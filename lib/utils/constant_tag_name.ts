export const TAG_CONST = [
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
  "news_air",
];

const TAG_NAME_CONST = [
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
  "航空类",
];

/**
 * @return {map} 标签对应中文名的map
 */
export default async function () {
  const nameMap = new Map();

  for (let i = 0; i < TAG_CONST.length; i++) {
    nameMap.set(TAG_CONST[i], TAG_NAME_CONST[i]);
  }

  return {
    nameMap,
  };
}
