require("dotenv").config();
const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const Booking = require('../models/booking'); 
const nodemailer = require("nodemailer");
const sendEmail = require("../utils/sendEmail");

const mbxGeocoing = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoing({accessToken: mapToken});

const {isLoggedIn,isOwner,validateListing,preprocessListingImages} = require("../middleware.js");

router.get("/search", async (req, res) => {
   const { q } = req.query;
   const regex = new RegExp(q, "i");
 
   try {
     const alllisting = await Listing.find({
       $or: [
         { country: regex },
         { state: regex },
         { address: regex }
       ]
     });
     res.render("listings/index", { alllisting }); 
   } catch (err) {
     console.error(err);
     res.send("Error searching listings");
   }
 });
//create route
router.post("/",isLoggedIn,preprocessListingImages,validateListing, wrapAsync( async (req,res,next)=>{
  let response  = await geocodingClient.forwardGeocode({
    query: req.body.listings.location,
    limit: 1
  })
  .send();

   if (typeof req.body.listings.image === 'string') {
      const urls = req.body.listings.image
        .split(',')
        .map(url => url.trim())
        .filter(url => url);

      if (urls.length !== 3) {
        req.flash("error", "Please enter exactly 3 image URLs.");
        return res.redirect("/listings");
      }
  
      req.body.listings.image = urls;
    }
  
  const newlisting =  new Listing(req.body.listings);
  newlisting.owner = req.user._id;
  newlisting.geometry = response.body.features[0].geometry;
  const savedlisting  = await newlisting.save();
  console.log(savedlisting);
  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
}))
router.get(
  '/mytrips',
  isLoggedIn,
  wrapAsync(async (req, res) => {
    const allBookings = await Booking
      .find({ user: req.user._id })
      .populate('listing')
      .exec();

    const now = Date.now();
    const upcoming   = [];
    const ongoing    = [];
    const completed  = [];
    const cancelled  = [];

    allBookings.forEach(bk => {
      if (bk.status === 'cancelled') {
        cancelled.push(bk);
      } else if (now < bk.arrivalTime) {
        upcoming.push(bk);
      } else if (now >= bk.arrivalTime && now <= bk.departureTime) {
        ongoing.push(bk);
      } else {
        completed.push(bk);
      }
    });
    res.render('listings/mytrip', {
      upcoming,
      ongoing,
      completed,
      cancelled
    });
  })
);
router.get("/", wrapAsync( async (req,res)=>{
  const alllisting = await Listing.find({});
  res.render("listings/index.ejs", {alllisting});

}))

router.get("/new",isLoggedIn, (req, res)=>{

 res.render("listings/new.ejs");
})



router.post("/:id/contact", async (req, res) => {
  const { id } = req.params;
  const { email, message } = req.body;
  const listing = await Listing.findById(id).populate("owner");

  if (!listing || !listing.owner.email) {
    req.flash("error", "Listing or owner not found.");
    return res.redirect(`/listings/${id}`);
  }

  try {
    await sendEmail(
      listing.owner.email,
     `Contact from WanderLust listing: ${listing.title}`,
     `You have received a message from a user interested in your listing.
 
       Listing: ${listing.title}
       Sender Email: ${email}
       Message: ${message}
           `,
   );
 
    req.flash("success", "Your message was sent to the host!");
  } catch (e) {
    console.error(e);
    req.flash("error", "Something went wrong. Please try again.");
  }

  res.redirect(`/listings/${id}`);
});
 // Show booking form
router.get('/listings/:id/book', async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id).populate('owner');
  res.render('bookings/form', { listing });
});

// Show booking form for a listing
router.get("/:id/book", async (req, res) => {
  try {
      const { id } = req.params;
      const listing = await Listing.findById(id);
      if (!listing) {
          return res.status(404).send("Listing not found");
      }
      res.render("bookings/new", { listing });
  } catch (err) {
      console.error("Error showing booking form:", err);
      res.status(500).send("Server Error");
  }
});
router.post("/:id/book", async (req, res) => {
  try {
      const { id } = req.params;
      const listing = await Listing.findById(id).populate("owner");
      if (!listing) {
          return res.status(404).send("Listing not found");
      }

      const {
          username,
          email,
          country,
          address,
          phone,
          state
      } = req.body;

      const newBooking = new Booking({
          listing: listing._id,
          owner: listing.owner._id, 
          username,
          email,
          country,
          address,
          phone,
          state
      });

      await newBooking.save();

      res.redirect(`/listings/${listing._id}`); 
  } catch (err) {
      console.error("Booking failed:", err);
      res.status(500).send("Server error while booking");
  }
});


//delete route
router.delete("/:id",isLoggedIn,isOwner, wrapAsync( async (req,res)=>{
   let{id} = req.params;
   await Listing.findByIdAndDelete(id);
   req.flash("success", "Listing Deleted!");
   res.redirect("/listings");
}))


//edit route
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync( async (req,res)=>{
   let{id} = req.params;
   const listing = await Listing.findById(id);
   if(!listing){
      req.flash("error", "Listing you requested for does not exit");
      return res.redirect("/listings");
   }
   res.render("listings/edit.ejs",{listing});
}))


//update route
router.put("/:id",isLoggedIn,isOwner,validateListing,wrapAsync( async (req,res)=>{
   let{id} = req.params;
   console.log(req.body);
   await Listing.findByIdAndUpdate(id, {...req.body.listings});
   req.flash("success", " Listing Updated!");
   res.redirect("/listings");
}))


//show route
router.get("/:id", wrapAsync( async(req,res)=>{
  let{id} = req.params;
  const listing = await Listing.findById(id)
        .populate({path: "reviews", populate: {path: "author"}})
        .populate("owner");
  if(!listing){
     req.flash("error", "Listing you requested for does not exit");
     return res.redirect("/listings");
  }
  res.render("listings/show.ejs", {listing});

}))




module.exports = router;