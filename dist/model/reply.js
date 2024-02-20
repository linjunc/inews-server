"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const replyFields = {
    create_time: { type: String },
    text: { type: String },
    comment_id: { type: String },
    user_id: { type: String },
};
const replySchema = new mongoose_1.default.Schema(replyFields);
const replyModel = mongoose_1.default.model("reply", replySchema);
exports.default = replyModel;
