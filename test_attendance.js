// Quick test to check database state
const { MongoClient } = require('mongodb');

async function test() {
  const client = new MongoClient('mongodb://localhost:27017');
  try {
    await client.connect();
    const db = client.db('flowternity');
    
    // Check bookings count
    const bookingCount = await db.collection('bookings').countDocuments();
    console.log('Total bookings:', bookingCount);
    
    // Check attendance count
    const attendanceCount = await db.collection('attendance').countDocuments();
    console.log('Total attendance records:', attendanceCount);
    
    // Sample bookings
    const sampleBookings = await db.collection('bookings').find().limit(3).toArray();
    console.log('\nSample bookings:');
    sampleBookings.forEach(b => {
      console.log(`  ID: ${b.id}, User: ${b.user_id}, Child: ${b.child_profile_id}, Status: ${b.status}`);
    });
    
    // Sample attendance
    const sampleAttendance = await db.collection('attendance').find().limit(3).toArray();
    console.log('\nSample attendance records:', sampleAttendance.length);
    sampleAttendance.forEach(a => {
      console.log(`  BookingID: ${a.booking_id}, Present: ${a.present}`);
    });
    
  } finally {
    await client.close();
  }
}

test().catch(console.error);
