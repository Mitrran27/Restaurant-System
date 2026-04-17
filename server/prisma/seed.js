const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Branches
  const branch1 = await prisma.branch.upsert({
    where: { id: 'branch-main' },
    update: {},
    create: {
      id: 'branch-main',
      name: 'Main Street Branch',
      address: '123 Main Street, Downtown',
      phone: '+1-555-0101',
      isActive: true,
    },
  });

  const branch2 = await prisma.branch.upsert({
    where: { id: 'branch-east' },
    update: {},
    create: {
      id: 'branch-east',
      name: 'East Side Branch',
      address: '456 East Ave, Eastside',
      phone: '+1-555-0102',
      isActive: true,
    },
  });

  // Users
  const adminPass = await bcrypt.hash('admin123', 10);
  const cashierPass = await bcrypt.hash('cashier123', 10);
  const kitchenPass = await bcrypt.hash('kitchen123', 10);
  const customerPass = await bcrypt.hash('customer123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@restaurant.com' },
    update: {},
    create: {
      email: 'admin@restaurant.com',
      password: adminPass,
      name: 'Admin User',
      role: 'ADMIN',
      branchId: branch1.id,
    },
  });

  const cashier = await prisma.user.upsert({
    where: { email: 'cashier@restaurant.com' },
    update: {},
    create: {
      email: 'cashier@restaurant.com',
      password: cashierPass,
      name: 'John Cashier',
      role: 'CASHIER',
      branchId: branch1.id,
    },
  });

  const kitchen = await prisma.user.upsert({
    where: { email: 'kitchen@restaurant.com' },
    update: {},
    create: {
      email: 'kitchen@restaurant.com',
      password: kitchenPass,
      name: 'Chef Kitchen',
      role: 'KITCHEN',
      branchId: branch1.id,
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      password: customerPass,
      name: 'Jane Customer',
      role: 'CUSTOMER',
    },
  });

  // Categories
  const categories = await Promise.all([
    prisma.category.upsert({ where: { id: 'cat-burgers' }, update: {}, create: { id: 'cat-burgers', name: 'Burgers', description: 'Juicy handcrafted burgers', sortOrder: 1 } }),
    prisma.category.upsert({ where: { id: 'cat-pizza' }, update: {}, create: { id: 'cat-pizza', name: 'Pizza', description: 'Stone-baked pizzas', sortOrder: 2 } }),
    prisma.category.upsert({ where: { id: 'cat-sides' }, update: {}, create: { id: 'cat-sides', name: 'Sides', description: 'Perfect accompaniments', sortOrder: 3 } }),
    prisma.category.upsert({ where: { id: 'cat-drinks' }, update: {}, create: { id: 'cat-drinks', name: 'Drinks', description: 'Refreshing beverages', sortOrder: 4 } }),
    prisma.category.upsert({ where: { id: 'cat-desserts' }, update: {}, create: { id: 'cat-desserts', name: 'Desserts', description: 'Sweet endings', sortOrder: 5 } }),
  ]);

  // Menu Items
  const menuItemsData = [
    { id: 'item-001', name: 'Classic Burger', description: 'Beef patty, lettuce, tomato, pickles, special sauce', price: 12.99, categoryId: 'cat-burgers', imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400' },
    { id: 'item-002', name: 'Double Smash Burger', description: 'Double smashed beef patty, american cheese, caramelized onions', price: 16.99, categoryId: 'cat-burgers', imageUrl: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400' },
    { id: 'item-003', name: 'Chicken Crispy Burger', description: 'Crispy fried chicken, coleslaw, chipotle mayo', price: 13.99, categoryId: 'cat-burgers', imageUrl: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400' },
    { id: 'item-004', name: 'Veggie Supreme Burger', description: 'Black bean patty, avocado, roasted peppers, vegan aioli', price: 11.99, categoryId: 'cat-burgers', imageUrl: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400' },
    { id: 'item-005', name: 'Margherita Pizza', description: 'San Marzano tomato, fresh mozzarella, basil', price: 14.99, categoryId: 'cat-pizza', imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400' },
    { id: 'item-006', name: 'Pepperoni Feast', description: 'Double pepperoni, mozzarella, oregano', price: 16.99, categoryId: 'cat-pizza', imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400' },
    { id: 'item-007', name: 'BBQ Chicken Pizza', description: 'BBQ sauce, grilled chicken, red onions, cilantro', price: 17.99, categoryId: 'cat-pizza', imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400' },
    { id: 'item-008', name: 'Truffle Mushroom Pizza', description: 'Truffle oil, mixed mushrooms, fontina, thyme', price: 19.99, categoryId: 'cat-pizza', imageUrl: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=400' },
    { id: 'item-009', name: 'Crispy Fries', description: 'Golden fries with sea salt', price: 4.99, categoryId: 'cat-sides', imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400' },
    { id: 'item-010', name: 'Loaded Fries', description: 'Fries with cheese sauce, bacon, jalapeños, sour cream', price: 7.99, categoryId: 'cat-sides', imageUrl: 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=400' },
    { id: 'item-011', name: 'Onion Rings', description: 'Beer-battered onion rings with ranch dip', price: 5.99, categoryId: 'cat-sides', imageUrl: 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=400' },
    { id: 'item-012', name: 'Caesar Salad', description: 'Romaine, parmesan, croutons, caesar dressing', price: 8.99, categoryId: 'cat-sides', imageUrl: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400' },
    { id: 'item-013', name: 'Cola', description: '400ml chilled cola', price: 2.99, categoryId: 'cat-drinks', imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400' },
    { id: 'item-014', name: 'Fresh Lemonade', description: 'Freshly squeezed lemonade with mint', price: 3.99, categoryId: 'cat-drinks', imageUrl: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400' },
    { id: 'item-015', name: 'Milkshake', description: 'Thick vanilla or chocolate milkshake', price: 5.99, categoryId: 'cat-drinks', imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400' },
    { id: 'item-016', name: 'Iced Coffee', description: 'Cold brew over ice with cream', price: 4.49, categoryId: 'cat-drinks', imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400' },
    { id: 'item-017', name: 'Chocolate Lava Cake', description: 'Warm chocolate cake with molten center, vanilla ice cream', price: 7.99, categoryId: 'cat-desserts', imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400' },
    { id: 'item-018', name: 'Cheesecake Slice', description: 'New York style cheesecake with berry compote', price: 6.99, categoryId: 'cat-desserts', imageUrl: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400' },
    { id: 'item-019', name: 'Ice Cream Sundae', description: '3 scoops with hot fudge, whipped cream, cherry', price: 5.99, categoryId: 'cat-desserts', imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400' },
  ];

  for (const item of menuItemsData) {
    await prisma.menuItem.upsert({
      where: { id: item.id },
      update: {},
      create: { ...item, branchId: branch1.id },
    });

    await prisma.inventory.upsert({
      where: { menuItemId: item.id },
      update: {},
      create: {
        menuItemId: item.id,
        branchId: branch1.id,
        status: 'IN_STOCK',
        quantity: 100,
      },
    });
  }

  console.log('✅ Database seeded successfully!');
  console.log('\n📋 Login credentials:');
  console.log('  Admin:    admin@restaurant.com    / admin123');
  console.log('  Cashier:  cashier@restaurant.com  / cashier123');
  console.log('  Kitchen:  kitchen@restaurant.com  / kitchen123');
  console.log('  Customer: customer@example.com    / customer123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
