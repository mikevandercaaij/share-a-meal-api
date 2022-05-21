const assert = require("assert");
const dbconnection = require("./../../database/dbconnection");
const { formatUser } = require("./user.controller");

//validate meal create
exports.validateMealCreate = (req, res, next) => {
    const meal = req.body;

    //localize all req body values
    let { description, isVega, isVegan, isToTakeHome, imageUrl, dateTime, name, maxAmountOfParticipants, price, allergenes } = meal;

    //check if all values are of a certain type

    try {
        assert(typeof name === "string", "Name must be a string.");

        assert(typeof price === "number", "Price must be a number.");

        assert(typeof maxAmountOfParticipants === "number", "MaxAmountOfParticipants must be a number.");

        assert(Number(maxAmountOfParticipants) > 1, "MaxAmountOfParticipants must be greater 1.");

        assert(typeof isVega === "boolean" || typeof isVega === "number", "IsVega must be a boolean or number.");

        assert(typeof isVegan === "boolean" || typeof isVegan === "number", "IsVegan must be a boolean or number.");

        assert(typeof isToTakeHome === "boolean" || typeof isToTakeHome === "number", "IsVegan must be a boolean or number.");

        assert(typeof imageUrl === "string", "ImageUrl must be a string");

        assert(typeof dateTime === "string", "DateTime must be a string");

        assert(typeof description === "string", "Description must be a string");

        assert(Array.isArray(allergenes), "Allergenes must be an object");

        return next();
    } catch (err) {
        //if not return error
        return next({
            status: 400,
            message: err.message,
        });
    }
};

//validate meal update
exports.validateMealUpdate = (req, res, next) => {
    const meal = req.body;

    //localize all req body values
    let { description, isActive, isVega, isVegan, isToTakeHome, imageUrl, name, dateTime, maxAmountOfParticipants, price, allergenes } = meal;

    //check if all values are of a certain type

    try {
        if (name || price || maxAmountOfParticipants) {
            if (name) {
                assert(typeof name === "string", "Name must be a string.");
            }

            if (price) {
                assert(typeof price === "number", "Price must be a number.");
            }

            if (maxAmountOfParticipants) {
                assert(typeof maxAmountOfParticipants === "number", "MaxAmountOfParticipants must be a number.");
                assert(Number(maxAmountOfParticipants) > 1, "MaxAmountOfParticipants must be greater 1.");
            }
        } else {
            return next({
                status: 400,
                message: "Request body must include name, price or maxAmountOfParticipants.",
            });
        }

        if (dateTime) {
            assert(typeof dateTime === "string", "DateTime must be a string");
        }

        if (isActive) {
            assert(typeof isActive === "boolean" || typeof isActive === "number", "IsActive must be a boolean or number.");
        }

        if (isVega) {
            assert(typeof isVega === "boolean" || typeof isVega === "number", "IsVega must be a boolean or number.");
        }

        if (isVegan) {
            assert(typeof isVegan === "boolean" || typeof isVegan === "number", "IsVegan must be a boolean or number.");
        }

        if (isToTakeHome) {
            assert(typeof isToTakeHome === "boolean" || typeof isToTakeHome === "number", "IsVegan must be a boolean or number.");
        }

        if (imageUrl) {
            assert(typeof imageUrl === "string", "ImageUrl must be a string");
        }

        if (description) {
            assert(typeof description === "string", "Description must be a string");
        }

        if (allergenes) {
            assert(Array.isArray(allergenes), "Allergenes must be an object");
        }

        return next();
    } catch (err) {
        //if not return error
        return next({
            status: 400,
            message: err.message,
        });
    }
};

//UC-301 Create a meal
exports.addMeal = (req, res, next) => {
    //create connection to database
    dbconnection.getConnection((err, connection) => {
        //throw error if something went wrong
        if (err) throw err;

        //alter allergenes syntax if it is in the request body
        req.body.allergenes = req.body.allergenes.join(",");

        // const date = new Date(req.body.dateTime).toISOString().slice(0, 19).replace("T", " ");

        let { isActive, isVega, isVegan, isToTakeHome, maxAmountOfParticipants, price, imageUrl, name, description, dateTime, allergenes } = req.body;

        const insertQuery = "INSERT INTO meal(isActive, isVega, isVegan, isToTakeHome, maxAmountOfParticipants, price, imageUrl, name, description, dateTime, allergenes, cookId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
        const insertArray = [isActive, isVega, isVegan, isToTakeHome, maxAmountOfParticipants, price, imageUrl, name, description, dateTime, allergenes, req.userId];

        //insert new meal into meals
        connection.query(insertQuery, insertArray, (err, results, fields) => {
            //throw error if something went wrong
            if (err) throw err;

            //get id from meal thats just been inserted
            const newestMealId = results.insertId;

            //add cook as a participant
            connection.query("INSERT INTO meal_participants_user(mealId, userId) VALUES (?,?)", [newestMealId, req.userId], (err, results, fields) => {
                //get meal
                connection.query("SELECT * FROM meal WHERE id = ?", newestMealId, (err, results, fields) => {
                    //throw error if something went wrong
                    if (err) throw err;

                    const cookId = results[0].cookId;
                    delete results[0].cookId;

                    let meal = formatMeal(results);

                    dbconnection.query("SELECT * FROM user WHERE id = ?", cookId, (err, results, fields) => {
                        //throw error if something went wrong
                        if (err) throw err;

                        meal = {
                            ...meal,
                            cook: formatUser(results),
                        };

                        dbconnection.query("SELECT DISTINCT userId FROM meal_participants_user WHERE mealId = ?", newestMealId, (err, results, fields) => {
                            //throw error if something went wrong
                            if (err) throw err;

                            let participantsAmount = results.length;

                            let participants = [];

                            const callback = () => {
                                if (participantsAmount === participants.length) {
                                    connection.release();

                                    meal = {
                                        ...meal,
                                        participants: participants.sort((a, b) => {
                                            return a.id - b.id;
                                        }),
                                    };

                                    //return successful status + result
                                    res.status(201).json({
                                        status: 201,
                                        result: meal,
                                    });

                                    res.end();
                                }
                            };

                            if (participantsAmount > 0) {
                                results.forEach((participant) => {
                                    dbconnection.query("SELECT * FROM user WHERE id = ?", participant.userId, (err, results, fields) => {
                                        participants.push(formatUser(results));
                                        callback();
                                    });
                                });
                            } else {
                                callback();
                            }
                        });
                    });
                });
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
                //store the meal in a variable
                const cookId = results[0].cookId;

                if (cookId !== req.userId) {
                    res.status(403).json({
                        status: 403,
                        message: "You are not the owner of this meal",
                    });
                } else {
                    let { allergenes } = newMeal;

                    if (typeof allergenes === "object") {
                        allergenes = allergenes.join(",");
                    }

                    let meal = {
                        ...oldMeal,
                        ...newMeal,
                    };

                    const { name, description, isActive, isVega, isVegan, isToTakeHome, imageUrl, maxAmountOfParticipants, price, dateTime } = meal;

                    // const date = new Date(dateTime).toISOString().slice(0, 19).replace("T", " ");

                    //update meal
                    connection.query("UPDATE meal SET name = ?, description = ?, isActive = ?, isVega = ?, isVegan = ?, isToTakeHome = ?, imageUrl = ?, dateTime = ?, allergenes = ?, maxAmountOfParticipants = ?, price = ? WHERE id = ?", [name, description, isActive, isVega, isVegan, isToTakeHome, imageUrl, dateTime, allergenes, maxAmountOfParticipants, price, id], (err, results, fields) => {
                        //throw error if something went wrong
                        if (err) throw err;

                        connection.query("SELECT * FROM meal WHERE id = ?", id, (err, results, fields) => {
                            //close connection
                            connection.release();

                            const cookId = results[0].cookId;
                            delete results[0].cookId;

                            let meal = formatMeal(results);

                            dbconnection.query("SELECT * FROM user WHERE id = ?", cookId, (err, results, fields) => {
                                //throw error if something went wrong
                                if (err) throw err;

                                meal = {
                                    ...meal,
                                    cook: formatUser(results),
                                };
                            });

                            dbconnection.query("SELECT DISTINCT userId FROM meal_participants_user WHERE mealId = ?", id, (err, results, fields) => {
                                //throw error if something went wrong
                                if (err) throw err;

                                let participantsAmount = results.length;

                                let participants = [];

                                const callback = () => {
                                    if (participantsAmount === participants.length) {
                                        connection.release();

                                        meal = {
                                            ...meal,
                                            participants: participants.sort((a, b) => {
                                                return a.id - b.id;
                                            }),
                                        };

                                        //return successful status + result
                                        res.status(201).json({
                                            status: 201,
                                            result: meal,
                                        });

                                        res.end();
                                    }
                                };

                                if (participantsAmount > 0) {
                                    results.forEach((participant) => {
                                        dbconnection.query("SELECT * FROM user WHERE id = ?", participant.userId, (err, results, fields) => {
                                            participants.push(formatUser(results));
                                            callback();
                                        });
                                    });
                                } else {
                                    callback();
                                }
                            });
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

            const amountOfMeals = results.length;
            let allMeals = [];

            results.forEach((currentMeal) => {
                const cookId = currentMeal.cookId;
                delete currentMeal.cookId;

                let meal = formatMeal([currentMeal]);

                dbconnection.query("SELECT * FROM user WHERE id = ?", cookId, (err, results, fields) => {
                    //throw error if something went wrong
                    if (err) throw err;

                    meal = {
                        ...meal,
                        cook: formatUser(results),
                    };

                    dbconnection.query("SELECT DISTINCT userId FROM meal_participants_user WHERE mealId = ?", currentMeal.id, (err, results, fields) => {
                        //throw error if something went wrong
                        if (err) throw err;

                        let participantsAmount = results.length;

                        let participants = [];

                        const callback = () => {
                            if (participantsAmount === participants.length) {
                                meal = {
                                    ...meal,
                                    participants: participants.sort((a, b) => {
                                        return a.id - b.id;
                                    }),
                                };

                                allMeals.push(meal);
                                connection.release();
                                if (amountOfMeals === allMeals.length) {
                                    //return successful status + result
                                    res.status(200).json({
                                        status: 200,
                                        result: allMeals.sort((a, b) => {
                                            return a.id - b.id;
                                        }),
                                    });
                                    //end response process
                                    res.end();
                                }
                            }
                        };

                        if (participantsAmount > 0) {
                            results.forEach((participant) => {
                                dbconnection.query("SELECT * FROM user WHERE id = ?", participant.userId, (err, results, fields) => {
                                    participants.push(formatUser(results));
                                    callback();
                                });
                            });
                        } else {
                            callback();
                        }
                    });
                });
            });
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
                const cookId = results[0].cookId;
                delete results[0].cookId;

                let meal = formatMeal(results);

                dbconnection.query("SELECT * FROM user WHERE id = ?", cookId, (err, results, fields) => {
                    //throw error if something went wrong
                    if (err) throw err;

                    meal = {
                        ...meal,
                        cook: formatUser(results),
                    };
                });

                dbconnection.query("SELECT DISTINCT userId FROM meal_participants_user WHERE mealId = ?", id, (err, results, fields) => {
                    //throw error if something went wrong
                    if (err) throw err;

                    let participantsAmount = results.length;

                    let participants = [];

                    const callback = () => {
                        if (participantsAmount === participants.length) {
                            connection.release();

                            meal = {
                                ...meal,
                                participants: participants.sort((a, b) => {
                                    return a.id - b.id;
                                }),
                            };

                            //return successful status + result
                            res.status(200).json({
                                status: 200,
                                result: meal,
                            });

                            res.end();
                        }
                    };

                    if (participantsAmount > 0) {
                        results.forEach((participant) => {
                            dbconnection.query("SELECT * FROM user WHERE id = ?", participant.userId, (err, results, fields) => {
                                participants.push(formatUser(results));
                                callback();
                            });
                        });
                    } else {
                        callback();
                    }
                });
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

        connection.query("SELECT COUNT(id) as count, cookId FROM meal WHERE id = ?", id, (err, results, fields) => {
            //throw error if something went wrong
            if (err) throw err;

            if (!results[0].count) {
                //if the meal isn't found return a fitting error response
                return next({
                    status: 404,
                    message: `Meal does not exist`,
                });
            } else {
                if (results[0].cookId !== req.userId) {
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

exports.participateMeal = (req, res, next) => {
    //save parameter (id) in variable
    const id = Number(req.params.mealId);

    //check if parameter is a number
    if (isNaN(id)) {
        return next();
    }

    dbconnection.getConnection((err, connection) => {
        if (err) throw err;

        const getMealInfoQuery = "SELECT id, cookId, maxAmountOfParticipants, COUNT(meal_participants_user.userId) AS currentParticipants FROM meal JOIN meal_participants_user ON meal.id = meal_participants_user.mealId WHERE meal.id =  ?";

        connection.query(getMealInfoQuery, id, (err, results, fields) => {
            const cookId = results[0].cookId;
            const maxAmountOfParticipants = results[0].maxAmountOfParticipants;
            const currentParticipants = results[0].currentParticipants;

            if (results[0].id !== null) {
                connection.query("SELECT userId FROM meal_participants_user WHERE mealId = ?", id, (err, results, fields) => {
                    if (err) throw err;

                    let participantIsCook = false;
                    let participantIsSignedUp = false;

                    if (req.userId === cookId) {
                        participantIsCook = true;
                    }

                    let count = 1;

                    results.forEach((participant) => {
                        if (participant.userId === req.userId && req.userId !== cookId) {
                            participantIsSignedUp = true;
                        }

                        count++;
                        if (results.length === count) {
                            if (participantIsCook) {
                                return next({
                                    status: 400,
                                    message: "The cook must be a participant at all times.",
                                });
                            }

                            if (currentParticipants === maxAmountOfParticipants && !participantIsSignedUp) {
                                return next({
                                    status: 404,
                                    message: "Max amount of participants has already been reached.",
                                });
                            }

                            if (!participantIsSignedUp) {
                                connection.query("INSERT INTO meal_participants_user(mealId, userId) VALUES (?,?)", [id, req.userId], (err, results, fields) => {
                                    if (err) throw err;
                                    connection.release();

                                    res.status(200).json({
                                        currentlyParticipating: true,
                                        currentAmountOfParticipants: currentParticipants + 1,
                                    });
                                });
                            } else {
                                connection.query("DELETE FROM meal_participants_user WHERE mealId = ? AND userId = ?", [id, req.userId], (err, results, fields) => {
                                    if (err) throw err;
                                    connection.release();

                                    res.status(200).json({
                                        currentlyParticipating: false,
                                        currentAmountOfParticipants: currentParticipants - 1,
                                    });
                                });
                            }
                        }
                    });
                });
            } else {
                return next({
                    status: 404,
                    message: "Meal does not exist.",
                });
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

        if (result.allergenes === "") {
            result.allergenes = [];
        }

        if (typeof result.allergenes === "string") {
            result.allergenes = result.allergenes.split(",");
        }
    });

    if (results.length === 1) {
        return results[0];
    }
    return results;
};

const convertBoolToInt = (arr) => {
    results.forEach((item) => {
        let boolObj = {
            isActive: item.isActive,
            isVega: item.isVega,
            isVegan: item.isVegan,
            isToTakeHome: item.isToTakeHome,
        };
        let keys = Object.keys(boolObj);
        keys.forEach((key) => {
            if (boolObj[key] === true) {
                boolObj[key] = 1;
            } else {
                boolObj[key] = 0;
            }
        });

        arr.isActive = boolObj.isActive;
        arr.isVega = boolObj.isVega;
        arr.isVegan = boolObj.isVegan;
        arr.isToTakeHome = boolObj.isToTakeHome;
    });

    return arr;
};
