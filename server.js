import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import callRoutes from "./routes/callRoutes.js";
import { setupSocket } from "./websocket/index.js";
import { errorHandler } from "./utils/errorHandler.js";
import helmet from "helmet";

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = setupSocket(server);

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(helmet());

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.get("/", (req, res) => res.send("Server running"));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", chatRoutes);
app.use("/api/call", callRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5016;
server.listen(PORT, () =>
  console.log(`Server running on ${PORT}`)
);
