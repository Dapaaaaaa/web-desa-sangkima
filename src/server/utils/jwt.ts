import { SignJWT, jwtVerify } from "jose";

const getJwtSecretKey = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length === 0) {
    throw new Error("JWT_SECRET is not set in environment variables");
  }
  return new TextEncoder().encode(secret);
};

const getJwtExpiration = () => {
  const exp = process.env.JWT_EXPIRES_IN;
  if (!exp) {
    throw new Error("JWT_EXPIRES_IN is not set");
  }
  return exp;
};

export const signToken = async (payload: {
  id: string;
  email: string;
  nik: string;
}) => {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(getJwtExpiration())
    .sign(getJwtSecretKey());
};

export const verifyToken = async (token: string) => {
  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey());
    return payload;
  } catch (error) {
    return null;
  }
};
