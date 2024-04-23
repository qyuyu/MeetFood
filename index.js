const express = require("express");
const app = express();
const routTest = require("./routes/routeTest");
const mongoose = require("mongoose");

app.use("/api/v1", routTest);

mongoose
  .connect(
    "mongodb+srv://admin:MeetFoodAdminTeam@meetfood.qvf7f4z.mongodb.net/?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: "meetfood-database",
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
