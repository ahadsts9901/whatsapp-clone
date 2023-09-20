const {
  checkUser,
  onBoardUser,
  getAllUsers,
  generateToken,
} = require("../controllers/AuthController");
const express = require("express");
const router = express.Router();

router.route("/checkUser").post(checkUser);
router.route("/onboard-user").post(onBoardUser);
router.route("/get-contacts").get(getAllUsers);
router.route("/generate-token/:userId").get(generateToken);

module.exports = router;
