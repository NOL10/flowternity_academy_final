/**
 * Fix existing memberships by adding original_expiry_date field
 * This migrates old memberships created before the fix
 */

const { MongoClient } = require('mongodb');

const MONGO_URL = process.env.MONGODB_URI || 'mongodb://localhost:27017/flowternity';

async function fix() {
  const client = new MongoClient(MONGO_URL);
  
  try {
    await client.connect();
    const db = client.db();
    
    console.log('\n🔧 Fixing existing memberships...\n');
    
    // Find all slot-based memberships that don't have original_expiry_date
    const memberships = await db.collection('user_memberships').find({
      type: 'slot',
      original_expiry_date: { $exists: false },
      status: 'active'
    }).toArray();
    
    console.log(`Found ${memberships.length} memberships without original_expiry_date\n`);
    
    if (memberships.length === 0) {
      console.log('✅ All memberships already have original_expiry_date\n');
      return;
    }
    
    // For each membership, set original_expiry_date = current expiry_date
    for (const mem of memberships) {
      await db.collection('user_memberships').updateOne(
        { id: mem.id },
        { $set: { original_expiry_date: mem.expiry_date } }
      );
      console.log(`✅ Fixed: ${mem.id}`);
      console.log(`   Original Expiry: ${mem.expiry_date.toISOString().slice(0, 10)}`);
    }
    
    console.log(`\n✅ Fixed ${memberships.length} memberships!\n`);
    
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

fix();
