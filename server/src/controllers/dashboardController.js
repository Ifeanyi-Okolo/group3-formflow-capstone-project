import Event from "../models/Event.js";
import Attendee from "../models/Attendee.js";
import mongoose from "mongoose";

export const getDashboardStats = async (req, res) => {
  try {
    const { organizerId } = req.query;
    if (!organizerId || !mongoose.isValidObjectId(organizerId)) {
      return res.status(400).json({
        success: false,
        message: "organizerId query parameter is required and must be valid",
      });
    }

    const events = await Event.find({
      organizerId,
      status: { $ne: "cancelled" },
    });
    const eventIds = events.map((event) => event._id);

    const recentEvents = await Event.find({ organizerId })
      .sort({ date: -1 })
      .limit(5)
      .select("title location date status")
      .lean();

    const totalTicketsSold = await Attendee.countDocuments({
      eventId: { $in: eventIds },
      status: { $ne: "cancelled" },
    });

    const revenueAggregation = await Attendee.aggregate([
      { $match: { eventId: { $in: eventIds }, status: { $ne: "cancelled" } } },
      {
        $lookup: {
          from: "events",
          localField: "eventId",
          foreignField: "_id",
          as: "event",
        },
      },
      { $unwind: "$event" },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$event.ticketPrice" },
        },
      },
    ]);

    const totalRevenue = revenueAggregation[0]?.totalRevenue || 0;
    const upcomingEvents = events.filter(
      (event) => event.date > new Date(),
    ).length;
    const activeAttendees = await Attendee.countDocuments({
      eventId: { $in: eventIds },
      status: { $in: ["confirmed", "checked-in"] },
    });

    return res.status(200).json({
      success: true,
      data: {
        totalTicketsSold,
        totalRevenue,
        totalUpcomingEvents: upcomingEvents,
        activeAttendees,
        recentEvents,
      },
      message: "Dashboard stats retrieved successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch dashboard stats",
    });
  }
};
