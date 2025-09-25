const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

async function checkUser() {
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

    // Find the user (include password field)
    const user = await User.findOne({ email: 'priya@example.com' }).select('+password');
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('👤 User found:', user.email);
    console.log('📧 Email:', user.email);
    console.log('🔑 Password hash:', user.password);
    console.log('📅 Created:', user.createdAt);

    // Test password
    const testPassword = 'password123';
    console.log('🔐 Testing password:', testPassword);
    console.log('🔐 Against hash:', user.password);
    
    const isMatch = await bcrypt.compare(testPassword, user.password);
    console.log('🔐 Password match:', isMatch);
    
    // Test creating a new hash with the same password
    const newHash = await bcrypt.hash(testPassword, 10);
    console.log('🔐 New hash:', newHash);
    const newMatch = await bcrypt.compare(testPassword, newHash);
    console.log('🔐 New hash match:', newMatch);

    // Test with different password
    const wrongPassword = 'wrongpassword';
    const isWrongMatch = await bcrypt.compare(wrongPassword, user.password);
    console.log('❌ Wrong password match:', isWrongMatch);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

checkUser();
