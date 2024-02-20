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
