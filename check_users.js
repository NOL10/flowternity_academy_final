const { MongoClient } = require('mongodb');

async function check() {
  const client = new MongoClient('mongodb://localhost:27017');
  try {
    await client.connect();
    const db = client.db('flowternity');
    
    // Get all users
    const users = await db.collection('users').find({}).toArray();
    console.log(`Total users: ${users.length}`);
    
    users.forEach(u => {
      console.log(`  ${u.full_name} - Role: ${u.role}, ID: ${u.id.slice(0, 8)}...`);
    });
    
    // Check classes
    const classes = await db.collection('classes').find({ sport_id: 'basketball' }).limit(3).toArray();
    console.log(`\nBasketball classes: ${classes.length}`);
    classes.forEach(c => {
      console.log(`  ${c.date} ${c.start_time} - Capacity: ${c.capacity}`);
    });
    
  } finally {
    await client.close();
  }
}

check().catch(console.error);
