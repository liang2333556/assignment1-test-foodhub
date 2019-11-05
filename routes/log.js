/*eslint no-unused-vars: "off" */

var User = require("../models/users")
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



router.logUser = (req, res) => {

  res.setHeader("Content-Type", "application/json")



  User.find({"name": req.body.name,"pwd":req.body.pwd}, function (err, user) {
    if (err){
      res.json({message: "User NOT Found!", errmsg: err})}
    else{
      res.send(JSON.stringify(user, null, 5))}
  })
}


module.exports = router
