import { fileURLToPath } from 'url';
import path from 'path';
import helmet from 'helmet';
import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import AppError from './utils/AppError.js';
import globalErrorHandler from './middlewares/errorHandler.js';
import authRouter from './modules/auth/authRoutes.js';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Global middlewares
app.use(express.static(path.join(__dirname, 'public')));
app.use(helmet());
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: { 'script-src': ["'self'"] },
  }),
);

// main routes
app.use('/api/v1/auth', authRouter);

// 404 handler for undefined routes
app.all('/{*splat}', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// Global error middleware
app.use(globalErrorHandler);

export default app;
