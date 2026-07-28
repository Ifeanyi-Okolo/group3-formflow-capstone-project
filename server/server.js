import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/db.js";
import eventRoutes from "./src/routes/eventRoutes.js";
import attendeeRoutes from "./src/routes/attendeeRoutes.js";
import dashboardRoutes from "./src/routes/dashboardRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

//Middleware
app.use(cors());
app.use(express.json());

app.use("/api/admin/auth", authRoutes);
app.use("/api/admin", eventRoutes);
app.use("/api/admin", attendeeRoutes);
app.use("/api/admin", dashboardRoutes);

await connectDB();
app.listen(PORT, () => console.log(`Server running on Port ${PORT}`));
