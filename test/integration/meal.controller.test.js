const chai = require("chai");
const chaiHttp = require("chai-http");
const path = require("path");
const crypto = require("crypto");
const server = require(path.join(__dirname, "../../") + "/index");
chai.should();
chai.use(chaiHttp);

let deletableMealId;

// UC-301 Create a meal
describe("UC-301 Create a meal - POST /api/meal", () => {
    beforeEach((done) => {
        done();
    });
    it("TC-301-1 Required input is missing", (done) => {
        chai.request(server)
            .post("/api/meal")
            .send({
                //missing name
                description: "De pastaklassieker bij uitstek.",
                isActive: true,
                isVega: true,
                isVegan: true,
                isToTakeHome: true,
                dateTime: new Date(),
                imageUrl: "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
                allergenes: ["gluten", "noten", "test"],
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
    // it("TC-301-2 Not logged in");
    it("TC-201-3 Meal succesfully added", (done) => {
        chai.request(server)
            .post("/api/meal")
            .send({
                name: "Spaghetti Bolognese",
                description: "De pastaklassieker bij uitstek.",
                isActive: true,
                isVega: true,
                isVegan: true,
                isToTakeHome: true,
                dateTime: "1900-01-01",
                imageUrl: "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
                allergenes: ["gluten", "noten", "test"],
                maxAmountOfParticipants: 6,
                price: 6.75,
            })
            .end((req, res) => {
                res.should.be.an("object");
                let { status, result } = res.body;

                //store id that can be used for the delete test later on
                deletableMealId = result[result.length - 1].id;

                status.should.equals(201);
                done();
            });
    });
});

// UC-302 Update meal
describe("UC-302 Update meal - PUT /api/meal/:id", () => {
    beforeEach((done) => {
        done();
    });
    it("TC-302-1 Required input is missing", (done) => {
        chai.request(server)
            .put("/api/meal/1")
            .send({
                //missing name
                description: "De pastaklassieker bij uitstek.",
                isActive: true,
                isVega: true,
                isVegan: true,
                isToTakeHome: true,
                dateTime: "2022-04-30T23:10:31.775Z",
                imageUrl: "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
                allergenes: ["gluten", "noten", "test"],
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
    // it("TC-302-2 Not logged in");
    // it("TC-302-3 Not the owner of this data");
    it("TC-302-4 Meal doesn't exist", (done) => {
        chai.request(server)
            .put("/api/meal/0")
            .send({
                name: "Spaghetti Bolognese",
                description: "De pastaklassieker bij uitstek.",
                isActive: true,
                isVega: true,
                isVegan: true,
                isToTakeHome: true,
                dateTime: "2022-04-30T23:10:31.775Z",
                imageUrl: "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
                allergenes: ["gluten", "noten", "test"],
                maxAmountOfParticipants: 6,
                price: 6.75,
            })
            .end((req, res) => {
                res.should.be.an("object");
                let { status } = res.body;
                status.should.equals(404);
                done();
            });
    });
    it("TC-302-5 Meal has been updated successfully", (done) => {
        chai.request(server)
            .put("/api/meal/" + deletableMealId)
            .send({
                name: "Spaghetti Bolognese",
                description: "De pastaklassieker bij uitstek.",
                isActive: true,
                isVega: true,
                isVegan: true,
                isToTakeHome: true,
                dateTime: "2022-04-30T23:10:31.775Z",
                imageUrl: "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
                allergenes: ["gluten", "noten", "test"],
                maxAmountOfParticipants: 6,
                price: 6.75,
            })
            .end((req, res) => {
                res.should.be.an("object");
                let { status } = res.body;
                status.should.equals(201);
                done();
            });
    });
});

// UC-303 Get list of meals
describe("UC-303 Get list of meals - GET /api/meal", () => {
    beforeEach((done) => {
        done();
    });
    it("TC-303-1 Return list of meals", (done) => {
        chai.request(server)
            .get("/api/meal")
            .end((req, res) => {
                res.should.be.an("object");
                let { status, result } = res.body;
                status.should.equals(200);
                done();
            });
    });
});

// UC-304 Get list of meals
describe("UC-304 Get list of meals - GET /api/meal/:id", () => {
    beforeEach((done) => {
        done();
    });
    it("TC-304-1 Meal doesn't exist", (done) => {
        chai.request(server)
            .get("/api/meal/0")
            .end((req, res) => {
                res.should.be.an("object");
                let { status, result } = res.body;
                status.should.equals(404);
                done();
            });
    });
    it("TC-304-2 Return details of meal", (done) => {
        chai.request(server)
            .get("/api/meal/" + deletableMealId)
            .end((req, res) => {
                res.should.be.an("object");
                let { status, result } = res.body;
                status.should.equals(200);
                done();
            });
    });
});

// UC-305 Delete meal
describe("UC-305 Delete meal - DELETE /api/meal/:id", () => {
    beforeEach((done) => {
        done();
    });
    // it("TC-305-2 Not logged in");
    // it("TC-305-3 Not the owner of this data");
    it("TC-305-4 Meal doesn't exist", (done) => {
        chai.request(server)
            .delete("/api/meal/0")
            .end((req, res) => {
                res.should.be.an("object");
                let { status, result } = res.body;
                status.should.equals(404);
                done();
            });
    });
    it("TC-305-5 Meal has been deleted successfully", (done) => {
        chai.request(server)
            .delete("/api/meal/" + deletableMealId)
            .end((req, res) => {
                res.should.be.an("object");
                let { status, result } = res.body;
                status.should.equals(201);
                done();
            });
    });
});
