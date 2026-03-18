import { Router } from 'express';
import { createVisitorSession, listCallHistory, ringOwner, updateCallStatus } from '../controllers/call.controller';
import { requireOwnerAuth, requireVisitorAuth } from '../middleware/auth.middleware';

const router = Router();
router.post('/session', createVisitorSession);
router.post('/ring', requireVisitorAuth, ringOwner);
router.post('/status', requireOwnerAuth, updateCallStatus);
router.get('/history', requireOwnerAuth, listCallHistory);

export default router;
