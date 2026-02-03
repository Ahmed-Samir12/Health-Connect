import './config/env.js';
// Handle Uncaught Exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception ❌, Shutting down...');
  console.log(err.name, err.message);
  console.log(err.stack);
  process.exit(1);
});

// Import Modules
import connectDB from './config/db.js';
import app from './app.js';

// Connect to Database
await connectDB();

// Start Server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Handle Unhandled Rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection ❌, Shutting down...');
  console.log(err.name, err.message);
  console.log(err.stack);
  server.close(() => {
    process.exit(1);
  });
});
