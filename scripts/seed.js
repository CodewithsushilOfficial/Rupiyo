const { Client } = require('pg');

const DEFAULT_CATEGORIES = [
  // Expense Categories
  { name: 'Food & Dining', type: 'EXPENSE', icon_name: 'Utensils', color_hex: '#EF4444' },
  { name: 'Groceries', type: 'EXPENSE', icon_name: 'ShoppingBag', color_hex: '#F97316' },
  { name: 'Transportation & Fuel', type: 'EXPENSE', icon_name: 'Car', color_hex: '#F59E0B' },
  { name: 'Rent & Housing', type: 'EXPENSE', icon_name: 'Home', color_hex: '#8B5CF6' },
  { name: 'Bills & Utilities', type: 'EXPENSE', icon_name: 'Zap', color_hex: '#3B82F6' },
  { name: 'Shopping & Apparel', type: 'EXPENSE', icon_name: 'Tag', color_hex: '#EC4899' },
  { name: 'Entertainment & OTT', type: 'EXPENSE', icon_name: 'Tv', color_hex: '#6366F1' },
  { name: 'Healthcare & Medical', type: 'EXPENSE', icon_name: 'Activity', color_hex: '#10B981' },
  { name: 'Education & Courses', type: 'EXPENSE', icon_name: 'BookOpen', color_hex: '#06B6D4' },
  { name: 'Travel & Vacation', type: 'EXPENSE', icon_name: 'Plane', color_hex: '#14B8A6' },
  { name: 'Miscellaneous Expense', type: 'EXPENSE', icon_name: 'MoreHorizontal', color_hex: '#64748B' },

  // Income Categories
  { name: 'Salary', type: 'INCOME', icon_name: 'Briefcase', color_hex: '#10B981' },
  { name: 'Freelance & Consulting', type: 'INCOME', icon_name: 'Laptop', color_hex: '#059669' },
  { name: 'Investments & Dividends', type: 'INCOME', icon_name: 'TrendingUp', color_hex: '#047857' },
  { name: 'Gifts & Grants', type: 'INCOME', icon_name: 'Gift', color_hex: '#34D399' },
  { name: 'Other Income', type: 'INCOME', icon_name: 'PlusCircle', color_hex: '#6EE7B7' },
];

async function seed() {
  const directUrl =
    process.env.DIRECT_URL ||
    'postgresql://postgres.kaljmvhnnoknupzkzptz:Rupiyo%407236@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres';

  console.log('🔌 Connecting to PostgreSQL database for category seeding...');
  const client = new Client({
    connectionString: directUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('✅ Connected!');

    for (const cat of DEFAULT_CATEGORIES) {
      const checkRes = await client.query(
        `SELECT id FROM public.categories WHERE name = $1 AND type = $2 AND is_system_default = true;`,
        [cat.name, cat.type]
      );

      if (checkRes.rows.length === 0) {
        await client.query(
          `INSERT INTO public.categories (name, type, icon_name, color_hex, is_system_default)
           VALUES ($1, $2, $3, $4, true);`,
          [cat.name, cat.type, cat.icon_name, cat.color_hex]
        );
        console.log(`✅ Seeded default category: ${cat.name} (${cat.type})`);
      } else {
        console.log(`ℹ️ Category already exists: ${cat.name} (${cat.type})`);
      }
    }

    console.log('🎉 Default category seed completed successfully!');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  } finally {
    await client.end();
  }
}

seed();
