const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const commentSchema = new Schema({
  create_time: String,
  text: String,
  digg_count: Number,
  digg_id_list: Array,
  user_id: String,
  article_id: String,
});

const commentModle = mongoose.model("comment", commentSchema);
module.exports = commentModle;
