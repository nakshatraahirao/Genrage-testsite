import { Router, Request, Response } from 'express';
import prisma from '../prisma.js';

const router = Router();

// Get all categories with product count
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { displayOrder: 'asc' }
    });

    res.json({ categories });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve categories.' });
  }
});

export default router;
