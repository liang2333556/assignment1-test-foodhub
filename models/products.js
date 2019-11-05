let mongoose = require('mongoose');

let ProductSchema = new mongoose.Schema({
        type: String,
        name:String,
        price:{type:Number,min:0,max:999},
        likes: {type: Number, default: 0}
    });

module.exports = mongoose.model('Product', ProductSchema);
