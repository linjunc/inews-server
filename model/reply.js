const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const replySchema = new Schema({
  create_time: String,
  text: String,
  comment_id: String,
  user_id: String,
});

const replyModel = mongoose.model("reply", replySchema);
module.exports = replyModel;
