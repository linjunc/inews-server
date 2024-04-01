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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dayjs_1 = __importDefault(require("dayjs"));
const constant_tag_name_1 = __importDefault(require("../utils/constant_tag_name"));
const constant_article_projection_1 = __importDefault(require("../utils/constant_article_projection"));
const auth_1 = __importDefault(require("../utils/auth"));
const util_sToMinute_1 = __importDefault(require("../utils/util_sToMinute"));
const user_1 = __importDefault(require("../model/user"));
const article_1 = __importDefault(require("../model/article"));
const router = express_1.default.Router();
router.post("/user_login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { account, password, type = "reader" } = req.body;
        // if(!account || !password) {
        //   res.send() new Error("账号或密码不能为空")
        // } else if(!/^[A-Za-z0-9]+$/.test(account)) {
        //   res.send() new Error("账号只能包含字母或数字")
        // }
        const user = yield user_1.default.where({ account }).findOne();
        let msg = "", id = "";
        let userInfo = {};
        if (user) {
            // 有该用户则验证类型
            if (user.type != type) {
                throw new Error("用户类型错误");
            }
            // 验证类型成功则验证密码
            if (password == user.password) {
                id = user._id;
                userInfo = {
                    account: user.account,
                    password: user.password,
                    avatar: user.avatar,
                    type: user.type,
                    tag_list: user.tag_list,
                    nickname: user.nickname,
                };
                msg = "登录成功";
            }
            else {
                throw new Error("账号或密码错误");
            }
        }
        else {
            // 没有该用户则注册
            userInfo = {
                account,
                password,
                introduction: "该用户暂无简介~",
                avatar: "https://sf1-ttcdn-tos.pstatp.com/obj/larkcloud-file-storage/baas/qctm8y/8e91b81e17773e58_1638443073384.png",
                nickname: "新用户",
                digg_article_id_list: [],
                digg_comment_id_list: [],
                comment_id_list: [],
                reply_id_list: [],
                like_article_id_list: [],
                follow_media_id_list: [],
                history_id_list: [],
                follower_id_list: [],
                tag_list: [],
                type: type || "reader",
                personal_page: `## <div align=\"center\">欢迎━(*｀∀´*)ノ亻!访问我的iNews主页</div>\n<div align=\"center\">\n\n ​🤵**目前职业**\n\n  ​👨**性别：你的性别**  &nbsp;&nbsp;&nbsp;  🚴‍♂️**爱好：你的爱好**\n\n  🏡​**Base：居住地点** &nbsp;🏢 ‍**公司 @公司名称**  \n\n😃 **今日状态：（元气满满/听歌/沉迷学习/摸鱼......）**\n</div>`,
                read_report_list: [],
                is_show_history: false,
            };
            yield user_1.default.create(userInfo);
            const newUser = yield user_1.default.where({ account }).findOne();
            id = newUser._id;
            msg = "注册成功";
        }
        const token = jsonwebtoken_1.default.sign({
            id,
            account: userInfo.account,
            password: userInfo.password,
        }, "secret", { expiresIn: "60d" });
        res.send({
            msg,
            user_info: {
                user_id: id,
                account: userInfo.account,
                password: userInfo.password,
                avatar: userInfo.avatar,
                type: userInfo.type,
                nickname: userInfo.nickname,
            },
            tag_list: userInfo.tag_list,
            token,
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
// 获取日历热图数据
router.get("/calendar_hot_graph", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_id } = req.query;
        if (!user_id) {
            throw new Error("Params Error");
        }
        const user = yield user_1.default.findOne({ _id: user_id }, {
            read_report_list: 1,
        });
        if (!user) {
            throw new Error("用户不存在");
        }
        if (user.read_report_list.length == 0) {
            throw new Error("暂无阅读数据");
        }
        const data = [];
        for (let i = 0; i < user.read_report_list.length; i++) {
            const obj = {
                date: user.read_report_list[i].date,
                count: user.read_report_list[i].total_count,
            };
            data.push(obj);
        }
        res.send({
            msg: "获取阅读日历数据成功",
            data,
            code: 200,
        });
    }
    catch (e) {
        res.send({
            code: e.message == "jwt expired" ? 401 : 402,
            msg: e.message,
        });
    }
}));
// 查看文章历史
router.get("/history_list", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.headers["authorization"];
        let { user_id, n, skip } = req.query;
        const currentNum = Number(n);
        const skipNum = Number(skip);
        if (currentNum <= 0 || skipNum < 0 || !user_id) {
            throw new Error("Params Error");
        }
        const { nameMap } = yield (0, constant_tag_name_1.default)();
        let has_more = true;
        const user = yield user_1.default.findOne({ _id: user_id }, {
            history_id_list: 1,
        });
        if (!user) {
            throw new Error("用户不存在");
        }
        // 倒序，保证第一个是最近的阅读历史记录
        const historyList = user.history_id_list.reverse();
        const article_list = [];
        let myself = null;
        if (token) {
            let decode = null;
            jsonwebtoken_1.default.verify(token, "secret", function (err, decoded) {
                if (err) {
                    throw err;
                }
                else {
                    decode = decoded;
                }
            });
            myself = yield user_1.default.findOne({
                _id: decode === null || decode === void 0 ? void 0 : decode.id,
            }, {
                digg_article_id_list: 1,
                like_article_id_list: 1,
            });
        }
        /**
         * 从skip开始，到skip + n或到historyList最后一个
         */
        for (let i = skipNum; i < historyList.length && i < skipNum + currentNum; i++) {
            const res = yield article_1.default.findOne({ _id: historyList[i] }, {
                title: 1,
                abstract: 1,
                tag: 1,
                digg_count: 1,
                like_count: 1,
                comment_count: 1,
                has_image: 1,
                publish_time: 1,
                image_url: 1,
                image_list: 1,
                read_count: 1,
                media_user: 1,
                media_id: 1,
            });
            if (res) {
                let tag_name = nameMap.get(res.tag);
                tag_name = tag_name.slice(0, tag_name.length - 1);
                let is_digg = false;
                let is_like = false;
                if (myself) {
                    is_digg = myself.digg_article_id_list.includes(res._id.toString());
                    is_like = myself.like_article_id_list.includes(res._id.toString());
                }
                article_list.push(Object.assign({}, res._doc, {
                    article_id: res._id.toString(),
                    tag_name,
                    is_digg,
                    is_like,
                }));
            }
        }
        if (!article_list.length) {
            return res.send({
                msg: "没有更多文章",
                has_more: false,
                code: 204,
            });
        }
        else if (currentNum + skipNum >= historyList.length) {
            has_more = false;
        }
        res.send({
            msg: "获取新闻列表成功",
            has_more,
            article_list,
            code: 200,
        });
    }
    catch (e) {
        res.send({
            code: e.message == "jwt expired" ? 401 : 402,
            msg: e.message,
        });
    }
}));
// 阅读时间排名
router.get("/reading_time_rank", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_id } = req.query;
        if (!user_id) {
            throw new Error("Params Error");
        }
        const user = yield user_1.default.findOne({ _id: user_id }, {
            read_report_list: 1,
        });
        if (!user) {
            throw new Error("用户不存在");
        }
        if (user.read_report_list.length == 0) {
            throw new Error("暂无阅读数据");
        }
        const data = [];
        for (let i of user.read_report_list) {
            for (let j of i.count_list) {
                const nameIndex = data.findIndex((n) => n.name == j.name);
                if (nameIndex != -1) {
                    // 如果在data中找到对应类别的索引，则加上count
                    data[nameIndex].value += Number(j.count);
                }
                else {
                    // 如果没找到对应的新闻类别，则创建
                    const obj = {
                        name: j.name,
                        value: Number(j.count),
                    };
                    data.push(obj);
                }
            }
        }
        data.sort((a, b) => b.value - a.value);
        res.send({
            msg: "获取新闻类别阅读时间排名成功",
            data,
            code: 200,
        });
    }
    catch (e) {
        res.send({
            code: e.message == "jwt expired" ? 401 : 402,
            msg: e.message,
        });
    }
}));
// 获取用户点赞了的新闻列表
router.get("/article_list_digg", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.headers["authorization"];
        let { user_id, n, skip } = req.query;
        const currentNum = Number(n);
        const skipNum = Number(skip);
        if (currentNum <= 0 || skipNum < 0 || !user_id) {
            throw new Error("Params Error");
        }
        let has_more = true;
        const user = yield user_1.default.findOne({ _id: user_id }, {
            digg_article_id_list: 1,
        });
        if (!user) {
            throw new Error("用户不存在");
        }
        const userDiggList = user.digg_article_id_list;
        const article_list = [];
        const { nameMap } = yield (0, constant_tag_name_1.default)();
        const { projection } = yield (0, constant_article_projection_1.default)();
        let myself = null;
        if (token) {
            let decode = null;
            jsonwebtoken_1.default.verify(token, "secret", function (err, decoded) {
                if (err) {
                    throw err;
                }
                else {
                    decode = decoded;
                }
            });
            myself = yield user_1.default.findOne({
                _id: decode === null || decode === void 0 ? void 0 : decode.id,
            }, {
                digg_article_id_list: 1,
                like_article_id_list: 1,
            });
        }
        /**
         * 从skip开始，到skip + n或到userDiggList最后一个
         */
        for (let i = skipNum; i < userDiggList.length && i < skipNum + currentNum; i++) {
            const res = yield article_1.default.findOne({ _id: userDiggList[i] }, projection);
            if (res) {
                let tag_name = nameMap.get(res.tag);
                tag_name = tag_name.slice(0, tag_name.length - 1);
                let is_digg = false;
                let is_like = false;
                if (myself) {
                    is_digg = myself.digg_article_id_list.includes(res._id.toString());
                    is_like = myself.like_article_id_list.includes(res._id.toString());
                }
                article_list.push(Object.assign({}, res._doc, {
                    article_id: res._id.toString(),
                    tag_name,
                    is_digg,
                    is_like,
                }));
            }
        }
        if (!article_list.length) {
            return res.send({
                msg: "没有更多文章",
                has_more: false,
                code: 204,
            });
        }
        else if (currentNum + skipNum >= userDiggList.length) {
            has_more = false;
        }
        res.send({
            msg: "获取新闻列表成功",
            has_more,
            article_list,
            code: 200,
        });
    }
    catch (e) {
        res.send({
            code: e.message == "jwt expired" ? 401 : 402,
            msg: e.message,
        });
    }
}));
// 获取用户收藏了的文章列表，
router.get("/article_list_like", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.headers["authorization"];
        let { user_id, n, skip } = req.query;
        const currentNum = Number(n);
        const skipNum = Number(skip);
        if (currentNum <= 0 || skipNum < 0 || !user_id) {
            throw new Error("Params Error");
        }
        let has_more = true;
        const user = yield user_1.default.findOne({ _id: user_id }, {
            digg_article_id_list: 1,
            like_article_id_list: 1,
        });
        if (!user) {
            throw new Error("用户不存在");
        }
        const userLikeList = user.like_article_id_list;
        const article_list = [];
        const { nameMap } = yield (0, constant_tag_name_1.default)();
        const { projection } = yield (0, constant_article_projection_1.default)();
        let myself = null;
        if (token) {
            let decode = null;
            jsonwebtoken_1.default.verify(token, "secret", function (err, decoded) {
                if (err) {
                    throw err;
                }
                else {
                    decode = decoded;
                }
            });
            myself = yield user_1.default.findOne({
                _id: decode === null || decode === void 0 ? void 0 : decode.id,
            }, {
                digg_article_id_list: 1,
                like_article_id_list: 1,
            });
        }
        /**
         * 从skip开始，到skip + n或到userLikeList最后一个
         */
        for (let i = skipNum; i < userLikeList.length && i < skipNum + currentNum; i++) {
            const res = yield article_1.default.findOne({ _id: userLikeList[i] }, projection);
            if (res) {
                let tag_name = nameMap.get(res.tag);
                tag_name = tag_name.slice(0, tag_name.length - 1);
                let is_digg = false;
                let is_like = false;
                if (myself) {
                    is_digg = myself.digg_article_id_list.includes(res._id.toString());
                    is_like = myself.like_article_id_list.includes(res._id.toString());
                }
                article_list.push(Object.assign({}, res._doc, {
                    article_id: res._id.toString(),
                    tag_name,
                    is_like,
                    is_digg,
                }));
            }
        }
        if (!article_list.length) {
            return res.send({
                msg: "没有更多文章",
                has_more: false,
                code: 204,
            });
        }
        else if (currentNum + skipNum >= userLikeList.length) {
            has_more = false;
        }
        res.send({
            msg: "获取新闻列表成功",
            has_more,
            article_list,
            code: 200,
        });
    }
    catch (e) {
        res.send({
            code: e.message == "jwt expired" ? 401 : 402,
            msg: e.message,
        });
    }
}));
router.get("/follower", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { user_id, n, skip } = req.query;
        const currentNum = Number(n);
        const skipNum = Number(skip);
        if (currentNum <= 0 || skipNum < 0 || !user_id) {
            throw new Error("Params Error");
        }
        let has_more = true;
        const user = yield user_1.default.findOne({ _id: user_id }, {
            follower_id_list: 1,
        });
        if (!user) {
            throw new Error("用户不存在");
        }
        const userFollowers = user.follower_id_list;
        const follower_list = [];
        for (let i = skipNum; i < userFollowers.length && i < skipNum + currentNum; i++) {
            const res = yield user_1.default.findOne({ _id: userFollowers[i] });
            if (res) {
                follower_list.push(res);
            }
        }
        if (!follower_list.length) {
            return res.send({
                msg: "没有更多关注者",
                has_more: false,
                code: 204,
            });
        }
        else if (currentNum + skipNum >= userFollowers.length) {
            has_more = false;
        }
        res.send({
            msg: "获取关注者列表成功",
            has_more,
            follower_list,
            code: 200,
        });
    }
    catch (e) {
        res.send({
            code: e.message == "jwt expired" ? 401 : 402,
            msg: e.message,
        });
    }
}));
router.get("/follow_list", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { user_id, n, skip } = req.query;
        const currentNum = Number(n);
        const skipNum = Number(skip);
        if (currentNum <= 0 || skipNum < 0 || !user_id) {
            throw new Error("Params Error");
        }
        let has_more = true;
        const user = yield user_1.default.findOne({ _id: user_id }, {
            follow_media_id_list: 1,
        });
        if (!user) {
            throw new Error("用户不存在");
        }
        const userFollowers = user.follow_media_id_list;
        const follow_list = [];
        for (let i = skipNum; i < userFollowers.length && i < skipNum + currentNum; i++) {
            const res = yield user_1.default.findOne({ _id: userFollowers[i] });
            if (res) {
                follow_list.push(Object.assign({}, res._doc, {
                    user_id: res._id,
                }));
            }
        }
        if (!follow_list.length) {
            return res.send({
                msg: "没有更多关注的用户",
                has_more: false,
                code: 204,
            });
        }
        else if (currentNum + skipNum >= userFollowers.length) {
            has_more = false;
        }
        res.send({
            msg: "获取关注的用户列表成功",
            has_more,
            follow_list,
            code: 200,
        });
    }
    catch (e) {
        res.send({
            code: e.message == "jwt expired" ? 401 : 402,
            msg: e.message,
        });
    }
}));
router.get("/tag_list", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { user_id, n, skip } = req.query;
        const currentNum = Number(n);
        const skipNum = Number(skip);
        if (currentNum <= 0 || skipNum < 0 || !user_id) {
            throw new Error("Params Error");
        }
        let has_more = true;
        const user = yield user_1.default.findOne({ _id: user_id }, {
            tag_list: 1,
        });
        if (!user) {
            throw new Error("用户不存在");
        }
        const tagList = user.tag_list;
        const tag_list = [];
        const { nameMap } = yield (0, constant_tag_name_1.default)();
        for (let i = skipNum; i < tagList.length && i < skipNum + currentNum; i++) {
            const nameCN = nameMap.get(tagList[i]);
            tag_list.push({
                name: nameCN.substr(0, nameCN.length - 1),
                tag: tagList[i],
                is_follow: true,
            });
        }
        if (!tag_list.length) {
            return res.send({
                msg: "没有更多关注的用户",
                has_more: false,
                code: 204,
            });
        }
        else if (currentNum + skipNum >= tagList.length) {
            has_more = false;
        }
        res.send({
            msg: "获取关注的用户列表成功",
            has_more,
            tag_list,
            code: 200,
        });
    }
    catch (e) {
        res.send({
            code: e.message == "jwt expired" ? 401 : 402,
            msg: e.message,
        });
    }
}));
router.get("/tag_list_all", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { nameMap } = yield (0, constant_tag_name_1.default)();
        let { user_id } = req.query;
        const user = yield user_1.default.findOne({ _id: user_id }, {
            tag_list: 1,
        });
        if (!user) {
            throw new Error("用户不存在");
        }
        const followTagList = user.tag_list;
        const tag_list = [];
        for (const key of nameMap.keys()) {
            const nameCN = nameMap.get(key);
            tag_list.push({
                name: nameCN.substr(0, nameCN.length - 1),
                tag: key,
                is_follow: followTagList.includes(key),
            });
        }
        res.send({
            code: 200,
            tag_list,
        });
    }
    catch (e) {
        res.send({
            code: e.message == "jwt expired" ? 401 : 402,
            msg: e.message,
        });
    }
}));
// 需要鉴权的接口
// router.use(authenticateToken);
router.put("/follow_media", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    try {
        const { media_id } = req.body;
        if (!media_id) {
            throw new Error("Params Error");
        }
        const user = yield user_1.default.findOne({ _id: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id }, {
            follow_media_id_list: 1,
        });
        if (!user) {
            throw new Error("用户不存在");
        }
        const followMedia = user.follow_media_id_list;
        console.log(followMedia, user);
        if (followMedia.includes(media_id)) {
            yield user_1.default.updateOne({ _id: (_b = req.user) === null || _b === void 0 ? void 0 : _b.id }, { $pull: { follow_media_id_list: media_id } });
            yield user_1.default.updateOne({
                _id: media_id,
            }, {
                $pull: { follower_id_list: (_c = req.user) === null || _c === void 0 ? void 0 : _c.id },
            });
            return res.send({
                code: 200,
                msg: "取消关注成功",
            });
        }
        else {
            yield user_1.default.updateOne({ _id: (_d = req.user) === null || _d === void 0 ? void 0 : _d.id }, { $push: { follow_media_id_list: media_id } });
            yield user_1.default.updateOne({
                _id: media_id,
            }, { $push: { follower_id_list: (_e = req.user) === null || _e === void 0 ? void 0 : _e.id } });
            res.send({
                code: 200,
                msg: "关注成功",
            });
        }
    }
    catch (e) {
        res.send({
            code: e.message == "jwt expired" ? 401 : 402,
            msg: e.message,
        });
    }
}));
// 修改是否展示浏览历史成功
router.put("/set_show_history", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _f;
    try {
        const { is_show_history } = req.body;
        if (typeof is_show_history != "boolean") {
            throw new Error("Params Error");
        }
        yield user_1.default.updateOne({ _id: (_f = req.user) === null || _f === void 0 ? void 0 : _f.id }, { is_show_history });
        // const user = await userModel.findOne({ _id: req.user?.id });
        res.send({
            msg: "修改是否展示浏览历史成功",
            // is_show_history: user.is_show_history,
            code: 200,
        });
    }
    catch (e) {
        res.send({
            code: e.message == "jwt expired" ? 401 : 402,
            msg: e.message,
        });
    }
}));
// 修改个人成功
router.put("/set_user_info", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _g;
    try {
        const info = req.body;
        if (!info.introduction || !info.nickname || !info.personal_page) {
            throw new Error("Params Error");
        }
        yield user_1.default.updateOne({ _id: (_g = req.user) === null || _g === void 0 ? void 0 : _g.id }, info);
        // const user = await userModel.findOne({ _id: req.user?.id });
        res.send({
            msg: "修改信息成功",
            userInfo: {
                nickname: info.nickname,
                introduction: info.introduction,
                personal_page: info.personal_page,
            },
            code: 200,
        });
    }
    catch (e) {
        res.send({
            code: e.message == "jwt expired" ? 401 : 402,
            msg: e.message,
        });
    }
}));
// 获取用户信息
router.get("/user_info", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _h;
    try {
        const { user_id } = req.query;
        if (!user_id) {
            throw new Error("Params Error");
        }
        const user = yield user_1.default.where({ _id: user_id }).findOne();
        if (!user) {
            throw new Error("用户不存在");
        }
        let is_follow = false;
        const myId = (_h = req.user) === null || _h === void 0 ? void 0 : _h.id;
        const myself = yield user_1.default.where({ _id: myId }).findOne();
        // if (!myself) {
        //   throw new Error("未登陆");
        // }
        if (myself && myself.follow_media_id_list.includes(user_id)) {
            is_follow = true;
        }
        res.send({
            msg: "获取用户信息成功",
            user_id: user._id,
            is_follow,
            userInfo: {
                type: user.type,
                is_show_history: user.is_show_history,
                introduction: user.introduction,
                avatar: user.avatar,
                nickname: user.nickname,
                digg_count: user.digg_article_id_list.length + user.digg_comment_id_list.length,
                follow_count: user.follow_media_id_list.length,
                follower_count: user.follower_id_list.length,
                comment_count: user.comment_id_list.length,
                reply_count: user.reply_id_list.length,
                like_count: user.like_article_id_list.length,
                tag_count: user.tag_list.length,
                personal_page: user.personal_page ||
                    `## <div align="center">欢迎━(*｀∀´*)ノ亻!访问我的 News 主页</div>
                  <div align="center">
  
                    ​🤵**目前职业**
  
                    🧑​**性别：你的性别**  &nbsp;&nbsp;&nbsp;  🚴‍♂️**爱好：你的爱好**
  
                    🏡​**Base：居住地点** &nbsp; ‍🏢**公司 @公司名称**
  
                   ​**今日状态：（元气满满/听歌/沉迷学习/摸鱼......）**
                  </div>`,
            },
            code: 200,
        });
    }
    catch (e) {
        res.send({
            code: e.message == "jwt expired" ? 401 : 402,
            msg: e.message,
        });
    }
}));
// 设置关注标签
router.put("/set_tag_list", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _j;
    try {
        // avatar 为头像url
        const { tag_list } = req.body;
        if (!tag_list || !tag_list.length) {
            throw new Error("Params Error");
        }
        yield user_1.default.updateOne({ _id: (_j = req.user) === null || _j === void 0 ? void 0 : _j.id }, { tag_list });
        // console.log("tagLis", tag_list);
        res.send({
            msg: "关注成功",
            tag_list: tag_list,
            code: 200,
        });
    }
    catch (e) {
        res.send({
            code: e.message == "jwt expired" ? 401 : 402,
            msg: e.message,
        });
    }
}));
// 更新头像
router.put("/avatar_upload", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _k;
    try {
        // avatar 为头像url
        const { avatar } = req.body;
        if (!avatar || typeof avatar != "string") {
            throw new Error("Params Error");
        }
        yield user_1.default.updateOne({ _id: (_k = req.user) === null || _k === void 0 ? void 0 : _k.id }, { avatar });
        res.send({
            msg: "上传头像成功",
            avatar_url: avatar,
            code: 200,
        });
    }
    catch (e) {
        res.send({
            code: e.message == "jwt expired" ? 401 : 402,
            msg: e.message,
        });
    }
}));
// 获取用户阅读时间
router.put("/read_time", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _l, _m;
    try {
        const { tag, read_time } = req.body;
        if (!tag || !read_time) {
            throw new Error("Params Error");
        }
        else if (read_time >= 7200000) {
            throw new Error("阅读时间过长");
        }
        const minute = yield (0, util_sToMinute_1.default)({ s: read_time });
        const user = yield user_1.default.findOne({
            _id: (_l = req.user) === null || _l === void 0 ? void 0 : _l.id,
        }, {
            read_report_list: 1,
        });
        if (!user) {
            throw new Error("用户不存在");
        }
        // const user = Object.assign({}, _user)
        // 查找日期索引
        const date = new Date((0, dayjs_1.default)().format("YYYY-MM-DD")).toString();
        let dateIndex = user.read_report_list.findIndex((n) => n.date == date);
        // 如果还没有今天的日期，就添加一个
        if (dateIndex == -1) {
            const obj = {
                date,
                year: (0, dayjs_1.default)().year(),
                count_list: [],
                total_count: 0,
            };
            user.read_report_list.push(obj);
            dateIndex = user.read_report_list.length - 1;
        }
        const { nameMap } = yield (0, constant_tag_name_1.default)();
        // 查找标签索引
        const tagIndex = user.read_report_list[dateIndex].count_list.findIndex((n) => n.tag == tag);
        // 找到直接加
        if (tagIndex != -1) {
            user.read_report_list[dateIndex].count_list[tagIndex].count += minute;
        }
        else {
            // 否则创建
            const obj = {
                tag,
                name: nameMap.get(tag) || "推荐类",
                count: minute,
            };
            user.read_report_list[dateIndex].count_list.push(obj);
        }
        user.read_report_list[dateIndex].total_count += minute;
        yield user_1.default.updateOne({
            _id: (_m = req.user) === null || _m === void 0 ? void 0 : _m.id,
        }, user);
        res.send({
            msg: "设置阅读时间成功",
            code: 200,
        });
    }
    catch (e) {
        res.send({
            code: e.message == "jwt expired" ? 401 : 402,
            msg: e.message,
        });
    }
}));
exports.default = (app) => {
    app.use("", router);
};
