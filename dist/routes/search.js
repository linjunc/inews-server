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
// 图床服务实现
const express_1 = __importDefault(require("express"));
const search_1 = require("../utils/search");
const router = express_1.default.Router();
// 添加用户反馈 到 bitable
router.get("/search", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { keyword } = req.query;
    if (!keyword) {
        return res.status(400).json({ error: "keyword parameter is required" });
    }
    try {
        const articles = yield (0, search_1.searchArticles)(keyword);
        const users = yield (0, search_1.searchUsers)(keyword);
        res.send({
            code: 200,
            data: {
                articles,
                users,
            },
        });
    }
    catch (e) {
        res.send({
            code: 402,
            msg: e.message,
        });
    }
}));
exports.default = (app) => {
    app.use("", router);
};
