import type { Brand } from "@/services/brand-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MapPin, Tag } from "lucide-react";

export function BrandCard({ brand }: { brand: Brand }) {
  return (
    <Card className="transition-shadow duration-200 hover:shadow-lg border-border/60"
      style={{ boxShadow: "var(--shadow-card)" }}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg leading-tight">{brand.name}</CardTitle>
          {brand.hasDiscounts && (
            <Badge className="bg-accent text-accent-foreground shrink-0 text-[11px]">
              <Tag className="h-3 w-3 mr-1" />
              Descuento
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5 mt-1">
          <Badge variant="secondary" className="text-[11px] font-normal">{brand.category}</Badge>
          <Badge variant="outline" className="text-[11px] font-normal">{brand.productType}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Mail className="h-3.5 w-3.5 shrink-0 text-primary" />
          <span className={brand.email ? "text-foreground" : "italic"}>
            {brand.email ?? "No disponible"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Phone className="h-3.5 w-3.5 shrink-0 text-primary" />
          <span className={brand.phone ? "text-foreground" : "italic"}>
            {brand.phone ?? "No disponible"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
          <span className="text-foreground">{brand.location}</span>
        </div>
      </CardContent>
    </Card>
  );
}
