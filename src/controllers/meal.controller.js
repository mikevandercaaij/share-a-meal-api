const assert = require("assert");
const dbconnection = require("../../database/dbconnection");

//validate meal
exports.validateMeal = (req, res, next) => {
    const meal = req.body;

    //localize all req body values
    let { name, description, isActive, isVega, isVegan, isToTakeHome, dateTime, imageUrl, allergenes, maxAmountOfParticipants, price } = meal;

    //check if all values are of a certain type
    try {
        assert(typeof isActive === "boolean" || typeof isActive === "number", "IsActive must be a boolean or number.");
        assert(typeof isVega === "boolean" || typeof isVega === "number", "IsVega must be a boolean or number.");
        assert(typeof isVegan === "boolean" || typeof isVegan === "number", "IsVegan must be a boolean or number.");
        assert(typeof isToTakeHome === "boolean" || typeof isToTakeHome === "number", "IsToTakeHome must be a boolean or number.");
        assert(typeof dateTime === "string", "DateTime must be a string.");
        assert(typeof maxAmountOfParticipants === "number", "MaxAmountOfParticipants must be a number.");
        assert(typeof price === "number", "Price must be a number.");
        assert(typeof imageUrl === "string", "ImageUrl must be a string.");
        assert(typeof name === "string", "Name must be a string.");
        assert(typeof description === "string", "Description must be a string.");
        assert(typeof allergenes === "object", "Allergenes must be an object.");

        return next();
    } catch (err) {
        //if not return error
        return next({
            status: 400,
            result: err.message,
        });
    }
};

//UC-301 Create a meal
exports.addMeal = (req, res, next) => {
    //create connection to database
    dbconnection.getConnection((err, connection) => {
        //throw error if something went wrong
        if (err) throw err;

        //put request body in a variable
        const { name, description, isActive, isVega, isVegan, isToTakeHome, dateTime, imageUrl, allergenes, maxAmountOfParticipants, price } = req.body;

        //change allergenes object into a string
        let allergenesString;

        //add all allergenes values to a single string
        for (let i = 0; i < allergenes.length; i++) {
            allergenesString += allergenes[i];

            //if it isnt the last allergie add a ","
            if (i !== allergenes.length - 1) {
                allergenesString += ",";
            }
        }

        //insert new meal into meals
        connection.query("INSERT INTO meal (name, description, isActive, isVega, isVegan, isToTakeHome, dateTime, imageUrl, allergenes, maxAmountOfParticipants, price) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [name, description, isActive, isVega, isVegan, isToTakeHome, dateTime, imageUrl, allergenesString, maxAmountOfParticipants, price], (err, results, fields) => {
            //throw error if something went wrong
            if (err) throw err;

            //get id from meal thats just been inserted
            const newestMealId = results.insertId;

            //get meal
            connection.query("SELECT * FROM meal WHERE id = ?", newestMealId, (err, results, fields) => {
                //throw error if something went wrong
                if (err) throw err;

                //close connection
                connection.release();

                //return successful status + result
                res.status(201).json({
                    status: 201,
                    result: results,
                });

                //end response process
                res.end();
            });
        });
    });
};

//UC-302 Update a meal
exports.updateMeal = (req, res, next) => {
    //create connection
    dbconnection.getConnection((err, connection) => {
        //throw error if something went wrong
        if (err) throw err;

        //save parameter (id) in variable
        const id = Number(req.params.id);

        //check if parameter is a number
        if (isNaN(id)) {
            return next();
        }

        //set meal object with given request body
        let meal = req.body;

        connection.query("SELECT COUNT(id) as count FROM meal WHERE id = ?", id, (err, results, fields) => {
            //throw error if something went wrong
            if (err) throw err;

            //store query output either 0 or 1
            const mealFound = results[0].count;

            //if meal exists
            if (mealFound) {
                //put request body in a variable
                const { name, description, isActive, isVega, isVegan, isToTakeHome, dateTime, imageUrl, allergenes, maxAmountOfParticipants, price } = req.body;

                //change allergenes object into a string
                let allergenesString;

                //add all allergenes values to a single string
                for (let i = 0; i < allergenes.length; i++) {
                    allergenesString += allergenes[i];

                    //if it isnt the last allergie add a ","
                    if (i !== allergenes.length - 1) {
                        allergenesString += ",";
                    }
                }

                //update meal
                connection.query("UPDATE meal SET name = ?, description = ?, isActive = ?, isVega = ?, isVegan = ?, isToTakeHome = ?, dateTime = ?, imageUrl = ?, allergenes = ?, maxAmountOfParticipants = ?, price = ? WHERE id = ?", [name, description, isActive, isVega, isVegan, isToTakeHome, dateTime, imageUrl, allergenesString, maxAmountOfParticipants, price, id], (err, results, fields) => {
                    //throw error if something went wrong
                    if (err) throw err;

                    //close connection
                    connection.release();

                    //return successful status + updated meal
                    res.status(201).json({
                        status: 201,
                        result: meal,
                    });

                    //end response process
                    res.end();
                });
            } else {
                //if the meal isn't found return a fitting error response
                return next({
                    status: 404,
                    message: `Can't update meal with an id of ${id} because it doesn't exist`,
                });
            }
        });
    });
};

//UC-303 Get list of all meals
exports.getAllMeals = (req, res) => {
    //create connection to database
    dbconnection.getConnection((err, connection) => {
        //throw error if something went wrong
        if (err) throw err;

        //get all meals
        connection.query("SELECT * FROM meal", (err, results, fields) => {
            //throw error if something went wrong
            if (err) throw err;

            //close connection
            connection.release();

            //send back all results
            res.status(200).json({
                status: 200,
                result: results,
            });

            //end response process
            res.end();
        });
    });
};

//UC-304 Get details of a meal
exports.getMealByID = (req, res, next) => {
    dbconnection.getConnection((err, connection) => {
        //throw error if something went wrong
        if (err) throw err;

        //save parameter (id) in variable
        const id = Number(req.params.id);

        //check if parameter is a number
        if (isNaN(id)) {
            return next();
        }

        //get requested meal's data
        connection.query("SELECT * FROM meal WHERE id = ?", id, (err, results, fields) => {
            //throw error if something went wrong
            if (err) throw err;

            //show data if meal exists
            if (results.length > 0) {
                //return successful status + result
                res.status(200).json({
                    status: 200,
                    result: results[0],
                });

                //end response process
                res.end();
            } else {
                //if the meal isn't found return a fitting error response
                return next({
                    status: 404,
                    message: `Meal with an id of ${id} doesn't exist`,
                });
            }
        });
    });
};

//UC-305 Delete a meal
exports.deleteMeal = (req, res, next) => {
    //save parameter (id) in variable
    const id = Number(req.params.id);

    //check if parameter is a number
    if (isNaN(id)) {
        return next();
    }

    //create connection
    dbconnection.getConnection((err, connection) => {
        //throw error if something went wrong
        if (err) throw err;

        connection.query("DELETE FROM meal WHERE id = ?", id, (err, results, fields) => {
            //throw error if something went wrong
            if (err) throw err;

            //close connection
            connection.release();

            //if a row has been deleted
            if (results.affectedRows === 1) {
                //send successful status
                res.status(201).json({
                    status: 201,
                    message: "Meal has been deleted successfully.",
                });

                //end response process
                res.end();
            } else {
                //if the meal isn't found return a fitting error response
                return next({
                    status: 404,
                    message: `Can't delete meal with an id of ${id} because it doesn't exist`,
                });
            }
        });
    });
};
