/**
 * @return {map} 标签对应中文名的map
 */
module.exports = async function (params, context) {
  const nameMap = new Map();
  // 两个数组顺序需要对应
  const tagList = [
    "news_society",
    "news_entertainment",
    "news_tech",
    "news_military",
    "news_sports",
    "news_car",
    "news_finance",
    "news_world",
    "news_fashion",
    "news_history",
    "news",
  ];

  const nameList = [
    "社会类",
    "娱乐类",
    "科技类",
    "军事类",
    "体育类",
    "汽车类",
    "财经类",
    "国际类",
    "时尚类",
    "历史类",
    "新类",
  ];
  for (let i = 0; i < tagList.length; i++) {
    nameMap.set(tagList[i], nameList[i]);
  }

  return {
    nameMap,
  };
};
