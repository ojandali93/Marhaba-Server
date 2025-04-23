import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import userRoutes from './routers/UserRouters.js';
import authRoutes from './routers/AuthRoutes.js';
import accountRoutes from './routers/AccountRoutes.js';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, 
  message: 'Too many requests, please try again later.',
});


app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(compression());
app.use(limiter);

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/account', accountRoutes);

app.get('/health', (req, res) => res.send('✅ Marhaba backend is running'));

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
