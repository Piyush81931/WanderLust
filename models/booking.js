const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  listing: {
    type: Schema.Types.ObjectId,
    ref: 'Listing',
    required: true,
  },
  owner: { 
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true 
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  
  arrivalTime: {
    type: Date,
    required: true
  },
  departureTime: {
    type: Date,
    required: true
  },
  totalGuests: {
    type: Number,
    required: true
  },
  roomType: {
    type: String,
    enum: ['Single Bed', 'Double Bed'],
    required: true
  },
  roomsRequired: {
    type: Number,
    required: true
  },
  message: {
    type: String
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  isConfirmed: {
    type: Boolean,
    default: false
  },
  isConfirmedUser: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
