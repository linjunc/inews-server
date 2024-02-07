const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const articleSchema = new Schema({
  tag: String,
  title: String,
  abstract: String,
  digg_count: Number,
  comment_count: Number,
  like_count: Number,
  has_image: Boolean,
  image_url: String,
  image_list: Array,
  publish_time: String,
  media_id: String,
  media_user: Object,
  content: String,
  digg_id_list: Array,
  like_id_list: Array,
  read_count: Number,
});

const articleModle = mongoose.model("article", articleSchema);
module.exports = articleModle;
