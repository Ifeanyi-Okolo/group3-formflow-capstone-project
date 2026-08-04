import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  organizerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  date: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  totalTickets: {
    type: Number,
    required: true,
    min: 0,
  },
  availableTickets: {
    type: Number,
    required: true,
    min: 0,
  },
  ticketPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ["draft", "published", "cancelled"],
    default: "draft",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Event = mongoose.model("Event", eventSchema);
export default Event;
