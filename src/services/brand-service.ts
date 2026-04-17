import partnersData from "@/data/partners.json";

export type BrandSource =
  | "Miravia"
  | "Groupon"
  | "Chollometro"
  | "Travelzoo"
  | "Gilt"
  | "LocalFlavor"
  | "DealSaver"
  | "LivingSocial"
  | "Wowcher"
  | "Atrapalo"
  | "Letsbonus"
  | "Offerum"
  | "Oferplan"
  | "Privalia"
  | "Westwing";

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

// Full dataset loaded from JSON (29.080 partner companies)
export const ALL_BRANDS: Brand[] = partnersData as Brand[];

// Backwards-compat alias
export const MOCK_BRANDS: Brand[] = ALL_BRANDS;

export type PlatformValue =
  | "both"
  | "miravia"
  | "groupon"
  | "chollometro"
  | "travelzoo"
  | "gilt"
  | "localflavor"
  | "dealsaver"
  | "livingsocial"
  | "wowcher"
  | "atrapalo"
  | "letsbonus"
  | "offerum"
  | "oferplan"
  | "privalia"
  | "westwing";

export const PLATFORMS: { value: PlatformValue; label: string; source?: BrandSource }[] = [
  { value: "both", label: "Todas las plataformas" },
  { value: "miravia", label: "Miravia", source: "Miravia" },
  { value: "groupon", label: "Groupon", source: "Groupon" },
  { value: "chollometro", label: "Chollometro", source: "Chollometro" },
  { value: "travelzoo", label: "Travelzoo", source: "Travelzoo" },
  { value: "gilt", label: "Gilt", source: "Gilt" },
  { value: "localflavor", label: "LocalFlavor", source: "LocalFlavor" },
  { value: "dealsaver", label: "DealSaver", source: "DealSaver" },
  { value: "livingsocial", label: "LivingSocial", source: "LivingSocial" },
  { value: "wowcher", label: "Wowcher", source: "Wowcher" },
  { value: "atrapalo", label: "Atrápalo", source: "Atrapalo" },
  { value: "letsbonus", label: "Letsbonus", source: "Letsbonus" },
  { value: "offerum", label: "Offerum", source: "Offerum" },
  { value: "oferplan", label: "Oferplan", source: "Oferplan" },
  { value: "privalia", label: "Privalia", source: "Privalia" },
  { value: "westwing", label: "Westwing", source: "Westwing" },
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
        !brand.location?.toLowerCase().includes(q) &&
        !brand.description?.toLowerCase().includes(q)
      )
        return false;
    }
    if (filters.source && brand.source !== filters.source) return false;
    if (filters.withContactOnly && !brand.email && !brand.phone) return false;
    if (filters.discountsOnly && !brand.hasDiscounts) return false;
    return true;
  });
}
