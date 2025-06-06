import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import { getRecieverSocketId, io } from "../lib/socket.js";
import dotenv from "dotenv";

dotenv.config();
const backendURL =
  process.env.NODE_ENV === "development" ? process.env.BACKEND_URL : "/";

export const getUsers = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("Error in getUsers controller: ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: userToChatId } = req.params;

    const filteredMessages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { receiverId: myId, senderId: userToChatId },
      ],
    });

    res.status(200).json(filteredMessages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: userToChatId } = req.params;
    const { text } = req.body;

    let imageUrl;

    // console.log("messages.controller.body: ", req.body);
    // console.log("messages.controller.file: ", req.file);

    if (req.file) {
      imageUrl = backendURL + req.file.path;
    }

    const newMessage = new Message({
      senderId: myId,
      receiverId: userToChatId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    // todo: realtime functionality with socket.io

    const recieverSocketId = getRecieverSocketId(userToChatId);

    if (recieverSocketId) {
      io.to(recieverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
