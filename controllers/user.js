const User = require('../models/user');

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
