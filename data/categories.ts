// Category data structure for easy MongoDB integration
export interface Category {
  _id: string;
  name: string;
  icon: string;
  color: string;
  isActive?: boolean;
  count: number;
  subcategories: string[];
  createdAt: string;
  updatedAt: string;
}

// Mock categories data
export const mockCategories: Category[] = [
  {
    _id: '1',
    name: 'Fashion',
    icon: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100&h=100&fit=crop',
    color: '#E91E63',
    isActive: true,
    count: 1250,
    subcategories: ['Dresses', 'Tops', 'Bottoms', 'Jackets', 'Accessories'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z'
  },
  {
    _id: '2',
    name: 'Beauty',
    icon: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=100&h=100&fit=crop&q=80',
    color: '#FF6B9D',
    isActive: false,
    count: 320,
    subcategories: ['Skincare', 'Makeup', 'Hair Care', 'Fragrance', 'Bath & Body'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z'
  },
  {
    _id: '3',
    name: 'Homeliving',
    icon: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=100&h=100&fit=crop',
    color: '#4A90E2',
    isActive: false,
    count: 450,
    subcategories: ['Furniture', 'Decor', 'Kitchen', 'Bedding', 'Storage'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z'
  },
  {
    _id: '4',
    name: 'Footwear',
    icon: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=100&h=100&fit=crop',
    color: '#7ED321',
    isActive: false,
    count: 750,
    subcategories: ['Sneakers', 'Sandals', 'Heels', 'Boots', 'Sports'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z'
  },
  {
    _id: '5',
    name: 'Accessories',
    icon: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=100&h=100&fit=crop',
    color: '#9C27B0',
    isActive: false,
    count: 540,
    subcategories: ['Bags', 'Jewelry', 'Watches', 'Belts', 'Sunglasses'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z'
  }
];

// Helper functions
export const getCategoryById = (id: string): Category | undefined => {
  return mockCategories.find(category => category._id === id);
};

export const getActiveCategories = (): Category[] => {
  return mockCategories.filter(category => category.isActive);
};

export const getAllCategories = (): Category[] => {
  return mockCategories;
};
