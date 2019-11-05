/*eslint no-unused-vars: "off" */

var Food = require("../models/foods")
var express = require("express")
var router = express.Router()
var mongoose = require("mongoose")


mongoose.connect("mongodb://localhost:27017/foodhub",
  {useNewUrlParser: true, useUnifiedTopology: true})

var db = mongoose.connection

db.on("error", function (err) {
  console.log("connection error", err)
})
db.once("open", function () {
  console.log("connected to database")
})

router.findAll = function(req, res) {

  // Use the Food model to find all foods
  Food.find(function(err, foods) {
    if (err)
      res.send(err)
    else {
      // console.log(foods)
      res.json(foods)
    }
  })
}

router.findOne = function(req, res) {

  // Use the Food model to find a single food
  Food.find({ "_id" : req.params.id },function(err, food) {
    if (err)
      res.json({ message: "Food NOT Found!", errmsg : err } )
    else
      res.json(food)
  })
}

router.addFood = function(req, res) {

  var food = new Food()

  food.type = req.body.type
  food.author = req.body.author

  // console.log('Adding food: ' + JSON.stringify(food));

  // Save the food and check for errors
  food.save(function(err) {
    if (err)
      res.send(err)

    res.json({ message: "Food Added!", data: food })
  })
}

router.deleteFood = function(req, res) {

  Food.findByIdAndRemove(req.params.id, function(err) {
    if (err)
      res.send(err)
    else
      res.json({ message: "Food Deleted!", data: Food})
  })
}

router.incrementLikes = function(req, res) {

  Food.findById(req.params.id, function(err,food) {
    if (err)
      res.send(err)
    else {
      food.likes += 1
      food.save(function (err) {
        if (err)
          res.send(err)
        else
          res.json({ message: "Submit your likes successfully!", data: food })
      })
    }
  })
}

module.exports = router

