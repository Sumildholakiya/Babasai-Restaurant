

const mongoose = require('mongoose');
const dotenv   = require('dotenv');
const MenuItem = require('./models/MenuItem');

dotenv.config();

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

async function fixPaths() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    // Find all items whose image starts with /uploads/ (relative path — the bug)
    const brokenItems = await MenuItem.find({
      image: { $regex: '^/uploads/' }
    });

    if (brokenItems.length === 0) {
      console.log('No broken image paths found. All items look good!');
      process.exit(0);
    }

    console.log(`Found ${brokenItems.length} item(s) with relative image paths. Fixing...`);

    for (const item of brokenItems) {
      const fixedUrl = BASE_URL + item.image; // e.g. http://localhost:5000/uploads/menu-xxx.jpg
      await MenuItem.findByIdAndUpdate(item._id, { image: fixedUrl });
      console.log(`  Fixed: "${item.name}"  =>  ${fixedUrl}`);
    }

    console.log('\nAll image paths fixed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

fixPaths();