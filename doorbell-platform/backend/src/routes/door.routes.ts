import { Router } from 'express';
import { createDoor, getDoor, listDoors } from '../controllers/door.controller';
import { requireOwnerAuth } from '../middleware/auth.middleware';

const router = Router();
router.post('/', requireOwnerAuth, createDoor);
router.get('/:id', getDoor);
router.get('/', requireOwnerAuth, listDoors);

export default router;
