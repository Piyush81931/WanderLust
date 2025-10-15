const express = require('express');
const router = express.Router();
const Listing = require('../models/listing.js');
const Booking = require('../models/booking.js');
const { isLoggedIn} = require('../middleware');  
const wrapAsync = require("../utils/wrapAsync.js");
const sendEmail = require("../utils/sendEmail");
const User = require("../models/user.js");

// Fake Payment Route
router.post('/userbookings/:id/confirm', async (req, res) => {
  try {
      const booking = await Booking.findById(req.params.id).populate('listing owner user');
      const owner = await User.findById(booking.listing.owner);
      booking.isConfirmedUser = true;
      await booking.save();

      const nights = Math.ceil((booking.departureTime - booking.arrivalTime) / (1000 * 60 * 60 * 24));
      const totalPrice = nights * booking.roomsRequired * booking.listing.price;
      const subject = "New Booking confirmed!";

      const emailMessage = `
          <h2>New Booking Confirmed</h2>
          <p><strong>Listing:</strong> ${booking.listing.title}</p>
          <p><strong>Booked By:</strong> ${booking.username} (${booking.email})</p>
          <p><strong>Arrival:</strong> ${booking.arrivalTime.toDateString()}</p>
          <p><strong>Departure:</strong> ${booking.departureTime.toDateString()}</p>
          <p><strong>Total Rooms:</strong> ${booking.roomsRequired}</p>
          <p><strong>Total Nights:</strong> ${nights}</p>
          <p><strong>Total Price:</strong> ₹${totalPrice}</p>
      `;
      await sendEmail(owner.email, subject, emailMessage);

      req.flash('success', 'Payment successful! Booking confirmed and email sent to the owner.');
      res.redirect('/listings');
  } catch (err) {
      console.error(err);
      req.flash('error', 'Something went wrong during payment.');
      res.redirect('/listings');
  }
});


router.post(
  '/booking/cancel/:id',
  isLoggedIn,
  wrapAsync(async (req, res) => {
    const bookingId = req.params.id;

    const booking = await Booking.findById(bookingId).populate('listing').exec();

    if (!booking) {
      req.flash('error', 'Booking not found.');
      return res.redirect('/mytrips');
    }

    if (!booking.user.equals(req.user._id)) {
      req.flash('error', 'Unauthorized access.');
      return res.redirect('/mytrips');
    }

    if (booking.arrivalTime <= Date.now()) {
      req.flash('error', 'Cannot cancel a trip that has already started.');
      return res.redirect('/mytrips');
    }

    booking.status = 'cancelled';
    await booking.save();

      const requiredRoom = booking.roomsRequired || 1;
      await Listing.updateOne(
        { _id: booking.listing._id },
        { $inc: { totalRooms: requiredRoom } }
      );
    const owner = await User.findById(booking.listing.owner);
      console.log(owner.email);
      console.log(owner.username);
    if (owner && owner.email) {
      const subject = `Booking Cancelled for ${booking.listing.title}`;
      const message = `
        Hi ${owner.username},

        A user has just cancelled their upcoming booking for your listing:

        Listing: ${booking.listing.title}
        Arrival: ${booking.arrivalTime.toLocaleString()}
        Departure: ${booking.departureTime.toLocaleString()}
        Guests: ${booking.totalGuests}

        Regards,
        Your Booking Platform
      `;
      await sendEmail(owner.email, subject, message);
    }
    if (booking.isConfirmedUser && booking.email) {
      try {
        await sendEmail(
          booking.email,
          "Booking Cancelled - Refund Initiated",
          `
            <p>Hi ${owner.username},</p>

            <p>The user <strong>${booking.username}</strong> has cancelled their <strong>confirmed</strong> booking for your listing: <strong>${booking.listing.title}</strong>.</p>

            <p><strong>Booking Details:</strong></p>
            <ul>
              <li>Arrival: ${booking.arrivalTime.toLocaleString()}</li>
              <li>Departure: ${booking.departureTime.toLocaleString()}</li>
              <li>Guests: ${booking.totalGuests}</li>
              <li>Payment:<strong>Confirmed</strong></span></li>
            </ul>

            <p>As the payment was already processed, a full refund has been initiated to the user. The amount will be returned to their original payment method within <strong>24 hours</strong>.</p>

            <p>Please check your dashboard for updated booking details. If you have any questions, feel free to reach out to support.</p>

            <p>Best regards,<br>Your Booking Platform Team</p>
          `
        );
        console.log("Refund email sent to user");
      } catch (err) {
        console.error("User refund email failed:", err);
      }
    }
    req.flash('success', 'Trip cancelled successfully.');
    res.redirect('/listings');
  })
);

// Show booking form for a listing
router.get('/book/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).send('Listing not found');
    res.render('bookings/new', { listing });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

router.post(
  '/book/:id',
  isLoggedIn,
  async (req, res) => {
    try {
      const listing = await Listing.findById(req.params.id);
      if (!listing) {
        return res.status(404).send('Listing not found');
      }
      const {
        username,
        email,
        country,
        state,
        address,
        phone,

        arrivalTime,
        departureTime,
        totalGuests,
        roomType,
        roomsRequired,
        message
      } = req.body;
      
      const arrivalDate = new Date(arrivalTime);
      const departureDate = new Date(departureTime);
      if (arrivalDate >= departureDate) {
        return res.status(400).send('Arrival time must be earlier than departure time!');
      }

      if (listing.totalRooms < roomsRequired) {
        return res
          .status(400)
          .send(`Only ${listing.totalRooms} rooms available right now.`);
      }
      const newBooking = new Booking({
        listing: listing._id,
        user: req.user._id,       
        owner: listing.owner,     
        username,
        email,
        country,
        state,
        address,
        phone,
        arrivalTime,
        departureTime,
        totalGuests,
        roomType,
        roomsRequired,
        message,
        status: 'upcoming'
      });
      console.log(req.body);
      listing.totalRooms -= roomsRequired;
      await listing.save();
      await newBooking.save();
      res.redirect("/listings/mytrips");
    } catch (error) {
      console.error('Booking error:', error);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
