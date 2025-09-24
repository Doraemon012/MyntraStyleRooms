const mongoose = require('mongoose');
const Room = require('../models/Room');
const User = require('../models/User');
require('dotenv').config();

// Sample rooms data
const sampleRooms = [
  {
    name: 'Fashion Forward',
    description: 'A trendy room for fashion enthusiasts',
    isPrivate: false,
    settings: {
      allowMemberInvites: true,
      aiSuggestionsEnabled: true,
      autoOutfitGeneration: false
    },
    tags: ['fashion', 'trendy', 'style']
  },
  {
    name: 'Wedding Collection',
    description: 'Elegant pieces for special occasions',
    isPrivate: false,
    settings: {
      allowMemberInvites: true,
      aiSuggestionsEnabled: true,
      autoOutfitGeneration: true
    },
    tags: ['wedding', 'elegant', 'formal']
  },
  {
    name: 'Casual Vibes',
    description: 'Comfortable everyday wear',
    isPrivate: false,
    settings: {
      allowMemberInvites: true,
      aiSuggestionsEnabled: true,
      autoOutfitGeneration: false
    },
    tags: ['casual', 'comfortable', 'everyday']
  },
  {
    name: 'Office Professional',
    description: 'Professional attire for work',
    isPrivate: true,
    settings: {
      allowMemberInvites: true,
      aiSuggestionsEnabled: true,
      autoOutfitGeneration: false
    },
    tags: ['professional', 'office', 'work']
  }
];

async function seedRooms() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    const mongoUriWithDb = mongoUri.includes('myntra-fashion') 
      ? mongoUri 
      : mongoUri.replace('mongodb.net/', 'mongodb.net/myntra-fashion');

    await mongoose.connect(mongoUriWithDb, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Clear existing rooms
    await Room.deleteMany({});
    console.log('🗑️ Cleared existing rooms');

    // Get existing users
    const users = await User.find({});
    if (users.length === 0) {
      console.log('❌ No users found. Please run seedWardrobes.js first to create users.');
      return;
    }

    console.log(`👥 Found ${users.length} users`);

    // Create rooms
    const rooms = [];
    for (let i = 0; i < sampleRooms.length; i++) {
      const roomData = sampleRooms[i];
      const owner = users[i % users.length]; // Distribute ownership
      
      const room = new Room({
        ...roomData,
        owner: owner._id,
        members: [
          {
            userId: owner._id,
            role: 'Owner',
            joinedAt: new Date()
          }
        ]
      });

      // Add other users as members with different roles
      const otherUsers = users.filter(u => u._id.toString() !== owner._id.toString());
      for (let j = 0; j < Math.min(otherUsers.length, 3); j++) { // Add up to 3 other members
        const role = j === 0 ? 'Editor' : j === 1 ? 'Contributor' : 'Viewer';
        room.members.push({
          userId: otherUsers[j]._id,
          role: role,
          joinedAt: new Date()
        });
      }

      await room.save();
      rooms.push(room);
    }

    console.log(`🏠 Created ${rooms.length} rooms`);

    // Update room member counts
    for (const room of rooms) {
      room.memberCount = room.members.length;
      await room.save();
    }

    console.log('📊 Updated room member counts');

    console.log('\n🎉 Room seeding completed successfully!');
    console.log(`Created ${rooms.length} rooms with members`);

    // Print room details
    for (const room of rooms) {
      console.log(`- ${room.name}: ${room.memberCount} members`);
    }

  } catch (error) {
    console.error('❌ Error seeding rooms:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the seeding function
seedRooms();

