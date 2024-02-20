import { randomUUID } from "crypto";
import { transferImage } from "../services/transfer";

function replaceImageUrls(html: string, imageUrlMap: any) {
  return html.replace(/<img[^>]*src="([^"]+)"/g, (match, src) => {
    const newSrc = imageUrlMap[src];
    if (newSrc) {
      return match.replace(src, newSrc);
    }
    return match;
  });
}

/**
 * html 中img图片链接转存
 * @param content
 * @param id
 * @returns
 */
export const picReChange = async (
  content: string,
  id: string = randomUUID()
) => {
  // 文本中的所有图片
  const allImg = getAllImg(content) ?? [];
  if (allImg.length === 0) return;
  // 转存所有的图片
  const promises = allImg.map((url, index) =>
    transferImage({
      url,
      fileName: `inews/${id}/image_${index}`,
    })
  );

  // 等待所有图片转存完成
  const newImageUrls = (await Promise.all(
    promises
  )) as unknown as Array<string>;

  const imageUrlMap = allImg.reduce((acc, oldUrl, index) => {
    acc[oldUrl] = newImageUrls[index];
    return acc;
  }, {} as any);
  // 替换 HTML 字符串中的图片 URL
  let newHtml = replaceImageUrls(content, imageUrlMap);
  return newHtml;
};

// 获取文本中的全部图片

const getAllImg = (content: string) => {
  const imageUrls = content.match(/<img[^>]*src="([^"]+)"/g) || [];
  return imageUrls.map((url) => url.replace(/<img[^>]*src="([^"]+)"/g, "$1"));
};
