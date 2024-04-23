const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userTestSchema = new Schema({
  userName: {
    type: String,
    unique: true,
  },

  firstName: {
    type: String,
  },
});

module.exports = mongoose.model("UserTest", userTestSchema);
