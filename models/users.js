let mongoose = require('mongoose');

let UserSchema = new mongoose.Schema({
        name: {type:String,required:true},
        pwd: {type:String,required:true,minlength:3,maxlength:10},

    });

module.exports = mongoose.model('User', UserSchema);
