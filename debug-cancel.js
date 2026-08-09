const { MongoClient } = require('mongodb');

const MONGO_URL = process.env.MONGODB_URI || 'mongodb://localhost:27017/flowternity';

async function debug() {
  const client = new MongoClient(MONGO_URL);
  
  try {
    await client.connect();
    const db = client.db();
    
    // Get all memberships with type: slot
    const allMems = await db.collection('user_memberships').find().toArray();
    const slotMems = allMems.filter(m => m.membership_snapshot?.type === 'slot');
    
    console.log(`\n📋 Found ${slotMems.length} slot memberships\n`);
    
    for (const mem of slotMems.slice(0, 5)) {
      console.log(`\n🔹 Membership: ${mem.id.slice(0, 8)}`);
      console.log(`   Status: ${mem.status}`);
      console.log(`   Current Expiry: ${new Date(mem.expiry_date).toISOString().slice(0, 10)}`);
      console.log(`   Original Expiry: ${mem.original_expiry_date ? new Date(mem.original_expiry_date).toISOString().slice(0, 10) : 'MISSING'}`);
      console.log(`   Slots: ${mem.slots_remaining}/${mem.slots_total}`);
      
      // Check bookings for this membership
      const bookings = await db.collection('bookings').find({
        user_membership_id: mem.id
      }).toArray();
      
      console.log(`   All bookings (any status): ${bookings.length}`);
      bookings.forEach(b => {
        console.log(`      - ${b.id.slice(0, 8)}: ${b.status}`);
      });
      
      const bookedOnly = bookings.filter(b => b.status === 'booked');
      console.log(`   Booked bookings: ${bookedOnly.length}`);
    }
    
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await client.close();
  }
}

debug();
