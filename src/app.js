import helmet from 'helmet';
import express from 'express';
import morgan from 'morgan';
import AppError from './utils/AppError.js';
import globalErrorHandler from './controllers/errorController.js';

const app = express();

// Global middlewares
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: { 'script-src': ["'self'"] },
  })
);

// Test route
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// 404 handler for undefined routes
app.all('/{*splat}', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl}`, 404));
});

// Global error middleware
app.use(globalErrorHandler);

export default app;
