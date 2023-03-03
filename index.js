const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Api = require("./routes/api");

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

// initialize api routes
app.use("/api/v1", Api);

let PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started at port http://localhost:${PORT}`);
});
