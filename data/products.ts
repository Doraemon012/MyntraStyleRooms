// Product data structure for easy MongoDB integration
export interface Product {
  _id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice: number;
  discount: number;
  discountPercentage: number;
  rating: number;
  reviewCount: number;
  image: string;
  images: string[];
  category: string;
  subcategory: string;
  description: string;
  features: string[];
  material: string;
  color: string;
  sizes: string[];
  availableSizes: string[];
  isNew?: boolean;
  isTrending?: boolean;
  isSustainable?: boolean;
  sustainability?: string;
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
  reviews: Review[];
  questions: Question[];
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  _id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
  helpful: number;
  images?: string[];
}

export interface Question {
  _id: string;
  question: string;
  answer: string;
  askedBy: string;
  answeredBy: string;
  date: string;
  helpful: number;
}

// Mock data - This will be replaced with MongoDB data
export const mockProducts: Product[] = [
  {
    _id: '68d4f81253d1477d8785ca81',
    name: 'Elegant Floral Midi Dress',
    brand: 'Zara',
    price: 2299,
    originalPrice: 4599,
    discount: 2300,
    discountPercentage: 50,
    rating: 4.3,
    reviewCount: 127,
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1571513720946-db1180a639b8?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1594736797933-d0c29d0b8b0a?w=400&h=600&fit=crop'
    ],
    category: 'Women',
    subcategory: 'Dresses',
    description: 'A stunning floral midi dress crafted from premium viscose blend. Features a flattering A-line silhouette, delicate floral print, and comfortable fit. Perfect for both casual outings and semi-formal events. The dress includes a hidden back zipper and lined bodice for added comfort.',
    features: [
      'Premium viscose blend fabric',
      'A-line silhouette',
      'Hidden back zipper',
      'Lined bodice',
      'Machine washable',
      'Delicate floral print',
      'Midi length (knee to mid-calf)',
      'Comfortable fit'
    ],
    material: 'Viscose Blend',
    color: 'Navy Blue Floral',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    availableSizes: ['XS', 'S', 'M', 'L', 'XL'],
    isNew: true,
    isTrending: true,
    isSustainable: true,
    sustainability: 'Eco-friendly packaging',
    delivery: {
      standard: {
        estimatedDays: '2-3 business days',
        price: 2299,
        originalPrice: 4599,
        discount: 50
      },
      express: {
        estimatedDays: '1 business day',
        price: 2499
      }
    },
    offers: {
      bankOffers: ['15% off on HDFC Credit Card', '10% off on ICICI Bank Debit Card', '5% off on SBI Credit Card'],
      couponOffers: ['WELCOME15 - 15% off for new users', 'FASHION20 - 20% off on fashion', 'ZARA10 - 10% off'],
      additionalDiscount: 345
    },
    returnPolicy: '30 days return & exchange policy',
    paymentOptions: {
      cod: true,
      codFee: 0
    },
    similarProducts: ['2', '3', '4', '5'],
    youMayAlsoLike: ['6', '7', '8', '9'],
    reviews: [
      {
        _id: 'r1',
        userId: 'u1',
        userName: 'Sarah Johnson',
        rating: 5,
        comment: 'Absolutely love this dress! The fit is perfect and the fabric feels luxurious. The floral print is beautiful and the quality is excellent for the price. Highly recommend!',
        date: '2 days ago',
        verified: true,
        helpful: 24
      },
      {
        _id: 'r2',
        userId: 'u2',
        userName: 'Emily Chen',
        rating: 4,
        comment: 'Great dress, very comfortable and flattering. The sizing is accurate. Only minor issue is the zipper could be smoother, but overall very satisfied.',
        date: '1 week ago',
        verified: true,
        helpful: 18
      },
      {
        _id: 'r3',
        userId: 'u3',
        userName: 'Maria Rodriguez',
        rating: 5,
        comment: 'Perfect for office wear and casual outings. The material is breathable and the design is timeless. Will definitely order more colors!',
        date: '3 days ago',
        verified: true,
        helpful: 15
      }
    ],
    questions: [
      {
        _id: 'q1',
        question: 'What is the exact length of this dress?',
        answer: 'The dress length is approximately 95cm (37.4 inches) for size M, measured from the shoulder to the hem. Length may vary slightly by size.',
        askedBy: 'Customer',
        answeredBy: 'Zara Customer Service',
        date: '2 days ago',
        helpful: 8
      },
      {
        _id: 'q2',
        question: 'Is this dress suitable for formal occasions?',
        answer: 'Yes, this dress is perfect for semi-formal occasions like office meetings, dinner dates, or garden parties. The elegant floral print and midi length make it versatile for various events.',
        askedBy: 'Customer',
        answeredBy: 'Zara Customer Service',
        date: '5 days ago',
        helpful: 12
      },
      {
        _id: 'q3',
        question: 'Does this dress require dry cleaning?',
        answer: 'No, this dress is machine washable. We recommend washing in cold water on a gentle cycle and air drying to maintain the fabric quality and print.',
        askedBy: 'Customer',
        answeredBy: 'Zara Customer Service',
        date: '1 week ago',
        helpful: 6
      }
    ],
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-20T14:45:00Z'
  },
  {
    _id: '68d4f81259979da02cafd866',
    name: 'Classic Denim Jacket',
    brand: 'Levi\'s',
    price: 3499,
    originalPrice: 4999,
    discount: 1500,
    discountPercentage: 30,
    rating: 4.6,
    reviewCount: 89,
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1571513720946-db1180a639b8?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1594736797933-d0c29d0b8b0a?w=400&h=600&fit=crop'
    ],
    category: 'Women',
    subcategory: 'Jackets',
    description: 'Iconic denim jacket crafted from premium 100% cotton denim. Features a classic fit, button closure, chest pockets, and timeless style. Perfect for layering over dresses, t-shirts, or sweaters. This versatile piece can be dressed up or down for any occasion.',
    features: [
      '100% Cotton Denim',
      'Classic fit',
      'Button closure',
      'Chest pockets',
      'Long sleeves',
      'Machine washable',
      'Timeless design',
      'Versatile styling'
    ],
    material: 'Cotton Denim',
    color: 'Mid Blue',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    availableSizes: ['XS', 'S', 'M', 'L', 'XL'],
    isTrending: true,
    delivery: {
      standard: {
        estimatedDays: '3-4 business days',
        price: 3499,
        originalPrice: 4999,
        discount: 30
      },
      express: {
        estimatedDays: '1-2 business days',
        price: 3699
      }
    },
    offers: {
      bankOffers: ['20% off on HDFC Credit Card', '15% off on ICICI Bank Debit Card', '10% off on SBI Credit Card'],
      couponOffers: ['DENIM25 - 25% off on denim', 'LEVIS15 - 15% off', 'FASHION20 - 20% off'],
      additionalDiscount: 500
    },
    returnPolicy: '30 days return & exchange policy',
    paymentOptions: {
      cod: true,
      codFee: 0
    },
    similarProducts: ['1', '3', '4', '5'],
    youMayAlsoLike: ['6', '7', '8', '9'],
    reviews: [
      {
        _id: 'r4',
        userId: 'u4',
        userName: 'Jessica Williams',
        rating: 5,
        comment: 'Perfect denim jacket! The quality is outstanding and the fit is exactly as expected. This is a wardrobe staple that will last for years. Highly recommend!',
        date: '1 day ago',
        verified: true,
        helpful: 32
      },
      {
        _id: 'r5',
        userId: 'u5',
        userName: 'Amanda Taylor',
        rating: 4,
        comment: 'Great jacket, very comfortable and well-made. The sizing runs slightly large, so consider sizing down if you prefer a more fitted look.',
        date: '4 days ago',
        verified: true,
        helpful: 19
      },
      {
        _id: 'r6',
        userId: 'u6',
        userName: 'Rachel Brown',
        rating: 5,
        comment: 'Love this jacket! It goes with everything and the quality is excellent. The classic style means it will never go out of fashion.',
        date: '1 week ago',
        verified: true,
        helpful: 25
      }
    ],
    questions: [
      {
        _id: 'q4',
        question: 'Does this jacket shrink after washing?',
        answer: 'This jacket is pre-shrunk, so minimal shrinkage is expected. We recommend washing in cold water and air drying to maintain the best fit and color.',
        askedBy: 'Customer',
        answeredBy: 'Levi\'s Customer Service',
        date: '3 days ago',
        helpful: 7
      },
      {
        _id: 'q5',
        question: 'Is this jacket suitable for all seasons?',
        answer: 'Yes, this denim jacket is perfect for spring, summer, and fall. It can be layered over lighter clothes in summer or under heavier coats in winter.',
        askedBy: 'Customer',
        answeredBy: 'Levi\'s Customer Service',
        date: '1 week ago',
        helpful: 11
      }
    ],
    createdAt: '2024-01-10T09:15:00Z',
    updatedAt: '2024-01-18T11:20:00Z'
  },
  {
    _id: '68d4f81205d1ac1d8e74d686',
    name: 'Premium Cotton T-Shirt',
    brand: 'Uniqlo',
    price: 899,
    originalPrice: 1299,
    discount: 400,
    discountPercentage: 31,
    rating: 4.4,
    reviewCount: 156,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1571513720946-db1180a639b8?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1594736797933-d0c29d0b8b0a?w=400&h=600&fit=crop'
    ],
    category: 'Men',
    subcategory: 'T-Shirts',
    description: 'Ultra-comfortable cotton t-shirt made from 100% organic cotton. Features a relaxed fit, soft hand feel, and pre-shrunk fabric. Perfect for everyday wear, this t-shirt is designed for comfort and durability. Available in multiple colors.',
    features: [
      '100% Organic Cotton',
      'Relaxed fit',
      'Pre-shrunk fabric',
      'Soft hand feel',
      'Machine washable',
      'Breathable material',
      'Durable construction',
      'Tagless design'
    ],
    material: 'Organic Cotton',
    color: 'White',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    availableSizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    delivery: {
      standard: {
        estimatedDays: '2-3 business days',
        price: 899,
        originalPrice: 1299,
        discount: 31
      },
      express: {
        estimatedDays: '1 business day',
        price: 999
      }
    },
    offers: {
      bankOffers: ['15% off on HDFC Credit Card', '10% off on ICICI Bank Debit Card', '5% off on SBI Credit Card'],
      couponOffers: ['COTTON20 - 20% off on cotton wear', 'UNIQLO10 - 10% off', 'BASICS15 - 15% off on basics'],
      additionalDiscount: 200
    },
    returnPolicy: '30 days return & exchange policy',
    paymentOptions: {
      cod: true,
      codFee: 0
    },
    similarProducts: ['4', '5', '6', '7'],
    youMayAlsoLike: ['8', '9', '10', '11'],
    reviews: [
      {
        _id: 'r7',
        userId: 'u7',
        userName: 'Michael Johnson',
        rating: 5,
        comment: 'Excellent quality t-shirt! The cotton is super soft and comfortable. Perfect fit and great value for money. Will definitely buy more colors.',
        date: '2 days ago',
        verified: true,
        helpful: 28
      },
      {
        _id: 'r8',
        userId: 'u8',
        userName: 'David Smith',
        rating: 4,
        comment: 'Great basic t-shirt. The quality is good and it holds its shape well after washing. Sizing is accurate.',
        date: '5 days ago',
        verified: true,
        helpful: 15
      },
      {
        _id: 'r9',
        userId: 'u9',
        userName: 'James Wilson',
        rating: 5,
        comment: 'Love this t-shirt! The organic cotton feels amazing and it\'s perfect for layering or wearing alone. Highly recommend!',
        date: '1 week ago',
        verified: true,
        helpful: 22
      }
    ],
    questions: [
      {
        _id: 'q6',
        question: 'What is the difference between organic cotton and regular cotton?',
        answer: 'Organic cotton is grown without harmful pesticides and chemicals, making it better for the environment and your skin. It\'s also softer and more breathable than regular cotton.',
        askedBy: 'Customer',
        answeredBy: 'Uniqlo Customer Service',
        date: '4 days ago',
        helpful: 9
      },
      {
        _id: 'q7',
        question: 'Does this t-shirt shrink after washing?',
        answer: 'This t-shirt is pre-shrunk, so minimal shrinkage is expected. We recommend washing in cold water and air drying to maintain the best fit.',
        askedBy: 'Customer',
        answeredBy: 'Uniqlo Customer Service',
        date: '1 week ago',
        helpful: 6
      }
    ],
    createdAt: '2024-01-12T14:30:00Z',
    updatedAt: '2024-01-19T16:45:00Z'
  },
  {
    _id: '68d4f812358c51e26cc29dae',
    name: 'Air Max 270 Running Shoes',
    brand: 'Nike',
    price: 8999,
    originalPrice: 12999,
    discount: 4000,
    discountPercentage: 31,
    rating: 4.7,
    reviewCount: 234,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1571513720946-db1180a639b8?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1594736797933-d0c29d0b8b0a?w=400&h=600&fit=crop'
    ],
    category: 'Sports',
    subcategory: 'Running Shoes',
    description: 'Revolutionary running shoes featuring Nike\'s largest Air Max unit for maximum cushioning and comfort. The Air Max 270 delivers all-day comfort with a bold design that\'s perfect for both running and casual wear. Features breathable mesh upper and responsive foam midsole.',
    features: [
      'Nike Air Max technology',
      'Breathable mesh upper',
      'Responsive foam midsole',
      'Rubber outsole for traction',
      'Lightweight design',
      'All-day comfort',
      'Bold, modern styling',
      'Durable construction'
    ],
    material: 'Mesh & Synthetic',
    color: 'Black & White',
    sizes: ['7', '8', '9', '10', '11', '12', '13'],
    availableSizes: ['7', '8', '9', '10', '11', '12'],
    isTrending: true,
    delivery: {
      standard: {
        estimatedDays: '3-4 business days',
        price: 8999,
        originalPrice: 12999,
        discount: 31
      },
      express: {
        estimatedDays: '1-2 business days',
        price: 9199
      }
    },
    offers: {
      bankOffers: ['20% off on HDFC Credit Card', '15% off on ICICI Bank Debit Card', '10% off on SBI Credit Card'],
      couponOffers: ['SPORTS25 - 25% off on sports', 'NIKE20 - 20% off', 'RUNNING15 - 15% off on running shoes'],
      additionalDiscount: 1000
    },
    returnPolicy: '30 days return & exchange policy',
    paymentOptions: {
      cod: true,
      codFee: 0
    },
    similarProducts: ['5', '6', '7', '8'],
    youMayAlsoLike: ['9', '10', '11', '12'],
    reviews: [
      {
        _id: 'r10',
        userId: 'u10',
        userName: 'Alex Thompson',
        rating: 5,
        comment: 'Amazing running shoes! The Air Max technology provides incredible comfort and the design is stunning. Perfect for both running and casual wear.',
        date: '1 day ago',
        verified: true,
        helpful: 45
      },
      {
        _id: 'r11',
        userId: 'u11',
        userName: 'Ryan Davis',
        rating: 5,
        comment: 'Best running shoes I\'ve ever owned! The cushioning is incredible and they look great. Highly recommend for serious runners.',
        date: '3 days ago',
        verified: true,
        helpful: 38
      },
      {
        _id: 'r12',
        userId: 'u12',
        userName: 'Chris Wilson',
        rating: 4,
        comment: 'Great shoes with excellent comfort. The sizing runs slightly large, so consider going half a size down. Overall very satisfied.',
        date: '1 week ago',
        verified: true,
        helpful: 29
      }
    ],
    questions: [
      {
        _id: 'q8',
        question: 'Are these shoes suitable for long-distance running?',
        answer: 'Yes, the Air Max 270 is designed for all-day comfort and is suitable for long-distance running. The Air Max technology provides excellent cushioning and support.',
        askedBy: 'Customer',
        answeredBy: 'Nike Customer Service',
        date: '2 days ago',
        helpful: 12
      },
      {
        _id: 'q9',
        question: 'How do I clean these shoes?',
        answer: 'We recommend cleaning with a soft brush and mild soap. Avoid machine washing. Let them air dry naturally away from direct heat.',
        askedBy: 'Customer',
        answeredBy: 'Nike Customer Service',
        date: '5 days ago',
        helpful: 8
      }
    ],
    createdAt: '2024-01-08T12:00:00Z',
    updatedAt: '2024-01-17T10:30:00Z'
  },
  {
    _id: '68d4f812f45955e05a3fc1b7',
    name: 'Silk Saree with Zari Work',
    brand: 'Sangria',
    price: 8999,
    originalPrice: 12999,
    discount: 4000,
    discountPercentage: 31,
    rating: 4.5,
    reviewCount: 67,
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1571513720946-db1180a639b8?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1594736797933-d0c29d0b8b0a?w=400&h=600&fit=crop'
    ],
    category: 'Women',
    subcategory: 'Sarees',
    description: 'Exquisite silk saree featuring intricate zari work and traditional motifs. Crafted from pure silk with gold and silver thread work, this saree is perfect for weddings, festivals, and special occasions. The elegant drape and luxurious feel make it a timeless addition to your wardrobe.',
    features: [
      'Pure silk fabric',
      'Intricate zari work',
      'Gold and silver thread',
      'Traditional motifs',
      'Handcrafted details',
      'Elegant drape',
      'Luxurious feel',
      'One size fits all'
    ],
    material: 'Pure Silk',
    color: 'Maroon & Gold',
    sizes: ['One Size'],
    availableSizes: ['One Size'],
    isTrending: true,
    delivery: {
      standard: {
        estimatedDays: '5-7 business days',
        price: 8999,
        originalPrice: 12999,
        discount: 31
      },
      express: {
        estimatedDays: '2-3 business days',
        price: 9199
      }
    },
    offers: {
      bankOffers: ['25% off on HDFC Credit Card', '20% off on ICICI Bank Debit Card', '15% off on SBI Credit Card'],
      couponOffers: ['SAREES30 - 30% off on sarees', 'SANGRIAS20 - 20% off', 'WEDDING25 - 25% off on wedding wear'],
      additionalDiscount: 1500
    },
    returnPolicy: '30 days return & exchange policy',
    paymentOptions: {
      cod: true,
      codFee: 0
    },
    similarProducts: ['6', '7', '8', '9'],
    youMayAlsoLike: ['1', '2', '3', '4'],
    reviews: [
      {
        _id: 'r13',
        userId: 'u13',
        userName: 'Priya Sharma',
        rating: 5,
        comment: 'Absolutely stunning saree! The zari work is exquisite and the silk quality is outstanding. Perfect for my daughter\'s wedding. Highly recommend!',
        date: '2 days ago',
        verified: true,
        helpful: 42
      },
      {
        _id: 'r14',
        userId: 'u14',
        userName: 'Anita Patel',
        rating: 5,
        comment: 'Beautiful saree with amazing craftsmanship. The colors are vibrant and the drape is perfect. Worth every penny!',
        date: '1 week ago',
        verified: true,
        helpful: 28
      },
      {
        _id: 'r15',
        userId: 'u15',
        userName: 'Rekha Singh',
        rating: 4,
        comment: 'Lovely saree, good quality silk. The zari work is beautiful. Only minor issue is the blouse piece could be slightly longer.',
        date: '3 days ago',
        verified: true,
        helpful: 19
      }
    ],
    questions: [
      {
        _id: 'q10',
        question: 'Is this saree suitable for wedding occasions?',
        answer: 'Yes, this saree is perfect for wedding occasions. The intricate zari work and luxurious silk make it ideal for bridal wear, family functions, and special celebrations.',
        askedBy: 'Customer',
        answeredBy: 'Sangria Customer Service',
        date: '1 day ago',
        helpful: 15
      },
      {
        _id: 'q11',
        question: 'How should I care for this silk saree?',
        answer: 'We recommend dry cleaning only for this saree. Store it in a cool, dry place wrapped in muslin cloth. Avoid direct sunlight and moisture to preserve the zari work.',
        askedBy: 'Customer',
        answeredBy: 'Sangria Customer Service',
        date: '4 days ago',
        helpful: 11
      }
    ],
    createdAt: '2024-01-05T08:45:00Z',
    updatedAt: '2024-01-16T13:20:00Z'
  },
  {
    _id: '68d4f81215cad9a887c1e056',
    name: 'Leather Crossbody Handbag',
    brand: 'Coach',
    price: 12999,
    originalPrice: 18999,
    discount: 6000,
    discountPercentage: 32,
    rating: 4.8,
    reviewCount: 89,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1571513720946-db1180a639b8?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1594736797933-d0c29d0b8b0a?w=400&h=600&fit=crop'
    ],
    category: 'Accessories',
    subcategory: 'Handbags',
    description: 'Luxurious leather crossbody handbag from Coach featuring premium leather construction, adjustable strap, and multiple compartments. Perfect for everyday use, this bag combines style and functionality with its spacious interior and elegant design.',
    features: [
      'Premium leather construction',
      'Adjustable crossbody strap',
      'Multiple compartments',
      'Zipper closure',
      'Interior organization pockets',
      'Durable hardware',
      'Timeless design',
      'Made in Italy'
    ],
    material: 'Genuine Leather',
    color: 'Black',
    sizes: ['One Size'],
    availableSizes: ['One Size'],
    isTrending: true,
    delivery: {
      standard: {
        estimatedDays: '4-5 business days',
        price: 12999,
        originalPrice: 18999,
        discount: 32
      },
      express: {
        estimatedDays: '2-3 business days',
        price: 13499
      }
    },
    offers: {
      bankOffers: ['30% off on HDFC Credit Card', '25% off on ICICI Bank Debit Card', '20% off on SBI Credit Card'],
      couponOffers: ['LUXURY35 - 35% off on luxury items', 'COACH25 - 25% off', 'HANDBAG20 - 20% off on handbags'],
      additionalDiscount: 2000
    },
    returnPolicy: '30 days return & exchange policy',
    paymentOptions: {
      cod: true,
      codFee: 0
    },
    similarProducts: ['7', '8', '9', '10'],
    youMayAlsoLike: ['1', '2', '3', '4'],
    reviews: [
      {
        _id: 'r16',
        userId: 'u16',
        userName: 'Jennifer Martinez',
        rating: 5,
        comment: 'Absolutely love this handbag! The leather quality is exceptional and the design is perfect for everyday use. The compartments are well-organized and the strap is comfortable.',
        date: '1 day ago',
        verified: true,
        helpful: 38
      },
      {
        _id: 'r17',
        userId: 'u17',
        userName: 'Lisa Anderson',
        rating: 5,
        comment: 'Beautiful Coach bag! The craftsmanship is outstanding and it goes with everything. Worth every penny. Highly recommend!',
        date: '3 days ago',
        verified: true,
        helpful: 29
      },
      {
        _id: 'r18',
        userId: 'u18',
        userName: 'Michelle Taylor',
        rating: 4,
        comment: 'Great quality bag, very stylish and functional. The leather is soft and the hardware is sturdy. Only minor issue is the strap could be slightly longer.',
        date: '1 week ago',
        verified: true,
        helpful: 21
      }
    ],
    questions: [
      {
        _id: 'q12',
        question: 'What is the capacity of this handbag?',
        answer: 'This handbag can comfortably fit a phone, wallet, keys, small makeup items, and other daily essentials. The main compartment is spacious with additional organization pockets.',
        askedBy: 'Customer',
        answeredBy: 'Coach Customer Service',
        date: '2 days ago',
        helpful: 13
      },
      {
        _id: 'q13',
        question: 'How should I care for this leather handbag?',
        answer: 'We recommend using a leather conditioner monthly and storing it in a dust bag when not in use. Avoid exposure to direct sunlight and moisture to maintain the leather quality.',
        askedBy: 'Customer',
        answeredBy: 'Coach Customer Service',
        date: '5 days ago',
        helpful: 9
      }
    ],
    createdAt: '2024-01-03T11:30:00Z',
    updatedAt: '2024-01-15T09:15:00Z'
  },
  {
    _id: '68d4f812393a89076b5f96f3',
    name: 'Wireless Bluetooth Headphones',
    brand: 'Sony',
    price: 8999,
    originalPrice: 12999,
    discount: 4000,
    discountPercentage: 31,
    rating: 4.6,
    reviewCount: 187,
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1571513720946-db1180a639b8?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1594736797933-d0c29d0b8b0a?w=400&h=600&fit=crop'
    ],
    category: 'Electronics',
    subcategory: 'Audio',
    description: 'Premium wireless Bluetooth headphones with active noise cancellation, 30-hour battery life, and superior sound quality. Features comfortable over-ear design, quick charge capability, and crystal-clear call quality. Perfect for music lovers and professionals.',
    features: [
      'Active noise cancellation',
      '30-hour battery life',
      'Quick charge (3 min = 3 hours)',
      'Bluetooth 5.0 connectivity',
      'Comfortable over-ear design',
      'Crystal-clear call quality',
      'Superior sound quality',
      'Foldable design'
    ],
    material: 'Plastic & Metal',
    color: 'Black',
    sizes: ['One Size'],
    availableSizes: ['One Size'],
    isTrending: true,
    delivery: {
      standard: {
        estimatedDays: '2-3 business days',
        price: 8999,
        originalPrice: 12999,
        discount: 31
      },
      express: {
        estimatedDays: '1 business day',
        price: 9199
      }
    },
    offers: {
      bankOffers: ['25% off on HDFC Credit Card', '20% off on ICICI Bank Debit Card', '15% off on SBI Credit Card'],
      couponOffers: ['AUDIO30 - 30% off on audio', 'SONY25 - 25% off', 'ELECTRONICS20 - 20% off on electronics'],
      additionalDiscount: 1500
    },
    returnPolicy: '30 days return & exchange policy',
    paymentOptions: {
      cod: true,
      codFee: 0
    },
    similarProducts: ['8', '9', '10', '11'],
    youMayAlsoLike: ['1', '2', '3', '4'],
    reviews: [
      {
        _id: 'r19',
        userId: 'u19',
        userName: 'Mark Johnson',
        rating: 5,
        comment: 'Outstanding headphones! The noise cancellation is incredible and the sound quality is top-notch. Battery life is excellent and the comfort is amazing for long listening sessions.',
        date: '1 day ago',
        verified: true,
        helpful: 52
      },
      {
        _id: 'r20',
        userId: 'u20',
        userName: 'Robert Davis',
        rating: 5,
        comment: 'Best headphones I\'ve ever owned! The Sony quality is unmatched. Great for both music and calls. Highly recommend!',
        date: '3 days ago',
        verified: true,
        helpful: 41
      },
      {
        _id: 'r21',
        userId: 'u21',
        userName: 'Kevin Wilson',
        rating: 4,
        comment: 'Excellent headphones with great sound quality. The noise cancellation works well and the battery life is impressive. Only minor issue is the ear cups could be slightly larger.',
        date: '1 week ago',
        verified: true,
        helpful: 33
      }
    ],
    questions: [
      {
        _id: 'q14',
        question: 'How long does the battery last with noise cancellation on?',
        answer: 'With active noise cancellation enabled, the battery lasts up to 30 hours. With noise cancellation off, you can get up to 38 hours of playback time.',
        askedBy: 'Customer',
        answeredBy: 'Sony Customer Service',
        date: '2 days ago',
        helpful: 18
      },
      {
        _id: 'q15',
        question: 'Are these headphones compatible with all devices?',
        answer: 'Yes, these headphones are compatible with any device that supports Bluetooth 5.0, including smartphones, tablets, laptops, and smart TVs.',
        askedBy: 'Customer',
        answeredBy: 'Sony Customer Service',
        date: '4 days ago',
        helpful: 12
      }
    ],
    createdAt: '2024-01-07T16:20:00Z',
    updatedAt: '2024-01-14T12:10:00Z'
  },
  {
    _id: '68d4f8121637099069095ced',
    name: 'Smart Fitness Watch',
    brand: 'Apple',
    price: 29999,
    originalPrice: 39999,
    discount: 10000,
    discountPercentage: 25,
    rating: 4.9,
    reviewCount: 312,
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1571513720946-db1180a639b8?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1594736797933-d0c29d0b8b0a?w=400&h=600&fit=crop'
    ],
    category: 'Electronics',
    subcategory: 'Wearables',
    description: 'Revolutionary smart fitness watch with advanced health monitoring, GPS tracking, and cellular connectivity. Features heart rate monitoring, sleep tracking, workout detection, and water resistance up to 50 meters. Perfect for fitness enthusiasts and health-conscious individuals.',
    features: [
      'Advanced health monitoring',
      'GPS + Cellular connectivity',
      'Heart rate monitoring',
      'Sleep tracking',
      'Workout detection',
      'Water resistant (50m)',
      '18-hour battery life',
      'Always-on Retina display'
    ],
    material: 'Aluminum & Ceramic',
    color: 'Space Gray',
    sizes: ['40mm', '44mm'],
    availableSizes: ['40mm', '44mm'],
    isTrending: true,
    delivery: {
      standard: {
        estimatedDays: '3-4 business days',
        price: 29999,
        originalPrice: 39999,
        discount: 25
      },
      express: {
        estimatedDays: '1-2 business days',
        price: 30999
      }
    },
    offers: {
      bankOffers: ['35% off on HDFC Credit Card', '30% off on ICICI Bank Debit Card', '25% off on SBI Credit Card'],
      couponOffers: ['APPLE40 - 40% off on Apple products', 'WATCH30 - 30% off on watches', 'FITNESS25 - 25% off on fitness'],
      additionalDiscount: 5000
    },
    returnPolicy: '30 days return & exchange policy',
    paymentOptions: {
      cod: true,
      codFee: 0
    },
    similarProducts: ['9', '10', '11', '12'],
    youMayAlsoLike: ['1', '2', '3', '4'],
    reviews: [
      {
        _id: 'r22',
        userId: 'u22',
        userName: 'Alex Thompson',
        rating: 5,
        comment: 'Incredible smartwatch! The health monitoring features are amazing and the battery life is excellent. The GPS tracking is accurate and the cellular connectivity works perfectly.',
        date: '1 day ago',
        verified: true,
        helpful: 67
      },
      {
        _id: 'r23',
        userId: 'u23',
        userName: 'Sarah Johnson',
        rating: 5,
        comment: 'Best smartwatch I\'ve ever owned! The fitness tracking is comprehensive and the design is beautiful. Highly recommend for anyone serious about their health and fitness.',
        date: '2 days ago',
        verified: true,
        helpful: 54
      },
      {
        _id: 'r24',
        userId: 'u24',
        userName: 'Mike Chen',
        rating: 5,
        comment: 'Outstanding device! The health monitoring has helped me improve my fitness significantly. The build quality is excellent and it looks great on the wrist.',
        date: '3 days ago',
        verified: true,
        helpful: 43
      }
    ],
    questions: [
      {
        _id: 'q16',
        question: 'Does this watch work with Android phones?',
        answer: 'Yes, this watch is compatible with both iPhone and Android phones. However, some features may be limited when used with Android devices.',
        askedBy: 'Customer',
        answeredBy: 'Apple Customer Service',
        date: '1 day ago',
        helpful: 22
      },
      {
        _id: 'q17',
        question: 'How accurate is the heart rate monitoring?',
        answer: 'The heart rate monitoring is very accurate and uses advanced sensors. It continuously monitors your heart rate throughout the day and during workouts.',
        askedBy: 'Customer',
        answeredBy: 'Apple Customer Service',
        date: '3 days ago',
        helpful: 16
      }
    ],
    createdAt: '2024-01-01T13:45:00Z',
    updatedAt: '2024-01-13T15:30:00Z'
  },
  {
    _id: '68d4f812b06ce87875574a80',
    name: 'Premium Skincare Set',
    brand: 'The Ordinary',
    price: 2999,
    originalPrice: 3999,
    discount: 1000,
    discountPercentage: 25,
    rating: 4.7,
    reviewCount: 156,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1571513720946-db1180a639b8?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1594736797933-d0c29d0b8b0a?w=400&h=600&fit=crop'
    ],
    category: 'Beauty',
    subcategory: 'Skincare',
    description: 'Complete skincare set featuring clinically-proven ingredients for healthy, glowing skin. Includes vitamin C serum, hyaluronic acid, and retinol treatment. Perfect for all skin types, this set provides everything you need for a complete skincare routine.',
    features: [
      'Vitamin C serum',
      'Hyaluronic acid',
      'Retinol treatment',
      'Clinically-proven ingredients',
      'Suitable for all skin types',
      'Dermatologist tested',
      'Cruelty-free',
      'Complete skincare routine'
    ],
    material: 'Liquid',
    color: 'Clear',
    sizes: ['30ml', '60ml'],
    availableSizes: ['30ml', '60ml'],
    isTrending: true,
    delivery: {
      standard: {
        estimatedDays: '2-3 business days',
        price: 2999,
        originalPrice: 3999,
        discount: 25
      },
      express: {
        estimatedDays: '1 business day',
        price: 3199
      }
    },
    offers: {
      bankOffers: ['20% off on HDFC Credit Card', '15% off on ICICI Bank Debit Card', '10% off on SBI Credit Card'],
      couponOffers: ['BEAUTY25 - 25% off on beauty', 'SKINCARE20 - 20% off on skincare', 'ORDINARY15 - 15% off'],
      additionalDiscount: 500
    },
    returnPolicy: '30 days return & exchange policy',
    paymentOptions: {
      cod: true,
      codFee: 0
    },
    similarProducts: ['10', '11', '12', '1'],
    youMayAlsoLike: ['2', '3', '4', '5'],
    reviews: [
      {
        _id: 'r25',
        userId: 'u25',
        userName: 'Emma Wilson',
        rating: 5,
        comment: 'Amazing skincare set! My skin has never looked better. The vitamin C serum is incredible and the hyaluronic acid keeps my skin hydrated all day. Highly recommend!',
        date: '1 day ago',
        verified: true,
        helpful: 45
      },
      {
        _id: 'r26',
        userId: 'u26',
        userName: 'Sophie Brown',
        rating: 5,
        comment: 'Best skincare investment I\'ve made! The retinol treatment has improved my skin texture significantly. The Ordinary never disappoints.',
        date: '3 days ago',
        verified: true,
        helpful: 38
      },
      {
        _id: 'r27',
        userId: 'u27',
        userName: 'Olivia Davis',
        rating: 4,
        comment: 'Great skincare set with effective ingredients. The products work well together and my skin feels much healthier. Only minor issue is the packaging could be more luxurious.',
        date: '1 week ago',
        verified: true,
        helpful: 29
      }
    ],
    questions: [
      {
        _id: 'q18',
        question: 'Can I use all these products together?',
        answer: 'Yes, these products are designed to work together. We recommend using the vitamin C serum in the morning and the retinol treatment at night for best results.',
        askedBy: 'Customer',
        answeredBy: 'The Ordinary Customer Service',
        date: '2 days ago',
        helpful: 14
      },
      {
        _id: 'q19',
        question: 'Is this suitable for sensitive skin?',
        answer: 'Yes, this set is suitable for sensitive skin. However, we recommend doing a patch test first and starting with lower concentrations if you\'re new to these ingredients.',
        askedBy: 'Customer',
        answeredBy: 'The Ordinary Customer Service',
        date: '4 days ago',
        helpful: 11
      }
    ],
    createdAt: '2024-01-02T10:15:00Z',
    updatedAt: '2024-01-12T14:25:00Z'
  },
  {
    _id: '68d4f8124a93188f872bfcac',
    name: 'Luxury Perfume Collection',
    brand: 'Chanel',
    price: 12999,
    originalPrice: 17999,
    discount: 5000,
    discountPercentage: 28,
    rating: 4.8,
    reviewCount: 234,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1571513720946-db1180a639b8?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1594736797933-d0c29d0b8b0a?w=400&h=600&fit=crop'
    ],
    category: 'Beauty',
    subcategory: 'Fragrance',
    description: 'Exquisite luxury perfume collection featuring iconic Chanel fragrances. This set includes three signature scents: No. 5, Coco Mademoiselle, and Chance. Each fragrance is crafted with the finest ingredients and represents the timeless elegance of Chanel.',
    features: [
      'Three signature fragrances',
      'No. 5 classic scent',
      'Coco Mademoiselle',
      'Chance fresh scent',
      'Luxury packaging',
      'Long-lasting formula',
      'Iconic Chanel quality',
      'Perfect gift set'
    ],
    material: 'Glass & Metal',
    color: 'Gold & Black',
    sizes: ['30ml', '50ml', '100ml'],
    availableSizes: ['30ml', '50ml'],
    isTrending: true,
    delivery: {
      standard: {
        estimatedDays: '3-4 business days',
        price: 12999,
        originalPrice: 17999,
        discount: 28
      },
      express: {
        estimatedDays: '1-2 business days',
        price: 13499
      }
    },
    offers: {
      bankOffers: ['30% off on HDFC Credit Card', '25% off on ICICI Bank Debit Card', '20% off on SBI Credit Card'],
      couponOffers: ['LUXURY40 - 40% off on luxury', 'CHANEL30 - 30% off', 'PERFUME25 - 25% off on fragrances'],
      additionalDiscount: 2000
    },
    returnPolicy: '30 days return & exchange policy',
    paymentOptions: {
      cod: true,
      codFee: 0
    },
    similarProducts: ['11', '12', '1', '2'],
    youMayAlsoLike: ['3', '4', '5', '6'],
    reviews: [
      {
        _id: 'r28',
        userId: 'u28',
        userName: 'Isabella Rodriguez',
        rating: 5,
        comment: 'Absolutely divine! The Chanel collection is everything I hoped for. Each fragrance is unique and beautiful. The packaging is luxurious and makes a perfect gift.',
        date: '1 day ago',
        verified: true,
        helpful: 67
      },
      {
        _id: 'r29',
        userId: 'u29',
        userName: 'Victoria Chen',
        rating: 5,
        comment: 'Incredible value for money! Three iconic Chanel fragrances in one set. The quality is outstanding and the scents are long-lasting. Highly recommend!',
        date: '2 days ago',
        verified: true,
        helpful: 54
      },
      {
        _id: 'r30',
        userId: 'u30',
        userName: 'Grace Thompson',
        rating: 4,
        comment: 'Beautiful fragrance collection! The scents are amazing and the packaging is elegant. Only minor issue is the bottles could be slightly larger.',
        date: '3 days ago',
        verified: true,
        helpful: 41
      }
    ],
    questions: [
      {
        _id: 'q20',
        question: 'What are the main notes in each fragrance?',
        answer: 'No. 5 features aldehydes and florals, Coco Mademoiselle has rose and jasmine with patchouli, and Chance includes pink pepper, jasmine, and patchouli.',
        askedBy: 'Customer',
        answeredBy: 'Chanel Customer Service',
        date: '1 day ago',
        helpful: 19
      },
      {
        _id: 'q21',
        question: 'How long do these fragrances last?',
        answer: 'These are eau de parfum concentrations, so they typically last 6-8 hours on the skin. The longevity may vary depending on your skin type and application method.',
        askedBy: 'Customer',
        answeredBy: 'Chanel Customer Service',
        date: '2 days ago',
        helpful: 15
      }
    ],
    createdAt: '2024-01-04T07:30:00Z',
    updatedAt: '2024-01-11T16:45:00Z'
  },
  {
    _id: '68d4f81292fd3e38ac2240b2',
    name: 'Designer Sunglasses',
    brand: 'Ray-Ban',
    price: 8999,
    originalPrice: 12999,
    discount: 4000,
    discountPercentage: 31,
    rating: 4.6,
    reviewCount: 178,
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1571513720946-db1180a639b8?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1594736797933-d0c29d0b8b0a?w=400&h=600&fit=crop'
    ],
    category: 'Accessories',
    subcategory: 'Sunglasses',
    description: 'Iconic Ray-Ban sunglasses featuring classic aviator design with premium lens technology. These sunglasses offer 100% UV protection, polarized lenses, and timeless style. Perfect for both fashion and function, they complement any outfit and provide excellent eye protection.',
    features: [
      '100% UV protection',
      'Polarized lenses',
      'Classic aviator design',
      'Premium lens technology',
      'Lightweight frame',
      'Timeless style',
      'Durable construction',
      'Comes with case'
    ],
    material: 'Metal & Glass',
    color: 'Gold & Brown',
    sizes: ['One Size'],
    availableSizes: ['One Size'],
    isTrending: true,
    delivery: {
      standard: {
        estimatedDays: '2-3 business days',
        price: 8999,
        originalPrice: 12999,
        discount: 31
      },
      express: {
        estimatedDays: '1 business day',
        price: 9199
      }
    },
    offers: {
      bankOffers: ['25% off on HDFC Credit Card', '20% off on ICICI Bank Debit Card', '15% off on SBI Credit Card'],
      couponOffers: ['SUNGLASSES30 - 30% off on sunglasses', 'RAYBAN25 - 25% off', 'ACCESSORIES20 - 20% off on accessories'],
      additionalDiscount: 1500
    },
    returnPolicy: '30 days return & exchange policy',
    paymentOptions: {
      cod: true,
      codFee: 0
    },
    similarProducts: ['12', '1', '2', '3'],
    youMayAlsoLike: ['4', '5', '6', '7'],
    reviews: [
      {
        _id: 'r31',
        userId: 'u31',
        userName: 'Daniel Martinez',
        rating: 5,
        comment: 'Perfect sunglasses! The quality is exceptional and the style is timeless. The polarized lenses work great and the fit is comfortable. Highly recommend!',
        date: '1 day ago',
        verified: true,
        helpful: 42
      },
      {
        _id: 'r32',
        userId: 'u32',
        userName: 'Carlos Rodriguez',
        rating: 5,
        comment: 'Excellent Ray-Ban sunglasses! The classic aviator design never goes out of style. The lens quality is outstanding and they provide great UV protection.',
        date: '2 days ago',
        verified: true,
        helpful: 38
      },
      {
        _id: 'r33',
        userId: 'u33',
        userName: 'Antonio Silva',
        rating: 4,
        comment: 'Great sunglasses with excellent quality. The polarized lenses are very effective and the build quality is solid. Only minor issue is the nose pads could be more comfortable.',
        date: '3 days ago',
        verified: true,
        helpful: 29
      }
    ],
    questions: [
      {
        _id: 'q22',
        question: 'Are these sunglasses suitable for driving?',
        answer: 'Yes, these sunglasses are perfect for driving. The polarized lenses reduce glare and provide excellent visibility, making them ideal for road trips and daily driving.',
        askedBy: 'Customer',
        answeredBy: 'Ray-Ban Customer Service',
        date: '1 day ago',
        helpful: 16
      },
      {
        _id: 'q23',
        question: 'What is the difference between polarized and regular lenses?',
        answer: 'Polarized lenses reduce glare from reflective surfaces like water, snow, and roads, providing better clarity and comfort. They also offer 100% UV protection and enhance contrast.',
        askedBy: 'Customer',
        answeredBy: 'Ray-Ban Customer Service',
        date: '2 days ago',
        helpful: 12
      }
    ],
    createdAt: '2024-01-06T15:20:00Z',
    updatedAt: '2024-01-10T11:35:00Z'
  },
  {
    _id: '68d4f812c4123a585b18d062',
    name: 'Luxury Watch Collection',
    brand: 'Rolex',
    price: 49999,
    originalPrice: 69999,
    discount: 20000,
    discountPercentage: 29,
    rating: 4.9,
    reviewCount: 89,
    image: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1571513720946-db1180a639b8?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1594736797933-d0c29d0b8b0a?w=400&h=600&fit=crop'
    ],
    category: 'Accessories',
    subcategory: 'Watches',
    description: 'Exquisite luxury watch collection featuring iconic Rolex timepieces. This collection includes classic designs with Swiss precision, premium materials, and timeless elegance. Each watch is a masterpiece of craftsmanship, perfect for special occasions and as a valuable investment.',
    features: [
      'Swiss precision movement',
      'Premium materials',
      'Water resistant',
      'Timeless design',
      'Luxury packaging',
      'Investment piece',
      'Classic elegance',
      'Comes with warranty'
    ],
    material: 'Gold & Steel',
    color: 'Gold & Silver',
    sizes: ['One Size'],
    availableSizes: ['One Size'],
    isTrending: true,
    delivery: {
      standard: {
        estimatedDays: '5-7 business days',
        price: 49999,
        originalPrice: 69999,
        discount: 29
      },
      express: {
        estimatedDays: '2-3 business days',
        price: 50999
      }
    },
    offers: {
      bankOffers: ['40% off on HDFC Credit Card', '35% off on ICICI Bank Debit Card', '30% off on SBI Credit Card'],
      couponOffers: ['LUXURY50 - 50% off on luxury', 'ROLEX40 - 40% off', 'WATCH35 - 35% off on watches'],
      additionalDiscount: 10000
    },
    returnPolicy: '30 days return & exchange policy',
    paymentOptions: {
      cod: true,
      codFee: 0
    },
    similarProducts: ['1', '2', '3', '4'],
    youMayAlsoLike: ['5', '6', '7', '8'],
    reviews: [
      {
        _id: 'r34',
        userId: 'u34',
        userName: 'James Anderson',
        rating: 5,
        comment: 'Absolutely stunning watch! The craftsmanship is exceptional and the quality is unmatched. This is a true investment piece that will last a lifetime. Highly recommend!',
        date: '1 day ago',
        verified: true,
        helpful: 78
      },
      {
        _id: 'r35',
        userId: 'u35',
        userName: 'William Thompson',
        rating: 5,
        comment: 'Incredible luxury watch! The Swiss precision is amazing and the design is timeless. This watch is perfect for special occasions and business meetings.',
        date: '2 days ago',
        verified: true,
        helpful: 65
      },
      {
        _id: 'r36',
        userId: 'u36',
        userName: 'Robert Wilson',
        rating: 5,
        comment: 'Outstanding quality and design! The Rolex craftsmanship is legendary and this watch lives up to the reputation. Worth every penny!',
        date: '3 days ago',
        verified: true,
        helpful: 52
      }
    ],
    questions: [
      {
        _id: 'q24',
        question: 'What is the warranty period for this watch?',
        answer: 'This watch comes with a 5-year international warranty from Rolex, covering manufacturing defects and servicing. The warranty is valid worldwide at authorized Rolex service centers.',
        askedBy: 'Customer',
        answeredBy: 'Rolex Customer Service',
        date: '1 day ago',
        helpful: 24
      },
      {
        _id: 'q25',
        question: 'Is this watch suitable for daily wear?',
        answer: 'Yes, this watch is designed for daily wear and is water resistant. However, we recommend regular servicing every 5-7 years to maintain optimal performance.',
        askedBy: 'Customer',
        answeredBy: 'Rolex Customer Service',
        date: '2 days ago',
        helpful: 18
      }
    ],
    createdAt: '2024-01-09T12:45:00Z',
    updatedAt: '2024-01-09T12:45:00Z'
  }
];

// Helper functions for easy backend integration
export const getProductById = (id: string): Product | undefined => {
  return mockProducts.find(product => product._id === id);
};

export const getProductsByCategory = (category: string): Product[] => {
  return mockProducts.filter(product => product.category === category);
};

export const getSimilarProducts = (productId: string, limit: number = 4): Product[] => {
  const product = getProductById(productId);
  if (!product) return [];
  
  return product.similarProducts
    .map(id => getProductById(id))
    .filter(Boolean)
    .slice(0, limit) as Product[];
};

export const getYouMayAlsoLike = (productId: string, limit: number = 4): Product[] => {
  const product = getProductById(productId);
  if (!product) return [];
  
  return product.youMayAlsoLike
    .map(id => getProductById(id))
    .filter(Boolean)
    .slice(0, limit) as Product[];
};

export const searchProducts = (query: string): Product[] => {
  const lowercaseQuery = query.toLowerCase();
  return mockProducts.filter(product => 
    product.name.toLowerCase().includes(lowercaseQuery) ||
    product.brand.toLowerCase().includes(lowercaseQuery) ||
    product.category.toLowerCase().includes(lowercaseQuery) ||
    product.subcategory.toLowerCase().includes(lowercaseQuery)
  );
};

export const getTrendingProducts = (limit: number = 8): Product[] => {
  return mockProducts
    .filter(product => product.isTrending)
    .slice(0, limit);
};

export const getNewProducts = (limit: number = 8): Product[] => {
  return mockProducts
    .filter(product => product.isNew)
    .slice(0, limit);
};
