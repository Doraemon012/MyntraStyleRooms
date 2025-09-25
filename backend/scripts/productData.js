// Product data extracted from frontend for seeding
const mockProducts = [
  {
    _id: '1',
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
      }
    ],
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-20T14:45:00Z'
  },
  {
    _id: '2',
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
      }
    ],
    createdAt: '2024-01-10T09:15:00Z',
    updatedAt: '2024-01-18T11:20:00Z'
  },
  {
    _id: '3',
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
      }
    ],
    createdAt: '2024-01-12T14:30:00Z',
    updatedAt: '2024-01-19T16:45:00Z'
  },
  {
    _id: '4',
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
      }
    ],
    createdAt: '2024-01-08T12:00:00Z',
    updatedAt: '2024-01-17T10:30:00Z'
  },
  {
    _id: '5',
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
      }
    ],
    createdAt: '2024-01-05T08:45:00Z',
    updatedAt: '2024-01-16T13:20:00Z'
  }
];

const mockProductsDetail = [
  {
    id: '6',
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
    similarProducts: ['7', '8', '9', '10'],
    youMayAlsoLike: ['1', '2', '3', '4'],
    reviews: [
      {
        id: '1',
        userName: 'Priya S.',
        rating: 5,
        comment: 'Beautiful dress! Perfect fit and the fabric is so comfortable. The floral print is exactly as shown.',
        date: '2 days ago',
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
      }
    ]
  },
  {
    id: '7',
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
    similarProducts: ['6', '8', '9', '10'],
    youMayAlsoLike: ['1', '2', '3', '4'],
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
  }
];

module.exports = { mockProducts, mockProductsDetail };
