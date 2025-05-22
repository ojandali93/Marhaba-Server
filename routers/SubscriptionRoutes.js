import { Router } from 'express';
import { verifySubscription } from '../controllers/SubscriptionControllers.js';

const router = Router();

router.post('/verify-subscription', verifySubscription);

export default router;