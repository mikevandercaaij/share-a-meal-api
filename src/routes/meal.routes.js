const express = require("express");
const router = express.Router();
const path = require("path");
const mealController = require("./../controllers/meal.controller");

//add router to exports
module.exports = router;

//catch all request for "/api/meal/"
router
    .route("/api/meal")

    //UC-301 Create a meal
    .post(mealController.validateMeal, mealController.addMeal)

    //UC-303 Get list of all meals
    .get(mealController.getAllMeals);

//catch all request for "/api/meal/:id"
router
    .route("/api/meal/:id")

    //UC-302 Update a meal
    .put(mealController.validateMeal, mealController.updateMeal)

    //UC-304 Get details of a meal
    .get(mealController.getMealByID)

    //UC-305 Delete a meal
    .delete(mealController.deleteMeal);
