const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user');
const { isToCCognitoAuthenticated } = require('../middleware/is-auth');
const multer = require('multer');
const upload = multer({ dest: 'upload/' });

// Create New Customer based on Cognito
router.post('/new', isToCCognitoAuthenticated, UserController.customerCreate);

// // Customer Sign-up
// router.post('/signup', UserController.customerSignup);

// // Customer Sign-in
// router.post('/signin', UserController.customerSignin);

// get profile
router.get(
  '/profile/me',
  isToCCognitoAuthenticated,
  UserController.getCustomerProfile,
);

// update profile
router.post(
  '/profile/me',
  isToCCognitoAuthenticated,
  UserController.updateMyProfile,
);

// upload profile photo
router.post(
  '/profile/photo',
  upload.single('imageContent'),
  isToCCognitoAuthenticated,
  UserController.updateProfilePhoto,
);

// delete user
router.delete('/delete', isToCCognitoAuthenticated, UserController.deleteUser);

// delete Video from collection
router.delete(
  '/videos/videoCollection/:videoPostId',
  isToCCognitoAuthenticated,
  UserController.deleteVideoInCollection,
);

// add Video to collection
router.post(
  '/videos/videoCollection/:videoPostId',
  isToCCognitoAuthenticated,
  UserController.addVideoInCollection,
);

module.exports = router;
