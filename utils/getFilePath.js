const fs = require('fs')

const getFilePath = (email, fname, num, isUploading) => {
  if (isUploading) {
    return __dirname + '/../uploads/uploading/' + email.split('@')[0] + '/'  + fname + ".part"
  } else {
    if (!fs.existsSync(__dirname + '/../uploads/uploaded/' + email.split('@')[0])){
      fs.mkdirSync(__dirname + '/../uploads/uploaded/' + email.split('@')[0], { recursive: true })
    }
    return __dirname + '/../uploads/uploaded/' + email.split('@')[0] + '/'  + num + '_' + fname
  }
}

module.exports = getFilePath