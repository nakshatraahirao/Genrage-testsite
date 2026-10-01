import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'genrage_super_secret_jwt_key_2026_streetwear';

// Register
router.post('/register', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password, name, phone } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ error: 'Email, password, and name are required.' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      res.status(400).json({ error: 'An account with this email already exists.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        name,
        phone: phone || null,
        role: 'CUSTOMER'
      },
      select: { id: true, email: true, name: true, phone: true, role: true, createdAt: true }
    });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Account created successfully.',
      user,
      token
    });
  } catch (err: any) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// Login
router.post('/login', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Logged in successfully.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt
      },
      token
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// Get Current User Profile
router.get('/me', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
        addresses: true
      }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user profile.' });
  }
});

// Update Profile
router.put('/profile', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, phone } = req.body;
    const updated = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        name: name !== undefined ? name : undefined,
        phone: phone !== undefined ? phone : undefined
      },
      select: { id: true, email: true, name: true, phone: true, role: true }
    });

    res.json({ message: 'Profile updated successfully.', user: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// Addresses
router.get('/addresses', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user!.id },
      orderBy: { isDefault: 'desc' }
    });
    res.json({ addresses });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch addresses.' });
  }
});

router.post('/addresses', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { fullName, phone, street, city, state, postalCode, country, isDefault } = req.body;

    if (!fullName || !phone || !street || !city || !state || !postalCode) {
      res.status(400).json({ error: 'All address fields are required.' });
      return;
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user!.id },
        data: { isDefault: false }
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: req.user!.id,
        fullName,
        phone,
        street,
        city,
        state,
        postalCode,
        country: country || 'India',
        isDefault: Boolean(isDefault)
      }
    });

    res.status(201).json({ message: 'Address created.', address });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create address.' });
  }
});

router.delete('/addresses/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const address = await prisma.address.findFirst({
      where: { id: req.params.id, userId: req.user!.id }
    });

    if (!address) {
      res.status(404).json({ error: 'Address not found.' });
      return;
    }

    await prisma.address.delete({ where: { id: req.params.id } });
    res.json({ message: 'Address removed successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete address.' });
  }
});

export default router;
