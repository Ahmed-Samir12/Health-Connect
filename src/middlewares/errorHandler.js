import AppError from '../utils/AppError.js';

const handleDuplicateFieldsDB = (err) => {
  const value = err.keyValue ? JSON.stringify(err.keyValue.email) : '';
  const message = `Duplicate field value ${value}, please use another value`;
  return new AppError(message, 400);
};

const handleJWTError = () => {
  return new AppError('Invalid token, Please login again', 401);
};

const handleJWTExpiresError = () => {
  return new AppError('Your session has expired. Please login again.', 401);
};

// For sending error responses in development environment
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

// For sending error responses in production environment
const sendErrorProd = (err, res) => {
  // Operational, trusted error
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  // Programming or unknown error
  console.error('💥 ERROR:', err);

  res.status(500).json({
    status: 'error',
    message: 'Something went wrong!',
  });
};

export default (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = err;
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'TokenExpiredError') error = handleJWTExpiresError();
    if (error.name === 'JsonWebTokenError') error = handleJWTError();

    sendErrorProd(error, res);
  }
};
