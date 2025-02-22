import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const http = createServer(app);
const io = new Server(http);
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "public")));

let users = new Map();

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  //register user
  socket.on("register", (userId) => {
    users.set(userId, socket.id);
    console.log(`user ${userId} is registered with socket id : ${socket.id}`);
  });

  // action
  socket.on('actionTriggered', (data) => {
    const { fromUser, toUser, action } = data;
    const targetId = users.get(toUser);

    console.log(`Action Triggered: from ${fromUser} to ${toUser}`);
    console.log(`Target socket ID: ${targetId}`);
    console.log(`Registered Users:`, users);

    if (targetId) {
        io.to(targetId).emit('notification', {
            from: fromUser,
            message: `User ${fromUser} has ${action}`,
            timestamp: new Date().toISOString()
        });
        console.log(`Notification sent to user ${toUser}`);
    } else {
        console.log(`User ${toUser} not found in registered users.`);
    }
});

    //disconnect
  socket.on("disconnect", () => {
    for (const [userId, socketId] of users.entries()) {
      if (socketId === socket.id) {
        users.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });
});

http.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
