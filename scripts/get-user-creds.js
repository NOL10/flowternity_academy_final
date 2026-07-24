const { MongoClient } = require('mongodb');

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'flowternity';

async function getUserCredentials() {
  const client = new MongoClient(MONGO_URL);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    
    // Find the user with the expiring membership
    const userId = '255b37f7-b799-4ec1-b9f7-38d4dbd3f62d';
    const user = await db.collection('users').findOne({ id: userId });
    
    if (!user) {
      console.log('User not found');
      return;
    }
    
    console.log('User Login Credentials:');
    console.log('Email:', user.email);
    console.log('Password: (Check if temp_password was set during registration)');
    console.log('Name:', user.full_name);
    console.log('Role:', user.role);
    
    // Check if there's a temp password in the membership
    const membership = await db.collection('user_memberships').findOne({ user_id: userId, status: 'active' });
    if (membership) {
      console.log('Membership expires:', membership.expiry_date);
    }
    
  } finally {
    await client.close();
  }
}

getUserCredentials().catch(console.error);
