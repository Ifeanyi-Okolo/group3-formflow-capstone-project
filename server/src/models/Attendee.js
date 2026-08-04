import mongoose from "mongoose";

const attendeeSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  organizerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  customerName: {
    type: String,
    required: true,
    trim: true,
  },
  customerEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  ticketType: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ["confirmed", "checked-in", "cancelled"],
    default: "confirmed",
  },
  purchaseDate: {
    type: Date,
    default: Date.now,
  },
});

const Attendee = mongoose.model("Attendee", attendeeSchema);
export default Attendee;
