require("dotenv").config();
require('./cron/bookingCleanup');

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");


const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const ownerRoutes = require("./routes/owner.js");
const bookingsRouter = require('./routes/bookings');


const User = require("./models/user.js");

const passport = require("passport");
const LocalStrategy = require("passport-local");

const session = require("express-session");
const flash = require("connect-flash");

const mongo_URL = "mongodb://127.0.0.1:27017/wanderdb";

main().then(() => {
  console.log("connected to db");
}).catch(err => {
  console.log(err);
});

async function main() {
  await mongoose.connect(mongo_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/public")));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);

const sessionSecret = process.env.SESSION_SECRET || "defaultsecret";

app.use(require("express-session")({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false
}));

app.use(flash());

app.use(passport.session());
app.use(passport.initialize());

passport.use(new LocalStrategy(User.authenticate())); 

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});
const Booking = require('./models/booking');
const Listing = require('./models/listing'); 

app.use(async (req, res, next) => {
  try {
    console.log("Running booking auto-complete middleware");

    const now = new Date();

    const expiredBookings = await Booking.find({
      departureTime: { $lte: now },
      status: 'confirm'
    });

    for (let booking of expiredBookings) {
      booking.status = 'completed';
      await booking.save();

      const listingId = booking.listing._id || booking.listing;
      const listing = await Listing.findById(listingId);

      if (listing) {
        console.log(`Adding ${booking.roomsRequired} rooms back to listing: ${listing._id}`);
        listing.totalRooms += booking.roomsRequired;
        await listing.save();
      } else {
        console.warn(`Listing not found for booking: ${booking._id}`);
      }
    }
  } catch (err) {
    console.error("Error in auto-complete booking middleware:", err);
  }

  next();
});


// Routes
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);
app.use("/owner", ownerRoutes);
app.use('/', bookingsRouter);


app.all(/.*/, (req, res, next) => {
  next(new ExpressError(404, "Page not found!"));
});

app.use((err, req, res, next) => {
  let { status = 500, message = "Something went wrong " } = err;
  res.status(status).render("listings/error.ejs", { message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
