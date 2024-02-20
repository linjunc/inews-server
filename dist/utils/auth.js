"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticateToken = (req, res, next) => {
    const token = req.headers["authorization"];
    if (!token) {
        return res.status(403).send({ error: "Token Lost" });
    }
    jsonwebtoken_1.default.verify(token, "secret", (err, decoded) => {
        if (err) {
            return res.status(403).send({ error: err });
        }
        req.user = decoded;
        next();
    });
};
exports.default = authenticateToken;
