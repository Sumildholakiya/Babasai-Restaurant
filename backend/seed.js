const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('./models/User');
const MenuItem = require('./models/MenuItem');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB Connected for seeding...');
};

const menuItems = [
  { name: 'Paneer Tikka', description: 'Soft paneer marinated in spicy yogurt and grilled to perfection', price: 220, category: 'Starters', image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400', isAvailable: true },
  { name: 'Veg Spring Rolls', description: 'Crispy rolls stuffed with seasoned vegetables', price: 150, category: 'Starters', image: 'https://images.unsplash.com/photo-1606755456206-b25206cde27e?w=400', isAvailable: true },
  { name: 'Hara Bhara Kebab', description: 'Spinach and peas patty with fresh herbs', price: 180, category: 'Starters', image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400', isAvailable: true },
  { name: 'Dal Makhani', description: 'Slow-cooked black lentils with butter and cream', price: 200, category: 'Main Course', image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400', isAvailable: true },
  { name: 'Palak Paneer', description: 'Fresh cottage cheese in a creamy spinach gravy', price: 240, category: 'Main Course', image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400', isAvailable: true },
  { name: 'Shahi Paneer', description: 'Paneer cooked in a rich, creamy tomato sauce', price: 260, category: 'Main Course', image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400', isAvailable: true },
  { name: 'Chana Masala', description: 'Chickpeas cooked in a tangy, spicy masala', price: 180, category: 'Main Course', image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400', isAvailable: true },
  { name: 'Butter Naan', description: 'Soft leavened bread brushed with butter', price: 50, category: 'Breads', image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400', isAvailable: true },
  { name: 'Garlic Naan', description: 'Naan topped with garlic and fresh coriander', price: 60, category: 'Breads', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400', isAvailable: true },
  { name: 'Tandoori Roti', description: 'Whole wheat bread baked in clay oven', price: 35, category: 'Breads', image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400', isAvailable: true },
  { name: 'Veg Biryani', description: 'Aromatic basmati rice with mixed vegetables and spices', price: 250, category: 'Rice & Biryani', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400', isAvailable: true },
  { name: 'Paneer Biryani', description: 'Fragrant rice cooked with paneer and whole spices', price: 290, category: 'Rice & Biryani', image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400', isAvailable: true },
  { name: 'Jeera Rice', description: 'Basmati rice tempered with cumin seeds', price: 120, category: 'Rice & Biryani', image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400', isAvailable: true },
  { name: 'Gulab Jamun', description: 'Soft milk dumplings soaked in rose-flavored sugar syrup', price: 90, category: 'Desserts', image: 'https://images.unsplash.com/photo-1666268890264-6a3d5d0d98a5?w=400', isAvailable: true },
  { name: 'Rasmalai', description: 'Soft cottage cheese dumplings in sweetened milk', price: 110, category: 'Desserts', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400', isAvailable: true },
  { name: 'Kulfi', description: 'Traditional Indian ice cream with pistachio and cardamom', price: 80, category: 'Desserts', image: 'https://images.unsplash.com/photo-1488900128323-21503983a07e?w=400', isAvailable: true },
  { name: 'Mango Lassi', description: 'Refreshing yogurt drink blended with fresh mangoes', price: 90, category: 'Beverages', image: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=400', isAvailable: true },
  { name: 'Masala Chai', description: 'Spiced Indian tea with ginger and cardamom', price: 50, category: 'Beverages', image: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400', isAvailable: true },
  { name: 'Fresh Lime Soda', description: 'Refreshing lime juice with soda water', price: 60, category: 'Beverages', image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400', isAvailable: true },
  { name: 'Samosa (2 pcs)', description: 'Crispy pastry filled with spiced potatoes and peas', price: 60, category: 'Snacks', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400', isAvailable: true },
  { name: 'Pav Bhaji', description: 'Spiced mashed vegetables with buttered bread rolls', price: 130, category: 'Snacks', image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400', isAvailable: true },
  { name: 'Dhokla', description: 'Steamed fermented chickpea flour cake', price: 100, category: 'Snacks', image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400', isAvailable: true },
];

const seedDB = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await MenuItem.deleteMany({});

    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    await User.create({
      name: 'BabaSai Admin',
      email: 'admin@babasai.com',
      password: hashedPassword,
      role: 'admin'
    });

    // Create sample users
    await User.create([
      { name: 'Rahul Sharma', email: 'rahul@example.com', password: 'user123', role: 'user' },
      { name: 'Priya Patel', email: 'priya@example.com', password: 'user123', role: 'user' }
    ]);

    // Seed menu items
    await MenuItem.insertMany(menuItems);

    console.log('✅ Database seeded successfully!');
    console.log('👤 Admin: admin@babasai.com / admin123');
    console.log('👤 User:  rahul@example.com / user123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedDB();
