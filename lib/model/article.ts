import mongoose, { Schema, Document, Model } from "mongoose";

const articleFields = {
  tag: { type: String },
  title: { type: String },
  abstract: { type: String },
  digg_count: { type: Number },
  comment_count: { type: Number },
  like_count: { type: Number },
  has_image: { type: Boolean },
  image_url: { type: String },
  image_list: { type: [String] },
  publish_time: { type: String },
  media_id: { type: String },
  media_user: {
    media_name: { type: String },
    avatar_url: { type: String },
    media_info: { type: String },
  },
  content: { type: String },
  digg_id_list: { type: [String] },
  like_id_list: { type: [String] },
  read_count: { type: Number },
};

type ArticleFieldsType = typeof articleFields;

interface IArticle extends Document, Record<keyof ArticleFieldsType, any> {}

const articleSchema = new Schema<IArticle>(articleFields);

const articleModel: Model<IArticle> = mongoose.model("article", articleSchema);

export default articleModel;
