import { CATEGORIES, PRODUCT_TYPES, type BrandFilters } from "@/services/brand-service";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, RotateCcw } from "lucide-react";

interface FilterSidebarProps {
  filters: BrandFilters;
  onChange: (filters: BrandFilters) => void;
}

export function FilterSidebar({ filters, onChange }: FilterSidebarProps) {
  const productTypes = filters.category ? PRODUCT_TYPES[filters.category] ?? [] : [];

  const update = (partial: Partial<BrandFilters>) =>
    onChange({ ...filters, ...partial });

  const reset = () =>
    onChange({ search: "", category: "", productType: "", discountsOnly: false });

  return (
    <aside className="w-72 shrink-0 rounded-xl border bg-card p-5 space-y-6 self-start sticky top-4"
      style={{ boxShadow: "var(--shadow-card)" }}>
      <div className="flex items-center gap-2 text-foreground font-semibold text-base">
        <SlidersHorizontal className="h-4 w-4 text-primary" />
        Filtros
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Categoría / Nicho</Label>
        <Select
          value={filters.category}
          onValueChange={(v) => update({ category: v === "__all__" ? "" : v, productType: "" })}
        >
          <SelectTrigger><SelectValue placeholder="Todas las categorías" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todas las categorías</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Product Type */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tipo de Producto</Label>
        <Select
          value={filters.productType}
          onValueChange={(v) => update({ productType: v === "__all__" ? "" : v })}
          disabled={productTypes.length === 0}
        >
          <SelectTrigger><SelectValue placeholder="Todos los tipos" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todos los tipos</SelectItem>
            {productTypes.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Brand search within filter */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Marca</Label>
        <Input
          placeholder="Filtrar por marca..."
          value={filters.search}
          onChange={(e) => update({ search: e.target.value })}
        />
      </div>

      {/* Discounts */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="discounts"
          checked={filters.discountsOnly}
          onCheckedChange={(checked) => update({ discountsOnly: checked === true })}
        />
        <Label htmlFor="discounts" className="text-sm cursor-pointer">
          Solo con descuentos
        </Label>
      </div>

      {/* Reset */}
      <Button variant="outline" size="sm" className="w-full gap-2" onClick={reset}>
        <RotateCcw className="h-3.5 w-3.5" />
        Limpiar filtros
      </Button>
    </aside>
  );
}
