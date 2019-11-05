let mongoose = require('mongoose');

let productSchema = new mongoose.Schema({
    name:String,
    });

module.exports = mongoose.model('PRODUCT', productSchema);
