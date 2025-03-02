import jwt from "jsonwebtoken";
import { TokenData } from "../types";

export const generateAccessToken = (tokenData: TokenData) => {
    return jwt.sign(tokenData, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "15m",
    });
};

// Generate Refresh Token
export const generateRefreshToken = (
    tokenData: TokenData,
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

export const generateExpiryDate = () => {
    const today = new Date();
    today.setDate(
        today.getDate() + Number(process.env.REFRESH_TOKEN_EXPIRY_DAYS)
    ); // Add 7 days to current date
    return today;
};

