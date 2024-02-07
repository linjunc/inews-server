import express, { Request, Response } from "express";
import authenticateToken from "../utils/auth";

import userModel from "../model/user";
import articleModel from "../model/article";
import commentModel from "../model/comment";
import replyModel from "../model/reply";

const router = express.Router();

// 根据用户id获取用户的评论数
router.get("/comment_list_user", async (req, res) => {
  try {
    let { user_id, n, skip } = req.query;
    const currentNum = Number(n);
    const skipNum = Number(skip);
    if (currentNum <= 0 || skipNum < 0 || !user_id) {
      throw new Error("Params Error");
    }

    let has_more = true;

    const comment = await commentModel
      .find(
        { user_id },
        {
          text: 1,
          digg_count: 1,
          create_time: 1,
          article_id: 1,
        }
      )
      .skip(skipNum)
      .limit(currentNum + 1);

    if (!comment || !comment.length) {
      return res.send({
        msg: "没有更多评论",
        has_more: false,
        code: 204,
      });
    } else if (comment.length <= currentNum) {
      has_more = false;
    }

    for (let i = 0; i < comment.length; i++) {
      (comment[i] as any).comment_id = comment[i]._id;
      delete (comment[i] as any)._id;
    }

    res.send({
      msg: "获取评论列表成功",
      has_more,
      comment_list: res,
      code: 200,
    });
  } catch (e: any) {
    res.send({
      code: e.message == "jwt expired" ? 401 : 402,
      msg: e.message,
    });
  }
});

// router.use(authenticateToken);

// 发表评论
router.post("/comment", authenticateToken, async (req, res) => {
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
      create_time: Date.parse(String(new Date())) / 1000,
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

    if (!user) {
      throw new Error("登录信息已过期");
    }

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
  } catch (e: any) {
    res.send({
      code: e.message == "jwt expired" ? 401 : 402,
      msg: e.message,
    });
  }
});

// 删除评论
router.delete("/comment_delete", authenticateToken, async (req, res) => {
  try {
    const { comment_id } = req.query;
    if (!comment_id) {
      throw new Error("Params Error");
    }

    const comment = await commentModel.findOne({
      _id: comment_id,
    });

    if (!comment) {
      throw new Error("评论内容已被删除");
    }

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

    await commentModel.deleteOne({
      _id: article_id,
    });

    res.send({
      msg: "删除评论成功",
      code: 200,
    });
  } catch (e: any) {
    res.send({
      code: e.message == "jwt expired" ? 401 : 402,
      msg: e.message,
    });
  }
});

// 取消、点赞评论
router.put("/comment_digg", authenticateToken, async (req, res) => {
  try {
    let msg = "";
    let { comment_id } = req.body;

    if (!comment_id) {
      throw new Error("Params Error");
    }

    const comment = await commentModel.where({ _id: comment_id }).findOne();
    if (!comment) {
      throw new Error("评论内容已被删除");
    }

    const user_id = req.user?.id;
    const user = await userModel.where({ _id: user_id }).findOne();

    if (!user) {
      throw new Error("登录信息已过期");
    }

    // 判断是否已点赞，已点赞则取消
    const commentIndex = comment.digg_id_list.indexOf(user_id);
    const userIndex = user.digg_comment_id_list.indexOf(comment_id);

    if (commentIndex != -1) {
      comment.digg_id_list.splice(commentIndex, 1);
      comment.digg_count!--;
      user.digg_comment_id_list.splice(userIndex, 1);
      msg = "取消点赞成功";
    } else {
      comment.digg_id_list.push(user_id);
      comment.digg_count!++;
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
  } catch (e: any) {
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
    const currentNum = Number(n);
    const skipNum = Number(skip);
    if (currentNum <= 0 || skipNum < 0 || !article_id) {
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
      .skip(skipNum)
      .limit(currentNum);

    const comment_count = await commentModel
      .where({
        article_id,
      })
      .count();

    for (let i = 0; i < currentNum; i++) {
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

      if (!commentator) {
        throw new Error("登录信息过期");
      }

      if (req.user && query[i].digg_id_list.includes(req.user?.id)) {
        is_digg = true;
      }

      comment_list.push(
        Object.assign({}, (query[i] as any)._doc, {
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

    if (currentNum + skipNum >= comment_count) {
      has_more = false;
    }

    res.send({
      msg: "获取评论列表成功",
      comment_list,
      comment_count,
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

// 回复信息
router.post("/reply", authenticateToken, async (req, res) => {
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
      create_time: Date.parse(String(new Date())) / 1000,
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

    if (!user) {
      throw new Error("登录信息过期");
    }

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
  } catch (e: any) {
    res.send({
      code: e.message == "jwt expired" ? 401 : 402,
      msg: e.message,
    });
  }
});
// 回复删除
router.delete("/reply_delete", authenticateToken, async (req, res) => {
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

    if (!reply) {
      throw new Error("回复id不存在");
    }

    if (reply.user_id != req.user?.id) {
      throw new Error("删除的回复不是当前登录用户发表的回复");
    }

    await replyModel.deleteOne({
      _id: reply_id,
    });

    res.send({
      msg: "删除回复成功",
      code: 200,
    });
  } catch (e: any) {
    res.send({
      code: e.message == "jwt expired" ? 401 : 402,
      msg: e.message,
    });
  }
});
// 获取回复列表
router.get("/reply_list", authenticateToken, async (req, res) => {
  try {
    let { comment_id, n, skip } = req.query;
    const currentNum = Number(n);
    const skipNum = Number(skip);
    if (currentNum <= 0 || skipNum < 0 || !comment_id) {
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
      .skip(skipNum)
      .limit(currentNum);

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
        Object.assign({}, (reply_list[i] as any)._doc, {
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

    if (currentNum + skipNum >= reply_count) {
      has_more = false;
    }

    res.send({
      msg: "获取回复列表成功",
      reply_list: res_list,
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
