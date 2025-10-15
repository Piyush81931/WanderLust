const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema,reviewSchema} = require("./schema.js");


module.exports.isLoggedIn = (req,res,next)=>{ // is check user is login or not
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        console.log(req.originalUrl);
        req.flash("error", "you must be logged in!")
        return res.redirect("/login");
     }
     next();
}
module.exports.saveRedirectUrl = (req,res,next)=>{ //this function use for orginalUrl redirect
    if(req.session.redirectUrl){
        res.locals.redirectUrl =   req.session.redirectUrl;
        }
        next();
}
module.exports.isOwnerAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === "owner") {
      return next();
    }
    req.flash("error", "Access denied.");
    res.redirect("/login");
  };

module.exports.isOwner = async(req,res,next)=>{ //this function use for autherization
    let{id} = req.params;   
    const listing =  await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currUser._id)){
        req.flash("error", "You are not the owner of this listing");
        return res.redirect(`/listings/${id}`);
    }
    next();
}

module.exports.isReviewAuthor = async(req,res,next)=>{
    let{id, reviewId} = req.params;
    const review = await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)){
        req.flash("error", "You are not the author of this review");
        return res.redirect(`/listings/${id}`);
    }
    next();
}

module.exports.validateListing = (req,res,next)=>{
    let {error} = listingSchema.validate(req.body);
    if(error){
        throw new ExpressError(400, error);
    }else{
        next();
    }
}
module.exports.validateReview = (req,res,next)=>{
    let {error} = reviewSchema.validate(req.body);
    if(error){
        throw new ExpressError(400, error);
    }else{
        next();
    }
}

  // middleware/preprocessImage.js
module.exports.preprocessListingImages = (req, res, next) => {
    if (req.body.listings && typeof req.body.listings.image === 'string') {
      const urls = req.body.listings.image
        .split(',')
        .map(url => url.trim())
        .filter(url => url); // removes empty strings
  
      req.body.listings.image = urls;
    }
    next();
  }
  
  
 
  