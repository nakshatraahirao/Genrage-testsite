import { Router, Request, Response } from 'express';
import prisma from '../prisma.js';

const router = Router();

// Get testimonials / reviews
router.get('/reviews', async (_req: Request, res: Response): Promise<void> => {
  try {
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    res.json({ reviews });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve reviews.' });
  }
});

// Submit review
router.post('/reviews', async (req: Request, res: Response): Promise<void> => {
  try {
    const { reviewerName, rating = 5, comment } = req.body;
    if (!reviewerName || !comment) {
      res.status(400).json({ error: 'Name and comment are required.' });
      return;
    }

    const review = await prisma.review.create({
      data: {
        reviewerName,
        rating: Math.min(5, Math.max(1, parseInt(rating, 10))),
        comment,
        verified: true
      }
    });

    res.status(201).json({ message: 'Review submitted.', review });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit review.' });
  }
});

// Submit contact inquiry
router.post('/contact', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !message) {
      res.status(400).json({ error: 'Name, email, and message are required.' });
      return;
    }

    const contact = await prisma.contactMessage.create({
      data: {
        name,
        email,
        phone: phone || null,
        message
      }
    });

    res.status(201).json({ message: 'Message sent successfully. Our team will get back to you shortly.', contact });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send contact message.' });
  }
});

export default router;
