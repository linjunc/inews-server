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
/**
 * @return {map} 标签对应中文名的map
 */
function default_1() {
    return __awaiter(this, void 0, void 0, function* () {
        const nameMap = new Map();
        // 两个数组顺序需要对应
        const tagList = [
            "news_society",
            "news_entertainment",
            "news_tech",
            "news_military",
            "news_sports",
            "news_car",
            "news_finance",
            "news_world",
            "news_fashion",
            "news_history",
            "news_air",
        ];
        const nameList = [
            "社会类",
            "娱乐类",
            "科技类",
            "军事类",
            "体育类",
            "汽车类",
            "财经类",
            "国际类",
            "时尚类",
            "历史类",
            "航空类",
        ];
        for (let i = 0; i < tagList.length; i++) {
            nameMap.set(tagList[i], nameList[i]);
        }
        return {
            nameMap,
        };
    });
}
exports.default = default_1;
