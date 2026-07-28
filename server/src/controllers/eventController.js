import Event from "../models/Event.js";
import Attendee from "../models/Attendee.js";
import mongoose from "mongoose";

export const createEvent = async (req, res) => {
  try {
    const {
      organizerId,
      title,
      description,
      date,
      location,
      totalTickets,
      ticketPrice,
      status = "draft",
    } = req.body;

    if (
      !organizerId ||
      !title ||
      !date ||
      !location ||
      totalTickets == null ||
      ticketPrice == null
    ) {
      return res.status(400).json({
        success: false,
        message:
          "organizerId, title, date, location, totalTickets, and ticketPrice are required",
      });
    }

    const event = await Event.create({
      organizerId,
      title,
      description,
      date,
      location,
      totalTickets,
      availableTickets: totalTickets,
      ticketPrice,
      status,
    });

    return res.status(201).json({
      success: true,
      data: event,
      message: "Event created successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create event",
    });
  }
};

export const getEvents = async (req, res) => {
  try {
    const { organizerId } = req.query;
    if (!organizerId) {
      return res.status(400).json({
        success: false,
        message: "organizerId query parameter is required",
      });
    }

    const events = await Event.find({ organizerId }).sort({ date: 1 });
    return res.status(200).json({
      success: true,
      data: events,
      message: "Events retrieved successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch events",
    });
  }
};

export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid event id" });
    }

    const event = await Event.findById(id);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    const ticketsSold = await Attendee.countDocuments({
      eventId: id,
      status: { $ne: "cancelled" },
    });
    const totalRevenue = ticketsSold * event.ticketPrice;

    return res.status(200).json({
      success: true,
      data: {
        ...event.toObject(),
        ticketsSold,
        totalRevenue,
      },
      message: "Event details retrieved successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch event details",
    });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      date,
      location,
      totalTickets,
      ticketPrice,
      status,
    } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid event id" });
    }

    const event = await Event.findById(id);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    if (totalTickets != null) {
      const soldTickets = event.totalTickets - event.availableTickets;
      if (totalTickets < soldTickets) {
        return res.status(400).json({
          success: false,
          message: "New totalTickets cannot be less than tickets already sold",
        });
      }
      const ticketDifference = totalTickets - event.totalTickets;
      event.totalTickets = totalTickets;
      event.availableTickets = Math.max(
        0,
        event.availableTickets + ticketDifference,
      );
    }

    if (title != null) event.title = title;
    if (description != null) event.description = description;
    if (date != null) event.date = date;
    if (location != null) event.location = location;
    if (ticketPrice != null) event.ticketPrice = ticketPrice;
    if (status != null) event.status = status;

    await event.save();

    return res.status(200).json({
      success: true,
      data: event,
      message: "Event updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update event",
    });
  }
};

export const cancelEvent = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid event id" });
    }

    const event = await Event.findById(id);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    event.status = "cancelled";
    event.availableTickets = 0;
    await event.save();

    return res.status(200).json({
      success: true,
      data: event,
      message: "Event cancelled successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to cancel event",
    });
  }
};
