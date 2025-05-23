import bcrypt from "bcryptjs";

import User from "../models/user.model.js";
import { generateToken } from "../lib/utils.js";

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    if (!fullName || !email || !password) {
      res.status(400).json({ message: "All fields are required" });
    } else if (password.length < 6) {
      res
        .status(400)
        .json({ message: "Password must be atleast 6 characters" });
    }

    const user = await User.findOne({ email });

    if (user) return res.status(400).json({ message: "Email already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      generateToken(newUser._id, res);
      await newUser.save();
      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup controller: ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User does not exist" });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect)
      return res.status(400).json({ message: "Invalid Credentials" });

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log("Error in login controller: ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller: ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  const userId = req.user._id;
  const { fullName } = req.user;
  // console.log("updateProfile.body: ", req.body);
  // console.log("updateProfile.file: ", req.file);
  try {
    if (req.file === "ERROR") {
      return res.status(400).json({ message: "Incorrect File Format" });
    } else if (req.file) {
      var updatedUser = await User.findByIdAndUpdate(
        userId,
        { profilePic: req.file.path },
        { new: true }
      );
      console.log("Updated: profilePic");
    } else if (req.body?.fullName && req.body.fullName !== fullName) {
      var updatedUser = await User.findByIdAndUpdate(
        userId,
        { fullName: req.body.fullName },
        { new: true }
      );
      console.log("Updated: fullName");
    } else if (req.body?.password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);

      var updatedUser = await User.findByIdAndUpdate(
        userId,
        { password: hashedPassword },
        { new: true }
      );
      console.log("Updated: password");
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("Error in updateProfile controller: ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller: ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
