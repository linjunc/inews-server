import multer from "multer";

// 配置 Multer 存储引擎
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

export default upload;
