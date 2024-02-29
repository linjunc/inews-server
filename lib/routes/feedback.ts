// 图床服务实现
import express from "express";
import { getToken } from "../utils/token";
// import { client } from "../services/bitable";
import userModel from "../model/user";

import * as lark from "@larksuiteoapi/node-sdk";

export const client = new lark.Client({
  appId: "cli_a55456063fbe500c",
  appSecret: "6mZ56zx0gVo04eDBh5NpfgJzjj1Dth0D",
});

const router = express.Router();

// 添加用户反馈 到 bitable
router.post("/user_feedback", async (req, res) => {
  const { phone, feedback_question, advance } = req.body;
  const userToken = getToken(req as any);
  console.log("userToken", userToken, phone, feedback_question);

  let userInfo: any = null;
  if (userToken?.id) {
    userInfo = await userModel.findOne({ _id: userToken.id });
  }

  const records = {
    用户名:
      userInfo?.nickname ||
      userInfo?.account ||
      userToken?.account ||
      "未登录用户",
    openid: userToken?.id || "",
    电话号码: phone,
    请描述您遇到的问题: feedback_question,
    请输入希望改进的地方: advance,
  };

  await client.bitable.appTableRecord.create({
    path: {
      app_token: "SJCkba6jRanDgXsF8kacxH2rncb",
      table_id: "tblC9Uz0tsYcPiAb",
    },
    data: {
      fields: records,
    },
  });

  res.send({
    code: 200,
    msg: "提交成功",
  });

  try {
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
