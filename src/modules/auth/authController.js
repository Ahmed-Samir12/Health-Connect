import * as tokenServices from '../token/tokenServices.js';
import * as authServices from './authServices.js';
import Email from '../../utils/emails.js';
// import AppError from '../../utils/AppError.js';

// helper functions
const removeCookie = (res) => {
  res.clearCookie('refreshToken', { path: '/api/v1/auth' });
};

// signup new user
export const signup = async (req, res) => {
  const newUser = await authServices.signupUser(req.body);
  const url = `${req.protocol}://${req.get('host')}/api/v1/users/me`;
  await new Email(newUser, url).sendWelcome();

  await tokenServices.createSendToken(newUser, 201, res);
};

export const login = async (req, res) => {
  const user = await authServices.loginUser(req.body);

  // 3) send tokens
  await tokenServices.createSendToken(user, 200, res);
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

  res.cookie('refreshToken', newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: expiresAt,
    path: '/api/v1/auth',
  });

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
    message: 'Token sent to your email',
  });
};

export const resetPassword = async (req, res) => {
  const { user } = await authServices.restUserPassword(req);

  tokenServices.createSendToken(user, 200, res);
};
