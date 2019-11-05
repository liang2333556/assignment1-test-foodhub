var mongoose = require('mongoose');

var FoodSchema = new mongoose.Schema({
    type: String,

     author:String,
    likes: {type: Number, default: 0}
});

module.exports = mongoose.model('Food', FoodSchema);