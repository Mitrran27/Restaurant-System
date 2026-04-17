require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Make io accessible throughout the app
app.set('io', io);

io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  // Join branch room for branch-specific updates
  socket.on('join:branch', (branchId) => {
    socket.join(`branch:${branchId}`);
    console.log(`Socket ${socket.id} joined branch:${branchId}`);
  });

  // Join order room for order-specific updates
  socket.on('join:order', (orderId) => {
    socket.join(`order:${orderId}`);
    console.log(`Socket ${socket.id} joined order:${orderId}`);
  });

  // Join role rooms
  socket.on('join:role', (role) => {
    socket.join(`role:${role}`);
    console.log(`Socket ${socket.id} joined role:${role}`);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
});
