import multer from "multer";

let isChat = false;

const imageType = (file) => {
  if (file.fieldname === "chat_image") {
    isChat = true;
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    imageType(file);
    cb(null, `uploads/${file.fieldname}`);
  },
  filename: (req, file, cb) => {
    if (isChat) {
      cb(
        null,
        req.user._id + "-" + req.params.id + "." + file.mimetype.split("/")[1]
      );
    } else {
      cb(null, req.user._id + "." + file.mimetype.split("/")[1]);
    }
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];

  if (isChat) {
    cb(null, true);
  } else if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false);
    req.file = "ERROR";
  }
};

export const upload = multer({
  storage,
  fileFilter,
});
