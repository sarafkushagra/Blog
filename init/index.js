const mongoose = require("mongoose");
// Extracting the model from the models folder
const Blogs = require("../models/blogs");
// Extracting the data from the data.js file
const initData = require("./data.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/blogify";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  await Blogs.deleteMany({});
  // adding owner to each object in the data array
  initData.data = initData.data.map((obj) => ({
    ...obj,
    owner: "67c34dd57f5a1b45a0a01479",
  }));
  await Blogs.insertMany(initData.data);
  console.log("data was initialized");
};

initDB();
