// SlotSwapper - MongoDB Version
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors"; // Import cors
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createServer } from 'http'; 
import { Server } from 'socket.io';   

dotenv.config();

const app = express();

// --- THIS IS THE FIX ---
// This allows requests from ALL origins (e.g., localhost, Vercel, etc.)
// It's the simplest way to solve the "not working" issue.
app.use(cors());
// --- END OF FIX ---

app.use(express.json());

// --- Socket.io Setup ---
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Also allow all origins for sockets
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log(`✅ User connected: ${socket.id}`);
  
  socket.on('join_room', (userId) => {
    socket.join(userId);
    console.log(`User ${socket.id} joined room ${userId}`);
  });

  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});
// --- End Socket.io Setup ---

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";

// ====================
// MongoDB Connection
// ====================
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("MongoDB Error:", err));

// ====================
// Schemas
// ====================
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  createdAt: { type: Date, default: Date.now },
});

const eventSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  title: String,
  startTime: Date,
  endTime: Date,
  status: { type: String, enum: ["BUSY", "SWAPPABLE", "SWAP_PENDING"], default: "BUSY" },
  createdAt: { type: Date, default: Date.now },
});

const swapSchema = new mongoose.Schema({
  requesterId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  requesterSlotId: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
  targetUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  targetSlotId: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
  status: { type: String, enum: ["PENDING", "ACCEPTED", "REJECTED"], default: "PENDING" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);
const Event = mongoose.model("Event", eventSchema);
const SwapRequest = mongoose.model("SwapRequest", swapSchema);

// ====================
// Middleware
// ====================
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Access token required" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
};

// ====================
// Routes
// ====================

app.get("/api/health", (_, res) => res.json({ status: "OK" }));

// Register
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: "All fields required" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Signup failed" });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

// Get Events
app.get("/api/events", authenticateToken, async (req, res) => {
  const events = await Event.find({ userId: req.user.id }).sort({ startTime: 1 });
  res.json(events);
});

// Create Event
app.post("/api/events", authenticateToken, async (req, res) => {
  const { title, startTime, endTime, status } = req.body;
  if (!title || !startTime || !endTime) return res.status(400).json({ error: "Missing fields" });
  const event = await Event.create({ userId: req.user.id, title, startTime, endTime, status });
  res.status(201).json(event);
});

// Update Event (Handles Request Cancellation)
app.put("/api/events/:id", authenticateToken, async (req, res) => {
  try {
    const { status: newStatus } = req.body; 
    const event = await Event.findOne({ _id: req.params.id, userId: req.user.id });
    if (!event) return res.status(404).json({ error: "Event not found" });

    const oldStatus = event.status;
    if (oldStatus === newStatus) return res.json(event);

    if (oldStatus === 'SWAP_PENDING' && (newStatus === 'BUSY' || newStatus === 'SWAPPABLE')) {
      
      const swap = await SwapRequest.findOne({
        $or: [{ requesterSlotId: event._id }, { targetSlotId: event._id }],
        status: 'PENDING'
      });

      if (swap) {
        await Event.updateMany(
          { _id: { $in: [swap.requesterSlotId, swap.targetSlotId] } },
          { status: 'SWAPPABLE' }
        );
        
        await SwapRequest.findByIdAndDelete(swap._id);

        const myEvent = await Event.findById(req.params.id);
        myEvent.status = newStatus;
        await myEvent.save();
        return res.json(myEvent);
      }
    }

    event.status = newStatus;
    await event.save();
    res.json(event);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error updating event' });
  }
});

// Delete Event
app.delete("/api/events/:id", authenticateToken, async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, userId: req.user.id });
    if (!event) return res.status(404).json({ error: "Event not found" });

    if (event.status === 'SWAP_PENDING') {
      return res.status(400).json({ error: "Cannot delete event with a pending swap. Please cancel/reject the swap first." });
    }
    
    await SwapRequest.deleteMany({
      $or: [{ requesterSlotId: event._id }, { targetSlotId: event._id }]
    });

    await Event.findByIdAndDelete(req.params.id);
    
    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error deleting event' });
  }
});

// Swappable Slots
app.get("/api/swappable-slots", authenticateToken, async (req, res) => {
  const events = await Event.find({ status: "SWAPPABLE", userId: { $ne: req.user.id } }).populate("userId", "name email");
  res.json(events);
});

// Swap Request
app.post("/api/swap-request", authenticateToken, async (req, res) => {
  try {
    const { mySlotId, theirSlotId } = req.body;
    const mySlot = await Event.findById(mySlotId);
    const theirSlot = await Event.findById(theirSlotId);
    if (!mySlot || !theirSlot) return res.status(404).json({ error: "Slots not found" });

    const request = await SwapRequest.create({
      requesterId: req.user.id,
      requesterSlotId: mySlotId,
      targetUserId: theirSlot.userId,
      targetSlotId: theirSlotId,
    });

    await Event.updateMany({ _id: { $in: [mySlotId, theirSlotId] } }, { status: "SWAP_PENDING" });
    
    const targetUserId = theirSlot.userId.toString();
    const requester = await User.findById(req.user.id);
    
    io.to(targetUserId).emit("new_request", {
      message: `You have a new swap request from ${requester.name || 'a user'}` 
    });
    
    res.status(201).json(request);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create swap request' });
  }
});

// My Requests
app.get("/api/swap-requests", authenticateToken, async (req, res) => {
  try {
    const incoming = await SwapRequest.find({ targetUserId: req.user.id })
      .populate("requesterId", "name")
      .populate("requesterSlotId", "title startTime _id")
      .populate("targetSlotId", "title startTime _id");
      
    const outgoing = await SwapRequest.find({ requesterId: req.user.id })
      .populate("targetUserId", "name")
      .populate("requesterSlotId", "title startTime _id")
      .populate("targetSlotId", "title startTime _id");
      
    res.json({ incoming, outgoing });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get swap requests' });
  }
});

// Respond to Swap
app.post("/api/swap-response/:id", authenticateToken, async (req, res) => {
  try {
    const { accept } = req.body;
    const swap = await SwapRequest.findOne({ _id: req.params.id, targetUserId: req.user.id });
    if (!swap) return res.status(404).json({ error: "Swap not found" });

    if (accept) {
      const slot1 = await Event.findById(swap.requesterSlotId);
      const slot2 = await Event.findById(swap.targetSlotId);

      // Handle edge case where one of the slots was deleted
      if (!slot1 || !slot2) {
        if (!slot1) await Event.findByIdAndUpdate(swap.targetSlotId, { status: 'SWAPPABLE' });
        if (!slot2) await Event.findByIdAndUpdate(swap.requesterSlotId, { status: 'SWAPPABLE' });
        await SwapRequest.findByIdAndDelete(swap._id);
        return res.status(404).json({ error: "One of the slots no longer exists. Request canceled." });
      }

      const tempUser = slot1.userId;
      slot1.userId = slot2.userId;
      slot2.userId = tempUser;

      slot1.status = slot2.status = "BUSY";
      await slot1.save();
      await slot2.save();

      swap.status = "ACCEPTED";
    } else {
      await Event.updateMany({ _id: { $in: [swap.requesterSlotId, swap.targetSlotId] } }, { status: "SWAPPABLE" });
      swap.status = "REJECTED";
    }

    await swap.save();

    const requesterId = swap.requesterId.toString();
    io.to(requesterId).emit("request_response", {
      message: `Your swap request was ${swap.status.toLowerCase()}`
    });
    
    res.json({ message: accept ? "Swap accepted" : "Swap rejected", swap });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to respond to swap' });
  }
});

// ====================
// Start Server
// ====================
httpServer.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));

// Export app for testing
export default app;
