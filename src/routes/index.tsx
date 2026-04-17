import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useCallback } from "react";
import { filterBrands, ALL_BRANDS, PLATFORMS, type BrandFilters } from "@/services/brand-service";
import { exportBrandsToPdf } from "@/services/pdf-export";
import { FilterSidebar } from "@/components/FilterSidebar";
import { BrandCard } from "@/components/BrandCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileDown, Search, Store, ChevronLeft, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Partner Explorer — Empresas de Miravia & Groupon" },
      { name: "description", content: "Explora miles de empresas que colaboran con Miravia y Groupon en España." },
    ],
  }),
});

const PAGE_SIZE = 60;

function Index() {
  const [filters, setFilters] = useState<BrandFilters>({
    search: "",
    source: "",
    withContactOnly: false,
    discountsOnly: false,
  });
  const [page, setPage] = useState(1);

  const brands = useMemo(() => filterBrands(ALL_BRANDS, filters), [filters]);
  const totalPages = Math.max(1, Math.ceil(brands.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageBrands = useMemo(
    () => brands.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [brands, currentPage]
  );

  const updateFilters = useCallback((next: BrandFilters) => {
    setFilters(next);
    setPage(1);
  }, []);

  const handleExport = useCallback(() => {
    // Export current filtered set (could be thousands)
    exportBrandsToPdf(brands);
  }, [brands]);

  const stats = useMemo(() => {
    const miravia = ALL_BRANDS.filter((b) => b.source === "Miravia").length;
    const groupon = ALL_BRANDS.filter((b) => b.source === "Groupon").length;
    return { miravia, groupon, total: ALL_BRANDS.length };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header
        className="sticky top-0 z-30 border-b bg-card/80 backdrop-blur-md"
        style={{ boxShadow: "0 1px 4px oklch(0.18 0.03 260 / 6%)" }}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-2 shrink-0">
            <Store className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold tracking-tight text-foreground hidden sm:inline">
              Partner Explorer
            </span>
          </div>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar empresa, categoría, ciudad..."
              className="pl-9"
              value={filters.search}
              onChange={(e) => updateFilters({ ...filters, search: e.target.value })}
            />
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-auto">
            <Select
              value={filters.source || "both"}
              onValueChange={(v) =>
                updateFilters({
                  ...filters,
                  source: v === "both" ? "" : (v === "miravia" ? "Miravia" : "Groupon"),
                })
              }
            >
              <SelectTrigger className="w-[180px] hidden md:flex">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PLATFORMS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button className="gap-2" onClick={handleExport} disabled={brands.length === 0}>
              <FileDown className="h-4 w-4" />
              <span className="hidden sm:inline">PDF</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 flex gap-6">
        <div className="hidden lg:block">
          <FilterSidebar filters={filters} onChange={updateFilters} />
        </div>

        <main className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{brands.length.toLocaleString("es-ES")}</span>{" "}
                {brands.length === 1 ? "empresa" : "empresas"} de {stats.total.toLocaleString("es-ES")} en el dataset
                <span className="ml-2 text-xs">
                  (Miravia: {stats.miravia.toLocaleString("es-ES")} · Groupon: {stats.groupon.toLocaleString("es-ES")})
                </span>
              </p>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  Página {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {brands.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Store className="h-12 w-12 text-muted-foreground/40 mb-4" />
              <p className="text-lg font-medium text-foreground">Sin resultados</p>
              <p className="text-sm text-muted-foreground mt-1">Ajusta los filtros para ver más empresas</p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {pageBrands.map((brand) => (
                  <BrandCard key={brand.id} brand={brand} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
                  </Button>
                  <span className="text-sm text-muted-foreground px-3">
                    {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Siguiente <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <MobileFilters filters={filters} onChange={updateFilters} />
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
            <FilterSidebar filters={filters} onChange={onChange} />
            <Button className="w-full mt-4" onClick={() => setOpen(false)}>
              Aplicar filtros
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
