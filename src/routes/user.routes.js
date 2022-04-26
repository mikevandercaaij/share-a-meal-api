const express = require("express");
const router = express.Router();
const path = require("path");
const userController = require(path.join(__dirname, "../") + "controllers/user.controller");

router.route("/api/user");
router.get((req, res) => {});

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

//UC-201 Register as a new user
router.post("/api/user", userController.addUser);

//UC-202 Get all users
router.get("/api/user", userController.getAllUsers);

//UC-203 Request personal user profile
router.get("/api/user/profile", userController.getUserProfile);

//UC-204 Get single user by ID
router.get("/api/user/:id", userController.getUserByID);

//UC-205 Update a single user
router.put("/api/user/:id", userController.updateUser);

//UC-206 Delete a user
router.delete("/api/user/:id", userController.deleteUser);
