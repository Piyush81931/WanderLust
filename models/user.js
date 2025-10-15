const { required } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = Schema({
    email:{
        type:String,
        required: true,
    },
    role: {
        type: String,
        enum: ['user', 'owner'],
        default: 'user',
      }
})

userSchema.plugin(passportLocalMongoose); // for adding default(name password) with hashing and salting
module.exports = mongoose.model("User", userSchema);