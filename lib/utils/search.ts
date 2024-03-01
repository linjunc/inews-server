import articleModel from "../model/article";
import userModel from "../model/user";

// 搜索 articles 集合
export async function searchArticles(keyword: any) {
  const results = await articleModel.find({
    $or: [
      { title: { $regex: new RegExp(keyword, "i") } },
      { content: { $regex: new RegExp(keyword, "i") } },
    ],
  });
  return results;
}

// 搜索 users 集合
export async function searchUsers(keyword: any) {
  const results = userModel.find({
    $or: [
      { nickname: { $regex: new RegExp(keyword, "i") } },
      { account: { $regex: new RegExp(keyword, "i") } },
    ],
  });
  return results;
}
