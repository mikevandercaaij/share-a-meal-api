const chai = require("chai");
const chaiHttp = require("chai-http");
const path = require("path");
const crypto = require("crypto");
const server = require(path.join(__dirname, "../../") + "/index");

chai.should();
chai.use(chaiHttp);

//TODO: Fix tests

// UC-201 Register as new user
describe("UC-201 Register as new user - POST /api/user", () => {
    beforeEach((done) => {
        done();
    });
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
                let { status, result } = res.body;
                status.should.equals(400);
                result.should.be.a("string").that.equals("First Name must be a string.");
                done();
            });
    });
    it("TC-201-2 Non valid Email Address", (done) => {
        chai.request(server)
            .post("/api/user")
            .send({
                firstName: "Klaas",
                lastName: "Tilburg",
                isActive: true,
                emailAdress: "ts.dsadas",
                password: "dmG!F]!!6cUwK7JQ",
                phoneNumber: "0612345678",
                roles: "editor,guest",
                street: "Hopstraat",
                city: "Amsterdam",
            })
            .end((req, res) => {
                res.should.be.an("object");
                let { status, result } = res.body;
                status.should.equals(400);
                result.should.be.a("string").that.equals("Email is not valid.");
                done();
            });
    });
    it("TC-201-3 Non valid Password", (done) => {
        chai.request(server)
            .post("/api/user")
            .send({
                firstName: "Klaas",
                lastName: "Tilburg",
                isActive: true,
                emailAdress: "ts.dsadas",
                password: "secret",
                phoneNumber: "0612345678",
                roles: "editor,guest",
                street: "Hopstraat",
                city: "Amsterdam",
            })
            .end((req, res) => {
                res.should.be.an("object");
                let { status, result } = res.body;
                status.should.equals(400);
                result.should.be.a("string").that.equals("Password's strength is weak. Please fill in a stronger one!");
                done();
            });
    });
    it("TC-201-4 User already exists", (done) => {
        chai.request(server)
            .post("/api/user")
            .send({
                id: 41,
                firstName: "Mike",
                lastName: "van der Caaij",
                isActive: 1,
                emailAdress: "m.vandercaaij@student.nl", //email thats already in use
                password: "dmG!F]!!6cUwK7JQ",
                phoneNumber: "0638719633",
                roles: "editor,guest",
                street: "Gareelwdsadaseg 11",
                city: "Heerle",
            })
            .end((req, res) => {
                res.should.be.an("object");
                let { status } = res.body;
                status.should.equals(409);
                done();
            });
    });
    it("TC-201-5 User has succesfully been registered", (done) => {
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
                let { status } = res.body;
                status.should.equals(201);
                done();
            });
    });
});
