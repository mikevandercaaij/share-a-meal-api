const express = require("express");
const participantController = require("../controllers/participant.controller");
const authController = require("../controllers/auth.controller");
const router = express.Router();

router.post("/api/meal/:mealId/signup", authController.validateLogin, authController.login);

//add router to exports
module.exports = router;
