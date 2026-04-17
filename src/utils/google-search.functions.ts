import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const FIRECRAWL_API_URL = "https://api.firecrawl.dev/v2";

function requireFirecrawlKey(): string {
  const key = process.env.FIRECRAWL_API_KEY;
  if (!key) {
    throw new Error("FIRECRAWL_API_KEY is not configured. Conecta Firecrawl en Connectors.");
  }
  return key;
}

export interface SearchedCompany {
  id: string;
  name: string;
  category: string;
  productType: string;
  email: string | null;
  phone: string | null;
  location: string;
  hasDiscounts: boolean;
  storeUrl: string | null;
  source: "Miravia" | "Groupon";
  description?: string;
}

type Platform = "miravia" | "groupon" | "both";

/** Build Google dorks targeted at finding partner brands + contact data */
function buildQueries(platform: Platform, extra?: string): { query: string; source: "Miravia" | "Groupon" }[] {
  const extraTerm = extra ? ` ${extra}` : "";
  const queries: { query: string; source: "Miravia" | "Groupon" }[] = [];

  if (platform === "miravia" || platform === "both") {
    queries.push(
      { query: `empresas que venden en Miravia${extraTerm} email contacto`, source: "Miravia" },
      { query: `marcas colaboradoras Miravia${extraTerm} "contacto" OR "email"`, source: "Miravia" },
      { query: `vendedores Miravia España${extraTerm} teléfono contacto`, source: "Miravia" },
    );
  }
  if (platform === "groupon" || platform === "both") {
    queries.push(
      { query: `empresas colaboradoras Groupon España${extraTerm} email contacto`, source: "Groupon" },
      { query: `partners Groupon${extraTerm} "contacto" OR "email"`, source: "Groupon" },
      { query: `negocios que trabajan con Groupon${extraTerm} teléfono`, source: "Groupon" },
    );
  }
  return queries;
}

interface FirecrawlSearchResult {
  url?: string;
  title?: string;
  description?: string;
  markdown?: string;
}

/** Extract emails/phones from a text blob */
function extractContacts(text: string): { emails: string[]; phones: string[] } {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const phoneRegex = /(?:\+?34[\s.-]?)?(?:6\d{2}|7\d{2}|9\d{2})[\s.-]?\d{3}[\s.-]?\d{3}/g;

  const emails = Array.from(new Set((text.match(emailRegex) ?? []).map((e) => e.toLowerCase())))
    .filter((e) => !e.includes("example.com") && !e.includes("@sentry") && !e.includes("@2x") && !e.endsWith(".png") && !e.endsWith(".jpg"));
  const phones = Array.from(new Set((text.match(phoneRegex) ?? []).map((p) => p.replace(/\s+/g, " ").trim())));
  return { emails, phones };
}

/** Heuristic: derive a brand/company name from URL or title */
function deriveName(title: string | undefined, url: string | undefined): string {
  if (title) {
    const cleaned = title
      .replace(/[-|–—].*$/, "")
      .replace(/\s+/g, " ")
      .trim();
    if (cleaned.length > 2 && cleaned.length < 80) return cleaned;
  }
  if (url) {
    try {
      const host = new URL(url).hostname.replace(/^www\./, "");
      const root = host.split(".")[0];
      return root.charAt(0).toUpperCase() + root.slice(1);
    } catch {
      // ignore
    }
  }
  return "Empresa sin nombre";
}

export const searchPartnerCompanies = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      platform: z.enum(["miravia", "groupon", "both"]).default("both"),
      extra: z.string().optional(),
      limit: z.number().min(1).max(20).optional().default(8),
    })
  )
  .handler(async ({ data }): Promise<{ companies: SearchedCompany[]; error: string | null }> => {
    const apiKey = requireFirecrawlKey();
    const queries = buildQueries(data.platform, data.extra);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 22000);

    try {
      // Run all queries in parallel via Firecrawl /v2/search
      const searchPromises = queries.map(async ({ query, source }) => {
        try {
          const res = await fetch(`${FIRECRAWL_API_URL}/search`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            signal: controller.signal,
            body: JSON.stringify({
              query,
              limit: data.limit,
              scrapeOptions: {
                formats: ["markdown"],
                onlyMainContent: true,
              },
            }),
          });

          if (!res.ok) {
            const errText = await res.text();
            console.error(`[google-search] Firecrawl search failed [${res.status}] for "${query}": ${errText.slice(0, 200)}`);
            return { source, results: [] as FirecrawlSearchResult[], status: res.status };
          }

          const json = await res.json();
          const results: FirecrawlSearchResult[] = json?.data ?? json?.results ?? [];
          return { source, results, status: 200 };
        } catch (err) {
          console.error(`[google-search] error on query "${query}":`, err);
          return { source, results: [] as FirecrawlSearchResult[], status: 0 };
        }
      });

      const allResults = await Promise.all(searchPromises);
      clearTimeout(timeoutId);

      // Check for credit / auth issues
      const paymentIssue = allResults.find((r) => r.status === 402);
      if (paymentIssue && allResults.every((r) => r.results.length === 0)) {
        return {
          companies: [],
          error: "Firecrawl no tiene créditos suficientes. Actualiza tu plan en firecrawl.dev (cupón LOVABLE50: 50% off 3 meses).",
        };
      }

      // Aggregate + dedupe by domain
      const seenDomains = new Set<string>();
      const companies: SearchedCompany[] = [];

      for (const { source, results } of allResults) {
        for (const r of results) {
          if (!r.url) continue;
          let domain = "";
          try {
            domain = new URL(r.url).hostname.replace(/^www\./, "");
          } catch {
            continue;
          }
          // Skip aggregator/search pages themselves
          if (
            domain.includes("google.") ||
            domain.includes("bing.") ||
            domain.includes("duckduckgo.") ||
            domain.includes("miravia.es") ||
            domain.includes("groupon.")
          ) {
            continue;
          }
          if (seenDomains.has(domain)) continue;
          seenDomains.add(domain);

          const text = `${r.title ?? ""}\n${r.description ?? ""}\n${r.markdown ?? ""}`;
          const { emails, phones } = extractContacts(text);

          companies.push({
            id: crypto.randomUUID(),
            name: deriveName(r.title, r.url),
            category: source === "Miravia" ? "Miravia partner" : "Groupon partner",
            productType: "Varios",
            email: emails[0] ?? null,
            phone: phones[0] ?? null,
            location: "España",
            hasDiscounts: source === "Groupon",
            storeUrl: r.url,
            source,
            description: r.description?.slice(0, 200),
          });
        }
      }

      if (companies.length === 0) {
        return {
          companies: [],
          error: "Google no devolvió resultados utilizables. Prueba con otros términos en el campo de búsqueda.",
        };
      }

      return { companies, error: null };
    } catch (err) {
      clearTimeout(timeoutId);
      console.error("[google-search] fatal error:", err);
      if (err instanceof Error && err.name === "AbortError") {
        return {
          companies: [],
          error: "La búsqueda en Google tardó demasiado (>22s). Intenta de nuevo o reduce el alcance (solo Miravia o solo Groupon).",
        };
      }
      return {
        companies: [],
        error: `Error en la búsqueda: ${err instanceof Error ? err.message : "Desconocido"}`,
      };
    }
  });
