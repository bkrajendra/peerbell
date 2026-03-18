import { Router } from 'express';
import { loginOwner, registerDevice, registerOwner } from '../controllers/owner.controller';
import { requireOwnerAuth } from '../middleware/auth.middleware';

const router = Router();
router.post('/register', registerOwner);
router.post('/login', loginOwner);
router.post('/device', requireOwnerAuth, registerDevice);

export default router;
