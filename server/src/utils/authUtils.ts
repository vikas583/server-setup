import jwt from "jsonwebtoken";
import { TempTokenData, TokenData, ResetPasswordTokenData } from "../types";
import { AdminTokenData } from "../admin-types";
import bcrypt from "bcrypt";

// Generate Access Token
export const generateAccessToken = (tokenData: TokenData | AdminTokenData) => {
  return jwt.sign(tokenData, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
};

// Generate Refresh Token
export const generateRefreshToken = (
  tokenData: TokenData | AdminTokenData,
  tokenValidFor?: string
) => {
  let tokenValidaity = "";
  if (!tokenValidFor) {
    tokenValidaity = `${process.env.REFRESH_TOKEN_EXPIRY_DAYS}d`;
  } else {
    tokenValidaity = tokenValidFor;
  }
  return jwt.sign(tokenData, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: tokenValidaity,
  });
};

export const comparePassword = (
  requestPassword: string,
  originalPassword: string
) => {
  const result = bcrypt.compareSync(requestPassword, originalPassword);
  return result;
};

export const generateExpiryDate = () => {
  const today = new Date();
  today.setDate(
    today.getDate() + Number(process.env.REFRESH_TOKEN_EXPIRY_DAYS)
  ); // Add 7 days to current date
  return today;
};

export const generateTempAccessToken = (
  tokenData: TempTokenData,
  minsValidFor: number
) => {
  return jwt.sign(tokenData, process.env.TEMP_TOKEN_SECRET, {
    expiresIn: minsValidFor + "m",
  });
};

export const generateResetPasswordToken = (
  tokenData: ResetPasswordTokenData,
  minsValidFor: number
) => {
  return jwt.sign(tokenData, process.env.RESET_PASSWORD_TOKEN_SECRET, {
    expiresIn: minsValidFor + "m",
  });
};

export const generatePasswordResetLink = (token: string) => {
  return `${process.env.FRONTEND_URL}/reset-password-set?token=${token}`;
};
