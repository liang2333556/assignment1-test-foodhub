let mongoose = require('mongoose');

let EssaySchema = new mongoose.Schema({
        author: String,
        content:String,
        date:Date,
        likes:Number

    });

module.exports = mongoose.model('Essay', EssaySchema);


