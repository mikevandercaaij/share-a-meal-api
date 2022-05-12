const express = require("express");
const authController = require("../controllers/auth.controller");
const router = express.Router();

router.post("/api/auth/login", authController.validateLogin, authController.login);

//add router to exports
module.exports = router;
