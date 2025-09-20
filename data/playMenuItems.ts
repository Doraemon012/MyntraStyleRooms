// Play menu items data structure for easy MongoDB integration
export interface PlayMenuItem {
  _id: string;
  title: string;
  description: string;
  icon: string;
  hasNewTag: boolean;
  isActive: boolean;
  order: number;
  route?: string;
  createdAt: string;
  updatedAt: string;
}

// Mock play menu items data
export const mockPlayMenuItems: PlayMenuItem[] = [
  {
    _id: '1',
    title: 'Fashion Room',
    description: 'Discover your style with friends',
    icon: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100&h=100&fit=crop',
    hasNewTag: true,
    isActive: true,
    order: 1,
    route: '/(tabs)',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z'
  },
  {
    _id: '2',
    title: 'Shop with Maya',
    description: 'Your Personal shopping assistant',
    icon: 'https://images.unsplash.com/photo-1512496015851-a90fb38cd796?w=100&h=100&fit=crop',
    hasNewTag: false,
    isActive: true,
    order: 2,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z'
  },
  {
    _id: '3',
    title: 'My Stylist',
    description: 'Outfit combinations for you',
    icon: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=100&h=100&fit=crop',
    hasNewTag: false,
    isActive: true,
    order: 3,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z'
  },
  {
    _id: '4',
    title: 'Myntra Minis',
    description: 'Swipe.Shop.Slay',
    icon: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=100&h=100&fit=crop',
    hasNewTag: false,
    isActive: true,
    order: 4,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z'
  }
];

// Helper functions
export const getActivePlayMenuItems = (): PlayMenuItem[] => {
  return mockPlayMenuItems
    .filter(item => item.isActive)
    .sort((a, b) => a.order - b.order);
};

export const getPlayMenuItemById = (id: string): PlayMenuItem | undefined => {
  return mockPlayMenuItems.find(item => item._id === id);
};
