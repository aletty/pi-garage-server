var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , passportLocalMongoose = require('passport-local-mongoose');

//User Schema
var userSchema = new Schema({
  name: {type: String},
  email: {type: String, unique: true},
  admin: {type: Boolean, required: true, default: false}
});

userSchema.plugin(passportLocalMongoose);

var userModel = mongoose.model('User', userSchema);

exports.userModel = userModel;