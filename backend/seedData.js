const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Room = require('./models/Room');

// Dummy users data
const dummyUsers = [
  {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    password: 'password123',
    location: 'New York, NY',
    profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    preferences: {
      stylePreferences: ['casual', 'formal', 'party'],
      budgetRange: { min: 100, max: 500 },
      favoriteBrands: ['Zara', 'H&M', 'Nike'],
      sizePreferences: { top: 'M', bottom: 'M', shoes: '8' }
    },
    stats: {
      roomsCreated: 2,
      wardrobesOwned: 1,
      itemsPurchased: 15,
      styleScore: 85
    },
    badges: ['trendsetter', 'style-guru'],
    isEmailVerified: true
  },
  {
    name: 'Priya Patel',
    email: 'priya.patel@example.com',
    password: 'password123',
    location: 'Mumbai, India',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    preferences: {
      stylePreferences: ['ethnic', 'casual', 'traditional'],
      budgetRange: { min: 50, max: 300 },
      favoriteBrands: ['FabIndia', 'W', 'Myntra'],
      sizePreferences: { top: 'S', bottom: 'S', shoes: '7' }
    },
    stats: {
      roomsCreated: 1,
      wardrobesOwned: 2,
      itemsPurchased: 8,
      styleScore: 92
    },
    badges: ['style-guru', 'trendsetter'],
    isEmailVerified: true
  },
  {
    name: 'Emma Wilson',
    email: 'emma.wilson@example.com',
    password: 'password123',
    location: 'London, UK',
    profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    preferences: {
      stylePreferences: ['casual', 'party', 'western'],
      budgetRange: { min: 200, max: 800 },
      favoriteBrands: ['Urban Outfitters', 'Free People', 'ASOS'],
      sizePreferences: { top: 'L', bottom: 'L', shoes: '9' }
    },
    stats: {
      roomsCreated: 3,
      wardrobesOwned: 1,
      itemsPurchased: 22,
      styleScore: 78
    },
    badges: ['early-adopter', 'shopping-pro'],
    isEmailVerified: true
  },
  {
    name: 'Aisha Khan',
    email: 'aisha.khan@example.com',
    password: 'password123',
    location: 'Dubai, UAE',
    profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    preferences: {
      stylePreferences: ['formal', 'ethnic', 'western'],
      budgetRange: { min: 150, max: 600 },
      favoriteBrands: ['Mango', 'Massimo Dutti', 'COS'],
      sizePreferences: { top: 'M', bottom: 'M', shoes: '8' }
    },
    stats: {
      roomsCreated: 1,
      wardrobesOwned: 3,
      itemsPurchased: 12,
      styleScore: 88
    },
    badges: ['ethnic-expert', 'style-guru'],
    isEmailVerified: true
  },
  {
    name: 'Maya Chen',
    email: 'maya.chen@example.com',
    password: 'password123',
    location: 'Shanghai, China',
    profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    preferences: {
      stylePreferences: ['casual', 'formal', 'western'],
      budgetRange: { min: 100, max: 400 },
      favoriteBrands: ['Uniqlo', 'COS', 'Everlane'],
      sizePreferences: { top: 'S', bottom: 'S', shoes: '7' }
    },
    stats: {
      roomsCreated: 2,
      wardrobesOwned: 2,
      itemsPurchased: 18,
      styleScore: 95
    },
    badges: ['style-guru', 'shopping-pro'],
    isEmailVerified: true
  }
];

// Dummy rooms data
const dummyRooms = [
  {
    name: 'Summer Fashion 2024',
    emoji: '☀️',
    description: 'Planning our summer wardrobe with the latest trends and colors',
    isPrivate: false,
    settings: {
      allowMemberInvites: true,
      aiEnabled: true,
      voiceCallEnabled: true
    },
    tags: ['summer', 'fashion', 'trends'],
    isActive: true
  },
  {
    name: 'Wedding Outfits',
    emoji: '💍',
    description: 'Finding the perfect outfits for the upcoming wedding season',
    isPrivate: true,
    settings: {
      allowMemberInvites: true,
      aiEnabled: true,
      voiceCallEnabled: false
    },
    tags: ['wedding', 'formal', 'special occasion'],
    isActive: true
  },
  {
    name: 'Work Wardrobe',
    emoji: '💼',
    description: 'Building a professional wardrobe for the office',
    isPrivate: false,
    settings: {
      allowMemberInvites: true,
      aiEnabled: true,
      voiceCallEnabled: true
    },
    tags: ['work', 'professional', 'business'],
    isActive: true
  },
  {
    name: 'Casual Friday',
    emoji: '👕',
    description: 'Relaxed and comfortable outfits for casual Fridays',
    isPrivate: false,
    settings: {
      allowMemberInvites: true,
      aiEnabled: false,
      voiceCallEnabled: true
    },
    tags: ['casual', 'comfortable', 'relaxed'],
    isActive: true
  },
  {
    name: 'Date Night Looks',
    emoji: '🌹',
    description: 'Elegant and romantic outfits for special dates',
    isPrivate: true,
    settings: {
      allowMemberInvites: false,
      aiEnabled: true,
      voiceCallEnabled: true
    },
    tags: ['date night', 'romantic', 'elegant'],
    isActive: true
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Room.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const createdUsers = [];
    for (const userData of dummyUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = new User({
        ...userData,
        password: hashedPassword
      });
      const savedUser = await user.save();
      createdUsers.push(savedUser);
      console.log(`Created user: ${savedUser.name}`);
    }

    // Create rooms with random owners and members
    for (let i = 0; i < dummyRooms.length; i++) {
      const roomData = dummyRooms[i];
      const owner = createdUsers[i % createdUsers.length];
      
      // Create members array with owner and some random members
      const members = [{
        userId: owner._id,
        role: 'Owner',
        joinedAt: new Date()
      }];

      // Add 1-3 random members to each room
      const numMembers = Math.floor(Math.random() * 3) + 1;
      const otherUsers = createdUsers.filter(u => u._id.toString() !== owner._id.toString());
      const shuffledUsers = otherUsers.sort(() => 0.5 - Math.random());
      
      for (let j = 0; j < Math.min(numMembers, shuffledUsers.length); j++) {
        const member = shuffledUsers[j];
        members.push({
          userId: member._id,
          role: ['Editor', 'Contributor', 'Viewer'][Math.floor(Math.random() * 3)],
          joinedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random date within last week
        });
      }

      const room = new Room({
        ...roomData,
        owner: owner._id,
        members: members,
        lastActivity: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last month
        memberCount: members.length
      });

      const savedRoom = await room.save();
      console.log(`Created room: ${savedRoom.name} with ${savedRoom.memberCount} members`);
    }

    console.log('Database seeded successfully!');
    console.log(`Created ${createdUsers.length} users and ${dummyRooms.length} rooms`);

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seed function
seedDatabase();
