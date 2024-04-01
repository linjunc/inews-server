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
exports.client = void 0;
// 图床服务实现
const express_1 = __importDefault(require("express"));
const token_1 = require("../utils/token");
// import { client } from "../services/bitable";
const user_1 = __importDefault(require("../model/user"));
const lark = __importStar(require("@larksuiteoapi/node-sdk"));
exports.client = new lark.Client({
    appId: "cli_a55456063fbe500c",
    appSecret: "6mZ56zx0gVo04eDBh5NpfgJzjj1Dth0D",
});
const router = express_1.default.Router();
// 添加用户反馈 到 bitable
router.post("/user_feedback", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { phone, feedback_question, advance } = req.body;
    const userToken = (0, token_1.getToken)(req);
    console.log("userToken", userToken, phone, feedback_question);
    let userInfo = null;
    if (userToken === null || userToken === void 0 ? void 0 : userToken.id) {
        userInfo = yield user_1.default.findOne({ _id: userToken.id });
    }
    const records = {
        用户名: (userInfo === null || userInfo === void 0 ? void 0 : userInfo.nickname) ||
            (userInfo === null || userInfo === void 0 ? void 0 : userInfo.account) ||
            (userToken === null || userToken === void 0 ? void 0 : userToken.account) ||
            "未登录用户",
        openid: (userToken === null || userToken === void 0 ? void 0 : userToken.id) || "",
        电话号码: phone,
        请描述您遇到的问题: feedback_question,
        请输入希望改进的地方: advance,
    };
    yield exports.client.bitable.appTableRecord.create({
        path: {
            app_token: "SJCkba6jRanDgXsF8kacxH2rncb",
            table_id: "tblC9Uz0tsYcPiAb",
        },
        data: {
            fields: records,
        },
    });
    res.send({
        code: 200,
        msg: "提交成功",
    });
    try {
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
