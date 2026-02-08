import * as tokenServices from '../token/tokenServices.js';
import * as authServices from './authServices.js';
import Email from '../../utils/emails.js';
// import User from '../user/userModel.js';
// import AppError from '../../utils/AppError.js';

// helper functions
const setCookie = (token, expiresAt, res) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: expiresAt,
    path: '/api/v1/auth',
  });
};

const removeCookie = (res) => {
  res.clearCookie('refreshToken', { path: '/api/v1/auth' });
};

const sendTokens = async (user, statusCode, req, res) => {
  const { accessToken, refreshToken, expiresAt } =
    await tokenServices.createToken(user, req.ip, req.get('user-agent'));

  setCookie(refreshToken, expiresAt, res);

  res.status(statusCode).json({
    status: 'success',
    accessToken,
    data: {
      user,
    },
  });
};

const signupWithRole = (role) => async (req, res, next) => {
  try {
    const newUser = await authServices.signupUser(req.body, role);
    const url = `${req.protocol}://${req.get('host')}/api/v1/users/me`;

    await sendTokens(newUser, 201, req, res);

    await new Email(newUser, url).sendWelcome();
  } catch (err) {
    next(err);
  }
};

// signup new user
export const signupPatient = signupWithRole('patient');

export const signupDoctor = signupWithRole('doctor');

export const login = async (req, res) => {
  const user = await authServices.loginUser(req.body);

  // 3) send tokens
  await sendTokens(user, 200, req, res);
};

export const refresh = async (req, res) => {
  // get refresh token and check it
  const { user, storedToken } = await authServices.refresh(
    req.cookies.refreshToken,
  );

  // generate new tokens
  const { newAccessToken, newRefreshToken, expiresAt } =
    await tokenServices.rotateRefreshToken(
      storedToken,
      user,
      req.ip,
      req.get('user-agent'),
    );

  removeCookie(res);

  setCookie(newRefreshToken, expiresAt, res);

  res.status(200).json({
    status: 'success',
    accessToken: newAccessToken,
  });
};

export const logout = async (req, res) => {
  await authServices.logoutUser(req.cookies.refreshToken);

  removeCookie(res);

  res.status(200).json({
    status: 'success',
  });
};

export const logoutAll = async (req, res) => {
  await authServices.logoutUserFromAllDevices(req.user.id);

  removeCookie(res);

  res.status(200).json({
    status: 'success',
  });
};

export const forgotPassword = async (req, res) => {
  await authServices.forgotUserPassword(req);

  res.status(200).json({
    status: 'success',
    message: 'If the email exists, a reset link was sent',
  });
};

export const resetPassword = async (req, res) => {
  const { user } = await authServices.restUserPassword(req);

  await sendTokens(user, 200, req, res);
};
