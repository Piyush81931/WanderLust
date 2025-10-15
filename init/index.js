
const mongoose   = require("mongoose");
const initdata   = require("./data.js");     
const Listing    = require("../models/listing.js");

const mongo_URL = "mongodb://127.0.0.1:27017/wanderdb";

async function main(){
  await mongoose.connect(mongo_URL);
  console.log("connected to db");
}
main().catch(console.error);

const initdb = async () => {
  await Listing.deleteMany({});
  const listingsWithOwners = initdata.data.map(obj => ({
    ...obj,
    owner: "67fcf7d75e5c970acdc806c8"
  }));
  await Listing.insertMany(listingsWithOwners);
  console.log("data was initialized");
};

initdb().catch(console.error);
