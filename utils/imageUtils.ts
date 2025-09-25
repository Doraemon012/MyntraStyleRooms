// Utility functions for handling product images with fallbacks

export const getSampleImages = () => [
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=500&fit=crop', // Fashion model
  'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=400&h=500&fit=crop', // Clothing rack
  'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=500&fit=crop', // Fashion store
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=500&fit=crop', // Shopping
  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=500&fit=crop', // Fashion accessories
  'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&h=500&fit=crop', // Clothing display
  'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=500&fit=crop', // Fashion show
  'https://images.unsplash.com/photo-1525507119028-ed4c629a60c3?w=400&h=500&fit=crop', // Wardrobe
];

export const getRandomSampleImage = () => {
  const images = getSampleImages();
  return images[Math.floor(Math.random() * images.length)];
};

export const getProductImageUri = (product: any) => {
  return product?.primaryImage || 
         product?.images?.[0]?.url || 
         product?.image || 
         getRandomSampleImage();
};

export const getDefaultImageProps = () => ({
  defaultSource: { uri: getRandomSampleImage() },
  onError: () => {
    console.log('Image failed to load, using fallback');
  }
});
