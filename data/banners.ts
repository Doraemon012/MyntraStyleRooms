// Banner data structure for easy MongoDB integration
export interface Banner {
  _id: string;
  image: string;
  title: string;
  discount: string;
  brand: string;
  buttonText: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

// Mock banner data
export const mockBanners: Banner[] = [
  {
    _id: '1',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
    title: 'The Best Men\'s Wear Collection',
    discount: 'UP TO 70% OFF',
    brand: '#SNITCH',
    buttonText: 'Shop Now',
    isActive: true,
    order: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z'
  },
  {
    _id: '2',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop',
    title: 'Women\'s Fashion Week',
    discount: 'UP TO 50% OFF',
    brand: '#FASHION',
    buttonText: 'Explore Now',
    isActive: true,
    order: 2,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z'
  },
  {
    _id: '3',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=300&fit=crop',
    title: 'Footwear Collection',
    discount: 'UP TO 60% OFF',
    brand: '#SHOES',
    buttonText: 'Shop Now',
    isActive: true,
    order: 3,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z'
  },
  {
    _id: '4',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop',
    title: 'Accessories Sale',
    discount: 'UP TO 40% OFF',
    brand: '#ACCESSORIES',
    buttonText: 'Buy Now',
    isActive: true,
    order: 4,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z'
  }
];

// Helper functions
export const getActiveBanners = (): Banner[] => {
  return mockBanners
    .filter(banner => banner.isActive)
    .sort((a, b) => a.order - b.order);
};

export const getBannerById = (id: string): Banner | undefined => {
  return mockBanners.find(banner => banner._id === id);
};
