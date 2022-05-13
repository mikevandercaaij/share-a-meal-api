const express = require("express");
const router = express.Router();
const path = require("path");
const userController = require("./../controllers/user.controller");
const authController = require("./../controllers/auth.controller");

//add router to exports
module.exports = router;

//catch all request for "/api/user/"
router
    .route("/api/user")

    //UC-201 Register as a new user
    .post(userController.validateUserCreate, userController.addUser)

    //UC-202 Get all users
    .get(authController.validateToken, userController.getAllUsers);

//UC-203 Request personal user profile
router.get("/api/user/profile", authController.validateToken, userController.getUserProfile);

//catch all request for "/api/user/:id"
router
    .route("/api/user/:id")

    //UC-204 Get single user by ID
    .get(authController.validateToken, userController.getUserByID)

    //UC-205 Update a single user
    .put(authController.validateToken, userController.validateUserUpdate, userController.updateUser)

    //UC-206 Delete a user
    .delete(authController.validateToken, userController.deleteUser);
