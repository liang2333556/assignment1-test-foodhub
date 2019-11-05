/*eslint no-unused-vars: "off" */

var PRODUCT = require("../models/product")
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
router.searchProduct = (req, res) => {
  res.setHeader("Content-Type", "application/json")
  var reg = new RegExp(req.body.name, "i")
  PRODUCT.find({name: {$regex: reg}}, function (err, product) {
    if (err) {
      res.json({message: "Product NOT Found!", errmsg: err})
    } else {
      res.send(JSON.stringify(product, null, 5))
    }
  })
}



module.exports = router
