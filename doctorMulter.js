import multer from "multer"
import path from "path"

//multer module : a module for upload images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "frontend/uploads/medicalEvidence/");
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

const Dupload = multer({
  storage,
  limits: { fileSize: 1 * 1024 * 1024 }, // 1MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("فقط فایل تصویری مجاز است"));
    }
  },
});


export default Dupload;