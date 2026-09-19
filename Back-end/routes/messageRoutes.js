import express from 'express';
import {
  getMessages,
  getConversations,
  sendMessage,
  deleteMessage,
  markAsRead,
} from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);



router.get('/conversations', getConversations);
router.get('/:userId', getMessages);
router.put('/:userId/read', markAsRead);
router.post('/', sendMessage);
router.delete('/:id', deleteMessage);

export default router;
