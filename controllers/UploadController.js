const async = require("async")
const checkAuthToken = require('../utils/checkAuthToken')
const getFilePath = require('../utils/getFilePath')
const fs = require('fs')
const UploadModel = require('../models/UploadModel')

exports.getAllFiles = (req, res) => {
  if (!checkAuthToken(req))
    return res.status(401).send("unzuthorized")

  const email = req.body.email
  const errors = {}

  UploadModel.findOne({ email }).then(upload => {
    if (upload) {
      res.json(upload.files)
    } else {
      errors.files = 'Files not found'
      return res.status(404).json(errors);
    }
  })
}

let MergeChunkFile = async (fullPath, chunkContent) => {
  let stream = fs.createWriteStream(fullPath, { flags: 'a' })
  stream.write(chunkContent, 'hex')
  stream.close()
}

let email = ""
exports.addFile = (req, res) => {
  if (req.files) {
    const errors = {}
    let avatar = ''
    let coverphoto = ''
    if (req.files) {
      try {
        if (req.files.image) {
          let uploadedFile = req.files.image
          let filepath = __dirname + '/../uploads/images/profile/' + req.body.address + '/' + uploadedFile.name
          uploadedFile.mv(filepath)
          avatar = req.body.address + '/' + uploadedFile.name
        }
      }
      catch (err) {
        errors.upload = 'Error while uploading file.'
        return res.status(500).json(errors)
      }
    }
  }
}

exports.removeFile = (req, res) => {
  // if (!checkAuthToken(req))
  //   return res.status(401).send("unzuthorized")
  let fileSave = ''
  let fname = ''
  if (req.files) {
    fname = req.files.chunkUpload.name
  } else {
    fname = req.body.chunkUpload
  }

  fileSave = getFilePath(email, fname, 0, true)

  if (fs.existsSync(fileSave)) {
    fs.unlink(fileSave, () => {
      console.log("file removed")
    })
  }

  res.sendStatus(200)
}