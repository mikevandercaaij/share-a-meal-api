const express = require("express");
const router = express.Router();
const path = require("path");
const userController = require(path.join(__dirname, "../") + "controllers/user.controller");
const authController = require(path.join(__dirname, "../") + "controllers/auth.controller");

//add router to exports
module.exports = router;

//get request on root
router.get("/", (req, res) => {
    //show response on home directory
    res.status(200).json({
        code: 200,
        message: "This is my recreation of the Share-a-Meal api that has been used for our recent Share-a-Meal application.",
        course: "Programmeren 4",
        author: "Mike van der Caaij",
        studentNumber: 2184147,
    });

    //end response process
    res.end();
});

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
    .get(userController.getUserByID)

    //UC-205 Update a single user
    .put(userController.validateUserUpdate, userController.updateUser)

    //UC-206 Delete a user
    .delete(userController.deleteUser);
