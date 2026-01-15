import mongoose from 'mongoose';
import app from './app.js';

process.loadEnvFile();

const DB = process.env.DATABASE;
const PORT = process.env.PORT || 3000;

mongoose
  .connect(DB)
  .then(() => console.log('✅ DB connected'))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
