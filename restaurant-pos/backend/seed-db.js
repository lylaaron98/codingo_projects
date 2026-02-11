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
    console.log(`  - ${data.data.users.length} users`);
    console.log(`  - ${data.data.tablesCount} tables`);
    console.log(`  - ${data.data.menuItemsCount} menu items\n`);
    console.log('📝 Login credentials (password: password123):');
    data.data.users.forEach(u => {
      console.log(`   ${u.username.padEnd(8)} → ${u.role}`);
    });
    console.log('\n🚀 Ready to test at http://localhost:5176');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Seed failed:', error.message);
    console.error('\nMake sure:');
    console.error('  1. Vercel dev server is running (npx vercel dev)');
    console.error('  2. MongoDB connection string is correct in .env');
    process.exit(1);
  });
