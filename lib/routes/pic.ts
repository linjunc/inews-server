// 图床服务实现
import express from "express";
import { transferFile, transferImage } from "../services/transfer";
import upload from "../services/multerInstance";

const router = express.Router();

router.post("/save_file_oss", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      throw new Error("Params Error");
    }
    const resp = await transferFile({ content: req.file });
    console.log("res", resp);

    res.send({
      msg: "图片转存成功",
      data: {
        url: resp,
      },
      code: 200,
    });
  } catch (e: any) {
    res.send({
      code: 402,
      msg: e.message,
    });
  }
});

// 根据 URL 转存图片到图床
router.post("/save_url_oss", async (req, res) => {
  const { url, fileName } = req.body;
  try {
    const resp = await transferImage({ url, fileName });

    res.send({
      msg: "图片转存成功",
      data: {
        url: resp,
      },
      code: 200,
    });
  } catch (e: any) {
    res.send({
      code: 402,
      msg: e.message,
    });
  }
});

export default (app: express.Application) => {
  app.use("", router);
};
