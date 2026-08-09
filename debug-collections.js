const { MongoClient } = require('mongodb');

const MONGO_URL = process.env.MONGODB_URI || 'mongodb://localhost:27017/flowternity';

async function debug() {
  const client = new MongoClient(MONGO_URL);
  
  try {
    await client.connect();
    const db = client.db();
    
    console.log('\n📊 Checking collections...\n');
    
    const allMems = await db.collection('user_memberships').find().limit(5).toArray();
    console.log(`Total memberships: ${await db.collection('user_memberships').countDocuments()}`);
    console.log(`\nFirst 5 memberships structure:`);
    allMems.forEach((m, i) => {
      console.log(`\n[${i+1}]`);
      console.log(`  id: ${m.id ? m.id.slice(0, 8) : 'NO ID'}`);
      console.log(`  membership_id: ${m.membership_id}`);
      console.log(`  type: ${m.type}`);
      console.log(`  status: ${m.status}`);
      console.log(`  expiry_date: ${m.expiry_date?.toISOString().slice(0, 10)}`);
      console.log(`  original_expiry_date: ${m.original_expiry_date?.toISOString().slice(0, 10)}`);
      console.log(`  slots_total: ${m.slots_total}`);
      console.log(`  slots_remaining: ${m.slots_remaining}`);
    });
    
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await client.close();
  }
}

debug();
