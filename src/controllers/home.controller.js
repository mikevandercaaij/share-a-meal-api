exports.getHomepage = (req, res) => {
    //show response on home directory
    res.status(200).json({
        code: 200,
        message: "This is my recreation of the Share-a-Meal api that has been used for our recent Share-a-Meal application.",
        course: "Programmeren 4",
        author: "Mike van der Caaij",
        studentNumber: 2184147,
    });

    //end response process
    res.end();
};
