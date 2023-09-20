const getPrismaInstance = require("../utils/PrismaClient");
const { generateToken04 } = require("../utils/TokenGenerator");
require("dotenv").config();

const checkUser = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide a valid email" });
    }
    const prisma = getPrismaInstance();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    return res
      .status(200)
      .json({ success: true, message: "user found", data: user });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Some server error occurred" });
  }
};

const onBoardUser = async (req, res, next) => {
  try {
    const { email, name, about, image: profilePicture } = req.body;
    console.log(email, name, about, profilePicture);
    if (!email || !name || !profilePicture) {
      return res
        .status(400)
        .json({ success: false, message: "Email,Name and Image are required" });
    }
    const prisma = getPrismaInstance();
    await prisma.user.create({ data: { email, name, about, profilePicture } });
    return res
      .status(200)
      .json({ success: true, message: "Profile created successfully" });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Some server error occurred" });
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const prisma = getPrismaInstance();
    const users = await prisma.user.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        email: true,
        name: true,
        profilePicture: true,
        about: true,
      },
    });
    const usersGroupByInitialLetter = {};
    users.forEach((user) => {
      const initialetter = user.name.charAt(0).toUpperCase();
      if (!usersGroupByInitialLetter[initialetter]) {
        usersGroupByInitialLetter[initialetter] = [];
      }
      usersGroupByInitialLetter[initialetter].push(user);
    });
    return res
      .status(200)
      .json({ success: true, users: usersGroupByInitialLetter });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Some server error occurred" });
  }
};

const generateToken = async (req, res, next) => {
  try {
    const appId = parseInt(process.env.ZEGO_APP_ID);
    const serverSecret = process.env.ZEGO_APP_SECRET;
    const userId = req.params.userId;
    const effectiveTime = 3600;
    const payload = "";
    if (appId && serverSecret && userId) {
      const token = generateToken04(
        appId,
        userId,
        serverSecret,
        effectiveTime,
        payload
      );
      return res.status(200).json({ success: true, message: token });
    }
    return res.status(400).json({
      success: false,
      message: "User id, app id and server secret is required",
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Server error occurred" });
  }
};

module.exports = { checkUser, onBoardUser, getAllUsers, generateToken };
