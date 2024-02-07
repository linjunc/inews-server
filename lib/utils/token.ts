import { Request } from "express";
import jwt from "jsonwebtoken";

export const getToken = (req: Request): Record<string, any> | null => {
  const token = req.headers["authorization"] as string;

  if (!token) {
    return null;
  }
  let dec: any = null;

  jwt.verify(token, "secret", (err: any, decoded) => {
    if (err) {
      dec = null;
    }

    dec = decoded;
  });

  return dec;
};
