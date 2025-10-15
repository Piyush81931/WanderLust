const cron = require('node-cron');
const Booking = require('../models/booking'); 
const Listing = require('../models/listing');

cron.schedule('*/5 * * * *', async () => {
  console.log("Running booking auto-complete task...");

  try {
    const now = new Date();

    const expiredBookings = await Booking.find({
      departureTime: { $lte: now },
      status: { $ne: 'completed' } 
    });

    console.log(`Found ${expiredBookings.length} expired bookings to process`);

    for (let booking of expiredBookings) {
      console.log(`Processing booking ${booking._id}`);
      
      booking.status = 'completed';
      await booking.save();
      
      const listingId = booking.listing instanceof Object ? booking.listing._id : booking.listing;
      console.log(`Looking for listing with ID: ${listingId}`);
      
      const listing = await Listing.findById(listingId);

      if (listing) {
        listing.totalRooms += booking.roomsRequired;
        await listing.save();
        console.log(`Updated listing ${listing._id} - added back ${booking.roomsRequired} rooms. New total: ${listing.totalRooms}`);
      } else {
        console.warn(`Listing not found for booking ${booking._id}`);
      }
    }
  } catch (err) {
    console.error("Error in booking auto-complete task:", err);
  }
});