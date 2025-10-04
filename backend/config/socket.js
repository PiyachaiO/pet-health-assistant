const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const supabase = require('./supabase');

let io;

/**
 * Initialize Socket.IO server
 * @param {Object} server - HTTP server instance
 * @returns {Object} Socket.IO instance
 */
function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'https://frontend-one-ashen-93.vercel.app',
        'https://frontend-nmwrwmfmm-piyachais-projects.vercel.app',
        'https://pet-health-assistant-one.vercel.app'
      ],
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling'], // Support both WebSocket and fallback
    pingTimeout: 60000, // 60 seconds
    pingInterval: 25000, // 25 seconds
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Fetch user from database
      const { data: user, error } = await supabase
        .from('users')
        .select('id, email, full_name, role')
        .eq('id', decoded.userId)
        .single();

      if (error || !user) {
        return next(new Error('Authentication error: Invalid token'));
      }

      // Attach user to socket
      socket.userId = user.id;
      socket.userEmail = user.email;
      socket.userName = user.full_name;
      socket.userRole = user.role;

      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.userName} (${socket.userRole}) - Socket ID: ${socket.id}`);

    // Join role-based rooms
    socket.join(`role:${socket.userRole}`);
    socket.join(`user:${socket.userId}`);

    // Log connection details
    socket.emit('connected', {
      message: 'Successfully connected to real-time notifications',
      userId: socket.userId,
      role: socket.userRole,
      timestamp: new Date().toISOString()
    });

    // Handle disconnect
    socket.on('disconnect', (reason) => {
      console.log(`❌ User disconnected: ${socket.userName} - Reason: ${reason}`);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error(`Socket error for user ${socket.userId}:`, error);
    });

    // Ping-pong for connection health check
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: Date.now() });
    });
  });

  console.log('🚀 Socket.IO server initialized');
  return io;
}

/**
 * Get Socket.IO instance
 * @returns {Object} Socket.IO instance
 */
function getIO() {
  if (!io) {
    throw new Error('Socket.IO not initialized. Call initializeSocket first.');
  }
  return io;
}

/**
 * Emit notification to specific user
 * @param {string} userId - User ID
 * @param {string} event - Event name
 * @param {Object} data - Data to send
 */
function emitToUser(userId, event, data) {
  if (!io) {
    console.warn('Socket.IO not initialized. Notification not sent.');
    return;
  }
  io.to(`user:${userId}`).emit(event, data);
  console.log(`📤 Sent "${event}" to user ${userId}`);
}

/**
 * Emit notification to specific role
 * @param {string} role - Role (user, veterinarian, admin)
 * @param {string} event - Event name
 * @param {Object} data - Data to send
 */
function emitToRole(role, event, data) {
  if (!io) {
    console.warn('Socket.IO not initialized. Notification not sent.');
    return;
  }
  io.to(`role:${role}`).emit(event, data);
  console.log(`📤 Sent "${event}" to role ${role}`);
}

/**
 * Emit notification to all connected clients
 * @param {string} event - Event name
 * @param {Object} data - Data to send
 */
function emitToAll(event, data) {
  if (!io) {
    console.warn('Socket.IO not initialized. Notification not sent.');
    return;
  }
  io.emit(event, data);
  console.log(`📤 Broadcast "${event}" to all users`);
}

/**
 * Get connected sockets count
 * @returns {Promise<number>} Number of connected sockets
 */
async function getConnectedCount() {
  if (!io) {
    return 0;
  }
  const sockets = await io.fetchSockets();
  return sockets.length;
}

/**
 * Get connected sockets by role
 * @param {string} role - Role (user, veterinarian, admin)
 * @returns {Promise<number>} Number of connected sockets for role
 */
async function getConnectedCountByRole(role) {
  if (!io) {
    return 0;
  }
  const sockets = await io.in(`role:${role}`).fetchSockets();
  return sockets.length;
}

module.exports = {
  initializeSocket,
  getIO,
  emitToUser,
  emitToRole,
  emitToAll,
  getConnectedCount,
  getConnectedCountByRole
};

