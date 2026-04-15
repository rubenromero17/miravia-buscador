import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useCallback } from "react";
import { filterBrands, MOCK_BRANDS, type Brand, type BrandFilters } from "@/services/brand-service";
import { exportBrandsToPdf } from "@/services/pdf-export";
import { scrapeMiraviaBrands } from "@/utils/miravia-scraper.functions";
import { FilterSidebar } from "@/components/FilterSidebar";
import { BrandCard } from "@/components/BrandCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileDown, Search, Store, Loader2, Wifi, WifiOff } from "lucide-react";


export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Miravia Brand Explorer — Directorio de Marcas" },
      { name: "description", content: "Busca, filtra y exporta marcas y vendedores de Miravia." },
    ],
  }),
});

function Index() {
  const [filters, setFilters] = useState<BrandFilters>({
    search: "",
    category: "",
    productType: "",
    discountsOnly: false,
  });

  const [allBrands, setAllBrands] = useState<Brand[]>(MOCK_BRANDS);
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scrapeFn = useServerFn(scrapeMiraviaBrands);

  const brands = useMemo(() => filterBrands(allBrands, filters), [allBrands, filters]);

  const handleScrape = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await scrapeFn({
        data: {
          category: filters.category || undefined,
          search: filters.search || undefined,
        },
      });

      if (result.error) {
        setError(result.error);
        if (result.brands.length === 0) {
          // Keep mock data if scraping returned nothing
          return;
        }
      }

      if (result.brands.length > 0) {
        setAllBrands(result.brands);
        setIsLive(true);
      }
    } catch (err) {
      setError(`Error de conexión: ${err instanceof Error ? err.message : "Desconocido"}`);
    } finally {
      setIsLoading(false);
    }
  }, [scrapeFn, filters.category, filters.search]);

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
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-2 shrink-0">
            <Store className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold tracking-tight text-foreground hidden sm:inline">
              Miravia Explorer
            </span>
          </div>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar marca o tienda..."
              className="pl-9"
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Scrape from Miravia button */}
            <Button
              variant={isLive ? "secondary" : "default"}
              className="gap-2"
              onClick={handleScrape}
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
                {isLoading ? "Scrapeando..." : isLive ? "Datos en vivo" : "Scrapear Miravia"}
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
              <span className="hidden sm:inline">Generar PDF</span>
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
              {brands.length} {brands.length === 1 ? "marca encontrada" : "marcas encontradas"}
              {isLive && (
                <span className="ml-2 inline-flex items-center gap-1 text-accent font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                  En vivo desde Miravia
                </span>
              )}
            </p>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
              <p className="text-lg font-medium text-foreground">Scrapeando Miravia...</p>
              <p className="text-sm text-muted-foreground mt-1">
                Esto puede tardar unos segundos
              </p>
            </div>
          ) : brands.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Store className="h-12 w-12 text-muted-foreground/40 mb-4" />
              <p className="text-lg font-medium text-foreground">Sin resultados</p>
              <p className="text-sm text-muted-foreground mt-1">
                Ajusta los filtros para encontrar marcas
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
