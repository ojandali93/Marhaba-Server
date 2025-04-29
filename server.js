import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import http from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { supabase } from './services/SupabaseClient.js';

import authRoutes from './routers/AuthRoutes.js';
import accountRoutes from './routers/AccountRoutes.js';
import userRoutes from './routers/UserRoutes.js';
import conversationRoutes from './routers/ConversationRoutes.js';
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // adjust if you want to restrict frontend URL
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 3000;
// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, 
  message: 'Too many requests, please try again later.',
});

// Middlewares
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(compression());
app.use(limiter);
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/user', userRoutes);
app.use('/api/conversation', conversationRoutes);

// Health check
app.get('/health', (req, res) => res.send('✅ Marhaba backend is running'));

// --- SOCKET.IO JWT AUTH ---
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    console.log('No token provided');
    return next(new Error('Authentication error'));
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log('JWT verify error', err);
      return next(new Error('Authentication error'));
    }
    socket.user = decoded; // Save user info to socket
    next();
  });
});

// --- SOCKET.IO CONNECTION ---
io.on('connection', (socket) => {
  console.log(`✅ User connected: ${socket.user?.id}`);

  socket.on('joinConversation', ({ conversationId }) => {
    socket.join(`conversation_${conversationId}`);
    console.log(`🛜 User joined room: conversation_${conversationId}`);
  });

  socket.on('sendMessage', async (message) => {
    try {
      console.log('✉️ New message received:', message);

      const { data, error } = await supabase
        .from('Messages')
        .insert([
          {
            conversationId: message.conversationId,
            senderId: message.senderId,
            receiverId: message.receiverId,
            text: message.text,
            createdAt: message.createdAt,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('❌ Error saving message:', error);
        return;
      }

      console.log('✅ Message saved:', data);

      // Emit the new message to users in the same conversation room
      io.to(`conversation_${message.conversationId}`).emit('newMessage', data);
    } catch (err) {
      console.error('❌ Server error during sendMessage:', err);
    }
  });

  socket.on('leaveConversation', ({ conversationId }) => {
    socket.leave(`conversation_${conversationId}`);
    console.log(`🚪 User left room: conversation_${conversationId}`);
  });

  socket.on('disconnect', (reason) => {
    console.log(`❌ User disconnected: ${socket.user?.id}, Reason: ${reason}`);
  });
});


// --- SUPABASE REALTIME SUBSCRIPTION ---
const setupRealtimeMessages = () => {
  supabase
    .channel('public:messages') // 👈 Adjust the channel name later if needed
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      },
      (payload) => {
        console.log('📩 New message detected:', payload.new);

        // Broadcast to all users
        io.emit('newMessage', payload.new);
        
        // In future: emit to a specific room if you want private chats
      }
    )
    .subscribe((status) => {
      console.log('🛜 Supabase realtime subscription status:', status);
    });
};

// Setup realtime subscription
setupRealtimeMessages();

// --- SERVER START ---
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
