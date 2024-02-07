import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

// 扩展Express的Request接口
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        account: string;
      };
    }
  }
}

const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers["authorization"] as string;

  if (!token) {
    return res.status(403).send({ error: "Token Lost" });
  }

  jwt.verify(token, "secret", (err: any, decoded: any) => {
    if (err) {
      return res.status(403).send({ error: err });
    }

    req.user = decoded;
    next();
  });
};

export default authenticateToken;
