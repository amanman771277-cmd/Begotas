import { MenuItem } from './types';

export const initialMenu: MenuItem[] = [
  {
    id: '1',
    titleEn: 'Classic Macchiato',
    titleAm: 'ክላሲክ ማኪያቶ',
    descriptionEn: 'Rich espresso with a dash of frothy milk.',
    descriptionAm: 'ትኩስ እና ጣፋጭ ማኪያቶ።',
    price: 45,
    category: 'Hot Drinks',
    image: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?auto=format&fit=crop&q=80&w=400',
    inStock: true
  },
  {
    id: '2',
    titleEn: 'Iced Caramel Frappe',
    titleAm: 'አይስድ ካራሜል ፍራፔ',
    descriptionEn: 'Blended iced coffee with caramel syrup and whipped cream.',
    descriptionAm: 'የቀዘቀዘ ቡና ከካራሜል ጋር።',
    price: 120,
    category: 'Cold Drinks',
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75bf699?auto=format&fit=crop&q=80&w=400',
    inStock: true
  },
  {
    id: '3',
    titleEn: 'Begotas Special Burger',
    titleAm: 'በጎታስ ልዩ በርገር',
    descriptionEn: 'Double beef patty, melted cheese, caramelized onions, and our secret sauce.',
    descriptionAm: 'ድርብ ስጋ፣ ቺዝ እና ልዩ ሶስ ያለው በርገር።',
    price: 350,
    category: 'Burgers',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400',
    inStock: true
  },
  {
    id: '4',
    titleEn: 'Chocolate Croissant',
    titleAm: 'ቸኮሌት ክሯሳንት',
    descriptionEn: 'Flaky, buttery pastry filled with rich dark chocolate.',
    descriptionAm: 'ጣፋጭ የቸኮሌት ክሯሳንት።',
    price: 80,
    category: 'Pastry',
    image: 'https://images.unsplash.com/photo-1549903072-7e6e0bedb7fb?auto=format&fit=crop&q=80&w=400',
    inStock: true
  },
  {
    id: '5',
    titleEn: 'Ethiopian Black Coffee',
    titleAm: 'የሀበሻ ቡና',
    descriptionEn: 'Traditional strong black coffee.',
    descriptionAm: 'ባህላዊ ጥቁር ቡና።',
    price: 25,
    category: 'Hot Drinks',
    image: 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&q=80&w=400',
    inStock: true
  }
];
