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
const transfer_1 = require("../services/transfer");
const multerInstance_1 = __importDefault(require("../services/multerInstance"));
const router = express_1.default.Router();
router.post("/save_file_oss", multerInstance_1.default.single("image"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            throw new Error("Params Error");
        }
        const resp = yield (0, transfer_1.transferFile)({ content: req.file });
        console.log("res", resp);
        res.send({
            msg: "图片转存成功",
            data: {
                url: resp,
            },
            code: 200,
        });
    }
    catch (e) {
        res.send({
            code: 402,
            msg: e.message,
        });
    }
}));
// 根据 URL 转存图片到图床
router.post("/save_url_oss", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { url, fileName } = req.body;
    try {
        const resp = yield (0, transfer_1.transferImage)({ url, fileName });
        res.send({
            msg: "图片转存成功",
            data: {
                url: resp,
            },
            code: 200,
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
