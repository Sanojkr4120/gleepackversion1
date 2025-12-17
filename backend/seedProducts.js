import mongoose from 'mongoose';
import dotenv from 'dotenv';
import MenuItem from './models/MenuItem.js';

dotenv.config();

const products = [
    // BIRTHDAY ITEMS
    {
        name: "Premium Birthday Decoration Kit (Black & Gold)",
        price: 1299,
        description: "Complete set including black & gold balloons, 'Happy Birthday' foil banner, fringe curtains, and confetti. Perfect for adult birthdays.",
        image: "https://images.unsplash.com/photo-1530103862676-de3c9a59af38?q=80&w=800&auto=format&fit=crop",
        category: "Birthday",
        isAvailable: true
    },
    {
        name: "Kids Jungle Safari Theme Kit",
        price: 1499,
        description: "Everything you need for a wild party! Includes animal foil balloons, green vines, and jungle-themed birthday banner.",
        image: "https://images.unsplash.com/photo-1602631985686-1bb0e6a8696e?q=80&w=800&auto=format&fit=crop",
        category: "Birthday",
        isAvailable: true
    },
    {
        name: "Princess Pink Birthday Set",
        price: 999,
        description: "Magical pink and white balloon arch kit with crown foil balloon and sash for the birthday girl.",
        image: "https://images.unsplash.com/photo-1558636508-e0db3814bd1d?q=80&w=800&auto=format&fit=crop",
        category: "Birthday",
        isAvailable: true
    },

    // ANNIVERSARY ITEMS
    {
        name: "Romantic Red & Gold Anniversary Set",
        price: 899,
        description: "Set the mood with red heart balloons, 'Happy Anniversary' banner, and LED fairy lights. Ideal for romantic surprises.",
        image: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800&auto=format&fit=crop",
        category: "Anniversary",
        isAvailable: true
    },
    {
        name: "Silver Jubilee Celebration Kit (25th)",
        price: 1999,
        description: "Elegant silver-themed decoration for 25th Anniversary. Includes silver balloons, '25' number foil, and sash.",
        image: "https://images.unsplash.com/photo-1464349153912-bc6163bd89a7?q=80&w=800&auto=format&fit=crop",
        category: "Anniversary",
        isAvailable: true
    },
    {
        name: "Golden Jubilee Set (50th)",
        price: 2499,
        description: "Grand gold decoration kit for 50th Anniversary celebrations. Premium quality metallic balloons and banners.",
        image: "https://images.unsplash.com/photo-1530103862676-de3c9a59af38?q=80&w=800&auto=format&fit=crop",
        category: "Anniversary",
        isAvailable: true
    },

    // GRAND OPENING ITEMS
    {
        name: "Grand Opening Ribbon Cutting Kit",
        price: 3499,
        description: "Professional kit containing giant scissors, red satin ribbon (10 meters), and ceremonial bows.",
        image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=800&auto=format&fit=crop",
        category: "Grand Opening",
        isAvailable: true
    },
    {
        name: "Shop Inauguration Flower Decor",
        price: 5999,
        description: "Fresh and artificial flower mix for shop entrance decoration. Makes your opening inviting and auspicious.",
        image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&auto=format&fit=crop",
        category: "Grand Opening",
        isAvailable: true
    },
    {
        name: "Balloon Arch for Shop Entrance",
        price: 2999,
        description: "Custom color balloon arch kit (1000 balloons) with electronic pump and arch strip. Essential for attracting attention.",
        image: "https://images.unsplash.com/photo-1533292686609-8b3807d4b58e?q=80&w=800&auto=format&fit=crop",
        category: "Grand Opening",
        isAvailable: true
    },

    // CUSTOM KITS
    {
        name: "Custom Name & Photo Banner Kit",
        price: 799,
        description: "Personalized banner with your photos and customized text. Send us the details after ordering.",
        image: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?q=80&w=800&auto=format&fit=crop",
        category: "Custom Kits",
        isAvailable: true
    },
    {
        name: "DIY Photo Booth Props",
        price: 499,
        description: "Fun and quirky customized props for selfies. Includes sticks and adhesive.",
        image: "https://images.unsplash.com/photo-1531591022136-eb8b0da1e6d0?q=80&w=800&auto=format&fit=crop",
        category: "Custom Kits",
        isAvailable: true
    },

    // PUJA KITS
    {
        name: "Ganesh Puja Samagri Kit",
        price: 1100,
        description: "Complete essential items for Ganesh Puja: Haldi, Kumkum, Agarbatti, Camphor, and specialized herbs.",
        image: "https://images.unsplash.com/photo-1604017011826-d3b4c23f8914?q=80&w=800&auto=format&fit=crop",
        category: "Puja Kits",
        isAvailable: true
    },
    {
        name: "Diwali Laxmi Puja Box",
        price: 1500,
        description: "Premium box with all necessities for Laxmi Puja. Includes idol cloths, diol lamps (diyas), and rangoli colors.",
        image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=800&auto=format&fit=crop",
        category: "Puja Kits",
        isAvailable: true
    },
    {
        name: "Griha Pravesh Essentials",
        price: 2100,
        description: "Housewarming ceremony kit. Includes Kalash, Coconut, Mango leaves (artificial), and Havan Samagri.",
        image: "https://images.unsplash.com/photo-1604017011826-d3b4c23f8914?q=80&w=800&auto=format&fit=crop", // Reduced redundancy in image if specific one not available
        category: "Puja Kits",
        isAvailable: true
    }
];

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    // Clear existing products
    await MenuItem.deleteMany({});
    console.log('Existing products removed');

    // Insert new products
    await MenuItem.insertMany(products);
    console.log('New celebration products imported!');

    process.exit();
  } catch (error) {
    console.error('Error importing data:', error);
    process.exit(1);
  }
};

seedProducts();
