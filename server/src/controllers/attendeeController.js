import mongoose from "mongoose";
import Event from "../models/Event.js";
import Attendee from "../models/Attendee.js";

export const getAttendees = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { status, search } = req.query;

    if (!mongoose.isValidObjectId(eventId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid event id" });
    }

    const filter = { eventId };
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { customerName: new RegExp(search, "i") },
        { customerEmail: new RegExp(search, "i") },
      ];
    }

    const attendees = await Attendee.find(filter).sort({ purchaseDate: -1 });
    return res.status(200).json({
      success: true,
      data: attendees,
      message: "Attendees retrieved successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch attendees",
    });
  }
};

export const createAttendee = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { organizerId, customerName, customerEmail, ticketType } = req.body;

    if (!mongoose.isValidObjectId(eventId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid event id" });
    }

    if (!organizerId || !customerName || !customerEmail || !ticketType) {
      return res.status(400).json({
        success: false,
        message:
          "organizerId, customerName, customerEmail, and ticketType are required",
      });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    if (event.status === "cancelled") {
      return res
        .status(400)
        .json({
          success: false,
          message: "Cannot register attendee for a cancelled event",
        });
    }

    if (event.availableTickets <= 0) {
      return res
        .status(400)
        .json({
          success: false,
          message: "No available tickets for this event",
        });
    }

    const attendee = await Attendee.create({
      eventId,
      organizerId,
      customerName,
      customerEmail,
      ticketType,
    });

    event.availableTickets -= 1;
    await event.save();

    return res.status(201).json({
      success: true,
      data: attendee,
      message: "Attendee registered successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to register attendee",
    });
  }
};

export const toggleCheckin = async (req, res) => {
  try {
    const { attendeeId } = req.params;
    if (!mongoose.isValidObjectId(attendeeId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid attendee id" });
    }

    const attendee = await Attendee.findById(attendeeId);
    if (!attendee) {
      return res
        .status(404)
        .json({ success: false, message: "Attendee not found" });
    }

    if (attendee.status === "cancelled") {
      return res
        .status(400)
        .json({
          success: false,
          message: "Cannot check in a cancelled attendee",
        });
    }

    attendee.status =
      attendee.status === "checked-in" ? "confirmed" : "checked-in";
    await attendee.save();

    return res.status(200).json({
      success: true,
      data: attendee,
      message: "Attendee check-in status updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update attendee status",
    });
  }
};

export const cancelAttendee = async (req, res) => {
  try {
    const { attendeeId } = req.params;
    if (!mongoose.isValidObjectId(attendeeId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid attendee id" });
    }

    const attendee = await Attendee.findById(attendeeId);
    if (!attendee) {
      return res
        .status(404)
        .json({ success: false, message: "Attendee not found" });
    }

    if (attendee.status === "cancelled") {
      return res
        .status(400)
        .json({
          success: false,
          message: "Attendee ticket is already cancelled",
        });
    }

    const event = await Event.findById(attendee.eventId);
    if (event) {
      event.availableTickets += 1;
      await event.save();
    }

    attendee.status = "cancelled";
    await attendee.save();

    return res.status(200).json({
      success: true,
      data: attendee,
      message: "Attendee ticket cancelled successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to cancel attendee ticket",
    });
  }
};
