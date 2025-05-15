const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const  passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new Schema({
    email : {
        type : String ,
        required : true  
    },
    type : {
        type : String ,
        required : true
    },
    username : {
        type : String ,
        required : true
    },
    googleId: String
});

UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User" , UserSchema);