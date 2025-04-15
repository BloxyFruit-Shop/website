import mongoose from 'mongoose';
import { init } from '@paralleldrive/cuid2';

// Initialize the referral code generator with a length of 48
const createCode = init({ length: 10 });

async function migrateUsers() {
  if (!process.env.MONGODB_URI) {
    console.error('Error: MONGODB_URI environment variable is not set.');
    process.exit(1);
  }

  try {
    // Connect to the MongoDB database using the connection string in MONGODB_URI
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB.');

    // Directly access the users collection
    const usersCollection = mongoose.connection.collection('users');

    // Find users missing "robux" or "referralCode"
    const cursor = usersCollection.find({
      $or: [{ robux: { $exists: false } }, { referralCode: { $exists: false } }]
    });

    let updatedCount = 0;
    while (await cursor.hasNext()) {
      const user = await cursor.next();

      const updateDoc = {};
      if (user.robux === undefined) {
        updateDoc.robux = 0;
      }
      if (user.referralCode === undefined) {
        updateDoc.referralCode = createCode();
      }

      if (Object.keys(updateDoc).length > 0) {
        await usersCollection.updateOne({ _id: user._id }, { $set: updateDoc });
        updatedCount++;
      }
    }

    console.log(`Migration complete. Updated ${updatedCount} user(s).`);
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

migrateUsers();
