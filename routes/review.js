const express = require("express");
const router = express.Router({ mergeParams: true });

const Listing = require("../models/listing.js");
const Review  = require("../models/review.js");
const wrapAsync = require("../utils/wrapAsync.js");
const {validateReview, isLoggedIn,isReviewAuthor} = require("../middleware.js");


//Reviews
router.post("/",isLoggedIn, validateReview, wrapAsync(async(req,res)=>{
    const newlisting = await Listing.findById(req.params.id);
    const newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    console.log(newReview.author);
    newlisting.reviews.push(newReview);

   await newReview.save();
    await newlisting.save();
    req.flash("success", "New Review Created!");
    res.redirect(`/listings/${req.params.id}`);
}))
router.delete("/:reviewId",isLoggedIn, isReviewAuthor, wrapAsync(async (req,res)=>{
    let{id , reviewId} = req.params;
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review Deleted!");
    res.redirect(`/listings/${id}`);

}))

module.exports = router;