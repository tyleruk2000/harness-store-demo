export type UseCase = "sport" | "trad" | "alpine" | "indoor" | "big wall";

export type Category = "harnesses" | "helmets" | "ropes" | "carabiners";

export interface Product {
  id: number;
  name: string;
  category: string;
  short_description: string;
  long_description: string;
  price: number;
  image_url: string;
  stock_quantity: number;
  weight: number | null;
  colour: string | null;
  use_case: UseCase;
  rating: number | null;
  featured: boolean;
}

export interface CategoryInfo {
  name: string;
  count: number;
}

/** Payload for creating a product via the admin page. */
export interface ProductInput {
  name: string;
  category: string;
  short_description: string;
  long_description: string;
  price: number;
  image_url: string;
  stock_quantity: number;
  weight: number | null;
  colour: string | null;
  use_case: UseCase;
  rating: number | null;
  featured: boolean;
}

export interface ProductQuery {
  category?: string;
  use_case?: UseCase;
  featured?: boolean;
  search?: string;
}
