const { MongoClient } = require('mongodb');
const crypto = require('crypto');

const MONGO_URL = 'mongodb://localhost:27017';
const DB_NAME = 'flowternity';

async function setTestPassword() {
  const client = new MongoClient(MONGO_URL);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    
    const userId = '255b37f7-b799-4ec1-b9f7-38d4dbd3f62d';
    const newPassword = 'Test123456';
    
    // Simple hash (same as used in registration)
    const passwordHash = crypto.createHash('sha256').update(newPassword).digest('hex');
    
    await db.collection('users').updateOne(
      { id: userId },
      { $set: { password_hash: passwordHash } }
    );
    
    console.log('Password set successfully!');
    console.log('Email: acharyaproject12@gmail.com');
    console.log('Password: Test123456');
    console.log('You can now login with these credentials.');
    
  } finally {
    await client.close();
  }
}

setTestPassword().catch(console.error);
