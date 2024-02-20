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
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const user_1 = __importDefault(require("../model/user"));
const article_1 = __importDefault(require("../model/article"));
const picReChange_1 = require("../utils/picReChange");
const router = express_1.default.Router();
// 添加文章
// 写入文章表时，如果没有该用户，那么就为这个 id 创建一个帐号，密码为123，然后再写入文章表和用户表
router.post("/add_article_mock", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { tag, title, abstract, has_image, image_url, image_list, media_id, media_name, avatar_url, media_info, content, } = req.body;
        const media = yield user_1.default.findOne({
            account: media_id,
        }, {
            account: 1,
            password: 1,
        });
        // 没有该用户则注册
        if (!media || !media.account) {
            const userInfo = {
                account: media_id,
                password: media_id,
                introduction: "该用户暂无简介~",
                avatar: avatar_url ||
                    "https://sf1-ttcdn-tos.pstatp.com/obj/larkcloud-file-storage/baas/qctm8y/8e91b81e17773e58_1638443073384.png",
                nickname: media_name,
                digg_article_id_list: [],
                digg_comment_id_list: [],
                comment_id_list: [],
                reply_id_list: [],
                like_article_id_list: [],
                follow_media_id_list: [],
                history_id_list: [],
                follower_id_list: [],
                tag_list: [],
                type: "media",
                personal_page: `## <div align=\"center\">欢迎━(*｀∀´*)ノ亻!访问我的iNews主页</div>\n<div align=\"center\">\n\n ​🤵**目前职业**\n\n  ​👨**性别：你的性别**  &nbsp;&nbsp;&nbsp;  🚴‍♂️**爱好：你的爱好**\n\n  🏡​**Base：居住地点** &nbsp;🏢 ‍**公司 @公司名称**  \n\n😃 **今日状态：（元气满满/听歌/沉迷学习/摸鱼......）**\n</div>`,
                read_report_list: [],
                is_show_history: false,
            };
            yield user_1.default.create(userInfo);
        }
        const userAct = yield user_1.default.findOne({ account: media_id });
        if (!userAct) {
            throw new Error("用户不存在");
        }
        const id = userAct._id;
        console.log("!!!", id);
        console.log(req.body);
        if (!title || !content || !tag) {
            throw new Error("Params Error");
        }
        const newArticle = new article_1.default({
            tag,
            title,
            abstract,
            digg_count: 0,
            comment_count: 0,
            like_count: 0,
            has_image: has_image || false,
            image_url: image_url || "",
            image_list: image_list || [],
            publish_time: Math.floor(Date.now() / 1000),
            media_id: id || "",
            media_user: {
                media_name,
                avatar_url,
                media_info,
            } || {},
            content,
            digg_id_list: [],
            like_id_list: [],
            read_count: 0,
        });
        yield newArticle.save();
        res.send({
            msg: "文章添加成功",
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
router.post("/add_mock_data", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { type = "news_society" } = req.body;
    try {
        const response = yield axios_1.default.get(`https://m.toutiao.com/list/?tag=${type}&count=200&format=json_raw&as=A17538D54D106FF`);
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
        const data = response.data.data;
        for (let i = 0; i < data.length; i++) {
            const contentData = data[i];
            const { title, abstract, has_image, middle_image, avatar_url, has_video, } = contentData;
            // 不添加视频文章
            if (has_video) {
                continue;
            }
            let tag = contentData.tag;
            console.log("type", type, tag);
            // 查找当前文章是否存在
            const currentArticle = yield article_1.default.findOne({ title });
            const { data: detailData } = yield axios_1.default.get(`http://m.toutiao.com${contentData.source_url}info/`);
            const detail = detailData === null || detailData === void 0 ? void 0 : detailData.data;
            if (!detail) {
                continue;
            }
            // 查找是否有当前作者
            const media = yield user_1.default.findOne({
                account: detail.media_id,
            }, {
                account: 1,
                password: 1,
            });
            // 没有该用户则注册
            if (!media || !media.account) {
                const userInfo = {
                    account: detail.media_id,
                    password: detail.media_id,
                    introduction: "该用户暂无简介~",
                    avatar: avatar_url ||
                        "https://sf1-ttcdn-tos.pstatp.com/obj/larkcloud-file-storage/baas/qctm8y/8e91b81e17773e58_1638443073384.png",
                    nickname: detail.source,
                    digg_article_id_list: [],
                    digg_comment_id_list: [],
                    comment_id_list: [],
                    reply_id_list: [],
                    like_article_id_list: [],
                    follow_media_id_list: [],
                    history_id_list: [],
                    follower_id_list: [],
                    tag_list: [],
                    type: "media",
                    personal_page: `## <div align=\"center\">欢迎━(*｀∀´*)ノ亻!访问我的iNews主页</div>\n<div align=\"center\">\n\n ​🤵**目前职业**\n\n  ​👨**性别：你的性别**  &nbsp;&nbsp;&nbsp;  🚴‍♂️**爱好：你的爱好**\n\n  🏡​**Base：居住地点** &nbsp;🏢 ‍**公司 @公司名称**  \n\n😃 **今日状态：（元气满满/听歌/沉迷学习/摸鱼......）**\n</div>`,
                    read_report_list: [],
                    is_show_history: false,
                };
                yield user_1.default.create(userInfo);
            }
            const userAct = yield user_1.default.findOne({
                account: detail.media_id,
            });
            if (!userAct) {
                throw new Error("用户不存在");
            }
            const id = userAct._id;
            // 保护这个标签
            if (!tagList.includes(tag)) {
                tag = tagList[Math.floor(Math.random() * tagList.length)];
            }
            const dealContent = yield (0, picReChange_1.picReChange)(detail.content);
            // 如果有这个文章，则更新
            if (currentArticle) {
                yield article_1.default.updateOne({
                    tag,
                    title,
                    abstract,
                    digg_count: detail.digg_count,
                    comment_count: 0,
                    like_count: detail.like_count,
                    has_image: has_image || false,
                    image_url: (middle_image === null || middle_image === void 0 ? void 0 : middle_image.url) || "",
                    image_list: (middle_image === null || middle_image === void 0 ? void 0 : middle_image.url_list) || [],
                    publish_time: detail.publish_time || Math.floor(Date.now() / 1000),
                    media_id: id || "",
                    media_user: {
                        media_name: detail.media_user.screen_name,
                        avatar_url: detail.media_user.avatar_url,
                        media_info: (_a = detail.media_user.user_auth_info) === null || _a === void 0 ? void 0 : _a.auth_info,
                    } || {},
                    content: dealContent,
                    digg_id_list: [],
                    like_id_list: [],
                    read_count: 0,
                });
                continue;
            }
            const newArticle = new article_1.default({
                tag,
                title,
                abstract,
                digg_count: detail.digg_count,
                comment_count: 0,
                like_count: detail.like_count,
                has_image: has_image || false,
                image_url: (middle_image === null || middle_image === void 0 ? void 0 : middle_image.url) || "",
                image_list: (middle_image === null || middle_image === void 0 ? void 0 : middle_image.url_list) || [],
                publish_time: detail.publish_time || Math.floor(Date.now() / 1000),
                media_id: id || "",
                media_user: {
                    media_name: detail.media_user.screen_name,
                    avatar_url: detail.media_user.avatar_url,
                    media_info: (_b = detail.media_user.user_auth_info) === null || _b === void 0 ? void 0 : _b.auth_info,
                } || {},
                content: dealContent,
                digg_id_list: [],
                like_id_list: [],
                read_count: 0,
            });
            yield newArticle.save();
        }
        res.send({
            msg: "文章添加成功",
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
