const User = require('../models/user');
const VideoPost = require('../models/videoPost');
const AWS_S3 = require('../util/aws-s3');
const { getFileBaseName } = require('../util/path');
const config = require('../config/production.json');
const s3 = AWS_S3.setS3Credentials;
/**
 * @api {post} /api/v1/user/new CustomerCreate
 * @apiName CustomerCreate
 * @apiGroup    User
 * @apiDescription  Create New Customer
 *
 * @apiParam {Header} {string} cognito-token    User Unique Identifier from Cognito
 * @apiParam {Body} {string} email  User Email
 *
 * @apiSuccess {Success Returned JSON} {string} User is created successfully
 * @apiError return corresponding errors
 */

exports.customerCreate = async (req, res) => {
  // data validation (parameter guard)
  const numOfParams = Object.keys(req.body).length;
  // header is not a param
  // we only have email in the body
  if (numOfParams > 1) {
    return res
      .status(400)
      .json({ errors: [{ msg: 'Bad Request, too many parameters.' }] });
  }

  const userSub = req.userSub;

  try {
    // check the user exist or not
    let user = await User.findById(req.userId);

    if (user) {
      return res.status(400).json({
        errors: [{ msg: 'The user already registered. Please sign in.' }],
      });
    }

    const email = req.body.email;
    const emailPrefix = email.substring(0, email.lastIndexOf('@'));

    // same email signed up through cognito:
    // 1. signed up by email and password directly
    // 2. signed up by google, but google is also email

    // check if the email is already used as an existing default username
    const isUserNameDuplicated = await User.findOne({ userName: emailPrefix });
    const defaultUserName = isUserNameDuplicated
      ? emailPrefix + userSub
      : emailPrefix;

    // Create a new user to save
    user = new User({
      userId: userSub,
      userName: defaultUserName,
      email,
      createdTime: new Date().toISOString(),
    });

    // Save to the database
    await user.save();
    return res.status(200).json({
      message: 'User account created successfully',
      user,
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server Error', err: err.message });
  }
};

exports.getCustomerProfile = async (req, res) => {
  // 1. check if user exist
  let user = await User.findById(req.userId);
  if (!user) {
    return res.status(400).json({ errors: [{ msg: 'Cannot find the user' }] });
  }
  // if exist, return user profile
  // 1. basic info: userName, etc
  // 2. videos: populate
  try {
    // 2.1 uploaded videos
    user.populate('videos.videoPost');

    // 2.2 populate collected videos
    await User.populate(user, { path: 'collections.videoPost' });
    await User.populate(user, {
      path: 'collections.videoPost.userId',
      select: ['_id', 'userId', 'userName', 'profilePhoto'],
    });
    await User.populate(user, { path: 'collections.videoPost.comments.user' });

    // 2.3 liked videos
    await User.populate(user, { path: 'likedVideos.videoPost' });
    await User.populate(user, {
      path: 'likedVideos.videoPost.userId',
      select: ['_id', 'userId', 'userName', 'profilePhoto'],
    });
    await User.populate(user, { path: 'likedVideos.videoPost.comments.user' });

    return res.status(200).send(user);
  } catch (err) {
    return res
      .status(500)
      .send({ msg: 'Failed to retrive user profile', err: err.message });
  }
};

exports.updateMyProfile = async (req, res) => {
  // data validation (parameter guard)
  const numOfParams = Object.keys(req.body).length;
  // header is not a param
  if (numOfParams > 3) {
    return res
      .status(400)
      .json({ errors: [{ msg: 'Bad Request, too many parameters.' }] });
  }

  const { newUserName, newFirstName, newLastName } = req.body;
  // check newUserName is unique or not
  let user = await User.findOne({ userName: newUserName });
  if (user != null && user.userId !== req.userSub) {
    // not unique
    return res
      .status(400)
      .json({ errors: [{ msg: 'the username has been used' }] });
  }

  // if exist, update profile information: userName, first/last name
  try {
    user = await User.findById(req.userId);
    user.userName = newUserName;
    user.firstName = newFirstName;
    user.lastName = newLastName;
    await user.save();
    return res.status(200).json({ message: 'User profile is updated', user });
  } catch (err) {
    return res
      .status(500)
      .send({ msg: 'Failed to update user profile', err: err.message });
  }
};

exports.updateProfilePhoto = async (req, res) => {
  const imageParams = AWS_S3.s3ProfilePhotoParams(req);

  // multer
  // aws s3
  try {
    // Check if the user exists
    const user = await User.findById(req.userId);

    if (!user) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'Can not find the user.' }] });
    }

    // Upload the new profile photo
    const ImageStored = await s3
      .upload(imageParams, (err) => {
        // Check error
        if (err) {
          return res.status(500).json({
            errors: [
              {
                msg: 'Error occured while trying to upload image to S3 bucket',
                err,
              },
            ],
          });
        }
      })
      .promise();

    // if the user had a profile photo before, delete the previous one
    // to save s3 storage
    if (user.profilePhoto) {
      // Delete the current profile photo
      var deleteParams = {
        Bucket: config.S3ProfilePhotoBucketName,
        Key: getFileBaseName(user.profilePhoto),
      };
      s3.deleteObject(deleteParams, function (err) {
        // Check error
        if (err) {
          return res.status(500).json({
            errors: [
              {
                msg: 'Error occured while trying to delete the old profile photo from S3',
                err,
              },
            ],
          });
        }
      });
    }

    const imageFileName = getFileBaseName(ImageStored.Location);
    const imageUrl = AWS_S3.profilePhotoUrlGenerator(imageFileName);

    // Update the database
    user.profilePhoto = imageUrl;
    await user.save();

    return res.status(200).json({
      message: 'User profile photo is updated',
      user,
    });
  } catch (err) {
    res
      .status(500)
      .json({ msg: 'Failed to update profile photo', err: err.message });
  }
};
