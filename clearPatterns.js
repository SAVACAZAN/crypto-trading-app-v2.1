// Quick script to clear old patterns from MongoDB
import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb://127.0.0.1:27017/crypto-app-V1';

async function clearPatterns() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);

    console.log('Deleting ALL patterns...');
    const result = await mongoose.connection.db.collection('patterndetections').deleteMany({});

    console.log(`✅ Deleted ${result.deletedCount} patterns`);

    const remaining = await mongoose.connection.db.collection('patterndetections').countDocuments();
    console.log(`📊 Remaining patterns: ${remaining}`);
    console.log('✅ Fresh patterns will be created automatically');

    await mongoose.disconnect();
    console.log('✅ Done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

clearPatterns();
