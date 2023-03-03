const express = require("express");
const router = express.Router();

const AuthController = require("../Controllers/AuthController");

router.get("/", (req, res) => {
  res.json("ILM API");
});

// router.use("/auth", AuthRequired("User"), AuthController);
router.use("/auth", AuthController);

module.exports = router;
