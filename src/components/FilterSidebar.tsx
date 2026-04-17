import { PLATFORMS, type BrandFilters } from "@/services/brand-service";
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
  const update = (partial: Partial<BrandFilters>) =>
    onChange({ ...filters, ...partial });

  const reset = () =>
    onChange({ search: "", source: "", withContactOnly: false, discountsOnly: false });

  return (
    <aside className="w-72 shrink-0 rounded-xl border bg-card p-5 space-y-6 self-start sticky top-4"
      style={{ boxShadow: "var(--shadow-card)" }}>
      <div className="flex items-center gap-2 text-foreground font-semibold text-base">
        <SlidersHorizontal className="h-4 w-4 text-primary" />
        Filtros
      </div>

      {/* Source platform */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Plataforma</Label>
        <Select
          value={filters.source || "__all__"}
          onValueChange={(v) => update({ source: v === "__all__" ? "" : (v as BrandFilters["source"]) })}
        >
          <SelectTrigger><SelectValue placeholder="Todas las plataformas" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todas las plataformas</SelectItem>
            <SelectItem value="Miravia">Miravia</SelectItem>
            <SelectItem value="Groupon">Groupon</SelectItem>
            <SelectItem value="Chollometro">Chollometro</SelectItem>
            <SelectItem value="Travelzoo">Travelzoo</SelectItem>
            <SelectItem value="Gilt">Gilt</SelectItem>
            <SelectItem value="LocalFlavor">LocalFlavor</SelectItem>
            <SelectItem value="DealSaver">DealSaver</SelectItem>
            <SelectItem value="LivingSocial">LivingSocial</SelectItem>
            <SelectItem value="Wowcher">Wowcher</SelectItem>
            <SelectItem value="Atrapalo">Atrápalo</SelectItem>
            <SelectItem value="Letsbonus">Letsbonus</SelectItem>
            <SelectItem value="Offerum">Offerum</SelectItem>
            <SelectItem value="Oferplan">Oferplan</SelectItem>
            <SelectItem value="Privalia">Privalia</SelectItem>
            <SelectItem value="Westwing">Westwing</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Search within results */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Empresa</Label>
        <Input
          placeholder="Filtrar por nombre..."
          value={filters.search}
          onChange={(e) => update({ search: e.target.value })}
        />
      </div>

      {/* Contact only */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="contact"
          checked={filters.withContactOnly}
          onCheckedChange={(checked) => update({ withContactOnly: checked === true })}
        />
        <Label htmlFor="contact" className="text-sm cursor-pointer">
          Solo con contacto (email/tel)
        </Label>
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

      <p className="text-[11px] text-muted-foreground leading-relaxed pt-2 border-t">
        Las plataformas disponibles son: {PLATFORMS.map((p) => p.label).join(" · ")}.
      </p>
    </aside>
  );
}
