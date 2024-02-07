module.exports = (app) => {
  const express = require("express");
  const router = express.Router();

  const articleModel = require("../model/article");
  const commentModel = require("../model/comment");
  const replyModel = require("../model/reply");
  const userModel = require("../model/user");

  const authenticateToken = require("../utils/auth");

  // 根据用户id获取用户的评论数
  router.get("/comment_list_user", async (req, res) => {
    try {
      let { user_id, n, skip } = req.query;
      n = Number(n);
      skip = Number(skip);
      if (n <= 0 || skip < 0 || !user_id) {
        throw new Error("Params Error");
      }

      let has_more = true;

      const res = await commentModel
        .find(
          { user_id },
          {
            text: 1,
            digg_count: 1,
            create_time: 1,
            article_id: 1,
          }
        )
        .skip(skip)
        .limit(n + 1);

      if (!res || !res.length) {
        res.send({
          msg: "没有更多评论",
          has_more: false,
          code: 204,
        });
      } else if (res.length <= n) {
        has_more = false;
      }

      for (let i = 0; i < res.length; i++) {
        res[i].comment_id = res[i]._id;
        delete res[i]._id;
      }

      res.send({
        msg: "获取评论列表成功",
        has_more,
        comment_list: res,
        code: 200,
      });
    } catch (e) {
      res.send({
        code: e.message == "jwt expired" ? 401 : 402,
        msg: e.message,
      });
    }
  });

  // router.use(authenticateToken);

  // 发表评论
  router.post("/comment", async (req, res) => {
    try {
      const { text, article_id } = req.body;

      if (typeof text != "string") {
        throw new Error("评论数据类型不正确");
      }
      const textKey = Object.keys(text);
      if (textKey.length == 0) {
        throw new Error("评论不能为空");
      } else if (!article_id) {
        throw new Error("文章id不能为空");
      }

      const article = await articleModel.findOne({ _id: article_id });
      if (!article) {
        throw new Error("文章id不存在");
      }

      article.comment_count++;

      await articleModel.updateOne({ _id: article_id }, article);

      const comment = await commentModel.create({
        text,
        article_id,
        digg_count: 0,
        create_time: Date.parse(new Date()) / 1000,
        user_id: req.user?.id,
        digg_id_list: [],
      });

      const user = await userModel.findOne(
        {
          _id: req.user?.id,
        },
        {
          comment_id_list: 1,
        }
      );

      user.comment_id_list.push(comment._id.toString());

      await userModel.updateOne(
        {
          _id: req.user?.id,
        },
        user
      );

      res.send({
        msg: "评论成功",
        comment_id: comment._id,
        code: 200,
      });
    } catch (e) {
      res.send({
        code: e.message == "jwt expired" ? 401 : 402,
        msg: e.message,
      });
    }
  });

  // 删除评论
  router.delete("/comment_delete", async (req, res) => {
    try {
      const { comment_id } = req.query;
      if (!comment_id) {
        throw new Error("Params Error");
      }

      const comment = await commentModel.findOne({
        _id: comment_id,
      });

      if (comment.user_id != req.user?.id) {
        throw new Error("删除的评论不是当前登录用户发表的评论");
      }
      const { article_id } = comment;

      const article = await articleModel.findOne({
        _id: article_id,
      });

      if (!article) {
        throw new Error("文章id不存在");
      }

      article.comment_count >= 1 ? article.comment_count-- : 0;

      await articleModel.updateOne(
        {
          _id: article_id,
        },
        article
      );
      await commentModel.delete(
        {
          _id: article_id,
        },
        comment
      );

      res.send({
        msg: "删除评论成功",
        code: 200,
      });
    } catch (e) {
      res.send({
        code: e.message == "jwt expired" ? 401 : 402,
        msg: e.message,
      });
    }
  });

  // 取消、点赞评论
  router.put("/comment_digg", async (req, res) => {
    try {
      let msg = "";
      let { comment_id } = req.body;

      if (!comment_id) {
        throw new Error("Params Error");
      }

      const comment = await commentModel.where({ _id: comment_id }).findOne();

      const user_id = req.user?.id;
      const user = await userModel.where({ _id: user_id }).findOne();

      // 判断是否已点赞，已点赞则取消
      const commentIndex = comment.digg_id_list.indexOf(user_id);
      const userIndex = user.digg_comment_id_list.indexOf(comment_id);

      if (commentIndex != -1) {
        comment.digg_id_list.splice(commentIndex, 1);
        comment.digg_count--;
        user.digg_comment_id_list.splice(userIndex, 1);
        msg = "取消点赞成功";
      } else {
        comment.digg_id_list.push(user_id);
        comment.digg_count++;
        user.digg_comment_id_list.push(comment_id);
        msg = "点赞成功";
      }

      await commentModel.updateOne({ _id: comment_id }, comment);
      await userModel.updateOne({ _id: user_id }, user);

      res.send({
        msg,
        code: 200,
        digg_count: comment.digg_count,
      });
    } catch (e) {
      res.send({
        isErr: true,
        code: e.message == "jwt expired" ? 401 : 402,
        msg: e.message,
      });
    }
  });

  // 通过文章id获取评论列表
  router.get("/comment_list", async (req, res) => {
    try {
      let { article_id, n, skip } = req.query;
      n = Number(n);
      skip = Number(skip);
      if (n <= 0 || skip < 0 || !article_id) {
        throw new Error("Params Error");
      }

      const comment_list = [];
      let has_more = true;

      const query = await commentModel
        .find(
          {
            article_id,
          },
          {
            create_time: 1,
            digg_count: 1,
            text: 1,
            user_id: 1,
            digg_id_list: 1,
          }
        )
        .skip(skip)
        .limit(n);

      const comment_count = await commentModel
        .where({
          article_id,
        })
        .count();

      for (let i = 0; i < n; i++) {
        if (!query[i]) {
          has_more = false;
          break;
        }

        let is_digg = false;

        const reply_count = await replyModel
          .where({
            comment_id: query[i]._id.toString(),
          })
          .count();

        const commentator = await userModel.findOne(
          {
            _id: query[i].user_id,
          },
          {
            avatar: 1,
            nickname: 1,
            digg_comment_id_list: 1,
          }
        );

        if (req.user && query[i].digg_id_list.includes(req.user?.id)) {
          is_digg = true;
        }

        comment_list.push(
          Object.assign({}, query[i]._doc, {
            comment_id: query[i]._id.toString(),
            is_digg,
            reply_count,
            user_info: {
              avatar_url: commentator.avatar,
              user_name: commentator.nickname,
            },
          })
        );
      }

      if (comment_list.length == 0) {
        return res.send({
          msg: "没有更多评论",
          has_more: false,
          code: 204,
        });
      }

      if (n + skip >= comment_count) {
        has_more = false;
      }

      res.send({
        msg: "获取评论列表成功",
        comment_list,
        comment_count,
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

  // 回复信息
  router.post("/reply", async (req, res) => {
    try {
      const { text, comment_id } = req.body;

      if (typeof text != "string") {
        throw new Error("回复数据类型不正确");
      }
      const textKey = Object.keys(text);
      if (textKey.length == 0) {
        throw new Error("回复不能为空");
      } else if (!comment_id) {
        throw new Error("评论id不能为空");
      }

      const comment = await commentModel
        .where({
          _id: comment_id,
        })
        .findOne();

      if (!comment) {
        throw new Error("评论id不存在");
      }

      const reply = await replyModel.create({
        text,
        comment_id,
        create_time: Date.parse(new Date()) / 1000,
        user_id: req.user?.id,
      });

      const user = await userModel.findOne(
        {
          _id: req.user?.id,
        },
        {
          reply_id_list: 1,
        }
      );

      user.reply_id_list.push(reply._id.toString());

      await userModel.updateOne(
        {
          _id: req.user?.id,
        },
        user
      );

      res.send({
        msg: "回复成功",
        reply_id: reply.id,
        code: 200,
      });
    } catch (e) {
      res.send({
        code: e.message == "jwt expired" ? 401 : 402,
        msg: e.message,
      });
    }
  });
  // 回复删除
  router.delete("/reply_delete", async (req, res) => {
    try {
      const { reply_id } = req.query;
      if (!reply_id) {
        throw new Error("Params Error");
      }

      const reply = await replyModel
        .where({
          _id: reply_id,
        })
        .findOne();

      if (reply.user_id != req.user?.id) {
        throw new Error("删除的回复不是当前登录用户发表的回复");
      }

      await replyModel.delete(
        {
          _id: reply_id,
        },
        reply
      );

      res.send({
        msg: "删除回复成功",
        code: 200,
      });
    } catch (e) {
      res.send({
        code: e.message == "jwt expired" ? 401 : 402,
        msg: e.message,
      });
    }
  });
  // 获取回复列表
  router.get("/reply_list", async (req, res) => {
    try {
      let { comment_id, n, skip } = req.query;
      n = Number(n);
      skip = Number(skip);
      if (n <= 0 || skip < 0 || !comment_id) {
        throw new Error("Params Error");
      }
      let has_more = true;
      const reply_list = await replyModel
        .find(
          {
            comment_id,
          },
          {
            comment_id: 1,
            create_time: 1,
            text: 1,
            user_id: 1,
          }
        )
        .skip(skip)
        .limit(n);

      if (reply_list.length == 0) {
        res.send({
          msg: "没有更多回复",
          has_more: false,
          code: 204,
        });
      }
      const res_list = [];

      for (let i = 0; i < reply_list.length; i++) {
        const user = await userModel.findOne(
          {
            _id: reply_list[i].user_id,
          },
          {
            nickname: 1,
            avatar: 1,
          }
        );

        res_list.push(
          Object.assign({}, reply_list[i]._doc, {
            user_info: user,
            reply_id: reply_list[i]._id.toString(),
          })
        );
      }

      const reply_count = await replyModel
        .where({
          comment_id,
        })
        .count();

      if (n + skip >= reply_count) {
        has_more = false;
      }

      res.send({
        msg: "获取回复列表成功",
        reply_list: res_list,
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
