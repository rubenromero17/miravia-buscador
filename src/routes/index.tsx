import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { filterBrands, type BrandFilters } from "@/services/brand-service";
import { exportBrandsToPdf } from "@/services/pdf-export";
import { FilterSidebar } from "@/components/FilterSidebar";
import { BrandCard } from "@/components/BrandCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileDown, Search, Store } from "lucide-react";

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

  const brands = useMemo(() => filterBrands(filters), [filters]);

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

          <Button
            className="gap-2 shrink-0"
            onClick={() => exportBrandsToPdf(brands)}
            disabled={brands.length === 0}
          >
            <FileDown className="h-4 w-4" />
            <span className="hidden sm:inline">Generar PDF</span>
          </Button>
        </div>
      </header>

      {/* Body */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 flex gap-6">
        {/* Sidebar — hidden on mobile, shown on lg+ */}
        <div className="hidden lg:block">
          <FilterSidebar filters={filters} onChange={setFilters} />
        </div>

        {/* Main Grid */}
        <main className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              {brands.length} {brands.length === 1 ? "marca encontrada" : "marcas encontradas"}
            </p>
          </div>

          {brands.length === 0 ? (
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

      {/* Mobile filter drawer trigger - shown on small screens */}
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
