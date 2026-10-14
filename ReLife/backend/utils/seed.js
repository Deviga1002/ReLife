/**
 * Seed script – creates admin + sample users and products.
 * Run: node utils/seed.js  (after setting MONGODB_URI in .env)
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const RewardTransaction = require('../models/RewardTransaction');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB for seeding');
};

const seed = async () => {
  try {
    await connectDB();

    // Clear existing (optional – comment out to keep data)
    // await User.deleteMany({});
    // await Product.deleteMany({});

    // Create admin
    let admin = await User.findOne({ email: 'admin@relife.app' });
    if (!admin) {
      admin = await User.create({
        name: 'ReLife Admin',
        email: 'admin@relife.app',
        phone: '9999999999',
        password: 'Admin@123',
        location: 'Mumbai',
        role: 'admin',
        rewardPoints: 0,
      });
      console.log('Admin created: admin@relife.app / Admin@123');
    } else {
      console.log('Admin already exists');
    }

    // Sample user
    let user = await User.findOne({ email: 'demo@relife.app' });
    if (!user) {
      user = await User.create({
        name: 'Demo User',
        email: 'demo@relife.app',
        phone: '9876543210',
        password: 'Demo@123',
        location: 'Delhi',
        role: 'user',
        rewardPoints: 50,
      });
      await RewardTransaction.create({
        user: user._id,
        points: 50,
        type: 'signup_bonus',
        description: 'Welcome bonus',
      });
      console.log('Demo user: demo@relife.app / Demo@123');
    }

    // Sample products if none
    const count = await Product.countDocuments();
    if (count === 0) {
      const samples = [
        {
          name: 'Winter Jacket',
          description: 'Warm winter jacket, size L, gently used. Perfect for cold weather.',
          category: 'Clothes and Fashion',
          condition: 'Good',
          action: 'Donate',
          price: 0,
          location: 'Delhi',
          images: [{ url: 'https://via.placeholder.com/400x300?text=Jacket', publicId: '' }],
          owner: user._id,
        },
        {
          name: 'Harry Potter Book Set',
          description: 'Complete set of 7 books in good condition.',
          category: 'Books and Stationery',
          condition: 'Like New',
          action: 'Sell',
          price: 1200,
          location: 'Mumbai',
          images: [{ url: 'https://via.placeholder.com/400x300?text=Books', publicId: '' }],
          owner: user._id,
        },
        {
          name: 'Old Smartphone',
          description: 'Working phone, screen has minor scratches. Good for parts or basic use.',
          category: 'Electronics',
          condition: 'Fair',
          action: 'Recycle',
          price: 0,
          location: 'Bangalore',
          images: [{ url: 'https://via.placeholder.com/400x300?text=Phone', publicId: '' }],
          owner: admin._id,
        },
        {
          name: 'Wooden Chair',
          description: 'Solid wood chair, needs minor repair on one leg.',
          category: 'Furniture',
          condition: 'Needs Repair',
          action: 'Repair',
          price: 0,
          location: 'Pune',
          images: [{ url: 'https://via.placeholder.com/400x300?text=Chair', publicId: '' }],
          owner: user._id,
        },
        {
          name: 'Kids Toys Bundle',
          description: 'Assorted toys for ages 3-8. Clean and safe.',
          category: 'Toys and Accessories',
          condition: 'Good',
          action: 'Donate',
          price: 0,
          location: 'Delhi',
          images: [{ url: 'https://via.placeholder.com/400x300?text=Toys', publicId: '' }],
          owner: admin._id,
        },
      ];
      await Product.insertMany(samples);
      console.log('Sample products created');
    }

    console.log('Seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();
