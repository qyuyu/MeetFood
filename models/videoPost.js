const mongoose = require('mongoose');
const constants = require('../util/constants');
const Schema = mongoose.Schema;

const videoPostSchema = new Schema(
  {
    postTitle: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    videoUrl: {
      type: String,
      required: true,
    },
    coverImageUrl: {
      type: String,
    },
    restaurantName: {
      type: String,
    },
    restaurantAddress: {
      street: {
        type: String,
      },
      city: {
        type: String,
      },
      state: {
        type: String,
        uppercase: true,
        enum: constants.statesArray,
      },
      zipcode: {
        type: Number,
      },
    },
    orderedVia: {
      type: Number,
      default: 0,
    },
    postTime: {
      type: Date,
      required: true,
    },
    countComment: {
      type: Number,
      default: 0,
    },
    countLike: {
      type: Number,
      default: 0,
    },
    countCollections: {
      type: Number,
      default: 0,
    },
    likes: [
      {
        userSub: {
          type: String,
        },
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],
    comments: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        text: {
          type: String,
          required: true,
        },
        name: {
          type: String,
        },
        avatar: {
          type: String,
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { collection: 'videoposts' },
);

module.exports = mongoose.model('VideoPost', videoPostSchema);
