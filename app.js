const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const config = require('./config/production.json');
const port = process.env.PORT || 3000;
const userRoutes = require('./routes/user');

// mongoose debug tool
mongoose.set('debug', true);

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));

// Add routers
app.use('/api/v1/user', userRoutes);
