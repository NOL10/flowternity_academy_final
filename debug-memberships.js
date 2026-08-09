const { MongoClient } = require('mongodb');

const MONGO_URL = process.env.MONGODB_URI || 'mongodb://localhost:27017/flowternity';

async function debug() {
  const client = new MongoClient(MONGO_URL);
  
  try {
    await client.connect();
    const db = client.db();
    
    // Find all slot memberships
    const memberships = await db.collection('user_memberships').find({
      type: 'slot',
      status: 'active'
    }).toArray();
    
    console.log(`\n📋 Found ${memberships.length} active slot memberships\n`);
    
    for (const mem of memberships) {
      const bookings = await db.collection('bookings').find({
        user_membership_id: mem.id,
        status: 'booked'
      }).toArray();
      
      console.log(`\n🔹 Membership ID: ${mem.id}`);
      console.log(`   User ID: ${mem.user_id}`);
      console.log(`   Slots: ${mem.slots_remaining}/${mem.slots_total}`);
      console.log(`   Current Expiry: ${mem.expiry_date.toISOString().slice(0, 10)}`);
      console.log(`   Original Expiry: ${mem.original_expiry_date ? mem.original_expiry_date.toISOString().slice(0, 10) : 'MISSING'}`);
      console.log(`   Active Bookings: ${bookings.length}`);
      
      if (bookings.length > 0) {
        const classIds = bookings.map(b => b.class_id);
        const classes = await db.collection('classes').find({ id: { $in: classIds } }).toArray();
        console.log(`   Booked Classes:`);
        classes.forEach(c => {
          console.log(`      - ${c.date} ${c.start_time}-${c.end_time}`);
        });
      }
    }
    
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await client.close();
  }
}

debug();
