"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const getToken = (req) => {
    const token = req.headers["authorization"];
    if (!token) {
        return null;
    }
    let dec = null;
    jsonwebtoken_1.default.verify(token, "secret", (err, decoded) => {
        if (err) {
            dec = null;
        }
        dec = decoded;
    });
    return dec;
};
exports.getToken = getToken;
