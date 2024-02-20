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
Object.defineProperty(exports, "__esModule", { value: true });
exports.picReChange = void 0;
const crypto_1 = require("crypto");
const transfer_1 = require("../services/transfer");
function replaceImageUrls(html, imageUrlMap) {
    return html.replace(/<img[^>]*src="([^"]+)"/g, (match, src) => {
        const newSrc = imageUrlMap[src];
        if (newSrc) {
            return match.replace(src, newSrc);
        }
        return match;
    });
}
/**
 * html 中img图片链接转存
 * @param content
 * @param id
 * @returns
 */
const picReChange = (content, id = (0, crypto_1.randomUUID)()) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // 文本中的所有图片
    const allImg = (_a = getAllImg(content)) !== null && _a !== void 0 ? _a : [];
    if (allImg.length === 0)
        return;
    // 转存所有的图片
    const promises = allImg.map((url, index) => (0, transfer_1.transferImage)({
        url,
        fileName: `inews/${id}/image_${index}`,
    }));
    // 等待所有图片转存完成
    const newImageUrls = (yield Promise.all(promises));
    const imageUrlMap = allImg.reduce((acc, oldUrl, index) => {
        acc[oldUrl] = newImageUrls[index];
        return acc;
    }, {});
    // 替换 HTML 字符串中的图片 URL
    let newHtml = replaceImageUrls(content, imageUrlMap);
    return newHtml;
});
exports.picReChange = picReChange;
// 获取文本中的全部图片
const getAllImg = (content) => {
    const imageUrls = content.match(/<img[^>]*src="([^"]+)"/g) || [];
    return imageUrls.map((url) => url.replace(/<img[^>]*src="([^"]+)"/g, "$1"));
};
