const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user');
const { isToCCognitoAuthenticated } = require('../middleware/is-auth');

// Create New Customer based on Cognito
router.post('/new', isToCCognitoAuthenticated, UserController.customerCreate);

// // Customer Sign-up
// router.post('/signup', UserController.customerSignup);

// // Customer Sign-in
// router.post('/signin', UserController.customerSignin);

module.exports = router;
