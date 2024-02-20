"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const commentFields = {
    create_time: { type: String },
    text: { type: String },
    digg_count: { type: Number },
    digg_id_list: { type: Array },
    user_id: { type: String },
    article_id: { type: String },
};
const commentSchema = new mongoose_1.default.Schema(commentFields);
const commentModel = mongoose_1.default.model("comment", commentSchema);
exports.default = commentModel;
