var Essay = require('../models/userEssay');
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

router.findAll = function(req, res) {

    // Use the UserEssay model to find all userEssays
   Essay.find(function(err, essays) {
        if (err)
            res.send(err);
        else {
            // console.log(userEssays)
            res.json(essays);
        }
    });
}

router.findOne = function(req, res) {

    // Use the UserEssay model to find a single userEssay
    Essay.find({ "_id" : req.params.id },function(err, userEssay) {
        if (err)
            res.json({ message: 'Essay NOT Found!', errmsg : err } );
        else
            res.json(userEssay);
    });
}

router.addEssay = function(req, res) {

    var essay = new Essay();
    essay.author=req.body.author,
        essay.content=req.body.content,


    // console.log('Adding userEssay: ' + JSON.stringify(userEssay));

    // Save the userEssay and check for errors
   essay.save(function(err) {
        if (err)
            res.send(err);

        res.json({ message: 'Essay Added!', data: essay });
    });
}

router.deleteEssay = function(req, res) {

   Essay.findByIdAndRemove(req.params.id, function(err) {
        if (err)
            res.send(err);
        else
            res.json({ message: 'Essay Deleted!', data: Essay});
    });
}

router.incrementLikes = function(req, res) {

    Essay.findById(req.params.id, function(err,essay) {
        if (err)
            res.send(err);
        else {
            essay.likes += 1;
           essay.save(function (err) {
                if (err)
                    res.send(err);
                else
                    res.json({ message: 'Submit your likes successfully!', data: essay });
            });
        }
    });
}

module.exports = router;

