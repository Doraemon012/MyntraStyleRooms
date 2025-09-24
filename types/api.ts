// API response types that match the MongoDB schema

export interface APIProduct {
  _id: string;
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  price: number;
  originalPrice?: number;
  discount: number;
  discountPercentage: number;
  description: string;
  images: Array<{
    _id: string;
    url: string;
    alt?: string;
    isPrimary: boolean;
  }>;
  primaryImage: string;
  specifications: {
    material?: string;
    color?: string;
    pattern?: string;
    occasion?: string[];
    season?: string;
    care?: string;
    origin?: string;
    weight?: string;
    dimensions?: string;
    closure?: string;
    heelHeight?: string;
    sole?: string;
  };
  sizes: Array<{
    size: string;
    stock: number;
  }>;
  colors: Array<{
    name: string;
    hex?: string;
    image?: string;
    stock: number;
  }>;
  rating: {
    average: number;
    count: number;
  };
  reviews: Array<{
    _id: string;
    userId: string;
    rating: number;
    comment?: string;
    images?: string[];
    createdAt: string;
    isVerified: boolean;
  }>;
  isAvailable: boolean;
  inStock: boolean;
  tags: string[];
  aiRecommended: boolean;
  trendingScore: number;
  viewCount: number;
  purchaseCount: number;
  wishlistCount: number;
  features: string[];
  delivery: {
    standard: {
      estimatedDays: string;
      price: number;
      originalPrice: number;
      discount: number;
    };
    express?: {
      estimatedDays: string;
      price: number;
    };
  };
  offers: {
    bankOffers: string[];
    couponOffers: string[];
    additionalDiscount: number;
  };
  returnPolicy: string;
  paymentOptions: {
    cod: boolean;
    codFee: number;
  };
  similarProducts: string[];
  youMayAlsoLike: string[];
  questions: Array<{
    _id: string;
    question: string;
    answer: string;
    askedBy: string;
    answeredBy: string;
    date: string;
    helpful: number;
  }>;
  metadata: {
    source: string;
    externalId?: string;
    lastSynced?: string;
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
  id: string; // Virtual field
}

// Transform API product to frontend Product format
export function transformAPIProduct(apiProduct: APIProduct) {
  return {
    _id: apiProduct._id,
    name: apiProduct.name,
    brand: apiProduct.brand,
    price: apiProduct.price,
    originalPrice: apiProduct.originalPrice || apiProduct.price,
    discount: apiProduct.discount,
    discountPercentage: apiProduct.discountPercentage,
    rating: apiProduct.rating.average,
    reviewCount: apiProduct.rating.count,
    image: apiProduct.primaryImage,
    images: apiProduct.images.map(img => img.url),
    category: apiProduct.category,
    subcategory: apiProduct.subcategory,
    description: apiProduct.description,
    features: apiProduct.features,
    material: apiProduct.specifications.material || 'Not specified',
    color: apiProduct.specifications.color || 'Not specified',
    sizes: apiProduct.sizes.map(s => s.size),
    availableSizes: apiProduct.sizes.filter(s => s.stock > 0).map(s => s.size),
    isNew: apiProduct.tags.includes('new'),
    isTrending: apiProduct.tags.includes('trending') || apiProduct.aiRecommended,
    isSustainable: apiProduct.tags.includes('sustainable'),
    sustainability: apiProduct.tags.includes('sustainable') ? 'Eco-friendly' : undefined,
    delivery: apiProduct.delivery,
    offers: apiProduct.offers,
    returnPolicy: apiProduct.returnPolicy,
    paymentOptions: apiProduct.paymentOptions,
    similarProducts: apiProduct.similarProducts,
    youMayAlsoLike: apiProduct.youMayAlsoLike,
    reviews: apiProduct.reviews.map(review => ({
      _id: review._id,
      userId: review.userId,
      userName: 'User', // We don't have user names in the API
      rating: review.rating,
      comment: review.comment || '',
      date: new Date(review.createdAt).toLocaleDateString(),
      verified: review.isVerified,
      helpful: 0, // We don't have helpful count in the API
      images: review.images || []
    })),
    questions: apiProduct.questions.map(q => ({
      _id: q._id,
      question: q.question,
      answer: q.answer,
      askedBy: q.askedBy,
      answeredBy: q.answeredBy,
      date: q.date,
      helpful: q.helpful
    })),
    createdAt: apiProduct.createdAt,
    updatedAt: apiProduct.updatedAt
  };
}
