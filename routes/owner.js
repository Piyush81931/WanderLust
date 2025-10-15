const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const passport = require("passport");
const Booking = require("../models/booking");
const Listing = require('../models/listing.js');
const { isOwnerAdmin, isLoggedIn } = require("../middleware");
const sendEmail = require("../utils/sendEmail");
const wrapAsync = require("../utils/wrapAsync.js");

// login page for owner
router.get("/login", (req, res) => {
    res.render("owner/login");
});

// login request for owner
router.post("/login", passport.authenticate("local", {
    failureRedirect: "/owner/login",
    failureFlash: true
}), (req, res) => {
    req.session.owner_id = req.user._id;
    req.flash("success", "Welcome Back!");
    res.redirect("/owner/dashboard");  
});

router.get("/my-listings", isLoggedIn, wrapAsync(async (req, res) => {
  const listings = await Listing.find({ owner: req.user._id });
  res.render("owner/myListings.ejs", { listings });
}));
// 
//form submission
router.post("/register", async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const newUser = new User({ username, email, role: "owner" });
        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser, (err) => {
            if(err) return next(err);
            req.flash("success", "Welcome Owner!");
            res.redirect("/owner/dashboard");
        });
    } catch (e) {
        if(e.name === "UserExistsError") {
            req.flash("error", "An account with that username already exists.");
        } else {
            req.flash("error", e.message);
        }
        res.redirect("/owner/register");
    }
});


router.get("/dashboard", isOwnerAdmin, async (req, res) => {
    try {
      const filter = req.query.filter || 'pending'; 
  
      let query = {};
      if (filter === 'pending') {
        const now = new Date();
        query = {
          status: { $ne: 'cancelled' },
          isConfirmed: false,
          arrivalTime: { $gt: now }
        };
        
      } else if (filter === 'ongoing') {
        const now = new Date();
        query = {
          arrivalTime: { $lte: now },
          departureTime: { $gte: now },
          status: { $ne: 'cancelled' }
        }; 
      } else if (filter === 'completed') {
        const now = new Date();
        query = {
          departureTime: { $lt: now },
          status: { $ne: 'cancelled' }
        }; 
      } else if (filter === 'confirm') {
        const now = new Date();
        query = {
          arrivalTime: { $gt: now },  
          isConfirmed: true,  
          status: { $ne: 'cancelled' }
        };
      } else if (filter === 'cancel') {
        query = { status: 'cancelled' };  
      }
      const bookings = await Booking.find({ owner: req.user._id, ...query })
        .populate("listing")
        .populate("user", "username email")
        .lean();
      res.render("owner/dashboard", { bookings });
  
    } catch (err) {
      console.error(err);
      req.flash("error", "Could not load bookings");
      res.redirect("/owner/login");
    }
  });
router.get('/payments', isLoggedIn, async (req, res) => {
  const bookings = await Booking.find({ owner: req.user._id, isConfirmed: true })
    .populate('user')
    .populate('listing');
  
  let totalEarnings = 0;

  bookings.forEach(booking => {
    const nights = Math.ceil((booking.departureTime - booking.arrivalTime) / (1000 * 60 * 60 * 24));
    const listingPrice = booking.listing.price;
    totalEarnings += nights * booking.roomsRequired * listingPrice;
  });

  res.render('owner/ownerPayments.ejs', { bookings, totalEarnings });
});

router.post('/bookings/:id/confirm', isOwnerAdmin, async (req, res) => {
    try {
      const b = await Booking.findById(req.params.id).populate('listing');
      if (!b){
         throw new Error("Booking not found");
        }
  
      if (b.listing.totalRooms < b.roomsRequired) {
        req.flash('error', 'Not enough rooms available to confirm this booking.');
        return res.redirect('/owner/dashboard');
      }
  
      b.listing.totalRooms -= b.roomsRequired;
      await b.listing.save();

      b.status = 'ongoing';
      b.isConfirmed = true;
      await b.save();
      await sendEmail(
        b.email,
        "Booking Confirmed",
        `<p>Hello ${b.username},</p><p>Your booking at <strong>${b.listing.title}</strong> has been <span style="color:green;"><strong>CONFIRMED</strong></span>.</p>`
      );
      
      req.flash('success', 'Booking confirmed!');
      res.redirect('/owner/dashboard');
    } catch (err) {
      console.error(err);
      req.flash('error', err.message);
      res.redirect('/owner/dashboard');
    }
  });
  
  router.post('/bookings/:id/cancel', isOwnerAdmin, async (req, res) => {
    try {
      const b = await Booking.findById(req.params.id).populate('listing');
      if (!b) throw new Error("Booking not found");
  
      const listing = await Listing.findById(b.listing._id);
  
      if (b.listing && b.roomsRequired) {
        listing.totalRooms += b.roomsRequired;
        await listing.save();
        console.log("Rooms restored after cancellation");
      }

      b.status = 'cancelled';
      b.isConfirmed = true;
      if(b.isConfirmedUser){
        console.log(b.email);
        await sendEmail(
          b.email,
          "Booking Cancelled - Refund Initiated",
          `Hello ${b.username}, your booking at ${b.listing.title} has been CANCELLED. A refund will be processed within 24 hours.`
        );              
        console.log("email sended");
      }else{
        await sendEmail(
          b.email,
          "Booking Cancelled",
          `<p>Hello ${b.username},</p><p>Unfortunately, your booking at <strong>${b.listing.title}</strong> has been <span style="color:red;"><strong>CANCELLED</strong></span>.</p>`
        );
      }
     
      await b.save();
      req.flash('success', 'Booking cancelled.');
      res.redirect('/owner/dashboard');
    } catch (err) {
      console.error(err);
      req.flash('error', err.message);
      res.redirect('/owner/dashboard');
    }
  });
  
router.delete('/bookings/:id', async (req, res) => {
    try {
        const bookingId = req.params.id;
        const booking = await Booking.findByIdAndDelete(bookingId);

        if (!booking) {
            return res.status(404).send('Booking not found');
        }

        res.redirect('/owner/dashboard');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});
  

module.exports = router;
