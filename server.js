import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import rateLimit from 'express-rate-limit';
import xssClean from 'xss-clean';
import hpp from 'hpp';
import compression from 'compression';
import userRoutes from './routers/UserRouters.js';
import authRoutes from './routers/AuthRoutes.js';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.',
});


// ✅ Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(xssClean());
app.use(hpp());
app.use(compression());
app.use(limiter);

// ✅ Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

// ✅ Health check endpoint (optional)
app.get('/health', (req, res) => res.send('✅ Marhaba backend is running'));

// ✅ Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
