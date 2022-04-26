const chai = require("chai");
const chaiHttp = require("chai-http");
let database = [];

const path = require("path");
const server = require(path.join(__dirname, "../../") + "/index");

chai.should();
chai.use(chaiHttp);

describe("Manage users", () => {
    describe("UC-201 register user api/user", () => {
        beforeEach((done) => {
            database = [];
            done();
        });
        it("When a required input is missing, a valid error should be returned", (done) => {
            chai.request(server)
                .post("/api/user")
                .send({
                    //firstName missing
                    lastName: "van der Caaij",
                    street: "Gareelwdsadaseg 11",
                    city: "Heerle",
                    isActive: true,
                    emailAddress: "m.vandercaaij@student.avans.nl",
                    password: "geheim",
                    phoneNumber: "06 38719633",
                })
                .end((req, res) => {
                    res.should.be.an("object");
                    let { status, result } = res.body;
                    status.should.equals(400);
                    result.should.be.a("string").that.equals("First Name must be a string");
                    done();
                });
        });
        it.skip("other test");
    });
});
