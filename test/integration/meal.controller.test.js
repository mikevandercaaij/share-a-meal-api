process.env.DB_DATABASE = "share-a-meal-testdb";

const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("./../../index");
const dbconnection = require("./../../database/dbconnection");
const jwt = require("jsonwebtoken");
const { jwtSecretKey } = require("./../../src/config/config");

chai.should();
chai.use(chaiHttp);

const CLEAR_MEAL_TABLE = "DELETE IGNORE FROM `meal`;";
const CLEAR_PARTICIPANTS_TABLE = "DELETE IGNORE FROM `meal_participants_user`;";
const CLEAR_USERS_TABLE = "DELETE IGNORE FROM `user`;";
const CLEAR_DB = CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE;

const INSERT_MEALS = "INSERT INTO `meal` (`id`, `name`, `description`, `imageUrl`, `maxAmountOfParticipants`, `price`, `cookId`) VALUES" + "(1, 'Meal A', 'description', 'image url', 5, 6.50, 1)," + "(2, 'Meal B', 'description', 'image url', 5, 6.50, 1);";
const INSERT_USER = "INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES" + '(1, "first", "last", "test@server.nl", "secret", "street", "city");';
const INSERT_SECOND_USER = "INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES" + '(2, "first2", "last2", "test2@server.nl", "secret", "street2", "city2");';

// UC-300 Meal tests
describe("UC-300 Meal tests - POST /api/user", () => {
    beforeEach((done) => {
        dbconnection.getConnection((err, connection) => {
            if (err) throw err;

            connection.query(CLEAR_DB + INSERT_USER + INSERT_SECOND_USER + INSERT_MEALS, (err, results, fields) => {
                if (err) throw err;
                connection.release();
                done();
            });
        });
    });
    // UC-301 Create a meal
    describe("UC-301 Create a meal - POST /api/meal", () => {
        it("TC-301-1 Required input is missing", (done) => {
            chai.request(server)
                .post("/api/meal")
                .set("authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
                .send({
                    //missing name
                    description: "De pastaklassieker bij uitstek.",
                    isActive: true,
                    isVega: true,
                    isVegan: true,
                    isToTakeHome: true,
                    imageUrl: "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
                    maxAmountOfParticipants: 6,
                    price: 6.75,
                })
                .end((req, res) => {
                    res.should.be.an("object");
                    let { status, result } = res.body;
                    status.should.equals(400);
                    result.should.be.a("string").that.equals("Name must be a string.");
                    done();
                });
        });
        it("TC-301-2 Not logged in", (done) => {
            chai.request(server)
                .post("/api/meal")
                .set("authorization", "Bearer " + jwt.sign({ userId: 1 }, "test"))
                .end((req, res) => {
                    res.body.should.be.an("object");
                    let { status, message } = res.body;
                    status.should.equals(401);
                    message.should.be.a("string").that.equals("Invalid token");
                    done();
                });
        });
        it("TC-301-3 Meal succesfully added", (done) => {
            chai.request(server)
                .post("/api/meal")
                .set("authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
                .send({
                    name: "Spaghetti Bolognese",
                    description: "De pastaklassieker bij uitstek.",
                    isVega: true,
                    isVegan: true,
                    isToTakeHome: true,
                    imageUrl: "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
                    maxAmountOfParticipants: 6,
                    price: 6.75,
                    allergenes: ["gluten", "noten"],
                })
                .end((req, res) => {
                    res.should.be.an("object");
                    let { status, result } = res.body;
                    status.should.equals(201);
                    result.should.be.an("object");
                    result.should.have.property("id");
                    result.should.have.property("isActive");
                    result.should.have.property("isVega");
                    result.should.have.property("isVegan");
                    result.should.have.property("isToTakeHome");
                    result.should.have.property("dateTime");
                    result.should.have.property("maxAmountOfParticipants");
                    result.should.have.property("price");
                    result.should.have.property("imageUrl");
                    result.should.have.property("createDate");
                    result.should.have.property("updateDate");
                    result.should.have.property("name");
                    result.should.have.property("description");
                    result.should.have.property("allergenes");
                    result.should.have.property("cook");
                    result.cook.should.be.an("object");
                    result.cook.should.have.property("id");
                    result.cook.should.have.property("firstName");
                    result.cook.should.have.property("lastName");
                    result.cook.should.have.property("isActive");
                    result.cook.should.have.property("emailAdress");
                    result.cook.should.have.property("password");
                    result.cook.should.have.property("phoneNumber");
                    result.cook.should.have.property("roles");
                    result.cook.should.have.property("street");
                    result.cook.should.have.property("city");
                    done();
                });
        });
    });

    // UC-302 Update meal
    describe("UC-302 Update meal - PUT /api/meal/:id", () => {
        it("TC-302-1 Required input is missing", (done) => {
            chai.request(server)
                .put("/api/meal/1")
                .set("authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
                .send({
                    //missing name
                    description: "De pastaklassieker bij uitstek.",
                    isActive: true,
                    isVega: true,
                    isVegan: true,
                    isToTakeHome: true,
                    imageUrl: "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
                    //missing maxAmountOfParticipants
                    //missing price
                })
                .end((req, res) => {
                    res.should.be.an("object");
                    let { status, message } = res.body;
                    status.should.equals(400);
                    message.should.be.a("string").that.equals("Request body must include name, price or maxAmountOfParticipants.");
                    done();
                });
        });
        it("TC-302-2 Not logged in", (done) => {
            chai.request(server)
                .put("/api/meal/1")
                .set("authorization", "Bearer " + jwt.sign({ userId: 1 }, "test"))
                .end((req, res) => {
                    res.body.should.be.an("object");
                    let { status, message } = res.body;
                    status.should.equals(401);
                    message.should.be.a("string").that.equals("Invalid token");
                    done();
                });
        });
        it("TC-302-3 Not the owner of this data", (done) => {
            chai.request(server)
                .put("/api/meal/1")
                .set("authorization", "Bearer " + jwt.sign({ userId: 2 }, jwtSecretKey))
                .send({
                    name: "Spaghetti",
                    description: "De pastaklassieker bij uitstek.",
                    isActive: true,
                    isVega: true,
                    isVegan: true,
                    isToTakeHome: true,
                    imageUrl: "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
                    maxAmountOfParticipants: 6,
                    price: 6.75,
                })
                .end((req, res) => {
                    res.body.should.be.an("object");
                    let { status, message } = res.body;
                    status.should.equals(403);
                    message.should.be.a("string").that.equals("You are not the owner of this meal");
                    done();
                });
        });
        it("TC-302-4 Meal doesn't exist", (done) => {
            chai.request(server)
                .put("/api/meal/0")
                .set("authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
                .send({
                    name: "Spaghetti Bolognese",
                    description: "De pastaklassieker bij uitstek.",
                    isActive: true,
                    isVega: true,
                    isVegan: true,
                    isToTakeHome: true,
                    imageUrl: "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
                    maxAmountOfParticipants: 6,
                    price: 6.75,
                })
                .end((req, res) => {
                    res.should.be.an("object");
                    let { status, message } = res.body;
                    status.should.equals(404);
                    message.should.be.a("string").that.equals("Meal does not exist");
                    done();
                });
        });
        it("TC-302-5 Meal has been updated successfully", (done) => {
            chai.request(server)
                .put("/api/meal/1")
                .set("authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
                .send({
                    name: "Spaghetti Bolognese",
                    description: "De pastaklassieker bij uitstek.",
                    isActive: true,
                    isVega: true,
                    isVegan: true,
                    isToTakeHome: true,
                    imageUrl: "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
                    maxAmountOfParticipants: 6,
                    price: 6.75,
                })
                .end((req, res) => {
                    res.should.be.an("object");
                    let { status, result } = res.body;
                    status.should.equals(201);
                    result.should.be.an("object");
                    result.should.have.property("id");
                    result.should.have.property("isActive");
                    result.should.have.property("isVega");
                    result.should.have.property("isVegan");
                    result.should.have.property("isToTakeHome");
                    result.should.have.property("dateTime");
                    result.should.have.property("maxAmountOfParticipants");
                    result.should.have.property("price");
                    result.should.have.property("imageUrl");
                    result.should.have.property("createDate");
                    result.should.have.property("updateDate");
                    result.should.have.property("name");
                    result.should.have.property("description");
                    result.should.have.property("allergenes");
                    result.should.have.property("cook");
                    result.cook.should.be.an("object");
                    result.cook.should.have.property("id");
                    result.cook.should.have.property("firstName");
                    result.cook.should.have.property("lastName");
                    result.cook.should.have.property("isActive");
                    result.cook.should.have.property("emailAdress");
                    result.cook.should.have.property("password");
                    result.cook.should.have.property("phoneNumber");
                    result.cook.should.have.property("roles");
                    result.cook.should.have.property("street");
                    result.cook.should.have.property("city");
                    done();
                });
        });
    });

    // UC-303 Get list of meals
    describe("UC-303 Get list of meals - GET /api/meal", () => {
        it("TC-303-1 Return list of meals", (done) => {
            chai.request(server)
                .get("/api/meal")
                .end((req, res) => {
                    res.should.be.an("object");
                    let { status, result } = res.body;
                    status.should.equals(200);
                    result.should.be.an("array");
                    result.forEach((obj) => {
                        obj.should.be.an("object");
                        obj.should.have.property("id");
                        obj.should.have.property("isActive");
                        obj.should.have.property("isVega");
                        obj.should.have.property("isVegan");
                        obj.should.have.property("isToTakeHome");
                        obj.should.have.property("dateTime");
                        obj.should.have.property("maxAmountOfParticipants");
                        obj.should.have.property("price");
                        obj.should.have.property("imageUrl");
                        obj.should.have.property("createDate");
                        obj.should.have.property("updateDate");
                        obj.should.have.property("name");
                        obj.should.have.property("description");
                        obj.should.have.property("allergenes");
                        obj.should.have.property("cook");
                        obj.cook.should.be.an("object");
                        obj.cook.should.have.property("id");
                        obj.cook.should.have.property("firstName");
                        obj.cook.should.have.property("lastName");
                        obj.cook.should.have.property("isActive");
                        obj.cook.should.have.property("emailAdress");
                        obj.cook.should.have.property("password");
                        obj.cook.should.have.property("phoneNumber");
                        obj.cook.should.have.property("roles");
                        obj.cook.should.have.property("street");
                        obj.cook.should.have.property("city");
                    });
                    done();
                });
        });
    });

    // UC-304 Get list of meals
    describe("UC-304 Get list of meals - GET /api/meal/:id", () => {
        it("TC-304-1 Meal doesn't exist", (done) => {
            chai.request(server)
                .get("/api/meal/0")
                .set("authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
                .end((req, res) => {
                    res.should.be.an("object");
                    let { status, message } = res.body;
                    status.should.equals(404);
                    message.should.be.a("string").that.equals("Meal does not exist");
                    done();
                });
        });
        it("TC-304-2 Return details of meal", (done) => {
            chai.request(server)
                .get("/api/meal/1")
                .set("authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
                .end((req, res) => {
                    res.should.be.an("object");
                    let { status, result } = res.body;
                    status.should.equals(200);
                    result.should.be.an("object");
                    result.should.be.an("object");
                    result.should.have.property("id");
                    result.should.have.property("isActive");
                    result.should.have.property("isVega");
                    result.should.have.property("isVegan");
                    result.should.have.property("isToTakeHome");
                    result.should.have.property("dateTime");
                    result.should.have.property("maxAmountOfParticipants");
                    result.should.have.property("price");
                    result.should.have.property("imageUrl");
                    result.should.have.property("createDate");
                    result.should.have.property("updateDate");
                    result.should.have.property("name");
                    result.should.have.property("description");
                    result.should.have.property("allergenes");
                    result.should.have.property("cook");
                    result.cook.should.be.an("object");
                    result.cook.should.have.property("id");
                    result.cook.should.have.property("firstName");
                    result.cook.should.have.property("lastName");
                    result.cook.should.have.property("isActive");
                    result.cook.should.have.property("emailAdress");
                    result.cook.should.have.property("password");
                    result.cook.should.have.property("phoneNumber");
                    result.cook.should.have.property("roles");
                    result.cook.should.have.property("street");
                    result.cook.should.have.property("city");
                    done();
                });
        });
    });

    // UC-305 Delete meal
    describe("UC-305 Delete meal - DELETE /api/meal/:id", () => {
        // TODO:it("TC-305-1 Required field is missing");
        it("TC-305-2 Not logged in", (done) => {
            chai.request(server)
                .delete("/api/meal/1")
                .set("authorization", "Bearer " + jwt.sign({ userId: 1 }, "test"))
                .end((req, res) => {
                    res.body.should.be.an("object");
                    let { status, message } = res.body;
                    status.should.equals(401);
                    message.should.be.a("string").that.equals("Invalid token");
                    done();
                });
        });
        it("TC-305-3 Not the owner of this data", (done) => {
            chai.request(server)
                .delete("/api/meal/1")
                .set("authorization", "Bearer " + jwt.sign({ userId: 2 }, jwtSecretKey))
                .end((req, res) => {
                    res.body.should.be.an("object");
                    let { status, message } = res.body;
                    status.should.equals(403);
                    message.should.be.a("string").that.equals("You are not the owner of this meal");

                    done();
                });
        });
        it("TC-305-4 Meal doesn't exist", (done) => {
            chai.request(server)
                .delete("/api/meal/0")
                .set("authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
                .end((req, res) => {
                    res.should.be.an("object");
                    let { status, message } = res.body;
                    status.should.equals(404);
                    message.should.be.a("string").that.equals("Meal does not exist");
                    done();
                });
        });
        it("TC-305-5 Meal has been deleted successfully", (done) => {
            chai.request(server)
                .delete("/api/meal/1")
                .set("authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
                .end((req, res) => {
                    res.should.be.an("object");
                    let { status, message } = res.body;
                    status.should.equals(200);
                    message.should.be.a("string").that.equals("Meal has been deleted successfully.");
                    done();
                });
        });
    });
});
