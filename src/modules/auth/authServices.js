import crypto from 'crypto';
import AppError from '../../utils/AppError.js';
import User from '../user/userModel.js';
import RefreshToken from '../token/refreshTokenModel.js';
import Email from '../../utils/emails.js';
import * as tokenServices from '../token/tokenServices.js';

const filterBody = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

/**
 * Signup a new user
 * @param {object} userData
 * @returns {Promise<User>}
 */

export const signupUser = async (userData, role) => {
  // 1) filter request body
  const filteredBody = filterBody(
    userData,
    'name',
    'email',
    'password',
    'passwordConfirm',
  );
  filteredBody.role = role;
  // 2) create user
  const newUser = await User.create(filteredBody);

  return newUser;
};

/**
 * Login User
 * @param {object} userData
 * @returns {Promise<User>}
 */

export const loginUser = async (userData) => {
  // 1) get email and password and check it
  const { email, password } = userData;
  if (!email || !password) {
    throw new AppError('Please provide email & password', 400);
  }

  // 2) get the user and check if exist
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    throw new AppError('Invalid email or password', 400);
  }

  return user;
};

/**
 * rotate token and get new one
 * @param  refreshToken
 * @returns { Promise<user, token> }
 */

export const refresh = async (refreshToken) => {
  // 1) get token from cookies & check it
  if (!refreshToken) {
    throw new AppError('Refresh token required!', 401);
  }

  // 2) find the token in DB and check it
  const tokenHash = tokenServices.hashToken(refreshToken);

  const storedToken = await RefreshToken.findOne({
    tokenHash,
    revoked: false,
  });

  if (!storedToken) {
    throw new AppError('Invalid refresh token!', 403);
  }

  // reuse token
  if (storedToken.expiresAt.getTime() < Date.now() || storedToken.revoked) {
    await tokenServices.revokeTokenFamily(storedToken.familyId);

    throw new AppError('Token reuse detected!, Login required', 403);
  }

  // 3) find user based on token & check it
  const user = await User.findById(storedToken.user);
  if (!user) {
    throw new AppError('User not found', 401);
  }

  // 4) check if user changed password
  if (user.changedPasswordAfter(storedToken.createdAt)) {
    await tokenServices.revokeTokenUser(user._id);
    throw new AppError('User changed password!, Login again', 401);
  }

  return {
    user: user._id,
    storedToken,
  };
};

/**
 * Log user out
 * @param  refreshToken
 */

export const logoutUser = async (refreshToken) => {
  if (!refreshToken) return;

  // get token & check it
  const storedToken = await RefreshToken.findOne({
    tokenHash: tokenServices.hashToken(refreshToken),
  });

  if (!storedToken) return;

  // reuse token, delete it
  if (storedToken.revoked) {
    await tokenServices.revokeTokenFamily(storedToken.familyId);
    return;
  }

  // delete token
  storedToken.revoked = true;
  await storedToken.save();
};

export const logoutUserFromAllDevices = async (userId) => {
  // delete all users token
  await RefreshToken.updateMany(
    { user: userId, revoked: false },
    { revoked: true },
  );
};

/**
 * Send password reset token to user email
 * @param { object } userData
 */

export const forgotUserPassword = async (userData) => {
  // find user based on POSTed email and check it
  const user = await User.findOne({ email: userData.body.email });
  if (!user) return;

  // generate reset token
  const resetToken = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false });

  try {
    // send email
    const url = `${userData.protocol}://${userData.get('host')}/api/v1/auth/resetPassword/${resetToken}`;

    await new Email(user, url).sendPasswordReset();
  } catch (err) {
    // reset token & it's expiry date
    console.log(err.message);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    throw new AppError(
      'There was an error sending the email! Please try again later!',
      500,
    );
  }
};

/**
 * reset user password
 * @param { object } userData
 */

export const restUserPassword = async (userData) => {
  // find user based on token & check it
  const hashedToken = crypto
    .createHash('sha256')
    .update(userData.params.resetToken)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) throw new AppError('Token is invalid or has expired!', 400);

  if (!userData.body.password || !userData.body.passwordConfirm) {
    throw new AppError('Please provide password and passwordConfirm', 400);
  }

  // set new password
  user.password = userData.body.newPassword;
  user.passwordConfirm = userData.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  await tokenServices.revokeTokenUser(user._id);

  // update passwordChangedAt property
  return { user };
};
