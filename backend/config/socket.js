const { Server } = require('socket.io');
const { supabase } = require('./supabase');

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

      // Verify token with Supabase Auth (same as REST API middleware)
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token);

      if (authError || !authUser) {
        console.error('[Socket.IO] Supabase auth error:', authError?.message || 'User not found');
        return next(new Error('Authentication error: Invalid or expired token'));
      }

      // Fetch full user data from database
      const { data: user, error: dbError } = await supabase
        .from('users')
        .select('id, email, full_name, role')
        .eq('id', authUser.id)
        .single();

      if (dbError || !user) {
        console.error('[Socket.IO] Database error:', dbError?.message || 'User not found in database');
        return next(new Error('Authentication error: User not found'));
      }

      console.log('[Socket.IO] User authenticated:', user.email, `(${user.role})`);

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
async function emitToUser(userId, event, data) {
  if (!io) {
    console.warn('Socket.IO not initialized. Notification not sent.');
    return;
  }
  
  // Check if user is in the room
  const sockets = await io.in(`user:${userId}`).fetchSockets();
  console.log(`📤 Attempting to send "${event}" to user ${userId} (${sockets.length} sockets in room)`);
  
  if (sockets.length === 0) {
    console.warn(`⚠️  No sockets found for user ${userId}. User might be offline.`);
  }
  
  io.to(`user:${userId}`).emit(event, data);
  console.log(`✅ Emitted "${event}" to user:${userId}`);
}

/**
 * Emit notification to specific role
 * @param {string} role - Role (user, veterinarian, admin)
 * @param {string} event - Event name
 * @param {Object} data - Data to send
 */
async function emitToRole(role, event, data) {
  if (!io) {
    console.warn('Socket.IO not initialized. Notification not sent.');
    return;
  }
  
  // Check how many sockets are in the role room
  const sockets = await io.in(`role:${role}`).fetchSockets();
  console.log(`📤 Attempting to send "${event}" to role ${role} (${sockets.length} sockets in room)`);
  
  if (sockets.length === 0) {
    console.warn(`⚠️  No sockets found for role ${role}. No users with this role are online.`);
  }
  
  io.to(`role:${role}`).emit(event, data);
  console.log(`✅ Emitted "${event}" to role:${role}`);
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

