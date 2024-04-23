const express = require('express');
const router = express.Router();
const UserTest = require('../models/userTest');

router.get('/meetfood', async (req, res) => {
  res.send('<h2>Hello World!</h2>');
  const user = new UserTest({
    firstName: 'Chris',
    userName: 'qyuyu',
  });

  await user.save();
  console.log('test');
});

module.exports = router;
