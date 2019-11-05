let mongoose = require('mongoose');

let orderSchema = new mongoose.Schema({


        customerID:String,         //用户id
        productList: Array,       //商品列表




    });

module.exports = mongoose.model('Order', orderSchema);
