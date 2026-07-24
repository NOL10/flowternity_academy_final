const { MongoClient } = require('mongodb');

// You need to set these values manually or get them from your .env file
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'flowternity';

async function updateExpiry() {
  const client = new MongoClient(MONGO_URL);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    
    // Find an active membership
    const membership = await db.collection('user_memberships').findOne({ status: 'active' });
    
    if (!membership) {
      console.log('No active membership found');
      return;
    }
    
    console.log(`Found active membership for user: ${membership.user_id}`);
    console.log(`Current expiry: ${membership.expiry_date}`);
    
    // Update to 5 days from now
    const newExpiry = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
    await db.collection('user_memberships').updateOne(
      { _id: membership._id },
      { $set: { expiry_date: newExpiry } }
    );
    
    console.log(`Updated expiry to: ${newExpiry}`);
    console.log('Done! Now login as this user to test expiry indicators.');
    
  } finally {
    await client.close();
  }
}

updateExpiry().catch(console.error);
