export interface ProductDetail {
  id: string;
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
  selectedSize?: string;
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
  reviews: {
    id: string;
    userName: string;
    rating: number;
    comment: string;
    date: string;
    verified: boolean;
  }[];
  questions: {
    id: string;
    question: string;
    answer: string;
    askedBy: string;
    answeredBy: string;
    date: string;
  }[];
}

export const mockProductsDetail: ProductDetail[] = [
  {
    id: '1',
    name: 'Floral Printed Chiffon Empire Dress',
    brand: 'Label Ritu Kumar',
    price: 1440,
    originalPrice: 4800,
    discount: 3360,
    discountPercentage: 70,
    rating: 4.1,
    reviewCount: 23,
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=600&fit=crop'
    ],
    category: 'Women',
    subcategory: 'Dresses',
    description: 'Pink and yellow floral print empire dress with flowy chiffon fabric. Perfect for casual outings and semi-formal occasions. Features a comfortable empire waistline and short sleeves.',
    features: [
      '100% Chiffon fabric',
      'Machine washable',
      'Empire waistline',
      'Short sleeves',
      'Knee length',
      'Floral print design'
    ],
    material: 'Chiffon',
    color: 'Pink & Yellow Floral',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    availableSizes: ['XS', 'S', 'M', 'L'],
    isNew: true,
    isSustainable: true,
    sustainability: 'Regular',
    delivery: {
      standard: {
        estimatedDays: '25 September - 2 October',
        price: 1440,
        originalPrice: 4800,
        discount: 70
      }
    },
    offers: {
      bankOffers: ['10% off on Axis Bank Credit Card', '5% off on HDFC Bank Debit Card'],
      couponOffers: ['MYNTRA10 - 10% off', 'WELCOME20 - 20% off for new users'],
      additionalDiscount: 234
    },
    returnPolicy: 'Hassle free 7 days Return & Exchange',
    paymentOptions: {
      cod: true,
      codFee: 10
    },
    similarProducts: ['2', '3', '4', '5'],
    youMayAlsoLike: ['6', '7', '8', '9'],
    reviews: [
      {
        id: '1',
        userName: 'Priya S.',
        rating: 5,
        comment: 'Beautiful dress! Perfect fit and the fabric is so comfortable. The floral print is exactly as shown.',
        date: '2 days ago',
        verified: true
      },
      {
        id: '2',
        userName: 'Anita M.',
        rating: 4,
        comment: 'Good quality dress. The color is slightly different than expected but overall satisfied.',
        date: '1 week ago',
        verified: true
      }
    ],
    questions: [
      {
        id: '1',
        question: 'What is the fabric composition?',
        answer: 'This dress is made of 100% chiffon fabric which is lightweight and breathable.',
        askedBy: 'Customer',
        answeredBy: 'Label Ritu Kumar',
        date: '3 days ago'
      },
      {
        id: '2',
        question: 'Is this suitable for plus size?',
        answer: 'Yes, this dress is available in sizes XS to XL and the empire waistline is flattering for all body types.',
        askedBy: 'Customer',
        answeredBy: 'Label Ritu Kumar',
        date: '1 week ago'
      }
    ]
  },
  {
    id: '2',
    name: 'Printed A-Line Dress',
    brand: 'Label Ritu Kumar',
    price: 1410,
    originalPrice: 4700,
    discount: 3290,
    discountPercentage: 70,
    rating: 3.7,
    reviewCount: 15,
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=600&fit=crop'
    ],
    category: 'Women',
    subcategory: 'Dresses',
    description: 'Orange-red printed A-line dress with short puffed sleeves and V-neckline. Perfect for casual and semi-formal occasions.',
    features: [
      'A-line silhouette',
      'Short puffed sleeves',
      'V-neckline',
      'Printed design',
      'Knee length',
      'Comfortable fit'
    ],
    material: 'Polyester',
    color: 'Orange-Red',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    availableSizes: ['XS', 'S', 'M', 'L'],
    isTrending: true,
    delivery: {
      standard: {
        estimatedDays: '26 September - 3 October',
        price: 1410,
        originalPrice: 4700,
        discount: 70
      }
    },
    offers: {
      bankOffers: ['10% off on Axis Bank Credit Card'],
      couponOffers: ['MYNTRA10 - 10% off'],
      additionalDiscount: 200
    },
    returnPolicy: 'Hassle free 7 days Return & Exchange',
    paymentOptions: {
      cod: true,
      codFee: 10
    },
    similarProducts: ['1', '3', '4', '5'],
    youMayAlsoLike: ['6', '7', '8', '9'],
    reviews: [
      {
        id: '1',
        userName: 'Riya K.',
        rating: 4,
        comment: 'Nice dress, good quality fabric. The A-line cut is very flattering.',
        date: '3 days ago',
        verified: true
      }
    ],
    questions: []
  },
  {
    id: '3',
    name: 'Floral Print Dress',
    brand: 'Label Ritu Kumar',
    price: 1140,
    originalPrice: 3800,
    discount: 2660,
    discountPercentage: 70,
    rating: 4.1,
    reviewCount: 8,
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=600&fit=crop'
    ],
    category: 'Women',
    subcategory: 'Dresses',
    description: 'Blue floral print dress with A-line silhouette and comfortable fit. Perfect for casual outings.',
    features: [
      'Blue floral print',
      'A-line silhouette',
      'Short sleeves',
      'V-neckline',
      'Knee length',
      'Comfortable fit'
    ],
    material: 'Cotton Blend',
    color: 'Blue Floral',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    availableSizes: ['XS', 'S', 'M', 'L'],
    delivery: {
      standard: {
        estimatedDays: '27 September - 4 October',
        price: 1140,
        originalPrice: 3800,
        discount: 70
      }
    },
    offers: {
      bankOffers: ['10% off on Axis Bank Credit Card'],
      couponOffers: ['MYNTRA10 - 10% off'],
      additionalDiscount: 150
    },
    returnPolicy: 'Hassle free 7 days Return & Exchange',
    paymentOptions: {
      cod: true,
      codFee: 10
    },
    similarProducts: ['1', '2', '4', '5'],
    youMayAlsoLike: ['6', '7', '8', '9'],
    reviews: [],
    questions: []
  },
  {
    id: '4',
    name: 'Floral Print Dress',
    brand: 'aarke',
    price: 1400,
    originalPrice: 2800,
    discount: 1400,
    discountPercentage: 50,
    rating: 4.3,
    reviewCount: 12,
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=600&fit=crop'
    ],
    category: 'Women',
    subcategory: 'Dresses',
    description: 'Light green floral print dress with long sleeves and elegant design. Perfect for formal occasions.',
    features: [
      'Light green floral print',
      'Long sleeves',
      'Elegant design',
      'Knee length',
      'Formal wear',
      'Comfortable fit'
    ],
    material: 'Polyester',
    color: 'Light Green Floral',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    availableSizes: ['XS', 'S', 'M', 'L'],
    delivery: {
      standard: {
        estimatedDays: '28 September - 5 October',
        price: 1400,
        originalPrice: 2800,
        discount: 50
      }
    },
    offers: {
      bankOffers: ['10% off on Axis Bank Credit Card'],
      couponOffers: ['MYNTRA10 - 10% off'],
      additionalDiscount: 100
    },
    returnPolicy: 'Hassle free 7 days Return & Exchange',
    paymentOptions: {
      cod: true,
      codFee: 10
    },
    similarProducts: ['1', '2', '3', '5'],
    youMayAlsoLike: ['6', '7', '8', '9'],
    reviews: [],
    questions: []
  },
  {
    id: '5',
    name: 'Women Ethnic Kurta',
    brand: 'anayna',
    price: 379,
    originalPrice: 1998,
    discount: 1619,
    discountPercentage: 81,
    rating: 4.2,
    reviewCount: 45,
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=600&fit=crop'
    ],
    category: 'Women',
    subcategory: 'Ethnic Wear',
    description: 'Pink women ethnic kurta with white geometric print and white trim. Perfect for traditional occasions and festivals.',
    features: [
      'Pink ethnic kurta',
      'White geometric print',
      'White trim details',
      'V-neckline',
      'Long sleeves',
      'Knee length'
    ],
    material: 'Cotton',
    color: 'Pink with White Print',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    availableSizes: ['XS', 'S', 'M', 'L', 'XL'],
    isTrending: true,
    delivery: {
      standard: {
        estimatedDays: '24 September - 1 October',
        price: 379,
        originalPrice: 1998,
        discount: 81
      }
    },
    offers: {
      bankOffers: ['15% off on SBI Credit Card', '10% off on HDFC Bank Debit Card'],
      couponOffers: ['ETHNIC20 - 20% off on ethnic wear', 'MYNTRA10 - 10% off'],
      additionalDiscount: 50
    },
    returnPolicy: 'Hassle free 7 days Return & Exchange',
    paymentOptions: {
      cod: true,
      codFee: 10
    },
    similarProducts: ['6', '7', '8', '9'],
    youMayAlsoLike: ['1', '2', '3', '4'],
    reviews: [
      {
        id: '1',
        userName: 'Sunita R.',
        rating: 5,
        comment: 'Beautiful ethnic kurta! Perfect for festivals. The quality is excellent for the price.',
        date: '1 day ago',
        verified: true
      },
      {
        id: '2',
        userName: 'Meera P.',
        rating: 4,
        comment: 'Good quality and comfortable fit. The print is very traditional and elegant.',
        date: '4 days ago',
        verified: true
      }
    ],
    questions: [
      {
        id: '1',
        question: 'Is this suitable for daily wear?',
        answer: 'Yes, this kurta is perfect for both daily wear and special occasions. The cotton fabric makes it comfortable for all-day wear.',
        askedBy: 'Customer',
        answeredBy: 'anayna',
        date: '2 days ago'
      }
    ]
  },
  {
    id: '6',
    name: 'Anti-Frizz Argan Oil Shampoo',
    brand: 'Love Beauty & Planet',
    price: 200,
    originalPrice: 400,
    discount: 200,
    discountPercentage: 50,
    rating: 4.4,
    reviewCount: 128,
    image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=600&fit=crop'
    ],
    category: 'Beauty',
    subcategory: 'Hair Care',
    description: 'LOVE beauty AND planet Anti-Frizz Argan Oil Shampoo with up to 48 hours of frizz control. Made with natural ingredients.',
    features: [
      'Up to 48 hours frizz control',
      'Argan oil formula',
      'Natural ingredients',
      'Sulfate-free',
      'Paraben-free',
      'Cruelty-free'
    ],
    material: 'Liquid',
    color: 'Purple',
    sizes: ['250ml', '400ml', '1L'],
    availableSizes: ['250ml', '400ml'],
    isSustainable: true,
    sustainability: 'Eco-friendly packaging',
    delivery: {
      standard: {
        estimatedDays: '25 September - 2 October',
        price: 200,
        originalPrice: 400,
        discount: 50
      }
    },
    offers: {
      bankOffers: ['10% off on Axis Bank Credit Card'],
      couponOffers: ['BEAUTY15 - 15% off on beauty products', 'MYNTRA10 - 10% off'],
      additionalDiscount: 30
    },
    returnPolicy: 'Hassle free 7 days Return & Exchange',
    paymentOptions: {
      cod: true,
      codFee: 10
    },
    similarProducts: ['7', '8', '9', '10'],
    youMayAlsoLike: ['1', '2', '3', '4'],
    reviews: [
      {
        id: '1',
        userName: 'Kavya S.',
        rating: 5,
        comment: 'Amazing shampoo! My hair feels so soft and the frizz is completely controlled. Highly recommended!',
        date: '2 days ago',
        verified: true
      },
      {
        id: '2',
        userName: 'Ritu M.',
        rating: 4,
        comment: 'Good product, works well for frizzy hair. The smell is pleasant too.',
        date: '1 week ago',
        verified: true
      }
    ],
    questions: [
      {
        id: '1',
        question: 'Is this suitable for all hair types?',
        answer: 'Yes, this shampoo is suitable for all hair types, especially beneficial for frizzy and dry hair.',
        askedBy: 'Customer',
        answeredBy: 'Love Beauty & Planet',
        date: '3 days ago'
      }
    ]
  },
  {
    id: '7',
    name: 'Women Glittery Flip-Flop Sandals',
    brand: 'DOCTOR',
    price: 399,
    originalPrice: 799,
    discount: 400,
    discountPercentage: 50,
    rating: 3.7,
    reviewCount: 23,
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=600&fit=crop'
    ],
    category: 'Footwear',
    subcategory: 'Sandals',
    description: 'Black glittery flip-flop sandals with sparkly gold strap. Perfect for casual outings and beach wear.',
    features: [
      'Black glittery design',
      'Sparkly gold strap',
      'Comfortable sole',
      'Lightweight',
      'Waterproof',
      'Easy to clean'
    ],
    material: 'Synthetic',
    color: 'Black with Gold Glitter',
    sizes: ['6', '7', '8', '9', '10'],
    availableSizes: ['6', '7', '8', '9'],
    delivery: {
      standard: {
        estimatedDays: '26 September - 3 October',
        price: 399,
        originalPrice: 799,
        discount: 50
      }
    },
    offers: {
      bankOffers: ['10% off on Axis Bank Credit Card'],
      couponOffers: ['FOOTWEAR10 - 10% off on footwear', 'MYNTRA10 - 10% off'],
      additionalDiscount: 50
    },
    returnPolicy: 'Hassle free 7 days Return & Exchange',
    paymentOptions: {
      cod: true,
      codFee: 10
    },
    similarProducts: ['8', '9', '10', '11'],
    youMayAlsoLike: ['1', '2', '3', '4'],
    reviews: [
      {
        id: '1',
        userName: 'Sneha K.',
        rating: 4,
        comment: 'Nice sandals, comfortable to wear. The glitter looks beautiful.',
        date: '3 days ago',
        verified: true
      }
    ],
    questions: []
  },
  {
    id: '8',
    name: 'Denim Jacket',
    brand: 'Roadster',
    price: 1899,
    originalPrice: 2999,
    discount: 1100,
    discountPercentage: 37,
    rating: 4.5,
    reviewCount: 67,
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=600&fit=crop'
    ],
    category: 'Women',
    subcategory: 'Jackets',
    description: 'Classic denim jacket with comfortable fit and timeless style. Perfect for layering and casual outings.',
    features: [
      '100% Cotton Denim',
      'Classic fit',
      'Button closure',
      'Chest pockets',
      'Long sleeves',
      'Machine washable'
    ],
    material: 'Cotton Denim',
    color: 'Blue',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    availableSizes: ['XS', 'S', 'M', 'L', 'XL'],
    isTrending: true,
    delivery: {
      standard: {
        estimatedDays: '25 September - 2 October',
        price: 1899,
        originalPrice: 2999,
        discount: 37
      }
    },
    offers: {
      bankOffers: ['10% off on Axis Bank Credit Card', '5% off on HDFC Bank Debit Card'],
      couponOffers: ['JACKET15 - 15% off on jackets', 'MYNTRA10 - 10% off'],
      additionalDiscount: 200
    },
    returnPolicy: 'Hassle free 7 days Return & Exchange',
    paymentOptions: {
      cod: true,
      codFee: 10
    },
    similarProducts: ['9', '10', '11', '12'],
    youMayAlsoLike: ['1', '2', '3', '4'],
    reviews: [
      {
        id: '1',
        userName: 'Anjali P.',
        rating: 5,
        comment: 'Perfect denim jacket! Great quality and fits perfectly. Very versatile piece.',
        date: '1 day ago',
        verified: true
      },
      {
        id: '2',
        userName: 'Riya S.',
        rating: 4,
        comment: 'Good quality denim jacket. The fit is comfortable and the style is classic.',
        date: '5 days ago',
        verified: true
      }
    ],
    questions: [
      {
        id: '1',
        question: 'Is this true to size?',
        answer: 'Yes, this jacket is true to size. We recommend ordering your usual size for the best fit.',
        askedBy: 'Customer',
        answeredBy: 'Roadster',
        date: '2 days ago'
      }
    ]
  },
  {
    id: '9',
    name: 'Cotton T-Shirt',
    brand: 'H&M',
    price: 599,
    originalPrice: 599,
    discount: 0,
    discountPercentage: 0,
    rating: 4.0,
    reviewCount: 89,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=600&fit=crop'
    ],
    category: 'Men',
    subcategory: 'T-Shirts',
    description: 'Comfortable cotton t-shirt with classic fit. Perfect for everyday wear and casual outings.',
    features: [
      '100% Cotton',
      'Classic fit',
      'Round neck',
      'Short sleeves',
      'Machine washable',
      'Comfortable'
    ],
    material: 'Cotton',
    color: 'White',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    availableSizes: ['S', 'M', 'L', 'XL', 'XXL'],
    delivery: {
      standard: {
        estimatedDays: '24 September - 1 October',
        price: 599,
        originalPrice: 599,
        discount: 0
      }
    },
    offers: {
      bankOffers: ['10% off on Axis Bank Credit Card'],
      couponOffers: ['MYNTRA10 - 10% off'],
      additionalDiscount: 0
    },
    returnPolicy: 'Hassle free 7 days Return & Exchange',
    paymentOptions: {
      cod: true,
      codFee: 10
    },
    similarProducts: ['10', '11', '12', '1'],
    youMayAlsoLike: ['2', '3', '4', '5'],
    reviews: [
      {
        id: '1',
        userName: 'Rahul K.',
        rating: 4,
        comment: 'Good quality t-shirt, comfortable to wear. Perfect for daily use.',
        date: '2 days ago',
        verified: true
      }
    ],
    questions: []
  },
  {
    id: '10',
    name: 'Running Shoes',
    brand: 'Nike',
    price: 4999,
    originalPrice: 7999,
    discount: 3000,
    discountPercentage: 38,
    rating: 4.7,
    reviewCount: 156,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=600&fit=crop'
    ],
    category: 'Sports',
    subcategory: 'Running Shoes',
    description: 'High-performance running shoes with advanced cushioning and breathable upper. Perfect for running and athletic activities.',
    features: [
      'Advanced cushioning',
      'Breathable upper',
      'Lightweight design',
      'Durable outsole',
      'Comfortable fit',
      'Athletic performance'
    ],
    material: 'Synthetic & Mesh',
    color: 'Black & White',
    sizes: ['7', '8', '9', '10', '11', '12'],
    availableSizes: ['7', '8', '9', '10', '11'],
    isTrending: true,
    delivery: {
      standard: {
        estimatedDays: '25 September - 2 October',
        price: 4999,
        originalPrice: 7999,
        discount: 38
      }
    },
    offers: {
      bankOffers: ['15% off on SBI Credit Card', '10% off on Axis Bank Credit Card'],
      couponOffers: ['SPORTS20 - 20% off on sports wear', 'MYNTRA10 - 10% off'],
      additionalDiscount: 500
    },
    returnPolicy: 'Hassle free 7 days Return & Exchange',
    paymentOptions: {
      cod: true,
      codFee: 10
    },
    similarProducts: ['11', '12', '1', '2'],
    youMayAlsoLike: ['3', '4', '5', '6'],
    reviews: [
      {
        id: '1',
        userName: 'Vikram S.',
        rating: 5,
        comment: 'Excellent running shoes! Great cushioning and very comfortable. Perfect for long runs.',
        date: '1 day ago',
        verified: true
      },
      {
        id: '2',
        userName: 'Arjun M.',
        rating: 5,
        comment: 'Best running shoes I have ever owned. Great quality and performance.',
        date: '3 days ago',
        verified: true
      }
    ],
    questions: [
      {
        id: '1',
        question: 'Are these suitable for wide feet?',
        answer: 'Yes, these shoes are designed to accommodate various foot shapes including wide feet. We recommend trying your usual size first.',
        askedBy: 'Customer',
        answeredBy: 'Nike',
        date: '1 day ago'
      }
    ]
  },
  {
    id: '11',
    name: 'Silk Saree',
    brand: 'Sangria',
    price: 3999,
    originalPrice: 5999,
    discount: 2000,
    discountPercentage: 33,
    rating: 4.3,
    reviewCount: 34,
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=600&fit=crop'
    ],
    category: 'Women',
    subcategory: 'Sarees',
    description: 'Elegant silk saree with traditional design and beautiful drape. Perfect for special occasions and festivals.',
    features: [
      'Pure silk fabric',
      'Traditional design',
      'Beautiful drape',
      'Handcrafted details',
      'Festive wear',
      'Elegant look'
    ],
    material: 'Silk',
    color: 'Multi-color',
    sizes: ['One Size'],
    availableSizes: ['One Size'],
    delivery: {
      standard: {
        estimatedDays: '26 September - 3 October',
        price: 3999,
        originalPrice: 5999,
        discount: 33
      }
    },
    offers: {
      bankOffers: ['15% off on SBI Credit Card', '10% off on HDFC Bank Debit Card'],
      couponOffers: ['SAREES20 - 20% off on sarees', 'MYNTRA10 - 10% off'],
      additionalDiscount: 300
    },
    returnPolicy: 'Hassle free 7 days Return & Exchange',
    paymentOptions: {
      cod: true,
      codFee: 10
    },
    similarProducts: ['12', '1', '2', '3'],
    youMayAlsoLike: ['4', '5', '6', '7'],
    reviews: [
      {
        id: '1',
        userName: 'Priya M.',
        rating: 5,
        comment: 'Beautiful saree! The silk quality is excellent and the design is very elegant. Perfect for weddings.',
        date: '2 days ago',
        verified: true
      }
    ],
    questions: [
      {
        id: '1',
        question: 'Is this suitable for wedding occasions?',
        answer: 'Yes, this silk saree is perfect for wedding occasions and other special events. The elegant design and quality make it ideal for formal wear.',
        askedBy: 'Customer',
        answeredBy: 'Sangria',
        date: '4 days ago'
      }
    ]
  },
  {
    id: '12',
    name: 'Kids T-Shirt',
    brand: 'Gini & Jony',
    price: 399,
    originalPrice: 399,
    discount: 0,
    discountPercentage: 0,
    rating: 4.1,
    reviewCount: 23,
    image: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=600&fit=crop'
    ],
    category: 'Kids',
    subcategory: 'T-Shirts',
    description: 'Comfortable kids t-shirt with fun design and soft fabric. Perfect for everyday wear and play.',
    features: [
      'Soft cotton fabric',
      'Fun design',
      'Comfortable fit',
      'Easy to wash',
      'Kid-friendly',
      'Durable'
    ],
    material: 'Cotton',
    color: 'Blue',
    sizes: ['2-3Y', '3-4Y', '4-5Y', '5-6Y', '6-7Y'],
    availableSizes: ['2-3Y', '3-4Y', '4-5Y', '5-6Y', '6-7Y'],
    delivery: {
      standard: {
        estimatedDays: '24 September - 1 October',
        price: 399,
        originalPrice: 399,
        discount: 0
      }
    },
    offers: {
      bankOffers: ['10% off on Axis Bank Credit Card'],
      couponOffers: ['KIDS10 - 10% off on kids wear', 'MYNTRA10 - 10% off'],
      additionalDiscount: 0
    },
    returnPolicy: 'Hassle free 7 days Return & Exchange',
    paymentOptions: {
      cod: true,
      codFee: 10
    },
    similarProducts: ['1', '2', '3', '4'],
    youMayAlsoLike: ['5', '6', '7', '8'],
    reviews: [
      {
        id: '1',
        userName: 'Parent User',
        rating: 4,
        comment: 'Good quality t-shirt for kids. My child loves the design and it is very comfortable.',
        date: '3 days ago',
        verified: true
      }
    ],
    questions: []
  }
];

export const getProductById = (id: string): ProductDetail | undefined => {
  return mockProductsDetail.find(product => product.id === id);
};

export const getSimilarProducts = (productId: string, limit: number = 4): ProductDetail[] => {
  const product = getProductById(productId);
  if (!product) return [];
  
  return product.similarProducts
    .map(id => getProductById(id))
    .filter(Boolean)
    .slice(0, limit) as ProductDetail[];
};

export const getYouMayAlsoLike = (productId: string, limit: number = 4): ProductDetail[] => {
  const product = getProductById(productId);
  if (!product) return [];
  
  return product.youMayAlsoLike
    .map(id => getProductById(id))
    .filter(Boolean)
    .slice(0, limit) as ProductDetail[];
};
