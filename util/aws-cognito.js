const AWS = require('aws-sdk');
const config = require('../config/production.json');

const adminToDeleteUser = async (username) => {
  try {
    const cognito = new AWS.CognitoIdentityServiceProvider();
    await cognito
      .adminDeleteUser({
        Username: username,
        UserPoolId: config.CognitoToCUserPoolId,
      })
      .promise();
    return {
      isDelete: true,
    };
  } catch (err) {
    return {
      isDelete: false,
      err: err,
    };
  }
};

module.exports = {
  adminToDeleteUser,
};
