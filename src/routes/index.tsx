import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useCallback } from "react";
import { filterBrands, MOCK_BRANDS, PLATFORMS, type Brand, type BrandFilters } from "@/services/brand-service";
import { exportBrandsToPdf } from "@/services/pdf-export";
import { searchPartnerCompanies } from "@/utils/google-search.functions";
import { FilterSidebar } from "@/components/FilterSidebar";
import { BrandCard } from "@/components/BrandCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileDown, Search, Store, Loader2, Wifi, WifiOff } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Partner Explorer — Empresas de Miravia & Groupon" },
      { name: "description", content: "Busca empresas que colaboran con Miravia y Groupon en Google y exporta sus contactos." },
    ],
  }),
});

type Platform = "miravia" | "groupon" | "both";

function Index() {
  const [filters, setFilters] = useState<BrandFilters>({
    search: "",
    source: "",
    withContactOnly: false,
    discountsOnly: false,
  });

  const [platform, setPlatform] = useState<Platform>("both");
  const [extraTerm, setExtraTerm] = useState("");
  const [allBrands, setAllBrands] = useState<Brand[]>(MOCK_BRANDS);
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const brands = useMemo(() => filterBrands(allBrands, filters), [allBrands, filters]);

  const handleSearch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await searchPartnerCompanies({
        data: {
          platform,
          extra: extraTerm || undefined,
          limit: 8,
        },
      });

      if (result.error) {
        setError(result.error);
        if (result.companies.length === 0) return;
      }

      if (result.companies.length > 0) {
        setAllBrands(result.companies);
        setIsLive(true);
      }
    } catch (err) {
      setError(`Error de conexión: ${err instanceof Error ? err.message : "Desconocido"}`);
    } finally {
      setIsLoading(false);
    }
  }, [platform, extraTerm]);

  const handleUseMock = useCallback(() => {
    setAllBrands(MOCK_BRANDS);
    setIsLive(false);
    setError(null);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b bg-card/80 backdrop-blur-md"
        style={{ boxShadow: "0 1px 4px oklch(0.18 0.03 260 / 6%)" }}>
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-2 shrink-0">
            <Store className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold tracking-tight text-foreground hidden sm:inline">
              Partner Explorer
            </span>
          </div>

          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filtrar resultados..."
              className="pl-9"
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            />
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-auto">
            <Select value={platform} onValueChange={(v) => setPlatform(v as Platform)}>
              <SelectTrigger className="w-[160px] hidden md:flex">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PLATFORMS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="Término extra (opcional)"
              className="w-[180px] hidden lg:block"
              value={extraTerm}
              onChange={(e) => setExtraTerm(e.target.value)}
            />

            <Button
              variant={isLive ? "secondary" : "default"}
              className="gap-2"
              onClick={handleSearch}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isLive ? (
                <Wifi className="h-4 w-4" />
              ) : (
                <WifiOff className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">
                {isLoading ? "Buscando..." : isLive ? "Resultados en vivo" : "Buscar en Google"}
              </span>
            </Button>

            {isLive && (
              <Button variant="ghost" size="sm" onClick={handleUseMock} className="text-xs">
                Usar mock
              </Button>
            )}

            <Button
              className="gap-2"
              onClick={() => exportBrandsToPdf(brands)}
              disabled={brands.length === 0}
            >
              <FileDown className="h-4 w-4" />
              <span className="hidden sm:inline">PDF</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Error banner */}
      {error && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-4">
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            ⚠️ {error}
          </div>
        </div>
      )}

      {/* Body */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 flex gap-6">
        <div className="hidden lg:block">
          <FilterSidebar filters={filters} onChange={setFilters} />
        </div>

        <main className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              {brands.length} {brands.length === 1 ? "empresa encontrada" : "empresas encontradas"}
              {isLive && (
                <span className="ml-2 inline-flex items-center gap-1 text-accent font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                  En vivo desde Google
                </span>
              )}
            </p>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
              <p className="text-lg font-medium text-foreground">Buscando en Google...</p>
              <p className="text-sm text-muted-foreground mt-1">
                Consultando empresas de {platform === "both" ? "Miravia y Groupon" : platform}
              </p>
            </div>
          ) : brands.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Store className="h-12 w-12 text-muted-foreground/40 mb-4" />
              <p className="text-lg font-medium text-foreground">Sin resultados</p>
              <p className="text-sm text-muted-foreground mt-1">
                Ajusta los filtros o lanza una nueva búsqueda
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {brands.map((brand) => (
                <BrandCard key={brand.id} brand={brand} />
              ))}
            </div>
          )}
        </main>
      </div>

      <MobileFilters filters={filters} onChange={setFilters} />
    </div>
  );
}

function MobileFilters({ filters, onChange }: { filters: BrandFilters; onChange: (f: BrandFilters) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 lg:hidden z-40 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center"
      >
        <Search className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-2xl bg-background p-4">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-muted-foreground/30" />
            <FilterSidebar filters={filters} onChange={(f) => { onChange(f); }} />
            <Button className="w-full mt-4" onClick={() => setOpen(false)}>
              Aplicar filtros
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
