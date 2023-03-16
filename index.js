const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const cron = require("node-cron");

const { ipMiddleware } = require("./Middlewares/GetIP");
require("dotenv").config();

const Api = require("./Routes/Api.js");

// connect to mongodb
mongoose
  .connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("connected to mongodb");
  })
  .catch((err) => {
    console.log(err);
  });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use("/", ipMiddleware());

// initialize api routes
app.use("/api/v1", Api);

// initialize cron jobs
// cron.schedule("*/5 * * * * *", () => {
//   console.log("Cron job script ran!");
// });

let PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started at port http://localhost:${PORT}`);
});
