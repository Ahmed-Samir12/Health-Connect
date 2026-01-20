import mongoose from 'mongoose';

const connectDB = async () => {
  const dbUrl = process.env.DATABASE_URL.replace(
    '<db_password>',
    process.env.DATABASE_PASSWORD
  );

  try {
    await mongoose.connect(dbUrl);
    console.log('Database connected successfully ✅');
  } catch (err) {
    console.error('Database connection failed ❌', err.message);
    process.exit(1);
  }
};

export default connectDB;
