const isEmpty = require('../validation/is-empty')
const checkAuthToken = require('../utils/checkAuthToken')
const UserModel = require('../models/UserModel')
const bcrypt = require('bcryptjs')


exports.getAllProfile = (req, res) => {
  if (!checkAuthToken(req))
    return res.status(401).send("unzuthorized")

  const errors = {}

  UserModel.findOne({ email: req.body.email }).then(user => {
    if (user) {
      res.json(user)
    } else {
      errors.profile = 'Profile not found'
      return res.status(404).json(errors)
    }
  })
}

exports.saveMine = (req, res) => {
  if (!checkAuthToken(req))
    return res.status(401).send("unzuthorized")

  const errors = {}
  let avatar = ''
  let coverphoto = ''
  console.log(req.files.avatar)
  if (req.files) {
    try {
      if (req.files.avatar) {
        let uploadedFile = req.files.avatar
        let filepath = __dirname + '/../uploads/images/profile/' + req.body.email.split('@')[0] + '/' + uploadedFile.name
        uploadedFile.mv(filepath)
        avatar = req.body.email.split('@')[0] + '/' + uploadedFile.name
      }
      if (req.files.coverphoto) {
        let uploadedFile = req.files.coverphoto
        let filepath = __dirname + '/../uploads/images/profile/' + req.body.email.split('@')[0] + '/' + uploadedFile.name
        uploadedFile.mv(filepath)
        coverphoto = req.body.email.split('@')[0] + '/' + uploadedFile.name
      }
    }
    catch (err) {
      errors.upload = 'Error while uploading file.'
      return res.status(500).json(errors)
    }
  }

  const { email, location } = req.body
  let setData = {
    location,
  }
  if (!isEmpty(avatar)) {
    setData.avatar = avatar
  }
  if (!isEmpty(coverphoto)) {
    setData.coverphoto = coverphoto
  }
  UserModel.findOneAndUpdate(
    { email },
    {
      $set: setData
    }
  )
    .then(user => res.json(user))
    .catch(err => console.log(err))
}


exports.savePayment = (req, res) => {
  if (!checkAuthToken(req))
    return res.status(401).send("unzuthorized")

  const { email,full_legal_name, full_home_address, phone_number, credit_card, bank_wire, card_number, Experation_date, CVV } = req.body
  let setData = {
    full_legal_name, full_home_address, phone_number, credit_card, bank_wire, card_number, Experation_date, CVV
  }
  UserModel.findOneAndUpdate(
    { email },
    {
      $set: setData
    }
  )
    .then(user => res.json(user))
    .catch(err => console.log(err))
}


exports.changePassword = (req, res) => {
  if (!checkAuthToken(req))
    return res.status(401).send("unzuthorized")

  const errors = {}

  const { email, currentpass, newpass } = req.body
  UserModel.findOne({ email }).then(user => {
    bcrypt.compare(currentpass, user.password).then(isMatch => {
      if (isMatch) {
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newpass, salt, (err, hash) => {
            if (err) throw err
            UserModel.findOneAndUpdate(
              { email },
              {
                $set: { password: hash }
              }
            )
              .then(user => res.json(user))
              .catch(err => console.log(err))
          })
        })
      } else {
        errors.password = 'Password incorrect'
        return res.status(400).json(errors)
      }
    })
  })
}
