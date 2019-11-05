/*eslint no-unused-vars: "off" */

var Product = require("../models/products")
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

  // Use the Product model to find all products
  Product.find(function(err, products) {
    if (err)
      res.send(err)
    else {
      // console.log(products)
      res.json(products)
    }
  })
}

router.findOne = function(req, res) {

  // Use the Product model to find a single product
  Product.find({ "_id" : req.params.id },function(err, product) {
    if (err)
      res.json({ message: "Product NOT Found!", errmsg : err } )
    else
      res.json(product)
  })
}

router.addProduct = function(req, res) {

  var product = new Product()

  product.type=req.body.type,
  product.name=req.body.name,
  product.price=req.body.price,
  product.likes=req.body.likes,



  // console.log('Adding product: ' + JSON.stringify(product));

  // Save the product and check for errors
  product.save(function(err) {
    if (err)
      res.send(err)

    res.json({ message: "Product Added!", data: product })
  })
}

router.deleteProduct = function(req, res) {

  Product.findByIdAndRemove(req.params.id, function(err) {
    if (err)
      res.send(err)
    else
      res.json({ message: "Product Deleted!", data: Product})
  })
}

router.incrementLikes = function(req, res) {

  Product.findById(req.params.id, function(err,product) {
    if (err)
      res.send(err)
    else {
      product.likes += 1
      product.save(function (err) {
        if (err)
          res.send(err)
        else
          res.json({ message: "Submit your likes successfully!", data: product })
      })
    }
  })
}

module.exports = router

