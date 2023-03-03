const express = require("express");
const router = express.Router();

const AuthController = require("../Controllers/AuthController");

router.get("/", (req, res) => {
  res.json("Paymate API");
});

// router.use("/auth", AuthRequired("User"), AuthController);
router.use("/client/auth", AuthController);

module.exports = router;
