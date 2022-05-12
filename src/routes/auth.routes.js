const express = require("express");
const authController = require("../controllers/auth.controller");
const router = express.Router();

//add router to exports
module.exports = router;

router.post("api/auth/login", authController.login);
