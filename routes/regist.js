var User = require('../models/users');
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');


mongoose.connect('mongodb://localhost:27017/foodhub',
    {useNewUrlParser: true, useUnifiedTopology: true});

var db = mongoose.connection;

db.on('error', function (err) {
    console.log('connection error', err);
});
db.once('open', function () {
    console.log('connected to database');
});



router.findOne = function(req, res) {

    // Use the Food model to find a single food
    User.find({ "_id" : req.params.id },function(err, food) {
        if (err)
            res.json({ message: 'User NOT Found!', errmsg : err } );
        else
            res.json(food);
    });
}



router.addUser = (req, res) => {

    res.setHeader("Content-Type", "application/json")

    var user = new User()

    user.name = req.body.name
    user.pwd = req.body.pwd


    user.save(function(err) {
        if (err)
            res.json({ message: "New user NOT Added!", errmsg : err } )
        else
            res.json({ message: "User Successfully Added!", data: user })
    })
}





module.exports = router
