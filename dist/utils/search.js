"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchUsers = exports.searchArticles = void 0;
const article_1 = __importDefault(require("../model/article"));
const user_1 = __importDefault(require("../model/user"));
// 搜索 articles 集合
function searchArticles(keyword) {
    return __awaiter(this, void 0, void 0, function* () {
        const results = yield article_1.default.find({
            $or: [
                { title: { $regex: new RegExp(keyword, "i") } },
                { content: { $regex: new RegExp(keyword, "i") } },
            ],
        });
        return results;
    });
}
exports.searchArticles = searchArticles;
// 搜索 users 集合
function searchUsers(keyword) {
    return __awaiter(this, void 0, void 0, function* () {
        const results = user_1.default.find({
            $or: [
                { nickname: { $regex: new RegExp(keyword, "i") } },
                { account: { $regex: new RegExp(keyword, "i") } },
            ],
        });
        return results;
    });
}
exports.searchUsers = searchUsers;
