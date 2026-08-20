export type Category = string;

export interface MenuItem {
  id: string;
  titleEn: string;
  titleAm: string;
  descriptionEn: string;
  descriptionAm: string;
  price: number;
  category: string;
  image: string;
  inStock: boolean;
  isDailySpecial?: boolean;
  createdAt?: string;
}

export type Language = 'en' | 'am';
