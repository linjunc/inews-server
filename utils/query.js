import articleModle from "../model/article";

export const queryArticle = async (params) => {
  return await articleModle.findOne(params);
};
