const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  userId: {
    type: String,
    // require: true,
  },
  userName: {
    type: String,
    unique: true,
  },
  email: {
    type: String,
    // required: true,
  },
  videos: [
    {
      videoPost: {
        type: Schema.Types.ObjectId,
        ref: 'VideoPost',
      },
    },
  ],
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  profilePhoto: {
    type: String,
  },
  collections: [
    {
      videoPost: {
        type: String,
        // need type string to compare with params.videoPostId
        ref: 'VideoPost',
      },
    },
  ],
  likedVideos: [
    {
      videoPost: {
        type: String,
        // need type string to compare with params.videoPostId
        ref: 'VideoPost',
      },
    },
  ],
});

module.exports = mongoose.model('User', userSchema);
