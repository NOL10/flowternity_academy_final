const { MongoClient } = require('mongodb');

const MONGO_URL = process.env.MONGODB_URI || 'mongodb://localhost:27017/flowternity';

async function debug() {
  const client = new MongoClient(MONGO_URL);
  
  try {
    await client.connect();
    const db = client.db();
    
    // Find ALL slot memberships
    const memberships = await db.collection('user_memberships').find({
      type: 'slot'
    }).toArray();
    
    console.log(`\n📋 Found ${memberships.length} slot memberships (all statuses)\n`);
    
    for (const mem of memberships.slice(0, 10)) { // Show first 10
      const bookings = await db.collection('bookings').find({
        user_membership_id: mem.id,
        status: 'booked'
      }).toArray();
      
      console.log(`\n🔹 Membership ID: ${mem.id.slice(0, 8)}...`);
      console.log(`   Status: ${mem.status}`);
      console.log(`   Slots: ${mem.slots_remaining}/${mem.slots_total}`);
      console.log(`   Current Expiry: ${mem.expiry_date.toISOString().slice(0, 10)}`);
      console.log(`   Original Expiry: ${mem.original_expiry_date ? mem.original_expiry_date.toISOString().slice(0, 10) : 'MISSING'}`);
      console.log(`   Active Bookings: ${bookings.length}`);
    }
    
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await client.close();
  }
}

debug();
