import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import schedule from "node-schedule";
import "dotenv/config";

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// 配置 body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//连接数据库
mongoose.connect("mongodb://localhost:27017/news");

// mongoose.connect("mongodb://localhost:27017/news?authSource=admin", {
//   user: "root",
//   pass: "KQgmH1MHLf0npkyt",
// });

// mongoose.set("strictQuery", false);

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
import picRoute from "./routes/pic";
import feedbackRouter from "./routes/feedback";
import searchRouter from "./routes/search";
import { crawler } from "./services/crawler";
import { TAG_CONST } from "./utils/constant_tag_name";

usersRoute(app);
articleRoute(app);
commentRoute(app);
mockRoute(app);
picRoute(app);
feedbackRouter(app);
searchRouter(app);

schedule.scheduleJob("0 */12 * * *", async () => {
  console.log("定时任务执行");
  for (let i = 0; i < TAG_CONST.length; i++) {
    await crawler(TAG_CONST[i]);
  }
});

app.listen(port, () => console.log(`http://localhost:3001`));
