//instantiate installed modules
const express = require("express");
const app = express();
const userRouter = require(__dirname + "/src/routes/user.routes");

//set port to either predefined server port or 3000 that can be used for local testing
const port = process.env.PORT || 3000;

//enable app to parse json
app.use(express.json());

//load al user routes
app.use(userRouter);

//when there is an invalid request
app.all("*", (req, res) => {
    res.status(400).json({
        status: 400,
        result: "Endpoint not found.",
    });

    //end response process
    res.end();
});

//make server listen to given ports
app.listen(port, () => {
    console.log("Server running at " + port);
});
