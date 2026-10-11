import { supabaseAdmin } from '../config/supabase.js';

export const sampleProducts = [
  {
    name: 'Wireless Noise-Canceling Headphones',
    description: 'Premium over-ear wireless headphones with active noise cancellation, 30-hour battery life, and ultra-comfortable earcups for high-fidelity audio.',
    price: 199.99,
    category: 'Electronics',
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    stock: 25,
  },
  {
    name: 'Minimalist Mechanical Keyboard',
    description: 'Compact 75% mechanical keyboard with tactile switches, per-key RGB backlighting, and hot-swappable sockets suited for coding and typing.',
    price: 119.50,
    category: 'Electronics',
    image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
    stock: 40,
  },
  {
    name: 'Precision Wireless Ergonomic Mouse',
    description: 'High-precision wireless mouse engineered for palm support, programmable side buttons, and hyper-fast scroll wheel.',
    price: 69.99,
    category: 'Electronics',
    image_url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80',
    stock: 35,
  },
  {
    name: 'Classic Vintage Leather Backpack',
    description: 'Handcrafted full-grain water-resistant leather backpack featuring a padded 15-inch laptop compartment and durable brass zippers.',
    price: 139.00,
    category: 'Accessories',
    image_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80',
    stock: 18,
  },
  {
    name: 'Chronograph Minimalist Wristwatch',
    description: 'Sleek analog wristwatch with stainless steel case, scratch-resistant sapphire crystal glass, and interchangeable leather strap.',
    price: 159.00,
    category: 'Accessories',
    image_url: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80',
    stock: 22,
  },
  {
    name: 'Polarized Aviator Sunglasses',
    description: 'Timeless metal frame sunglasses offering 100% UV400 protection and glare reduction for everyday outdoor wear.',
    price: 49.99,
    category: 'Accessories',
    image_url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80',
    stock: 50,
  },
  {
    name: 'Premium Heavyweight Organic Cotton Hoodie',
    description: 'Ultra-soft, brushed fleece pullover hoodie tailored with ribbed cuffs, kangaroo pocket, and double-lined hood.',
    price: 79.99,
    category: 'Clothing',
    image_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
    stock: 30,
  },
  {
    name: 'Classic Selvedge Denim Jacket',
    description: 'Timeless structured denim jacket with dual chest pockets and buttoned waist adjusters in a deep indigo wash.',
    price: 89.99,
    category: 'Clothing',
    image_url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop&q=80',
    stock: 20,
  },
  {
    name: 'Ceramic Pour-Over Coffee Dripper Set',
    description: 'Artisan matte ceramic dripper set with heat-resistant glass carafe for the ultimate barista-level brew at home.',
    price: 45.00,
    category: 'Home',
    image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
    stock: 28,
  },
  {
    name: 'Smart Ambient LED Desk Lamp',
    description: 'Touch-controlled dimmable desk lamp with color temperature adjustment, eye-caring diffusion, and wireless phone charging pad.',
    price: 54.99,
    category: 'Home',
    image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80',
    stock: 45,
  },
  {
    name: 'Clean Code: Handbook of Agile Software Craftsmanship',
    description: 'A must-read foundational guide by Robert C. Martin on software design principles, refactoring, and crafting maintainable code.',
    price: 38.50,
    category: 'Books',
    image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
    stock: 35,
  },
  {
    name: 'Designing Data-Intensive Applications',
    description: 'Comprehensive deep dive by Martin Kleppmann exploring reliability, scalability, and maintainability in modern distributed systems.',
    price: 44.95,
    category: 'Books',
    image_url: 'https://images.unsplash.com/photo-1532012164546-f432f2e37271?w=800&auto=format&fit=crop&q=80',
    stock: 25,
  },
];

export async function seedProducts() {
  console.log('🌱 Starting product seeding...');
  try {
    for (const prod of sampleProducts) {
      // Check if product with this name already exists
      const { data: existing } = await supabaseAdmin
        .from('products')
        .select('id')
        .eq('name', prod.name)
        .single();

      if (!existing) {
        const { error } = await supabaseAdmin.from('products').insert(prod);
        if (error) {
          console.error(`Failed to seed ${prod.name}:`, error.message);
        } else {
          console.log(`✅ Inserted: ${prod.name}`);
        }
      } else {
        console.log(`ℹ️ Already exists: ${prod.name}`);
      }
    }
    console.log('✨ Seeding process finished!');
  } catch (err) {
    console.error('Seeding error:', err);
  }
}

// Allow direct execution via `node src/services/seed.js`
if (process.argv[1]?.endsWith('seed.js')) {
  seedProducts().then(() => process.exit(0));
}
