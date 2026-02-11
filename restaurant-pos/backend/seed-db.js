// Simple seed script - calls the API endpoint
// Run with: node backend/seed-db.js OR cd backend && npm run seed

console.log('🌱 Seeding database via API endpoint...\n');

fetch('http://localhost:3000/api/auth/seed', { 
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
})
  .then(async (response) => {
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }
    return response.json();
  })
  .then((data) => {
    console.log('✅ Database seeded successfully!\n');
    console.log('Created:');
    console.log(`  - ${data.data.users} users (waiter, kitchen, cashier, manager)`);
    console.log(`  - ${data.data.tables} tables (numbered 1-10)`);
    console.log(`  - ${data.data.menuItems} menu items (across 5 categories)\n`);
    console.log('📝 Login credentials:');
    console.log('   Username → Password → Role');
    console.log('   waiter   → password123 → WAITER');
    console.log('   kitchen  → password123 → KITCHEN');
    console.log('   cashier  → password123 → CASHIER');
    console.log('   manager  → password123 → MANAGER');
    console.log('\n🚀 Ready to test at http://localhost:5173 (frontend)');
    console.log('   Backend running at http://localhost:3000');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Seed failed:', error.message);
    console.error('\nMake sure:');
    console.error('  1. Backend server is running (npm run dev in backend folder)');
    console.error('  2. MongoDB connection string is correct in .env');
    process.exit(1);
  });
