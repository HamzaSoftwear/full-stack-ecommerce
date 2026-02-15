const mongoose = require('mongoose');
require('dotenv/config');
const Category = require('./models/Category');

const MONGO_URI = process.env.CONNECTION_DB;

const defaultCategories = [
  { name: 'Shoes', image: '' },
  { name: 'Clothes', image: '' },
  { name: 'Technology', image: '' }
];

async function seedCategories() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check if categories already exist
    const existingCategories = await Category.find({ name: { $in: defaultCategories.map(c => c.name) } });
    
    if (existingCategories.length > 0) {
      console.log('ℹ️  Some categories already exist:', existingCategories.map(c => c.name).join(', '));
    }

    // Insert only categories that don't exist
    const categoriesToInsert = defaultCategories.filter(
      cat => !existingCategories.some(existing => existing.name === cat.name)
    );

    if (categoriesToInsert.length === 0) {
      console.log('✅ All default categories already exist');
      await mongoose.connection.close();
      return;
    }

    const inserted = await Category.insertMany(categoriesToInsert);
    console.log(`✅ Successfully seeded ${inserted.length} categories:`, inserted.map(c => c.name).join(', '));
    
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    process.exit(1);
  }
}

seedCategories();

