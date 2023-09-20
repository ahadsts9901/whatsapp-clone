const express = require("express");
const {
  addMessage,
  getMessages,
  addImageMessage,
  addAudioMessage,
  getInitialContactswithMessages,
  updatesingleMessageStatus,
} = require("../controllers/MessageController");
const multer = require("multer");

const router = express.Router();

const uplaodAudio = multer({ dest: "uploads/recordings" });
const uploadImage = multer({ dest: "uploads/images" });

router.route("/add-message").post(addMessage);
router.route("/get-messages/:from/:to").get(getMessages);
router.post("/add-image-message", uploadImage.single("image"), addImageMessage);
router.post("/add-audio-message", uplaodAudio.single("audio"), addAudioMessage);
router.get("/get-initial-contacts/:from", getInitialContactswithMessages);
router.route("/update-single-message/:from/:to").get(updatesingleMessageStatus);

module.exports = router;
