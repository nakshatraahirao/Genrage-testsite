import { Router, Response } from 'express';
import prisma from '../prisma.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Get notifications
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' }
    });

    const unreadCount = notifications.filter(n => !n.isRead).length;

    res.json({ notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve notifications.' });
  }
});

// Mark single notification as read
router.put('/:id/read', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.notification.updateMany({
      where: { id, userId: req.user!.id },
      data: { isRead: true }
    });
    res.json({ message: 'Notification marked as read.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update notification.' });
  }
});

// Mark all as read
router.put('/read-all', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.id },
      data: { isRead: true }
    });
    res.json({ message: 'All notifications marked as read.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update notifications.' });
  }
});

export default router;
