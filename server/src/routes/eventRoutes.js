import express from "express";
import {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  cancelEvent,
} from "../controllers/eventController.js";
import {
  getAttendees,
  createAttendee,
} from "../controllers/attendeeController.js";

const router = express.Router();

router.post("/events", createEvent);
router.get("/events", getEvents);
router.get("/events/:id", getEventById);
router.put("/events/:id", updateEvent);
router.delete("/events/:id", cancelEvent);

router.get("/events/:eventId/attendees", getAttendees);
router.post("/events/:eventId/attendees", createAttendee);

export default router;
