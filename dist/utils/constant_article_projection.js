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
function default_1() {
    return __awaiter(this, void 0, void 0, function* () {
        const projection = {
            publish_time: 1,
            image_url: 1,
            media_id: 1,
            media_user: 1,
            like_count: 1,
            title: 1,
            abstract: 1,
            tag: 1,
            digg_count: 1,
            comment_count: 1,
            has_image: 1,
            image_list: 1,
            read_count: 1,
        };
        return {
            projection,
        };
    });
}
exports.default = default_1;
