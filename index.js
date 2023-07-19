const express = require("express");
const app = express();
const routeTest = require("./routes/routeTest");
const mongoose = require("mongoose");

app.use("/api/v1/", routeTest);

mongoose
  .connect(
    "mongodb+srv://yqy1998:Elliepoo-Chrisbun@meetfood.ro3wd3i.mongodb.net/?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: "meetfood-databse",
    }
  )
  .then(() => {
    console.log("DB Connection is ready...");
    app.listen(8080);
    console.log("server listening on port 8080");
  })
  .catch((err) => {
    console.log(err);
  });
