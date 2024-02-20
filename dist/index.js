"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
require("dotenv/config");
const app = (0, express_1.default)();
const port = 3001;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// 配置 body-parser
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
//连接数据库
mongoose_1.default.connect("mongodb://localhost:27017/news");
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
(0, users_1.default)(app);
(0, article_1.default)(app);
(0, comment_1.default)(app);
(0, mock_1.default)(app);
(0, pic_1.default)(app);
app.listen(port, () => console.log(`http://localhost:3001`));
