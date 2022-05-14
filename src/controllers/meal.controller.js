const assert = require("assert");
const dbconnection = require("./../../database/dbconnection");

//validate meal
exports.validateMeal = (req, res, next) => {
    const meal = req.body;

    //localize all req body values
    let { name, description, isActive, isVega, isVegan, isToTakeHome, imageUrl, maxAmountOfParticipants, price } = meal;

    //check if all values are of a certain type
    try {
        assert(typeof isActive === "boolean" || typeof isActive === "number", "IsActive must be a boolean or number.");
        assert(typeof isVega === "boolean" || typeof isVega === "number", "IsVega must be a boolean or number.");
        assert(typeof isVegan === "boolean" || typeof isVegan === "number", "IsVegan must be a boolean or number.");
        assert(typeof isToTakeHome === "boolean" || typeof isToTakeHome === "number", "IsToTakeHome must be a boolean or number.");
        assert(typeof maxAmountOfParticipants === "number", "MaxAmountOfParticipants must be a number.");
        assert(typeof price === "number", "Price must be a number.");
        assert(typeof imageUrl === "string", "ImageUrl must be a string.");
        assert(typeof name === "string", "Name must be a string.");
        assert(typeof description === "string", "Description must be a string.");

        if (typeof meal.allergenes !== "undefined") {
            assert(typeof meal.allergenes === "object", "Allergenes must be an object.");
        }

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
        const { name, description, isActive, isVega, isVegan, isToTakeHome, imageUrl, maxAmountOfParticipants, price } = req.body;
        let { allergenes } = req.body;

        if (typeof allergenes === "undefined") {
            allergenes = "";
        } else {
            allergenes = allergenes.join();
        }

        //insert new meal into meals
        connection.query("INSERT INTO meal (name, description, isActive, isVega, isVegan, isToTakeHome, imageUrl, cookId , allergenes, maxAmountOfParticipants, price) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [name, description, isActive, isVega, isVegan, isToTakeHome, imageUrl, req.userId, allergenes, maxAmountOfParticipants, price], (err, results, fields) => {
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

                const cookId = results[0].cookId;
                delete results[0].cookId;

                const returnMeal = async () => {
                    const cook = await addCook(cookId);
                    // const participants = await addParticipants(cookId);
                    const meal = {
                        ...results[0],
                        cook,
                        // participants
                    };

                    //return successful status + result
                    res.status(201).json({
                        status: 201,
                        result: meal,
                    });

                    //end response process
                    res.end();
                };
                returnMeal();
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

        const newMeal = req.body;

        connection.query("SELECT * FROM meal WHERE id = ?", id, (err, results, fields) => {
            //throw error if something went wrong
            if (err) throw err;

            const oldMeal = results[0];

            //if meal exists
            if (results.length === 1) {
                let { allergenes } = newMeal;

                //store the meal in a variable
                const cookId = results[0].cookId;

                if (cookId !== req.userId) {
                    res.status(403).json({
                        status: 403,
                        message: "You are not the owner of this meal",
                    });
                } else {
                    if (!typeof allergenes === "undefined") {
                        allergenes = allergenes.join(",");
                    }

                    let meal = {
                        ...oldMeal,
                        ...newMeal,
                    };

                    const { name, description, isActive, isVega, isVegan, isToTakeHome, imageUrl, maxAmountOfParticipants, price } = meal;

                    //update meal
                    connection.query("UPDATE meal SET name = ?, description = ?, isActive = ?, isVega = ?, isVegan = ?, isToTakeHome = ?, imageUrl = ?, allergenes = ?, maxAmountOfParticipants = ?, price = ? WHERE id = ?", [name, description, isActive, isVega, isVegan, isToTakeHome, imageUrl, allergenes, maxAmountOfParticipants, price, id], (err, results, fields) => {
                        //throw error if something went wrong
                        if (err) throw err;

                        connection.query("SELECT * FROM meal WHERE id = ?", id, (err, results, fields) => {
                            //close connection
                            connection.release();

                            const returnMeal = async () => {
                                const cook = await addCook(cookId);
                                // const participants = await addParticipants(cookId);
                                const meal = {
                                    ...results[0],
                                    cook,
                                    // participants
                                };

                                //return successful status + result
                                res.status(201).json({
                                    status: 201,
                                    result: formatMeal([meal]),
                                });

                                //end response process
                                res.end();
                            };
                            returnMeal();
                        });
                    });
                }
            } else {
                //if the meal isn't found return a fitting error response
                return next({
                    status: 404,
                    message: `Meal does not exist`,
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
                result: formatMeal(results),
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
                    result: formatMeal(results),
                });

                //end response process
                res.end();
            } else {
                //if the meal isn't found return a fitting error response
                return next({
                    status: 404,
                    message: `Meal does not exist`,
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

        connection.query("SELECT COUNT(id) as count FROM meal WHERE id = ?", id, (err, results, fields) => {
            //throw error if something went wrong
            if (err) throw err;

            if (!results[0].count) {
                //if the meal isn't found return a fitting error response
                return next({
                    status: 404,
                    message: `Meal does not exist`,
                });
            } else {
                if (id !== req.userId) {
                    res.status(403).json({
                        status: 403,
                        message: "You are not the owner of this meal",
                    });
                } else {
                    connection.query("DELETE FROM meal WHERE id = ?", id, (err, results, fields) => {
                        //throw error if something went wrong
                        if (err) throw err;

                        //close connection
                        connection.release();

                        //if a row has been deleted
                        if (results.affectedRows === 1) {
                            //send successful status
                            res.status(201).json({
                                status: 200,
                                message: "Meal has been deleted successfully.",
                            });

                            //end response process
                            res.end();
                        }
                    });
                }
            }
        });
    });
};

const formatMeal = (results) => {
    results.forEach((result) => {
        let boolObj = {
            isActive: result.isActive,
            isVega: result.isVega,
            isVegan: result.isVegan,
            isToTakeHome: result.isToTakeHome,
        };
        let keys = Object.keys(boolObj);
        keys.forEach((key) => {
            if (boolObj[key] === 1) {
                boolObj[key] = true;
            } else {
                boolObj[key] = false;
            }
        });

        result.isActive = boolObj.isActive;
        result.isVega = boolObj.isVega;
        result.isVegan = boolObj.isVegan;
        result.isToTakeHome = boolObj.isToTakeHome;

        if (result.allergenes.length === 0) {
            result.allergenes = [];
        }
    });

    if (results.length === 1) {
        return results[0];
    }
    return results;
};

const addCook = async (cookId) => {
    try {
        const retrieveCook = await dbconnection.query(`SELECT * FROM user WHERE id = ${cookId}`);
        return retrieveCook[0];
    } catch (err) {
        throw err;
    }
};

// const addParticipants = async (cookId) => {
// const retrieveCook = await dbconnection.query(`SELECT * FROM user where id IN ());

//     // const retrieveCook = await dbconnection.query(`SELECT * FROM user where id IN ());
// }
