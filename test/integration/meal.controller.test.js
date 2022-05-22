process.env.DB_DATABASE = "share-a-meal-testdb";

const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("./../../index");
const dbconnection = require("./../../database/dbconnection");
const jwt = require("jsonwebtoken");
const { jwtSecretKey } = require("./../../src/config/config");
const assert = require("assert");

chai.should();
chai.use(chaiHttp);

const CLEAR_MEAL_TABLE = "DELETE IGNORE FROM `meal`;";
const CLEAR_PARTICIPANTS_TABLE = "DELETE IGNORE FROM `meal_participants_user`;";
const CLEAR_USERS_TABLE = "DELETE IGNORE FROM `user`;";
const CLEAR_DB = CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE;

const INSERT_MEALS = "INSERT INTO `meal` (`id`, `name`, `description`, `imageUrl`, `maxAmountOfParticipants`, `price`,  `cookId`) VALUES" + "(1, 'Meal A', 'description', 'image url', 5, 6.50, 1)," + "(2, 'Meal B', 'description', 'image url', 5, 6.50, 2);";
const INSERT_USER = "INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES" + '(1, "first", "last", "test@server.nl", "secret", "street", "city");';
const INSERT_SECOND_USER = "INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES" + '(2, "first2", "last2", "test2@server.nl", "secret", "street2", "city2");';

const INSERT_PARTICIPANTS = "INSERT INTO `meal_participants_user` VALUES (1,1),(1,2),(2,2)";

// UC-300 Meal tests
describe("UC-300 Meal tests - POST /api/user", () => {
    beforeEach((done) => {
        dbconnection.getConnection((err, connection) => {
            if (err) throw err;

            connection.query(CLEAR_DB + INSERT_USER + INSERT_SECOND_USER + INSERT_MEALS + INSERT_PARTICIPANTS, (err, results, fields) => {
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
                    let { status, message } = res.body;
                    status.should.equals(400);
                    message.should.be.a("string").that.equals("Name must be a string.");
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
                    isActive: true,
                    isVega: true,
                    isVegan: true,
                    isToTakeHome: true,
                    dateTime: "2022-05-20T08:30:53.232Z",
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
                    assert.deepEqual(result, {
                        id: result.id,
                        isActive: true,
                        isVega: true,
                        isVegan: true,
                        isToTakeHome: true,
                        dateTime: "2022-05-20T06:30:53.000Z",
                        maxAmountOfParticipants: 6,
                        price: 6.75,
                        imageUrl: "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
                        createDate: result.createDate,
                        updateDate: result.updateDate,
                        name: "Spaghetti Bolognese",
                        description: "De pastaklassieker bij uitstek.",
                        allergenes: ["gluten", "noten"],
                        cook: {
                            id: 1,
                            firstName: "first",
                            lastName: "last",
                            isActive: true,
                            emailAdress: "test@server.nl",
                            phoneNumber: "-",
                            roles: ["editor", "guest"],
                            street: "street",
                            city: "city",
                        },
                        participants: [
                            {
                                id: 1,
                                firstName: "first",
                                lastName: "last",
                                isActive: false,
                                emailAdress: "test@server.nl",
                                phoneNumber: "-",
                                roles: ["editor", "guest"],
                                street: "street",
                                city: "city",
                            },
                        ],
                    });
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
                    maxAmountOfParticipants: 6,
                    price: 2.5,
                })
                .end((req, res) => {
                    res.should.be.an("object");
                    let { status, message } = res.body;
                    status.should.equals(400);
                    message.should.be.a("string").that.equals("Name must be a string.");
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
                    status.should.equals(200);
                    result.should.be.an("object");
                    assert.deepEqual(result, {
                        id: 1,
                        isActive: true,
                        isVega: true,
                        isVegan: true,
                        isToTakeHome: true,
                        dateTime: result.dateTime,
                        maxAmountOfParticipants: 6,
                        price: 6.75,
                        imageUrl: "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
                        createDate: result.createDate,
                        updateDate: result.updateDate,
                        name: "Spaghetti Bolognese",
                        description: "De pastaklassieker bij uitstek.",
                        allergenes: [],
                        cook: {
                            id: 1,
                            firstName: "first",
                            lastName: "last",
                            isActive: true,
                            emailAdress: "test@server.nl",
                            phoneNumber: "-",
                            roles: ["editor", "guest"],
                            street: "street",
                            city: "city",
                        },
                        participants: [
                            {
                                id: 1,
                                firstName: "first",
                                lastName: "last",
                                isActive: false,
                                emailAdress: "test@server.nl",
                                phoneNumber: "-",
                                roles: ["editor", "guest"],
                                street: "street",
                                city: "city",
                            },
                            {
                                city: "city2",
                                emailAdress: "test2@server.nl",
                                firstName: "first2",
                                id: 2,
                                isActive: false,
                                lastName: "last2",
                                phoneNumber: "-",
                                roles: ["editor", "guest"],
                                street: "street2",
                            },
                        ],
                    });

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

                    assert.deepEqual(result, [
                        {
                            id: 1,
                            isActive: false,
                            isVega: false,
                            isVegan: false,
                            isToTakeHome: true,
                            dateTime: result[0].dateTime,
                            maxAmountOfParticipants: 5,
                            price: 6.5,
                            imageUrl: "image url",
                            createDate: result[0].createDate,
                            updateDate: result[0].updateDate,
                            name: "Meal A",
                            description: "description",
                            allergenes: [],
                            cook: {
                                id: 1,
                                firstName: "first",
                                lastName: "last",
                                isActive: true,
                                emailAdress: "test@server.nl",
                                phoneNumber: "-",
                                roles: ["editor", "guest"],
                                street: "street",
                                city: "city",
                            },
                            participants: [
                                {
                                    id: 1,
                                    firstName: "first",
                                    lastName: "last",
                                    isActive: false,
                                    emailAdress: "test@server.nl",
                                    phoneNumber: "-",
                                    roles: ["editor", "guest"],
                                    street: "street",
                                    city: "city",
                                },
                                {
                                    city: "city2",
                                    emailAdress: "test2@server.nl",
                                    firstName: "first2",
                                    id: 2,
                                    isActive: false,
                                    lastName: "last2",
                                    phoneNumber: "-",
                                    roles: ["editor", "guest"],
                                    street: "street2",
                                },
                            ],
                        },
                        {
                            id: 2,
                            isActive: false,
                            isVega: false,
                            isVegan: false,
                            isToTakeHome: true,
                            dateTime: result[1].dateTime,
                            maxAmountOfParticipants: 5,
                            price: 6.5,
                            imageUrl: "image url",
                            createDate: result[1].createDate,
                            updateDate: result[1].updateDate,
                            name: "Meal B",
                            description: "description",
                            allergenes: [],
                            cook: {
                                id: 2,
                                firstName: "first2",
                                lastName: "last2",
                                isActive: true,
                                emailAdress: "test2@server.nl",
                                phoneNumber: "-",
                                roles: ["editor", "guest"],
                                street: "street2",
                                city: "city2",
                            },
                            participants: [
                                {
                                    city: "city2",
                                    emailAdress: "test2@server.nl",
                                    firstName: "first2",
                                    id: 2,
                                    isActive: false,
                                    lastName: "last2",
                                    phoneNumber: "-",
                                    roles: ["editor", "guest"],
                                    street: "street2",
                                },
                            ],
                        },
                    ]);

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
                    assert.deepEqual(result, {
                        id: 1,
                        isActive: false,
                        isVega: false,
                        isVegan: false,
                        isToTakeHome: true,
                        dateTime: result.dateTime,
                        maxAmountOfParticipants: 5,
                        price: 6.5,
                        imageUrl: "image url",
                        createDate: result.createDate,
                        updateDate: result.updateDate,
                        name: "Meal A",
                        description: "description",
                        allergenes: [],
                        cook: {
                            id: 1,
                            firstName: "first",
                            lastName: "last",
                            isActive: true,
                            emailAdress: "test@server.nl",
                            phoneNumber: "-",
                            roles: ["editor", "guest"],
                            street: "street",
                            city: "city",
                        },
                        participants: [
                            {
                                city: "city",
                                emailAdress: "test@server.nl",
                                firstName: "first",
                                id: 1,
                                isActive: false,
                                lastName: "last",
                                phoneNumber: "-",
                                roles: ["editor", "guest"],
                                street: "street",
                            },
                            {
                                city: "city2",
                                emailAdress: "test2@server.nl",
                                firstName: "first2",
                                id: 2,
                                isActive: false,
                                lastName: "last2",
                                phoneNumber: "-",
                                roles: ["editor", "guest"],
                                street: "street2",
                            },
                        ],
                    });

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

    // UC-401 Sign up for meal
    describe("UC-401 Sign up for meal - GET /api/meal/:id/participate", () => {
        it("TC-401-1 Not logged in", (done) => {
            chai.request(server)
                .get("/api/meal/1/participate")
                .set("authorization", "Bearer " + jwt.sign({ userId: 1 }, "test"))
                .end((req, res) => {
                    res.body.should.be.an("object");
                    let { status, message } = res.body;
                    status.should.equals(401);
                    message.should.be.a("string").that.equals("Invalid token");
                    done();
                });
        });
        it("TC-401-2 Meal does not exist", (done) => {
            chai.request(server)
                .get("/api/meal/4/participate")
                .set("authorization", "Bearer " + jwt.sign({ userId: 2 }, jwtSecretKey))
                .end((req, res) => {
                    res.body.should.be.an("object");
                    let { status, message } = res.body;
                    status.should.equals(404);
                    message.should.be.a("string").that.equals("Meal does not exist.");
                    done();
                });
        });
        it("TC-401-3 Successfully signed up", (done) => {
            chai.request(server)
                .get("/api/meal/2/participate")
                .set("authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
                .end((req, res) => {
                    res.should.be.an("object");
                    let { status, result } = res.body;
                    status.should.equals(200);
                    assert.deepEqual(result, {
                        currentlyParticipating: true,
                        currentAmountOfParticipants: 2,
                    });

                    done();
                });
        });
    });
    // UC-402 Sign out for meal
    describe("UC-402 Sign out for meal - GET /api/meal/:id/participate", () => {
        it("TC-401-1 Not logged in", (done) => {
            chai.request(server)
                .get("/api/meal/1/participate")
                .set("authorization", "Bearer " + jwt.sign({ userId: 1 }, "test"))
                .end((req, res) => {
                    res.body.should.be.an("object");
                    let { status, message } = res.body;
                    status.should.equals(401);
                    message.should.be.a("string").that.equals("Invalid token");
                    done();
                });
        });
        it("TC-402-2 Meal does not exist", (done) => {
            chai.request(server)
                .get("/api/meal/4/participate")
                .set("authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
                .end((req, res) => {
                    res.body.should.be.an("object");
                    let { status, message } = res.body;
                    status.should.equals(404);
                    message.should.be.a("string").that.equals("Meal does not exist.");
                    done();
                });
        });
        it("TC-402-3 Successfully signed out", (done) => {
            chai.request(server)
                .get("/api/meal/1/participate")
                .set("authorization", "Bearer " + jwt.sign({ userId: 2 }, jwtSecretKey))
                .end((req, res) => {
                    res.should.be.an("object");
                    let { status, result } = res.body;
                    status.should.equals(200);
                    assert.deepEqual(result, {
                        currentlyParticipating: false,
                        currentAmountOfParticipants: 1,
                    });

                    done();
                });
        });
    });
});
