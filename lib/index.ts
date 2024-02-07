import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// 配置 body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//连接数据库
mongoose.connect("mongodb://localhost:27017/news");

//监听数据库连接状态
mongoose.connection.once("open", () => {
  console.log("数据库连接成功……");
});
mongoose.connection.once("close", () => {
  console.log("数据库断开……");
});

import usersRoute from "./routes/users";
import articleRoute from "./routes/article";
import commentRoute from "./routes/comment";
import mockRoute from "./routes/mock";

usersRoute(app);
articleRoute(app);
commentRoute(app);
mockRoute(app);

app.listen(port, () => console.log(`http://localhost:3001`));
