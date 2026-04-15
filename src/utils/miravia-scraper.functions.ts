import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const FIRECRAWL_API_URL = "https://api.firecrawl.dev/v2";

function requireFirecrawlKey(): string {
  const key = process.env.FIRECRAWL_API_KEY;
  console.log("[miravia-scraper] FIRECRAWL_API_KEY present:", !!key);
  if (!key) {
    // List available env var names for debugging
    const envKeys = Object.keys(process.env).filter(k => k.includes("FIRECRAWL") || k.includes("LOVABLE"));
    console.error("[miravia-scraper] Available related env vars:", envKeys);
    throw new Error("FIRECRAWL_API_KEY is not configured. Connect Firecrawl in Connectors.");
  }
  return key;
}

/** Category slug mapping for Miravia URLs */
const CATEGORY_SLUGS: Record<string, string> = {
  "Supermercado": "supermarket",
  "Belleza y Salud": "beauty-and-health",
  "Electrónica": "electronics",
  "Moda": "womens-fashion",
  "Hogar y Jardín": "home-and-garden",
  "Deportes": "sports",
  "Juguetes": "toys",
};

export interface ScrapedBrand {
  id: string;
  name: string;
  category: string;
  productType: string;
  email: string | null;
  phone: string | null;
  location: string;
  hasDiscounts: boolean;
  storeUrl: string | null;
}

/**
 * Scrapes Miravia category pages to extract seller/brand information.
 * Uses Firecrawl's scrape endpoint with JSON extraction.
 */
export const scrapeMiraviaBrands = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      category: z.string().optional(),
      search: z.string().optional(),
      page: z.number().optional().default(1),
    })
  )
  .handler(async ({ data }): Promise<{ brands: ScrapedBrand[]; error: string | null }> => {
    const apiKey = requireFirecrawlKey();

    // Build URL based on category or search
    let url: string;
    if (data.search) {
      url = `https://www.miravia.es/catalog/?q=${encodeURIComponent(data.search)}&page=${data.page}`;
    } else if (data.category && CATEGORY_SLUGS[data.category]) {
      url = `https://www.miravia.es/category/${CATEGORY_SLUGS[data.category]}/?page=${data.page}`;
    } else {
      url = `https://www.miravia.es/category/all/?page=${data.page}`;
    }

    try {
      // Use AbortController for a 20s timeout (serverless limit is ~25s)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      const scrapeRes = await fetch(`${FIRECRAWL_API_URL}/scrape`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          url,
          formats: [
            {
              type: "json",
              prompt:
                "Extract all sellers/stores/brands visible on this e-commerce page. For each, extract: store_name, category, product_type, has_discount (boolean), store_url. Return an array.",
              schema: {
                type: "object",
                properties: {
                  sellers: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        store_name: { type: "string" },
                        category: { type: "string" },
                        product_type: { type: "string" },
                        has_discount: { type: "boolean" },
                        store_url: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          ],
          waitFor: 2000,
          onlyMainContent: true,
          timeout: 15000,
        }),
      });

      clearTimeout(timeoutId);

      if (!scrapeRes.ok) {
        const errBody = await scrapeRes.text();
        console.error(`Firecrawl scrape failed [${scrapeRes.status}]: ${errBody}`);

        if (scrapeRes.status === 402) {
          return {
            brands: [],
            error: "Firecrawl no tiene créditos suficientes. Actualiza tu plan en firecrawl.dev con el cupón LOVABLE50 (50% off 3 meses).",
          };
        }
        return { brands: [], error: `Error al scrapear Miravia (${scrapeRes.status})` };
      }

      const result = await scrapeRes.json();
      const jsonData = result?.data?.json ?? result?.json;

      if (!jsonData?.sellers || !Array.isArray(jsonData.sellers)) {
        console.warn("No sellers found in scrape result:", JSON.stringify(result?.data ?? result).slice(0, 500));
        return {
          brands: [],
          error: "Miravia devolvió la página pero no se encontraron vendedores. Puede que la página tenga protección anti-bot activa.",
        };
      }

      // Deduplicate by store name
      const seen = new Set<string>();
      const brands: ScrapedBrand[] = [];

      for (const seller of jsonData.sellers) {
        const name = seller.store_name?.trim();
        if (!name || seen.has(name.toLowerCase())) continue;
        seen.add(name.toLowerCase());

        brands.push({
          id: crypto.randomUUID(),
          name,
          category: seller.category || data.category || "General",
          productType: seller.product_type || "Varios",
          email: null, // Miravia no muestra emails públicamente
          phone: null, // Miravia no muestra teléfonos públicamente
          location: "España",
          hasDiscounts: seller.has_discount ?? false,
          storeUrl: seller.store_url || null,
        });
      }

      return { brands, error: null };
    } catch (err) {
      console.error("Miravia scraping error:", err);
      if (err instanceof Error && err.name === "AbortError") {
        return {
          brands: [],
          error: "El scraping tardó demasiado (>20s). Miravia puede estar bloqueando la petición. Intenta con una categoría específica o más tarde.",
        };
      }
      return {
        brands: [],
        error: `Error al scrapear Miravia: ${err instanceof Error ? err.message : "Desconocido"}`,
      };
    }
  });

/**
 * Scrapes a specific Miravia store page for more details.
 */
export const scrapeMiraviaStore = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      storeUrl: z.string().url(),
    })
  )
  .handler(async ({ data }): Promise<{ store: Partial<ScrapedBrand> | null; error: string | null }> => {
    const apiKey = requireFirecrawlKey();

    try {
      const res = await fetch(`${FIRECRAWL_API_URL}/scrape`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: data.storeUrl,
          formats: [
            {
              type: "json",
              prompt:
                "Extract the store/seller information from this page: store_name, description, location/address if visible, email if visible, phone if visible, main_category, number_of_products, has_active_discounts (boolean).",
              schema: {
                type: "object",
                properties: {
                  store_name: { type: "string" },
                  description: { type: "string" },
                  location: { type: "string" },
                  email: { type: "string" },
                  phone: { type: "string" },
                  main_category: { type: "string" },
                  number_of_products: { type: "number" },
                  has_active_discounts: { type: "boolean" },
                },
              },
            },
          ],
          waitFor: 3000,
        }),
      });

      if (!res.ok) {
        return { store: null, error: `Error scraping store (${res.status})` };
      }

      const result = await res.json();
      const storeData = result?.data?.json ?? result?.json;

      if (!storeData?.store_name) {
        return { store: null, error: "No se pudo extraer información de la tienda" };
      }

      return {
        store: {
          name: storeData.store_name,
          category: storeData.main_category || "General",
          email: storeData.email || null,
          phone: storeData.phone || null,
          location: storeData.location || "España",
          hasDiscounts: storeData.has_active_discounts ?? false,
        },
        error: null,
      };
    } catch (err) {
      return {
        store: null,
        error: `Error: ${err instanceof Error ? err.message : "Unknown"}`,
      };
    }
  });
