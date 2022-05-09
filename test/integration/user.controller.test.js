process.env.DB_DATABASE = process.env.DB_DATABASE || "share-a-meal-testdb";

const chai = require("chai");
const chaiHttp = require("chai-http");
const path = require("path");
const crypto = require("crypto");
const server = require(path.join(__dirname, "../../") + "/index");
chai.should();
chai.use(chaiHttp);

let deletableUserId;

//IMPORTANT//
/**
 * ALL TEST THAT HAVE BEEN COMMENT OUT ARE NOT POSSIBLE TO DO WITH THE
 * CURRENT STATE OF THE API/HOW FAR WE HAVE TO BE FOR NOW
 * (either due to authorization or parameters that need to be added like ?limit= or ?name=)
 *
 * I have discussed this with Robin before handing in my assignment.
 *
 * no need to empty database beforehands since we create a user that we delete in a later test
 * the database also holds 4 users by default (that are not touched because we only delete the user we just create.
 * All the other request that need a user like updating or get user also use the user that has just been created.)
 **/

// UC-201 Register as new user
describe("UC-201 Register as new user - POST /api/user", () => {
    it("TC-201-1 Required input is missing", (done) => {
        chai.request(server)
            .post("/api/user")
            .send({
                //firstName missing
                lastName: "van der Caaij",
                street: "Gareelweg 11",
                city: "Heerle",
                isActive: true,
                emailAddress: "m.vandercaaij@student.avans.nl",
                password: "dmG!F]!!6cUwK7JQ",
                phoneNumber: "06 38719633",
            })
            .end((req, res) => {
                res.should.be.an("object");
                let { status, message } = res.body;
                status.should.equals(400);
                message.should.be.a("string").that.equals("First Name must be a string.");
                done();
            });
    });
    // it("TC-201-2 Non valid Email Address", (done) => {
    //     chai.request(server)
    //         .post("/api/user")
    //         .send({
    //             firstName: "Klaas",
    //             lastName: "Tilburg",
    //             isActive: true,
    //             emailAdress: "ts.dsadas",
    //             password: "dmG!F]!!6cUwK7JQ",
    //             phoneNumber: "0612345678",
    //             roles: "editor,guest",
    //             street: "Hopstraat",
    //             city: "Amsterdam",
    //         })
    //         .end((req, res) => {
    //             res.should.be.an("object");
    //             let { status, result } = res.body;
    //             status.should.equals(400);
    //             result.should.be.a("string").that.equals("Email is not valid.");
    //             done();
    //         });
    // });
    // it("TC-201-3 Non valid Password", (done) => {
    //     chai.request(server)
    //         .post("/api/user")
    //         .send({
    //             firstName: "Klaas",
    //             lastName: "Tilburg",
    //             isActive: true,
    //             emailAdress: "ts.dsadas",
    //             password: "secret",
    //             phoneNumber: "0612345678",
    //             roles: "editor,guest",
    //             street: "Hopstraat",
    //             city: "Amsterdam",
    //         })
    //         .end((req, res) => {
    //             res.should.be.an("object");
    //             let { status, result } = res.body;
    //             status.should.equals(400);
    //             result.should.be.a("string").that.equals("Password's strength is weak. Please fill in a stronger one!");
    //             done();
    //         });
    // });
    it("TC-201-4 User already exists", (done) => {
        chai.request(server)
            .post("/api/user")
            .send({
                firstName: "Klaas",
                lastName: "Tilburg",
                isActive: true,
                emailAdress: "m.vandullemen@server.nl", //email that exists
                password: "dmG!F]!!6cUwK7JQ",
                phoneNumber: "0612345678",
                roles: "editor,guest",
                street: "Hopstraat",
                city: "Amsterdam",
            })
            .end((req, res) => {
                res.should.be.an("object");
                let { status } = res.body;
                status.should.equals(409);
                done();
            });
    });
    it("TC-201-5 User has been registered succesfully", (done) => {
        chai.request(server)
            .post("/api/user")
            .send({
                firstName: "Klaas",
                lastName: "Tilburg",
                isActive: true,
                emailAdress: `${crypto.randomBytes(25).toString("hex")}@gmail.com`,
                password: "dmG!F]!!6cUwK7JQ",
                phoneNumber: "0612345678",
                roles: "editor,guest",
                street: "Hopstraat",
                city: "Amsterdam",
            })
            .end((req, res) => {
                res.should.be.an("object");
                let { status, result } = res.body;

                //store id that can be used for the delete test later on
                deletableUserId = result[result.length - 1].id;

                status.should.equals(201);
                done();
            });
    });
});

// UC-202 Overview of users
// describe("UC-202 Overview of users - GET /api/user", () => {
//     it("TC-202-1 Show zero users");
//     it("TC-202-2 Show two users");
//     it("TC-202-3 Show users using a searchterm with non-existing name");
//     it("TC-202-4 User ID doesn't exist");
//     it("TC-202-5 Show users using a searchterm with isActive status of true");
//     it("TC-202-6 Show users using a searchterm with existing name");
// });
//
// // UC-203 Get users profile
// describe("UC-203 Get users profile - GET /api/user/profile", () => {
//     it("TC-203-1 Invalid token");
//     it("TC-203-2 Valid token and user exists");
// });

// UC-204 Get user details
describe("UC-204 Get user details - GET /api/user/:id", () => {
    // it("TC-204-1 Invalid token");
    it("TC-204-2 User ID doesn't exists", (done) => {
        chai.request(server)
            .get("/api/user/0")
            .end((req, res) => {
                let { status } = res.body;
                status.should.equals(404);
                done();
            });
    });
    it("TC-204-3 User ID exists", (done) => {
        chai.request(server)
            .get("/api/user/" + deletableUserId)
            .end((req, res) => {
                let { status } = res.body;
                status.should.equals(200);
                done();
            });
    });
});

// UC-205 Modify user
describe("UC-205 Modify user - PUT /api/user/:id", () => {
    it("TC-205-1 Required field missing", (done) => {
        chai.request(server)
            .put("/api/user/1")
            .send({
                // missing firstname should end up failing
                lastName: "Tilburg",
                isActive: true,
                emailAdress: `${crypto.randomBytes(25).toString("hex")}@gmail.com`,
                password: "dmG!F]!!6cUwK7JQ",
                phoneNumber: "0612345678",
                roles: "editor,guest",
                street: "Hopstraat",
                city: "Amsterdam",
            })
            .end((req, res) => {
                let { status, message } = res.body;
                status.should.equals(400);
                message.should.be.a("string").that.equals("First Name must be a string.");
                done();
            });
    });
    // it("TC-205-2 Invalid postal code");
    // it("TC-205-3 Invalid phone number", (done) => {
    //     chai.request(server)
    //         .put("/api/user/1")
    //         .send({
    //             firstName: "Klaas",
    //             lastName: "Tilburg",
    //             isActive: true,
    //             emailAdress: `${crypto.randomBytes(25).toString("hex")}@gmail.com`,
    //             password: "dmG!F]!!6cUwK7JQ",
    //             phoneNumber: "000",
    //             roles: "editor,guest",
    //             street: "Hopstraat",
    //             city: "Amsterdam",
    //         })
    //         .end((req, res) => {
    //             let { status, result } = res.body;
    //             status.should.equals(400);
    //             result.should.be.a("string").that.equals("Phone number is invalid.");
    //             done();
    //         });
    // });
    it("TC-205-4 User doesn't exists", (done) => {
        chai.request(server)
            .put("/api/user/0")
            .send({
                firstName: "Klaas",
                lastName: "Tilburg",
                isActive: true,
                emailAdress: `${crypto.randomBytes(25).toString("hex")}@gmail.com`,
                password: "dmG!F]!!6cUwK7JQ",
                phoneNumber: "0612345678",
                roles: "editor,guest",
                street: "Hopstraat",
                city: "Amsterdam",
            })
            .end((req, res) => {
                let { status } = res.body;
                status.should.equals(404);
                done();
            });
    });
    // it("TC-204-5 Not logged in");
    it("TC-205-6 User has been modified successfully", (done) => {
        chai.request(server)
            .put("/api/user/" + deletableUserId)
            .send({
                firstName: "Klaas",
                lastName: "Tilburg",
                isActive: true,
                emailAdress: `${crypto.randomBytes(25).toString("hex")}@gmail.com`,
                password: "dmG!F]!!6cUwK7JQ",
                phoneNumber: "0612345678",
                roles: "editor,guest",
                street: "Hopstraat",
                city: "Amsterdam",
            })
            .end((req, res) => {
                let { status } = res.body;
                status.should.equals(201);
                done();
            });
    });
});

// UC-206 Delete user
describe("UC-206 Delete user - DELETE /api/user/:id", () => {
    it("TC-206-1 User doesn't exist", (done) => {
        chai.request(server)
            .delete("/api/user/0")
            .end((req, res) => {
                let { status } = res.body;
                status.should.equals(404);
                done();
            });
    });
    // it("TC-206-2 Not logged in");
    // it("TC-206-3 Actor is not the owner");
    it("TC-206-4 User has been deleted successfully", (done) => {
        chai.request(server)
            .delete("/api/user/" + deletableUserId)
            .end((req, res) => {
                let { status } = res.body;
                status.should.equals(201);
                done();
            });
    });
});
