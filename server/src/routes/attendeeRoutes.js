import express from "express";
import {
  toggleCheckin,
  cancelAttendee,
} from "../controllers/attendeeController.js";

const router = express.Router();

router.patch("/attendees/:attendeeId/checkin", toggleCheckin);
router.delete("/attendees/:attendeeId", cancelAttendee);

export default router;
