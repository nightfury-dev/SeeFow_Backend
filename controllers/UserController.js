const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../config/keys");
const passport = require("passport");
const async = require("async");
const isEmpty = require("../validation/is-empty");
const checkAuthToken = require("../utils/checkAuthToken");

const UserModel = require("../models/UserModel");

exports.check = async (req, res) => {
  try {
    const user = await UserModel.findOne({ address: req.body.address });
    if (user) {
      res.status(200).send({ user: user, exist: true });
    } else {
      res.status(200).send({ exist: false });
    }
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.search = async (req, res) => {
  try {
    const user = await UserModel.findOne({ address: req.body.address });
    if (user) {
      res.status(200).send({ user: user, exist: true });
    } else {
      res.status(200).send({ exist: false });
    }
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.add = (req, res) => {
  // if (req.files) {
  const errors = {};
  let avatar = "";
  try {
    if (Boolean(req.files)) {
      let uploadedFile = req.files.image;
      let filepath =
        __dirname +
        "/../uploads/images/profile/" +
        req.body.address +
        "/" +
        uploadedFile.name;
      uploadedFile.mv(filepath);
      avatar = req.body.address + "/" + uploadedFile.name;
    }
    UserModel.findOne({ address: req.body.address }).then((user) => {
      if (user) {
        errors.address = "address already exists";
        return res.status(400).json(errors);
      } else {
        const newUser = new UserModel({
          address: req.body.address,
          bio: req.body.bio,
          avatar: avatar,
        });
        newUser
          .save()
          .then((user) => res.status(200).send(user))
          .catch((err) => console.log(err));
      }
    });
  } catch (err) {
    errors.upload = "Error while uploading file.";
    return res.status(500).json(errors);
  }
  // }
};

exports.updateUser = async (req, res) => {
  try {
    const { bio, address } = req.body;
    let updateBody = {
      bio: bio,
    };
    if (req.files && typeof image !== "string") {
      if (req.files.image) {
        let uploadedFile = req.files.image;
        let filepath =
          __dirname +
          "/../uploads/images/profile/" +
          req.body.address +
          "/" +
          uploadedFile.name;
        uploadedFile.mv(filepath);
        avatar = req.body.address + "/" + uploadedFile.name;
        updateBody = { ...updateBody, avatar: avatar };
      }
    }
    await UserModel.findOneAndUpdate({ address: address }, updateBody, {
      new: true,
    });
    res.status(200).send({ update: true });
  } catch (error) {
    res.status(500).send({ udpate: false });
  }
};

exports.registerUser = (req, res) => {
  const errors = {};
  UserModel.findOne({ email: req.body.email }).then((user) => {
    if (user) {
      errors.email = "Email already exists";
      return res.status(400).json(errors);
    } else {
      const newUser = new UserModel({
        email: req.body.email,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        password: req.body.password,
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then((user) => res.json(user))
            .catch((err) => console.log(err));
        });
      });
    }
  });
};

exports.loginUser = (req, res) => {
  const errors = {};
  const email = req.body.email;
  const password = req.body.password;

  // Find user by email
  UserModel.findOne({ email }).then((user) => {
    // Check for user
    if (!user) {
      errors.email = "User not found";
      return res.status(404).json(errors);
    }

    // Check Password
    bcrypt.compare(password, user.password).then((isMatch) => {
      if (isMatch) {
        // User Matched
        const payload = {
          id: user.id,
          email: user.email,
          firstname: user.firstname,
          lastname: user.lastname,
          avatar: user.avatar,
          job_title: user.job_title,
        }; // Create JWT Payload

        // Sign Token
        jwt.sign(
          payload,
          keys.secretOrKey,
          { expiresIn: 3600 },
          (err, token) => {
            res.json({
              success: true,
              token: "Bearer " + token,
            });
          }
        );
      } else {
        errors.password = "Password incorrect";
        return res.status(400).json(errors);
      }
    });
  });
};

exports.getDocumentCount = (req, res) => {
  if (!checkAuthToken(req)) return res.status(401).send("unzuthorized");

  UserModel.find({})
    .countDocuments()
    .then((count) => {
      res.json(count);
    })
    .catch((err) => console.log(err));
};

exports.getAllEmails = (req, res) => {
  if (!checkAuthToken(req)) return res.status(401).send("unzuthorized");

  UserModel.find({})
    .then((users) => {
      let emails = [];
      users.forEach((user) => {
        emails.push(user.email);
      });
      res.json(emails);
    })
    .catch((err) => console.log(err));
};

exports.getUsers = (req, res) => {
  if (!checkAuthToken(req)) return res.status(401).send("unzuthorized");

  const { page, pagesize } = req.body;
  UserModel.find({})
    .limit(pagesize)
    .skip(pagesize * page)
    .then((users) => {
      res.json(users);
    })
    .catch((err) => console.log(err));
};

exports.deleteUsers = async (req, res) => {
  if (!checkAuthToken(req)) return res.status(401).send("unzuthorized");

  const { deleteIds } = req.body;
  await async.forEachOf(
    deleteIds,
    (value, key, callback) => {
      UserModel.deleteOne({ _id: value })
        .then(() => callback())
        .catch((err) => callback(err));
    },
    (err) => {
      if (err) console.error(err);
    }
  );

  await res.json({ message: "delete success" });
};

exports.addUser = (req, res) => {
  if (!checkAuthToken(req)) return res.status(401).send("unzuthorized");

  const errors = {};
  let avatar = "";
  let coverphoto = "";
  if (req.files) {
    try {
      if (req.files.avatar) {
        let uploadedFile = req.files.avatar;
        let filepath =
          __dirname +
          "/../uploads/images/profile/" +
          req.body.email.split("@")[0] +
          "/" +
          uploadedFile.name;
        uploadedFile.mv(filepath);
        avatar = req.body.email.split("@")[0] + "/" + uploadedFile.name;
      }
      if (req.files.coverphoto) {
        let uploadedFile = req.files.coverphoto;
        let filepath =
          __dirname +
          "/../uploads/images/profile/" +
          req.body.email.split("@")[0] +
          "/" +
          uploadedFile.name;
        uploadedFile.mv(filepath);
        coverphoto = req.body.email.split("@")[0] + "/" + uploadedFile.name;
      }
    } catch (err) {
      errors.upload = "Error while uploading file.";
      return res.status(500).json(errors);
    }
  }

  const {
    email,
    firstname,
    lastname,
    location,
    story,
    linkedin,
    website,
    facebook,
    twitter,
    yearly_income,
    income_include_spouse,
    accredited_investor,
    invested_not_republic,
    net_worth,
    job_title,
    job_industry,
    investement_amount,
    full_legal_name,
    full_home_address,
    phone_number,
    credit_card,
    bank_wire,
    card_number,
    Experation_date,
    CVV,
  } = req.body;
  const newUser = new UserModel({
    email,
    firstname,
    lastname,
    location,
    story,
    linkedin,
    website,
    facebook,
    twitter,
    yearly_income: JSON.parse(yearly_income),
    income_include_spouse: JSON.parse(income_include_spouse),
    accredited_investor: JSON.parse(accredited_investor),
    invested_not_republic: JSON.parse(invested_not_republic),
    net_worth: JSON.parse(net_worth),
    job_title,
    job_industry,
    investement_amount: JSON.parse(investement_amount),
    full_legal_name,
    full_home_address,
    phone_number,
    credit_card: JSON.parse(credit_card),
    bank_wire: JSON.parse(bank_wire),
    card_number,
    Experation_date,
    CVV,
    avatar,
    coverphoto,
    password: "11111111",
  });
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newUser.password, salt, (err, hash) => {
      if (err) throw err;
      newUser.password = hash;
      newUser
        .save()
        .then((user) => res.json(user))
        .catch((err) => console.log(err));
    });
  });
};

exports.editUser = (req, res) => {
  if (!checkAuthToken(req)) return res.status(401).send("unzuthorized");

  const errors = {};
  let avatar = "";
  let coverphoto = "";
  if (req.files) {
    try {
      if (req.files.avatar) {
        let uploadedFile = req.files.avatar;
        let filepath =
          __dirname +
          "/../uploads/images/profile/" +
          req.body.email.split("@")[0] +
          "/" +
          uploadedFile.name;
        uploadedFile.mv(filepath);
        avatar = req.body.email.split("@")[0] + "/" + uploadedFile.name;
      }
      if (req.files.coverphoto) {
        let uploadedFile = req.files.coverphoto;
        let filepath =
          __dirname +
          "/../uploads/images/profile/" +
          req.body.email.split("@")[0] +
          "/" +
          uploadedFile.name;
        uploadedFile.mv(filepath);
        coverphoto = req.body.email.split("@")[0] + "/" + uploadedFile.name;
      }
    } catch (err) {
      errors.upload = "Error while uploading file.";
      return res.status(500).json(errors);
    }
  }

  const {
    _id,
    email,
    firstname,
    lastname,
    location,
    job_title,
    full_legal_name,
    full_home_address,
    phone_number,
    credit_card,
    bank_wire,
    card_number,
    Experation_date,
    CVV,
  } = req.body;
  let setData = {
    email,
    firstname,
    lastname,
    location,
    job_title,
    full_legal_name,
    full_home_address,
    phone_number,
    credit_card: JSON.parse(credit_card),
    bank_wire: JSON.parse(bank_wire),
    card_number,
    Experation_date,
    CVV,
  };
  if (!isEmpty(avatar)) {
    setData.avatar = avatar;
  }
  if (!isEmpty(coverphoto)) {
    setData.coverphoto = coverphoto;
  }
  UserModel.findOneAndUpdate(
    { _id },
    {
      $set: setData,
    }
  )
    .then((user) => res.json(user))
    .catch((err) => console.log(err));
};
