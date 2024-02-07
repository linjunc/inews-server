import mongoose from "mongoose";

const commentFields = {
  create_time: { type: String },
  text: { type: String },
  digg_count: { type: Number },
  digg_id_list: { type: Array },
  user_id: { type: String },
  article_id: { type: String },
};

const commentSchema = new mongoose.Schema(commentFields);

const commentModel = mongoose.model("comment", commentSchema);

export default commentModel;
