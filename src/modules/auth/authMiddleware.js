import { promisify } from 'util';
import jwt from 'jsonwebtoken';
import AppError from '../../utils/AppError.js';
import User from '../user/userModel.js';

export const protect = async (req, res, next) => {
  // 1) get token & check it
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) throw new AppError('You are not logged in, Please log in', 401);

  // 2) verify token
  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_ACCESS_TOKEN_SECRET,
  );

  if (decoded.type !== 'access') throw new AppError('Invalid token type', 403);

  // 3) get user based on token
  const currentUser = await User.findById(decoded.id);
  if (!currentUser)
    throw new AppError(
      'The user belonging to this token does no longer exists.',
      401,
    );

  // 4) check if user changed password
  if (currentUser.changedPasswordAfter(decoded.iat))
    throw new AppError('User changed password, Login again', 401);

  // 5) grant access
  req.user = currentUser;
  next();
};

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      throw new AppError(`You don't have permission to do this action`, 403);

    next();
  };
};
