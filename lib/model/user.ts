import mongoose from "mongoose";

const userFields = {
  account: { type: String },
  password: { type: String },
  introduction: { type: String },
  avatar: { type: String },
  nickname: { type: String },
  digg_article_id_list: { type: Array },
  reply_id_list: { type: Array },
  like_article_id_list: { type: Array },
  history_id_list: { type: Array },
  follow_media_id_list: { type: Array },
  digg_comment_id_list: { type: Array },
  comment_id_list: { type: Array },
  follower_id_list: { type: Array },
  tag_list: { type: Array },
  type: { type: String },
  personal_page: { type: String },
  read_report_list: { type: Array },
  is_show_history: { type: Boolean },
};

const userSchema = new mongoose.Schema(userFields);

const userModel = mongoose.model("user", userSchema);

export default userModel;
