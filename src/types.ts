export type Category = 'All' | 'Hot Drinks' | 'Cold Drinks' | 'Burgers' | 'Pastry';

export interface MenuItem {
  id: string;
  titleEn: string;
  titleAm: string;
  descriptionEn: string;
  descriptionAm: string;
  price: number;
  category: Omit<Category, 'All'>;
  image: string;
  inStock: boolean;
  isDailySpecial?: boolean;
  createdAt?: string;
}

export type Language = 'en' | 'am';
