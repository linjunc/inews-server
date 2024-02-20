import axios from "axios";
import OSS from "ali-oss";

export interface ITransferImage {
  /**
   * 图片地址
   */
  url?: string;
  /**
   * 图片文件名
   */
  fileName: string;
  /**
   * 图片数据（用于表单上传）
   */
  form_data?: FormData;
}

// 初始化OSS客户端。请将以下参数替换为您自己的配置信息。
const client = new OSS({
  region: "oss-cn-beijing", // 示例：'oss-cn-hangzhou'，填写Bucket所在地域。
  accessKeyId: "LTAI5tJdhGcHabG4wijekHbV", // 确保已设置环境变量OSS_ACCESS_KEY_ID。
  accessKeySecret: "GEoWQGFCRPiV3EHHFbYGyXvPMcRD9W", // 确保已设置环境变量OSS_ACCESS_KEY_SECRET。
  bucket: "ljcimg", // 示例：'my-bucket-name'，填写存储空间名称。
});

// 文件存储
export const transferFile = async ({ content }: { content: any }) => {
  try {
    console.log("content", content);
    const objectKey = `/avatar/${Date.now()}-${content?.originalname}`;

    // 上传到图床
    const { res, url: ossUrl } = await client.put(objectKey, content.buffer);

    if (res.status !== 200) {
      throw new Error("上传失败");
    }

    console.log(res);
    // 返回图片地址
    return ossUrl;
  } catch (error) {
    console.error(`Failed to transfer image`, error);
    return "";
  }
};

/**
 * 将 url 图片内容，转存到 oss 中
 * @param param0
 * @returns
 */
export const transferImage = async ({
  url,
  fileName,
}: ITransferImage & { url: string }) => {
  try {
    const response = await axios.get(url, { responseType: "arraybuffer" });

    // 上传到图床
    const { res, url: ossUrl } = await client.put(fileName, response.data, {
      headers: {
        "Content-Type": response.headers["content-type"],
      },
    });

    if (res.status !== 200) {
      throw new Error("上传失败");
    }

    console.log(res);
    // 返回图片地址
    return ossUrl;
  } catch (error) {
    console.error(`Failed to transfer image: ${url}`, error);
    return "";
  }
};
