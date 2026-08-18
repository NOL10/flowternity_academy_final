const { MongoClient } = require('mongodb');
const { v4: uuidv4 } = require('uuid');

async function seed() {
  const client = new MongoClient('mongodb://localhost:27017');
  try {
    await client.connect();
    const db = client.db('flowternity');
    
    // Get first user with children
    const user = await db.collection('users').findOne({});
    if (!user) {
      console.log('No users found');
      return;
    }
    
    console.log(`Using user: ${user.full_name} (${user.id})`);
    
    // Get or create child profiles for this user
    let children = await db.collection('child_profiles').find({ parent_id: user.id }).toArray();
    console.log(`Found ${children.length} child profiles for ${user.full_name}`);
    
    // If no children, create one
    if (children.length === 0) {
      const childId = uuidv4();
      const newChild = {
        id: childId,
        parent_id: user.id,
        child_name: `${user.full_name}'s Child`,
        athlete_name: `${user.full_name}'s Child`,
        dob: '2015-01-01',
        selected_sports: ['basketball'],
        created_at: new Date()
      };
      await db.collection('child_profiles').insertOne(newChild);
      children = [newChild];
      console.log(`Created child profile: ${childId}`);
    }
    
    // Get classes
    const classes = await db.collection('classes').find({ sport_id: 'basketball' }).limit(5).toArray();
    console.log(`Found ${classes.length} basketball classes`);
    
    if (classes.length === 0) {
      console.log('No classes found');
      return;
    }
    
    // Create bookings and attendance
    let bookingCount = 0;
    let attendanceCount = 0;
    
    for (const cls of classes) {
      // Create a booking
      const bookingId = uuidv4();
      const booking = {
        id: bookingId,
        user_id: user.id,
        class_id: cls.id,
        child_profile_id: children[0].id,
        status: 'booked',
        created_at: new Date(),
        user_membership_id: uuidv4()
      };
      
      // Check if booking already exists
      const existing = await db.collection('bookings').findOne({ 
        user_id: user.id, 
        class_id: cls.id, 
        child_profile_id: children[0].id 
      });
      
      if (!existing) {
        await db.collection('bookings').insertOne(booking);
        bookingCount++;
        
        // Create attendance record
        const attendance = {
          id: uuidv4(),
          booking_id: bookingId,
          class_id: cls.id,
          present: Math.random() > 0.3, // 70% present
          created_at: new Date(),
          marked_at: new Date(),
          marked_by: 'admin-seed'
        };
        
        await db.collection('attendance').insertOne(attendance);
        attendanceCount++;
        
        console.log(`✓ Created booking & attendance for class ${cls.date} ${cls.start_time} - Present: ${attendance.present}`);
      } else {
        console.log(`- Booking already exists for class ${cls.date} ${cls.start_time}`);
      }
    }
    
    console.log(`\nDone! Seeded ${bookingCount} bookings and ${attendanceCount} attendance records`);
    
  } finally {
    await client.close();
  }
}

seed().catch(console.error);
