export interface Brand {
  id: string;
  name: string;
  category: string;
  productType: string;
  email: string | null;
  phone: string | null;
  location: string;
  hasDiscounts: boolean;
}

const MOCK_BRANDS: Brand[] = [
  {
    id: "1",
    name: "NaturVida",
    category: "Belleza y Salud",
    productType: "Cuidado facial",
    email: "contacto@naturvida.es",
    phone: "+34 912 345 678",
    location: "Madrid, España",
    hasDiscounts: true,
  },
  {
    id: "2",
    name: "FreshMarket",
    category: "Supermercado",
    productType: "Snacks",
    email: "info@freshmarket.es",
    phone: "+34 933 456 789",
    location: "Barcelona, España",
    hasDiscounts: false,
  },
  {
    id: "3",
    name: "GlowSkin",
    category: "Belleza y Salud",
    productType: "Maquillaje",
    email: "hello@glowskin.com",
    phone: null,
    location: "Valencia, España",
    hasDiscounts: true,
  },
  {
    id: "4",
    name: "TechZone",
    category: "Electrónica",
    productType: "Móviles",
    email: "ventas@techzone.es",
    phone: "+34 955 678 901",
    location: "Sevilla, España",
    hasDiscounts: true,
  },
  {
    id: "5",
    name: "ModaTrend",
    category: "Moda",
    productType: "Ropa mujer",
    email: null,
    phone: "+34 944 789 012",
    location: "Bilbao, España",
    hasDiscounts: false,
  },
  {
    id: "6",
    name: "BioEssence",
    category: "Belleza y Salud",
    productType: "Cuidado capilar",
    email: "info@bioessence.es",
    phone: "+34 961 890 123",
    location: "Málaga, España",
    hasDiscounts: true,
  },
  {
    id: "7",
    name: "SuperAhorro",
    category: "Supermercado",
    productType: "Bebidas",
    email: "contacto@superahorro.es",
    phone: "+34 976 012 345",
    location: "Zaragoza, España",
    hasDiscounts: false,
  },
  {
    id: "8",
    name: "PixelPro",
    category: "Electrónica",
    productType: "Accesorios",
    email: "soporte@pixelpro.es",
    phone: "+34 928 123 456",
    location: "Las Palmas, España",
    hasDiscounts: true,
  },
  {
    id: "9",
    name: "UrbanStyle",
    category: "Moda",
    productType: "Calzado",
    email: "hola@urbanstyle.es",
    phone: null,
    location: "Madrid, España",
    hasDiscounts: true,
  },
  {
    id: "10",
    name: "DeliFoods",
    category: "Supermercado",
    productType: "Conservas",
    email: "pedidos@delifoods.es",
    phone: "+34 941 234 567",
    location: "Barcelona, España",
    hasDiscounts: false,
  },
  {
    id: "11",
    name: "SkinLab",
    category: "Belleza y Salud",
    productType: "Cuidado corporal",
    email: null,
    phone: "+34 952 345 678",
    location: "Granada, España",
    hasDiscounts: false,
  },
  {
    id: "12",
    name: "MegaByte",
    category: "Electrónica",
    productType: "Portátiles",
    email: "info@megabyte.es",
    phone: "+34 965 456 789",
    location: "Alicante, España",
    hasDiscounts: true,
  },
];

export const CATEGORIES = [
  "Supermercado",
  "Belleza y Salud",
  "Electrónica",
  "Moda",
];

export const PRODUCT_TYPES: Record<string, string[]> = {
  Supermercado: ["Snacks", "Bebidas", "Conservas"],
  "Belleza y Salud": ["Cuidado facial", "Maquillaje", "Cuidado capilar", "Cuidado corporal"],
  Electrónica: ["Móviles", "Accesorios", "Portátiles"],
  Moda: ["Ropa mujer", "Calzado"],
};

export interface BrandFilters {
  search: string;
  category: string;
  productType: string;
  discountsOnly: boolean;
}

export function filterBrands(filters: BrandFilters): Brand[] {
  return MOCK_BRANDS.filter((brand) => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (
        !brand.name.toLowerCase().includes(q) &&
        !brand.category.toLowerCase().includes(q)
      )
        return false;
    }
    if (filters.category && brand.category !== filters.category) return false;
    if (filters.productType && brand.productType !== filters.productType) return false;
    if (filters.discountsOnly && !brand.hasDiscounts) return false;
    return true;
  });
}
