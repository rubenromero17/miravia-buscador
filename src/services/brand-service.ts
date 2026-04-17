import partnersData from "@/data/partners.json";

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

// Full dataset loaded from JSON (thousands of partner companies)
export const ALL_BRANDS: Brand[] = partnersData as Brand[];

// Backwards-compat alias
export const MOCK_BRANDS: Brand[] = ALL_BRANDS;

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

export function filterBrands(brands: Brand[], filters: BrandFilters): Brand[] {
  return brands.filter((brand) => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (
        !brand.name.toLowerCase().includes(q) &&
        !brand.category.toLowerCase().includes(q) &&
        !brand.productType.toLowerCase().includes(q) &&
        !(brand.location?.toLowerCase().includes(q)) &&
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
