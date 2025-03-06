import multer, { Options } from "multer";
import path from "path";
import { APIError } from "./APIError";

export const fileUploadOptions: Options = {
  storage: multer.diskStorage({
    destination: path.join(__dirname, "../../public/assets"),
    filename: (_, file, cb) => {
      cb(null, `${Date.now()}_${file.originalname}`);
    },
  }),
  fileFilter: async (_req, file, cb) => {
    if (
      !["image/png", "image/jpg", "image/jpeg", "application/pdf"].includes(
        file.mimetype.toLowerCase()
      )
    ) {
      return cb(new APIError("Only pdf/jpg/png are allowed", 400));
    }
    return cb(null, true);
  },
  limits: {
    files: 1,
    fieldNameSize: 255,
    fileSize: Infinity,
  },
};
