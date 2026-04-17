export type BrandSource = "Miravia" | "Groupon";

export interface Brand {
  id: string;
  name: string;
  category: string;
  productType: string;
  email: string | null;
  phone: string | null;
  location: string;
  hasDiscounts: boolean;
  storeUrl?: string | null;
  source?: BrandSource;
  description?: string;
}

// Mock data as fallback when search returns nothing
export const MOCK_BRANDS: Brand[] = [
  { id: "1", name: "NaturVida", category: "Miravia partner", productType: "Cuidado facial", email: "contacto@naturvida.es", phone: "+34 912 345 678", location: "Madrid, España", hasDiscounts: true, source: "Miravia" },
  { id: "2", name: "FreshMarket", category: "Miravia partner", productType: "Snacks", email: "info@freshmarket.es", phone: "+34 933 456 789", location: "Barcelona, España", hasDiscounts: false, source: "Miravia" },
  { id: "3", name: "SpaRelax", category: "Groupon partner", productType: "Bienestar", email: "reservas@sparelax.es", phone: "+34 911 222 333", location: "Madrid, España", hasDiscounts: true, source: "Groupon" },
  { id: "4", name: "AventuraOutdoor", category: "Groupon partner", productType: "Ocio", email: "hola@aventuraoutdoor.es", phone: "+34 644 555 666", location: "Valencia, España", hasDiscounts: true, source: "Groupon" },
];

export const PLATFORMS: { value: "both" | "miravia" | "groupon"; label: string }[] = [
  { value: "both", label: "Miravia + Groupon" },
  { value: "miravia", label: "Solo Miravia" },
  { value: "groupon", label: "Solo Groupon" },
];

export interface BrandFilters {
  search: string;
  source: "" | BrandSource;
  withContactOnly: boolean;
  discountsOnly: boolean;
}

/** Client-side filter for already-loaded brands */
export function filterBrands(brands: Brand[], filters: BrandFilters): Brand[] {
  return brands.filter((brand) => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (
        !brand.name.toLowerCase().includes(q) &&
        !brand.category.toLowerCase().includes(q) &&
        !(brand.description?.toLowerCase().includes(q))
      )
        return false;
    }
    if (filters.source && brand.source !== filters.source) return false;
    if (filters.withContactOnly && !brand.email && !brand.phone) return false;
    if (filters.discountsOnly && !brand.hasDiscounts) return false;
    return true;
  });
}
