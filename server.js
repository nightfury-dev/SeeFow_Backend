const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
const path = require("path");
const fileUpload = require("express-fileupload");
const cors = require("cors");
require("dotenv").config();

const UserRoute = require("./routes/UserRoute");
const ProfileRoute = require("./routes/ProfileRoute");
const UploadRoute = require("./routes/UploadRoute");

const app = express();
app.use(express.static(__dirname + "/"));
// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// enable files upload
app.use(
  fileUpload({
    createParentPath: true,
  })
);
app.use(cors());
// DB Config
const db = require("./config/keys").mongoURI;

// Connect to MongoDB
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// Passport middleware
app.use(passport.initialize());

// Passport Config
require("./config/passport")(passport);

// Use Routes
app.use("/api/users", UserRoute);
app.use("/api/profile", ProfileRoute);
app.use("/api/upload", UploadRoute);

// Server static assets if in production
if (process.env.NODE_ENV === "production") {
  // Set static folder
  app.use(express.static("client/build"));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port ${port}`));
