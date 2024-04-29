const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const config = require('./config/production.json');
const port = process.env.PORT || 3000;
const userRoutes = require('./routes/user');
const videoRoutes = require('./routes/videoPost');
const expressValidator = require('express-validator');
var cors = require('cors');
const rateLimit = require('express-rate-limit');

// mongoose debug tool
mongoose.set('debug', true);

const app = express();

const MAX_RATE = 2000;

app.use(
  rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour duration in milliseconds
    max: MAX_RATE,
    message: `You exceeded ${MAX_RATE} requests in per hour limit!`,
    headers: true,
  }),
);

//Middlewares
app.use(cors());

app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  }),
);
// used for header token validation
app.use(bodyParser.urlencoded({ extended: false }));
// used for req body data validation
app.use(expressValidator());

// Add routers
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/video', videoRoutes);

// Database
mongoose
  .connect(config.mongodbConnectURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'meetfood-database',
  })
  .then(() => {
    console.log('DB Connection is ready...');
    app.listen(8080);
    console.log('server listening on port 8080');
  })
  .catch((err) => {
    console.log(err);
  });
