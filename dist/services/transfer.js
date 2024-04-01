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
exports.transferImages = exports.transferImage = exports.transferFile = void 0;
const axios_1 = __importDefault(require("axios"));
const ali_oss_1 = __importDefault(require("ali-oss"));
const crypto_1 = require("crypto");
// 初始化OSS客户端。请将以下参数替换为您自己的配置信息。
const client = new ali_oss_1.default({
    region: "oss-cn-beijing", // 示例：'oss-cn-hangzhou'，填写Bucket所在地域。
    accessKeyId: process.env.OSS_ACCESS_KEY_ID || "", // 确保已设置环境变量OSS_ACCESS_KEY_ID。
    accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET || "", // 确保已设置环境变量OSS_ACCESS_KEY_SECRET。
    bucket: "ljcimg", // 示例：'my-bucket-name'，填写存储空间名称。
});
// 文件存储
const transferFile = ({ content }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const objectKey = `/avatar/${Date.now()}-${content === null || content === void 0 ? void 0 : content.originalname}`;
        // 上传到图床
        const { res, url: ossUrl } = yield client.put(objectKey, content.buffer);
        if (res.status !== 200) {
            throw new Error("上传失败");
        }
        // 返回图片地址
        return ossUrl;
    }
    catch (error) {
        console.error(`Failed to transfer file`, error);
        return "";
    }
});
exports.transferFile = transferFile;
/**
 * 将 url 图片内容，转存到 oss 中
 * @param param0
 * @returns
 */
const transferImage = ({ url, fileName, }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!url)
            return url;
        const response = yield axios_1.default.get(url, { responseType: "arraybuffer" });
        // 上传到图床
        const { res, url: ossUrl } = yield client.put(fileName, response.data, {
            headers: {
                "Content-Type": response.headers["content-type"],
            },
        });
        if (res.status !== 200) {
            throw new Error("上传失败");
        }
        // 返回图片地址
        return ossUrl;
    }
    catch (error) {
        console.error(`Failed to transfer image: ${url}`, error);
        throw new Error(`Failed to transfer image: ${url}`);
    }
});
exports.transferImage = transferImage;
/**
 * 批量转存图片
 * @param param0
 * @returns
 */
const transferImages = ({ urls, fileName = "", }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const resp = [];
        for (let i = 0; i < urls.length; i++) {
            const response = yield axios_1.default.get(urls[i], {
                responseType: "arraybuffer",
            });
            const id = (0, crypto_1.randomUUID)();
            // 上传到图床
            const { res, url: ossUrl } = yield client.put(`inews-${fileName}/${id}/image_${i}`, response.data, {
                headers: {
                    "Content-Type": response.headers["content-type"],
                },
            });
            if (res.status !== 200) {
                throw new Error("上传失败");
            }
            resp.push(ossUrl);
        }
        // 返回图片地址
        return resp;
    }
    catch (error) {
        console.error(`Failed to transfer images: `, error);
        throw new Error(`Failed to transfer images`);
    }
});
exports.transferImages = transferImages;
