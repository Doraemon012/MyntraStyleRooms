const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

async function fixUserPassword() {
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

    // Find the user
    const user = await User.findOne({ email: 'priya@example.com' });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('👤 User found:', user.email);

    // Set the password to plain text - pre-save hook will hash it
    const newPassword = 'password123';
    console.log('🔐 Setting password to:', newPassword);

    // Update the user's password (pre-save hook will hash it)
    user.password = newPassword;
    await user.save();

    console.log('✅ Password updated successfully');

    // Verify the password works using the model method
    const isMatch = await user.comparePassword(newPassword);
    console.log('🔐 Password verification:', isMatch);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

fixUserPassword();
