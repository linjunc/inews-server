const express = require("express");
const mongoose = require("mongoose");
// 解析 post 请求
const bodyParser = require("body-parser");
const app = express();
const port = 3001;

app.use(require("cors")());
app.use(express.json());
// 配置 body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//连接数据库
mongoose.connect("mongodb://localhost:27017/news", {
  useNewUrlParser: true,
});

//监听数据库连接状态
mongoose.connection.once("open", () => {
  console.log("数据库连接成功……");
});
mongoose.connection.once("close", () => {
  console.log("数据库断开……");
});

require("./routes/users")(app);
require("./routes/article")(app);
require("./routes/comment")(app);
require("./routes/mock")(app);
app.listen(port, () => console.log(`http://localhost:3001`));
