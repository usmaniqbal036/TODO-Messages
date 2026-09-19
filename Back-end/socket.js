import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from './models/User.js';



export const userRoom = (id) => `user:${id}`;

export const initSocket = (httpServer, corsOrigin) => {
  const io = new Server(httpServer, {
    cors: { origin: corsOrigin },
  });

  
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Not authorized, no token provided'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('_id');
      if (!user) return next(new Error('User no longer exists'));

      socket.userId = user.id;
      next();
    } catch {
      next(new Error('Not authorized, token invalid'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(userRoom(socket.userId));
  });

  return io;
};


export const emitToUsers = (app, userIds, event, payload) => {
  const io = app.get('io');
  if (!io) return;

  [...new Set(userIds.map(String))].forEach((id) => {
    io.to(userRoom(id)).emit(event, payload);
  });
};
