const { MongoClient } = require('mongodb');

async function verify() {
  const client = new MongoClient('mongodb://localhost:27017');
  try {
    await client.connect();
    const db = client.db('flowternity');
    
    const bookingCount = await db.collection('bookings').countDocuments();
    const attendanceCount = await db.collection('attendance').countDocuments();
    
    console.log(`Bookings: ${bookingCount}`);
    console.log(`Attendance: ${attendanceCount}`);
    
    // Get first user's bookings
    const user = await db.collection('users').findOne({});
    const userBookings = await db.collection('bookings').find({ user_id: user.id }).toArray();
    console.log(`\n${user.full_name}'s bookings: ${userBookings.length}`);
    
    userBookings.forEach(b => {
      console.log(`  Booking ${b.id.slice(0, 8)}... - Child: ${b.child_profile_id?.slice(0, 8) || 'none'}...`);
    });
    
    // Get attendance for those bookings
    const bookingIds = userBookings.map(b => b.id);
    const attendance = await db.collection('attendance').find({ booking_id: { $in: bookingIds } }).toArray();
    console.log(`\nAttendance records for user's bookings: ${attendance.length}`);
    
    attendance.forEach(a => {
      console.log(`  BookingID: ${a.booking_id.slice(0, 8)}... - Present: ${a.present}`);
    });
    
  } finally {
    await client.close();
  }
}

verify().catch(console.error);
