import { Router, Response } from 'express';
import prisma from '../prisma.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Get user wishlist
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const items = await prisma.wishlistItem.findMany({
      where: { userId: req.user!.id },
      include: {
        product: {
          include: {
            images: { orderBy: { displayOrder: 'asc' } },
            variants: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ wishlist: items });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve wishlist.' });
  }
});

// Toggle wishlist item
router.post('/:productId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const userId = req.user!.id;

    const existing = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: { userId, productId }
      }
    });

    if (existing) {
      await prisma.wishlistItem.delete({
        where: { id: existing.id }
      });
      res.json({ message: 'Removed from wishlist.', inWishlist: false });
    } else {
      await prisma.wishlistItem.create({
        data: { userId, productId }
      });
      res.json({ message: 'Added to wishlist.', inWishlist: true });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to update wishlist.' });
  }
});

export default router;
