require('dotenv').config();
const { sequelize, User, Category, Item, syncDatabase } = require('./database');
const bcrypt = require('bcryptjs');

const seedData = async () => {
    await syncDatabase();

    // 1. Create Admin User
    const adminPassword = process.env.ADMIN_PASSWORD || '123admin124'; // Fallback if env missing
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const [admin, created] = await User.findOrCreate({
        where: { username: 'Admin' },
        defaults: {
            password: hashedPassword
        }
    });

    if (created) {
        console.log('Admin user created successfully.');
    } else {
        console.log('Admin user already exists.');
    }

    // 2. Seed Categories and Items if empty
    const categoryCount = await Category.count();
    if (categoryCount === 0) {
        console.log('Seeding menu data...');

        const categories = [
            {
                name: 'Burgers',
                slug: 'burgers',
                items: [
                    { name_en: 'Classic Burger', name_ar: 'برجر كلاسيك', price: '$4.00' },
                    { name_en: 'Lebanese Burger', name_ar: 'برجر لبناني', price: '$4.00' },
                    { name_en: 'BBQ Burger', name_ar: 'برجر باربكيو', price: '$4.00' },
                    { name_en: 'Oh My Cheese Burger', name_ar: 'برجر الجبن المذهل', price: '$5.50', is_featured: true }
                ]
            },
            {
                name: 'Salads & Appetizers',
                slug: 'salads',
                items: [
                    { name_en: 'Fattoush', name_ar: 'فتوش', price: '$3.80' },
                    { name_en: 'Hummus', name_ar: 'حمص', price: '$3.00' }
                ]
            },
            {
                name: 'Grilled Chicken',
                slug: 'grilled',
                items: [
                    { name_en: 'Charcoal-Grilled Chicken', name_ar: 'دجاج مشوي على الفحم', price: '$14.00' },
                    { name_en: 'Half Charcoal-Grilled Chicken', name_ar: 'نصف دجاج مشوي على الفحم', price: '$8.50' },
                    { name_en: 'Gas-Grilled Chicken', name_ar: 'دجاج مشوي على الغاز', price: '$10.00' },
                    { name_en: '1 Kilo Mixed Grill', name_ar: 'كيلو مشاوي متنوعة', price: '$18.00', is_featured: true }
                ]
            },
            {
                name: 'Sandwiches',
                slug: 'sandwiches',
                items: [
                    { name_en: 'Large Charcoal-Grilled Chicken Sandwich', name_ar: 'ساندويتش دجاج مشوي كبير', price: '$5.00' },
                    { name_en: 'Medium Charcoal-Grilled Chicken Sandwich', name_ar: 'ساندويتش دجاج مشوي وسط', price: '$3.30' },
                    { name_en: 'Fries Sandwich', name_ar: 'ساندويتش بطاطس', price: '$1.80' },
                    { name_en: 'Large Tawook Sandwich', name_ar: 'ساندويتش طاووق كبير', price: '$5.00' },
                    { name_en: 'Medium Tawook Sandwich', name_ar: 'ساندويتش طاووق وسط', price: '$3.30' },
                    { name_en: 'Large Kafta Sandwich', name_ar: 'ساندويتش كفتة كبير', price: '$5.00' },
                    { name_en: 'Medium Kafta Sandwich', name_ar: 'ساندويتش كفتة وسط', price: '$3.30' },
                    { name_en: 'Large Grilled Meat Sandwich', name_ar: 'ساندويتش لحم مشوي كبير', price: '$5.00' },
                    { name_en: 'Medium Grilled Meat Sandwich', name_ar: 'ساندويتش لحم مشوي وسط', price: '$3.30' },
                    { name_en: 'Kafta Sub Sandwich', name_ar: 'ساندويتش كفتة ساب', price: '$3.30' },
                    { name_en: 'Sujok Sub Sandwich', name_ar: 'ساندويتش سجق ساب', price: '$3.30' }
                ]
            },
            {
                name: 'Fries',
                slug: 'fries',
                items: [
                    { name_en: 'Large Fries Box', name_ar: 'صندوق بطاطس كبير', price: '$5.00' },
                    { name_en: 'Small Fries Box', name_ar: 'صندوق بطاطس صغير', price: '$2.20' }
                ]
            },
            {
                name: 'Drinks',
                slug: 'drinks',
                items: [
                    { name_en: 'Soft Drink', name_ar: 'مشروب غازي', price: '100,000 L.L' },
                    { name_en: 'Laban', name_ar: 'لبن', price: '80,000 L.L' },
                    { name_en: 'Water', name_ar: 'ماء', price: '30,000 L.L' }
                ]
            },
            {
                name: 'Combos',
                slug: 'combos',
                items: [
                    { name_en: 'Combo (Fries + Drink)', name_ar: 'كومبو (بطاطس + مشروب)', price: '$2.50' }
                ]
            }
        ];

        for (const cat of categories) {
            const category = await Category.create({ name: cat.name, slug: cat.slug });
            for (const item of cat.items) {
                await Item.create({
                    ...item,
                    CategoryId: category.id
                });
            }
        }
        console.log('Menu data seeded successfully.');
    } else {
        console.log('Menu data already exists. Skipping seed.');
    }

    // Close connection usually, but here we just exit
    process.exit(0);
};

seedData();
