const express = require("express");
const router = express.Router();
const mealController = require("./../controllers/meal.controller");
const authController = require("./../controllers/auth.controller");

//add router to exports
module.exports = router;

//catch all request for "/api/meal/"
router
    .route("/api/meal")

    //UC-301 Create a meal
    .post(authController.validateToken, mealController.validateMealCreate, mealController.addMeal)

    //UC-303 Get list of all meals
    .get(mealController.getAllMeals);

//catch all request for "/api/meal/:id"
router
    .route("/api/meal/:id")

    //UC-302 Update a meal
    .put(authController.validateToken, mealController.validateMealUpdate, mealController.updateMeal)

    //UC-304 Get details of a meal
    .get(mealController.getMealByID)

    //UC-305 Delete a meal
    .delete(authController.validateToken, mealController.deleteMeal);

router.route("/api/meal/:mealId/participate").get(authController.validateToken, mealController.participateMeal);
