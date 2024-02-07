const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const userSchema = new Schema({
  account: String,
  password: String,
  introduction: String,
  avatar: String,
  nickname: String,
  digg_article_id_list: Array,
  reply_id_list: Array,
  like_article_id_list: Array,
  history_id_lisy: Array,
  follow_media_id_list: Array,
  digg_comment_id_list: Array,
  comment_id_list: Array,
  history_id_list: Array,
  follower_id_list: Array,
  tag_list: Array,
  type: String,
  personal_page: String,
  read_report_list: Array,
  is_show_history: Boolean,
});

//将userSchema映射到一个MongoDB collection并定义这个文档的构成
const userModle = mongoose.model("user", userSchema);

module.exports = userModle;
