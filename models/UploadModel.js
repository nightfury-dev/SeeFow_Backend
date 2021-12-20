const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UploadSchema = new Schema({
  email: {
    type: String,
    default: ''
  },
  files: [{
    path :{
      type: String,
      default: ''
    },
    date :{
      type: Date,
      default: ''
    }
  }],
});

module.exports = UploadModel = mongoose.model('uploads', UploadSchema);
