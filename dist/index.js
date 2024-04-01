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
const mongoose_1 = __importDefault(require("mongoose"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const node_schedule_1 = __importDefault(require("node-schedule"));
require("dotenv/config");
const app = (0, express_1.default)();
const port = 3001;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// 配置 body-parser
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
//连接数据库
mongoose_1.default.connect("mongodb://localhost:27017/news?authSource=admin", {
    user: "root",
    pass: "KQgmH1MHLf0npkyt",
});
// mongoose.set("strictQuery", false);
//监听数据库连接状态
mongoose_1.default.connection.once("open", () => {
    console.log("数据库连接成功……");
});
mongoose_1.default.connection.once("close", () => {
    console.log("数据库断开……");
});
const users_1 = __importDefault(require("./routes/users"));
const article_1 = __importDefault(require("./routes/article"));
const comment_1 = __importDefault(require("./routes/comment"));
const mock_1 = __importDefault(require("./routes/mock"));
const pic_1 = __importDefault(require("./routes/pic"));
const feedback_1 = __importDefault(require("./routes/feedback"));
const search_1 = __importDefault(require("./routes/search"));
const crawler_1 = require("./services/crawler");
const constant_tag_name_1 = require("./utils/constant_tag_name");
(0, users_1.default)(app);
(0, article_1.default)(app);
(0, comment_1.default)(app);
(0, mock_1.default)(app);
(0, pic_1.default)(app);
(0, feedback_1.default)(app);
(0, search_1.default)(app);
node_schedule_1.default.scheduleJob("* * * * *", () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("定时任务执行");
    for (let i = 0; i < constant_tag_name_1.TAG_CONST.length; i++) {
        yield (0, crawler_1.crawler)(constant_tag_name_1.TAG_CONST[i]);
    }
}));
app.listen(port, () => console.log(`http://localhost:3001`));
