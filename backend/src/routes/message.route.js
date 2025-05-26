import express from "express";
import { upload } from "../lib/upload.js";

import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getUsers,
  getMessages,
  sendMessage,
} from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", protectRoute, getUsers);
router.get("/:id", protectRoute, getMessages);
router.post(
  "/send/:id",
  protectRoute,
  upload.single("chat_image"),
  sendMessage
);

export default router;
