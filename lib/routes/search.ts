// 图床服务实现
import express from "express";
import { getToken } from "../utils/token";
// import { client } from "../services/bitable";
import userModel from "../model/user";
import { searchArticles, searchUsers } from "../utils/search";

const router = express.Router();

// 添加用户反馈 到 bitable
router.get("/search", async (req, res) => {
  const { keyword } = req.query;
  if (!keyword) {
    return res.status(400).json({ error: "keyword parameter is required" });
  }
  try {
    const articles = await searchArticles(keyword);
    const users = await searchUsers(keyword);

    res.send({
      code: 200,
      data: {
        articles,
        users,
      },
    });
  } catch (e: any) {
    res.send({
      code: 402,
      msg: e.message,
    });
  }
});

export default (app: express.Application) => {
  app.use("", router);
};
