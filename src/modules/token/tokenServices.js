import crypto from 'crypto';
import JWT from 'jsonwebtoken';
import RefreshToken from '../token/refreshTokenModel.js';

// create access token
export const signAccessToken = (user) => {
  return JWT.sign(
    { id: user._id, role: user.role, type: 'access' },
    process.env.JWT_ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN,
    },
  );
};

// generate random 64 bytes string for refresh token
export const generateRefreshToken = () =>
  crypto.randomBytes(64).toString('hex');

// hash token to store it in DB
export const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

// generate random familyId for token revoke
export const generateFamilyId = () => crypto.randomBytes(32).toString('hex');

// create and send tokens
export const createToken = async (user, ip, userAgent) => {
  // 1) generate access & refresh tokens
  const accessToken = signAccessToken(user);
  const refreshToken = generateRefreshToken();
  const tokenHash = hashToken(refreshToken);
  const familyId = generateFamilyId();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  // 2) store refresh token in DB
  await RefreshToken.create({
    user: user._id,
    tokenHash,
    familyId,
    expiresAt,
    createdByIp: ip,
    userAgent,
  });

  // remove password from responce
  user.password = undefined;
  user.isActive = undefined;

  return {
    accessToken,
    refreshToken,
    expiresAt,
  };
};

// for delete token family
export const revokeTokenFamily = async (familyId) =>
  await RefreshToken.deleteMany({ familyId });

// delete entire user's token
export const revokeTokenUser = async (userId) =>
  await RefreshToken.deleteMany({ user: userId });

export const rotateRefreshToken = async (storedToken, user, ip, userAgent) => {
  const newRefreshToken = generateRefreshToken();
  const newRefreshTokenHash = hashToken(newRefreshToken);

  // rotate old token and create new one
  storedToken.revoked = true;
  storedToken.revokedByIp = ip;
  storedToken.userAgent = userAgent;
  storedToken.replacedByTokenHash = newRefreshTokenHash;

  await storedToken.save();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await RefreshToken.create({
    user: user._id,
    tokenHash: newRefreshTokenHash,
    familyId: storedToken.familyId,
    expiresAt,
    createdByIp: ip,
    userAgent,
  });

  // create new access token & send new tokens
  const newAccessToken = signAccessToken(user);

  return { newAccessToken, newRefreshToken, expiresAt };
};
