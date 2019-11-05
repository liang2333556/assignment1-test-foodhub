var Order = require('../models/order');
var express = require('express');
var User = require('../models/users');

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

    Order.find(function(err, orders) {
        if (err)
            res.send(err);
        else {
            // console.log(foods)
            res.json(orders);
        }
    });
}



router.findOne = function(req, res) {

    // Use the Food model to find a single food
    Order.find({ "_id" : req.params.id },function(err, order) {
        if (err)
            res.json({ message: 'Food NOT Found!', errmsg : err } );
        else
            res.json(order);
    });
}



router.addOrder = (req, res) => {

    res.setHeader("Content-Type", "application/json")

    var order = new Order()

    order.customerID= req.body.customerID,
    order.productList=req.body.productList,




    User.findById(req.body.customerID, function(err) {
        if (err)
            res.json({ message: "Fail to submit!", errmsg : err } )
        else {
            order.save(function (err) {
                if (err)
                    res.json({message: "Order NOT Added!", errmsg: err})
                else
                    res.json({message: "Order Successfully Added!", data: order})

            })
        }
    })


}





module.exports = router