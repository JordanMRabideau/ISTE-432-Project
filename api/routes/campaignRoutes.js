module.exports = app => {
    const router = require("express").Router();

    router.get("/test", function(req, res) {
        return res.send({message: "Test passsed"})
    })

    app.use('/api', router)
}