const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  address: {
    type: String,
    default: ''
  },
  avatar: {
    type: String,
    default: ''
  },
  coverphoto: {
    type: String,
    default: ''
  },
  full_home_address: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: ''
  }
});

module.exports = UserModel = mongoose.model('users', UserSchema);
