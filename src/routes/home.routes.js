const express = require("express");
const homeController = require("./../controllers/home.controller");
const router = express.Router();

router.get("/", homeController.getHomepage);

//add router to exports
module.exports = router;
