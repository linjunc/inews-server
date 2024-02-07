import mongoose from "mongoose";

const replyFields = {
  create_time: { type: String },
  text: { type: String },
  comment_id: { type: String },
  user_id: { type: String },
};

const replySchema = new mongoose.Schema(replyFields);

const replyModel = mongoose.model("reply", replySchema);

export default replyModel;
