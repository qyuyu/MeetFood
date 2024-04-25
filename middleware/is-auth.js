const CognitoExpress = require('cognito-express');
const config = require('../config/production.json');
const User = require('../models/user');

// Initializing CognitoExpress constructor
// ToC: to customers
const cognitoExpressToC = new CognitoExpress({
  region: config.CognitoRegion,
  cognitoUserPoolId: config.CognitoUserPoolId,
  tokenUse: config.CognitoTokenUse, //Possible Values: access | id
  tokenExpiration: config.CognitoTokenExpiration, //Up to default expiration of 1 hour (3600000 ms)
});

function isToCCognitoAuthnticated(req, res, next) {
  const token = req.header('cognito-token');

  // Check if not token
  if (!token) {
    return res.status(401).send('Access Token not found');
  }

  cognitoExpressToC.validate(token, async function (err, response) {
    // if API is not authenticated, return 401 with error message
    if (err) return res.status(401).json({ err });

    // else API is authenticated. Proceed
    req.userSub = response.sub;
    let user = await User.findOne({ userId: response.sub });
    req.userId = null;

    if (user) {
      req.userId = user._id;
    }
    next();
  });
}

module.exports = { isToCCognitoAuthnticated };
