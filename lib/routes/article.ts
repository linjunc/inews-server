import express, { Request, Response } from "express";
import map from "../utils/constant_tag_name";
import getProjection from "../utils/constant_article_projection";
import authenticateToken from "../utils/auth";

import userModel from "../model/user";
import articleModel from "../model/article";
import { getToken } from "../utils/token";
import { getRecommendedArticle } from "../services/predict";

const router = express.Router();

interface IQueryListParams {
  tag: string;
  n: string;
  skip: string;
}

// 查询文章列表

router.get(
  "/article_list",
  async (req: Request<{}, {}, {}, IQueryListParams>, res: Response) => {
    try {
      let { tag, n, skip } = req.query;

      const currentNum = Number(n);
      const skipNum = Number(skip);
      if (currentNum <= 0 || skipNum < 0) {
        throw new Error("Params Error");
      }

      const article_list: any[] = [];
      let article_count = await articleModel.where().countDocuments();
      let query: any[] = [];
      let has_more = true;

      const { nameMap } = await map();
      const { projection } = await getProjection();
      const userToken = getToken(req as any);

      if (tag === "recommend" && userToken?.id) {
        const recommendTag = await getRecommendedArticle(userToken?.id);
        query = await articleModel
          .find({ tag: recommendTag[0].label }, projection)
          .skip(skipNum)
          .limit(currentNum);
      } else if (tag == "hot" || tag == "recommend") {
        query = await articleModel
          .find({}, projection)
          .sort({ [tag === "hot" ? "read_count" : "like_count"]: -1 })
          .skip(skipNum)
          .limit(currentNum);
      } else {
        query = await articleModel
          .find({ tag }, projection)
          .skip(skipNum)
          .limit(currentNum);
        article_count = await articleModel
          .where({
            tag,
          })
          .countDocuments();
      }

      if (!query || !query.length) {
        return res.send({
          msg: "没有更多此类新闻",
          has_more: false,
          code: 204,
        });
      }

      for (let i = 0; i < currentNum; i++) {
        if (!query[i]) {
          has_more = false;
          break;
        }

        let tag_name;
        if (query[i].tag !== "hot" && query[i].tag !== "recommend") {
          tag_name = nameMap.get(query[i].tag);
        }

        article_list.push(
          Object.assign({}, query[i]._doc, {
            article_id: query[i]._id.toString(),
            tag_name,
          })
        );
      }

      if (article_list.length == 0) {
        return res.send({
          msg: "没有更多此类新闻",
          has_more: false,
          code: 204,
        });
      }

      if (currentNum + skipNum >= article_count) {
        has_more = false;
      }

      res.send({
        msg: "获取新闻列表成功",
        article_list,
        has_more,
        code: 200,
      });
    } catch (e: any) {
      res.send({
        code: e.message == "jwt expired" ? 401 : 402,
        msg: e.message,
      });
    }
  }
);

// 查询文章详情
router.get("/article_content", async (req, res) => {
  try {
    let { item_id } = req.query;
    if (!item_id) {
      throw new Error("Params Error");
    }
    const judge = {
      is_digg: false,
      is_like: false,
      is_follow: false,
      is_read: false,
    };
    const article = await articleModel.findOne(
      {
        _id: item_id,
      },
      {
        title: 1,
        tag: 1,
        digg_count: 1,
        like_count: 1,
        comment_count: 1,
        has_image: 1,
        publish_time: 1,
        content: 1,
        media_id: 1,
        media_user: 1,
        image_url: 1,
        image_list: 1,
        read_count: 1,
      }
    );

    if (!article) {
      throw new Error("文章已删除");
    }

    article.read_count += 1;
    await articleModel.updateOne(
      {
        _id: item_id,
      },
      { read_count: article.read_count }
    );

    const userToken = getToken(req);

    const user = await userModel.findOne(
      {
        _id: userToken?.id,
      },
      {
        digg_article_id_list: 1,
        like_article_id_list: 1,
        history_id_list: 1,
        follow_media_id_list: 1,
      }
    );

    // 登录的情况下，判断是否已点赞，已收藏，已阅读，已关注
    if (user) {
      judge.is_digg = user.digg_article_id_list.includes(item_id);
      judge.is_like = user.like_article_id_list.includes(item_id);
      judge.is_read = user.history_id_list.includes(item_id);
      judge.is_follow = user.follow_media_id_list.includes(article.media_id);
      // 如果是没有阅读
      if (!judge.is_read) {
        user.history_id_list.push(item_id);
        await userModel.updateOne(
          {
            _id: userToken?.id,
          },
          user
        );
      }
    }

    // article.item_id = article._id

    res.send({
      msg: "获取新闻成功",
      article: Object.assign({}, (article as any)._doc, {
        item_id: article._id.toString(),
      }),
      judge,
      code: 200,
    });
  } catch (e: any) {
    res.send({
      code: e.message == "jwt expired" ? 401 : 402,
      msg: e.message,
    });
  }
});
// 取消文章点赞
router.put("/article_digg", authenticateToken, async (req, res) => {
  try {
    let msg = "";
    let { article_id } = req.body;

    if (!article_id) {
      throw new Error("Params Error");
    }

    const article = await articleModel.findOne({ _id: article_id });

    const user_id = req.user?.id;

    const user = await userModel.findOne({ _id: user_id });

    if (!article || !user) {
      return res.send({
        code: 400,
        msg: "文章或用户不存在",
      });
    }

    // 判断是否已点赞，已点赞则取消
    const articleIndex = article.digg_id_list.indexOf(user_id);
    const userIndex = user.digg_article_id_list.indexOf(article_id);

    if (userIndex != -1) {
      article.digg_id_list.splice(articleIndex, 1);
      article.digg_count--;
      user.digg_article_id_list.splice(userIndex, 1);
      msg = "取消点赞成功";
    } else {
      article.digg_id_list.push(user_id);
      article.digg_count++;
      user.digg_article_id_list.push(article_id);
      msg = "点赞成功";
    }

    await articleModel.updateOne({ _id: article_id }, article);
    await userModel.updateOne({ _id: user_id }, user);

    res.send({
      msg,
      code: 200,
      digg_count: article.digg_count,
    });
  } catch (e: any) {
    res.send({
      isErr: true,
      code: e.message == "jwt expired" ? 401 : 402,
      msg: e.message,
    });
  }
});
// 文章点赞
router.put("/article_like", authenticateToken, async (req, res) => {
  try {
    let msg = "";
    let { article_id } = req.body;

    if (!article_id) {
      throw new Error("Params Error");
    }

    const article = await articleModel.findOne(
      { _id: article_id },
      {
        like_count: 1,
        like_id_list: 1,
      }
    );

    const user_id = req.user?.id;

    const user = await userModel.findOne(
      { _id: user_id },
      {
        like_article_id_list: 1,
      }
    );

    if (!article || !user) {
      return res.send({
        code: 400,
        msg: "文章或用户不存在",
      });
    }

    // 判断是否已点赞，已点赞则取消
    const articleIndex = article.like_id_list.indexOf(user_id);
    const userIndex = user.like_article_id_list.indexOf(article_id);

    if (articleIndex != -1) {
      article.like_id_list.splice(articleIndex, 1);
      article.like_count--;
      user.like_article_id_list.splice(userIndex, 1);
      msg = "取消收藏成功";
    } else {
      article.like_id_list.push(user_id);
      article.like_count++;
      user.like_article_id_list.push(article_id);
      msg = "收藏成功";
    }

    await articleModel.updateOne({ _id: article_id }, article);
    await userModel.updateOne({ _id: user_id }, user);

    res.send({
      msg,
      code: 200,
      like_count: article.like_count,
    });
  } catch (e: any) {
    res.send({
      isErr: true,
      code: e.message == "jwt expired" ? 401 : 402,
      msg: e.message,
    });
  }
});
// 查询作者文章
router.get("/article_list_user", async (req, res) => {
  try {
    let { user_id, n, skip } = req.query;
    const currentNum = Number(n);
    const skipNum = Number(skip);
    if (currentNum <= 0 || skipNum < 0 || !user_id) {
      throw new Error("Params Error");
    }

    let has_more = true;
    const { nameMap } = await map();
    const { projection } = await getProjection();

    const userToken = getToken(req);

    const myself = await userModel.findOne(
      {
        _id: userToken?.id,
      },
      {
        digg_article_id_list: 1,
        like_article_id_list: 1,
      }
    );

    const articles = await articleModel
      .find({ media_id: user_id }, projection)
      .skip(skipNum)
      .limit(currentNum + 1);
    // 获取n+1项，是为了判断是否还有更多，如果res.length > n，则说明还有，反之则没有更多

    if (!articles || !articles.length) {
      return res.send({
        msg: "没有更多文章",
        has_more: false,
        code: 204,
      });
    } else if (articles.length <= currentNum) {
      has_more = false;
    }

    const newArticles = [];
    for (let i = 0; i < articles.length; i++) {
      const temp: any = { ...(articles[i] as any)._doc };
      const tag_name = nameMap.get(articles[i].tag);

      temp.tag_name = tag_name.slice(0, tag_name.length - 1);
      temp.is_digg = false;
      temp.is_like = false;
      if (myself) {
        temp.is_digg = myself.digg_article_id_list.includes(
          temp._id.toString()
        );
        temp.is_like = myself.like_article_id_list.includes(
          temp._id.toString()
        );
      }
      temp.article_id = temp._id;
      delete temp._id;
      newArticles.push(temp);
    }

    res.send({
      msg: "获取新闻列表成功",
      has_more,
      article_list: newArticles,
      code: 200,
    });
  } catch (e: any) {
    res.send({
      code: e.message == "jwt expired" ? 401 : 402,
      msg: e.message,
    });
  }
});
// 搜索
router.get("/article_search", async (req, res) => {
  try {
    let { search, n, skip } = req.query;
    const currentNum = Number(n);
    const skipNum = Number(skip);
    if (currentNum <= 0 || skipNum < 0 || !search) {
      throw new Error("Params Error");
    }

    const reg = eval(`/${search}/`);

    const article_list = [];
    let article_count = 0;
    let query = [];
    let has_more = true;

    query = await articleModel
      .find({
        title: reg,
      })
      .skip(skipNum)
      .limit(currentNum);

    article_count = await articleModel
      .where({
        title: reg,
      })
      .count();

    for (let i = 0; i < currentNum; i++) {
      if (!query[i]) {
        has_more = false;
        break;
      }
      article_list.push({
        article_id: query[i]._id,
        publish_time: query[i].publish_time,
        image_url: query[i].image_url,
        media_id: query[i].media_id,
        media_user: query[i].media_user,
        like_count: query[i].like_count,
        title: query[i].title,
        abstract: query[i].abstract,
        tag: query[i].tag,
        digg_count: query[i].digg_count,
        comment_count: query[i].comment_count,
        has_image: query[i].has_image,
        // group_id: query[i].group_id,
        image_list: query[i].image_list,
      });
    }

    if (article_list.length == 0) {
      res.send({
        msg: "没有更多此类新闻",
        has_more: false,
        code: 204,
      });
    }

    if (currentNum + skipNum >= article_count) {
      has_more = false;
    }

    res.send({
      msg: "获取新闻列表成功",
      article_list,
      has_more,
      code: 200,
    });
  } catch (e: any) {
    res.send({
      code: e.message == "jwt expired" ? 401 : 402,
      msg: e.message,
    });
  }
});

export default (app: express.Application) => {
  app.use("", router);
};
