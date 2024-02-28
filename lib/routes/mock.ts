import express from "express";
import axios from "axios";

import userModel from "../model/user";
import articleModel from "../model/article";
import { picReChange } from "../utils/picReChange";
import { TAG_CONST } from "../utils/constant_tag_name";
import { transferImage, transferImages } from "../services/transfer";
import { getToken } from "../utils/token";
import { getRecommendedArticle } from "../services/predict";
import { crawler } from "../services/crawler";

const router = express.Router();

// 添加文章
// 写入文章表时，如果没有该用户，那么就为这个 id 创建一个帐号，密码为123，然后再写入文章表和用户表
router.post("/add_article_mock", async (req, res) => {
  try {
    const {
      tag,
      title,
      abstract,
      has_image,
      image_url,
      image_list,
      media_id,
      media_name,
      avatar_url,
      media_info,
      content,
    } = req.body;

    const media = await userModel.findOne(
      {
        account: media_id,
      },
      {
        account: 1,
        password: 1,
      }
    );

    // 没有该用户则注册
    if (!media || !media.account) {
      const userInfo = {
        account: media_id,
        password: media_id,
        introduction: "该用户暂无简介~",
        avatar:
          avatar_url ||
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
      await userModel.create(userInfo);
    }

    const userAct = await userModel.findOne({ account: media_id });
    if (!userAct) {
      throw new Error("用户不存在");
    }

    const id = userAct._id;

    console.log("!!!", id);

    console.log(req.body);

    if (!title || !content || !tag) {
      throw new Error("Params Error");
    }

    const newArticle = new articleModel({
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
      media_user:
        {
          media_name,
          avatar_url,
          media_info,
        } || {},
      content,
      digg_id_list: [],
      like_id_list: [],
      read_count: 0,
    });

    await newArticle.save();

    res.send({
      msg: "文章添加成功",
      code: 200,
    });
  } catch (e: any) {
    res.send({
      code: 402,
      msg: e.message,
    });
  }
});

router.post("/add_mock_data", async (req, res) => {
  const { type = "news_society" } = req.body;
  try {
    await crawler(type);

    res.send({
      msg: "文章添加成功",
      code: 200,
    });
  } catch (e: any) {
    res.send({
      code: 402,
      msg: e.message,
    });
  }
});

router.get("/test-predict", async (req, res) => {
  const userToken = getToken(req);
  console.log(userToken);
  if (!userToken?.id) {
    return res.send({
      code: 402,
      msg: "没有 token",
    });
  }
  const article = await getRecommendedArticle(userToken.id);

  console.log(article);
  res.send({
    code: 200,
    data: article,
  });
});

export default (app: express.Application) => {
  app.use("", router);
};
