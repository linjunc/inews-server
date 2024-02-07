module.exports = (app) => {
  const express = require("express");

  const router = express.Router();

  const map = require("../utils/constant_tag_name");
  const getProjection = require("../utils/constant_article_projection");
  const authenticateToken = require("../utils/auth");

  const userModel = require("../model/user");
  const articleModel = require("../model/article");

  // 查询文章列表
  router.get("/article_list", async (req, res) => {
    try {
      let { tag, n, skip } = req.query;
      n = Number(n);
      skip = Number(skip);
      if (n <= 0 || skip < 0) {
        throw new Error("Params Error");
      }

      const article_list = [];
      let article_count = await articleModel.where().count();
      let query = [];
      let has_more = true;
      const { nameMap } = await map();
      const { projection } = await getProjection();
      if (tag == "recommend" || tag == "hot") {
        query = await articleModel
          .find({}, projection)
          .sort({ [tag === "hot" ? "read_count" : "like_count"]: -1 })
          .skip(skip)
          .limit(n);
      } else {
        query = await articleModel
          .find({ tag }, projection)
          .skip(skip)
          .limit(n);
        article_count = await articleModel
          .where({
            tag,
          })
          .count();
      }
      if (!query || !query.length) {
        return res.send({
          msg: "没有更多此类新闻",
          has_more: false,
          code: 204,
        });
      }

      for (let i = 0; i < n; i++) {
        if (!query[i]) {
          has_more = false;
          break;
        }

        let tag_name;
        if (query[i].tag !== "hot" && query[i].tag !== "recommend") {
          tag_name = nameMap.get(query[i].tag);
          // query[i].tag_name = tag_name.slice(0, tag_name.length - 1)
        }

        article_list.push(
          Object.assign({}, query[i]._doc, {
            article_id: query[i]._id.toString(),
            tag_name,
          })
        );
      }

      if (article_list.length == 0) {
        res.send({
          msg: "没有更多此类新闻",
          has_more: false,
          code: 204,
        });
      }

      if (n + skip >= article_count) {
        has_more = false;
      }

      res.send({
        msg: "获取新闻列表成功",
        article_list,
        has_more,
        code: 200,
      });
    } catch (e) {
      res.send({
        code: e.message == "jwt expired" ? 401 : 402,
        msg: e.message,
      });
    }
  });

  // 查询文章详情
  router.get("/article_content", authenticateToken, async (req, res) => {
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

      const user = await userModel.findOne(
        {
          _id: req.user?.id,
        },
        {
          digg_article_id_list: 1,
          like_article_id_list: 1,
          history_id_list: 1,
          follow_media_id_list: 1,
        }
      );

      judge.is_digg = user.digg_article_id_list.includes(item_id);
      judge.is_like = user.like_article_id_list.includes(item_id);
      judge.is_read = user.history_id_list.includes(item_id);
      judge.is_follow = user.follow_media_id_list.includes(article.media_id);

      if (!judge.is_read) {
        user.history_id_list.push(item_id);
        await userModel.updateOne(
          {
            _id: req.user?.id,
          },
          user
        );
      }

      // article.item_id = article._id

      res.send({
        msg: "获取新闻成功",
        article: Object.assign({}, article._doc, {
          item_id: article._id.toString(),
        }),
        judge,
        code: 200,
      });
    } catch (e) {
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
    } catch (e) {
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
    } catch (e) {
      res.send({
        isErr: true,
        code: e.message == "jwt expired" ? 401 : 402,
        msg: e.message,
      });
    }
  });
  // 查询作者文章
  router.get("/article_list_user", authenticateToken, async (req, res) => {
    try {
      let { user_id, n, skip } = req.query;
      n = Number(n);
      skip = Number(skip);
      if (n <= 0 || skip < 0 || !user_id) {
        throw new Error("Params Error");
      }

      let has_more = true;
      const { nameMap } = await map();
      const { projection } = await getProjection();

      const myself = await userModel.findOne(
        {
          _id: req.user?.id,
        },
        {
          digg_article_id_list: 1,
          like_article_id_list: 1,
        }
      );

      const articles = await articleModel
        .find({ media_id: user_id }, projection)
        .skip(skip)
        .limit(n + 1);
      // 获取n+1项，是为了判断是否还有更多，如果res.length > n，则说明还有，反之则没有更多

      if (!articles || !articles.length) {
        return articles.send({
          msg: "没有更多文章",
          has_more: false,
          code: 204,
        });
      } else if (articles.length <= n) {
        has_more = false;
      }

      for (let i = 0; i < articles.length; i++) {
        const tag_name = nameMap.get(articles[i].tag);
        console.log("tag", tag_name);
        articles[i].tag_name = tag_name.slice(0, tag_name.length - 1);
        articles[i].is_digg = false;
        articles[i].is_like = false;
        if (myself) {
          articles[i].is_digg = myself.digg_article_id_list.includes(
            articles[i]._id.toString()
          );
          articles[i].is_like = myself.like_article_id_list.includes(
            articles[i]._id.toString()
          );
        }
        articles[i].article_id = articles[i]._id;
        delete articles[i]._id;
      }

      res.send({
        msg: "获取新闻列表成功",
        has_more,
        article_list: articles,
        code: 200,
      });
    } catch (e) {
      res.send({
        code: e.message == "jwt expired" ? 401 : 402,
        msg: e.message,
      });
    }
  });
  // 搜索
  router.put("/article_search", async (req, res) => {
    try {
      let { search, n, skip } = req.query;
      n = Number(n);
      skip = Number(skip);
      if (n <= 0 || skip < 0 || !search) {
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
        .skip(skip)
        .limit(n);

      article_count = await articleModel
        .where({
          title: reg,
        })
        .count();

      for (let i = 0; i < n; i++) {
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
          group_id: query[i].group_id,
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

      if (n + skip >= article_count) {
        has_more = false;
      }

      res.send({
        msg: "获取新闻列表成功",
        article_list,
        has_more,
        code: 200,
      });
    } catch (e) {
      res.send({
        code: e.message == "jwt expired" ? 401 : 402,
        msg: e.message,
      });
    }
  });

  app.use("", router);
};
