"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const articleFields = {
    tag: { type: String },
    title: { type: String },
    abstract: { type: String },
    digg_count: { type: Number },
    comment_count: { type: Number },
    like_count: { type: Number },
    has_image: { type: Boolean },
    image_url: { type: String },
    image_list: { type: [String] },
    publish_time: { type: String },
    media_id: { type: String },
    media_user: {
        media_name: { type: String },
        avatar_url: { type: String },
        media_info: { type: String },
    },
    content: { type: String },
    digg_id_list: { type: [String] },
    like_id_list: { type: [String] },
    read_count: { type: Number },
};
const articleSchema = new mongoose_1.Schema(articleFields);
const articleModel = mongoose_1.default.model("article", articleSchema);
exports.default = articleModel;
