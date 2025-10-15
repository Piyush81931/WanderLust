const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");
const { string, required } = require("joi");
const listingSchema = Schema({
    title:{
        type: String,
        required: true
    },
    description: String,
    image: {
        type: [String],
        required: [true, "At least 3 image URLs are required"],
        validate: {
          validator: function (val) {
            return Array.isArray(val) && val.length === 3 && val.every(url => typeof url === 'string' && url.trim() !== '');
          },
          message: "Exactly 3 valid image URLs are required"
        },
        set: function (v) {
          if (typeof v === 'string') {
            const parts = v.split(',').map(url => url.trim()).filter(url => url);
            return parts.slice(0, 3);
          }
          return v;
        }
      },
    price:Number,
    location:String,
    country:String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ],
    owner:{
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    totalRooms: {
      type: Number,
      required: true,
      default: 1,  
  },
  geometry:{
    type:{
      type:String,
      enum:['Point'],
      required: true,
    },
    coordinates:{
      type:[Number],
      required:true
    }
  }
})

listingSchema.post("findOneAndDelete",async(listing)=>{
    if(listing){
        await Review.deleteMany({_id: {$in : listing.reviews}});
    }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;