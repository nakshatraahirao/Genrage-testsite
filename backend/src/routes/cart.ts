import { Router, Response } from 'express';
import prisma from '../prisma.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Get current user cart
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const items = await prisma.cartItem.findMany({
      where: { userId: req.user!.id },
      include: {
        product: {
          include: {
            images: { where: { isPrimary: true }, take: 1 }
          }
        },
        variant: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedItems = items.map(item => {
      const unitPrice = (item.product.price || 0) + (item.variant?.priceOffset || 0);
      const subtotal = unitPrice * item.quantity;
      return {
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        productName: item.product.name,
        slug: item.product.slug,
        imageUrl: item.product.images[0]?.imageUrl || '',
        size: item.variant?.size || null,
        color: item.variant?.color || null,
        stockAvailable: item.variant ? item.variant.stockQuantity : 99,
        quantity: item.quantity,
        unitPrice,
        subtotal
      };
    });

    const subtotal = formattedItems.reduce((acc, curr) => acc + curr.subtotal, 0);
    const shipping = subtotal > 2000 || subtotal === 0 ? 0 : 150; // Free shipping over ₹2000
    const total = subtotal + shipping;

    res.json({
      items: formattedItems,
      summary: {
        itemCount: formattedItems.reduce((acc, curr) => acc + curr.quantity, 0),
        subtotal,
        shipping,
        total
      }
    });
  } catch (err: any) {
    console.error('Fetch cart error:', err);
    res.status(500).json({ error: 'Failed to retrieve cart items.' });
  }
});

// Add item to cart
router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId, variantId, quantity = 1 } = req.body;

    if (!productId) {
      res.status(400).json({ error: 'Product ID is required.' });
      return;
    }

    // Check product existence
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { variants: true }
    });

    if (!product || !product.isActive) {
      res.status(404).json({ error: 'Product not found or unavailable.' });
      return;
    }

    // If variants exist, validate variant
    if (product.variants.length > 0 && !variantId) {
      res.status(400).json({ error: 'Please select a size and color variant.' });
      return;
    }

    if (variantId) {
      const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
      if (!variant) {
        res.status(404).json({ error: 'Variant not found.' });
        return;
      }
      if (variant.stockQuantity < quantity) {
        res.status(400).json({ error: `Only ${variant.stockQuantity} items available in stock.` });
        return;
      }
    }

    // Check if already in cart
    const existing = await prisma.cartItem.findFirst({
      where: {
        userId: req.user!.id,
        productId,
        variantId: variantId || null
      }
    });

    if (existing) {
      const updated = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity }
      });
      res.json({ message: 'Cart item updated.', item: updated });
    } else {
      const newItem = await prisma.cartItem.create({
        data: {
          userId: req.user!.id,
          productId,
          variantId: variantId || null,
          quantity
        }
      });
      res.status(201).json({ message: 'Item added to cart.', item: newItem });
    }
  } catch (err: any) {
    console.error('Add to cart error:', err);
    res.status(500).json({ error: 'Failed to add item to cart.' });
  }
});

// Update cart item quantity
router.put('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { quantity } = req.body;
    const { id } = req.params;

    if (quantity <= 0) {
      await prisma.cartItem.deleteMany({
        where: { id, userId: req.user!.id }
      });
      res.json({ message: 'Item removed from cart.' });
      return;
    }

    const item = await prisma.cartItem.findFirst({
      where: { id, userId: req.user!.id },
      include: { variant: true }
    });

    if (!item) {
      res.status(404).json({ error: 'Cart item not found.' });
      return;
    }

    if (item.variant && item.variant.stockQuantity < quantity) {
      res.status(400).json({ error: `Only ${item.variant.stockQuantity} items in stock.` });
      return;
    }

    const updated = await prisma.cartItem.update({
      where: { id },
      data: { quantity }
    });

    res.json({ message: 'Quantity updated.', item: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update cart quantity.' });
  }
});

// Remove item from cart
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.cartItem.deleteMany({
      where: { id, userId: req.user!.id }
    });
    res.json({ message: 'Item removed from cart.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete cart item.' });
  }
});

// Clear cart
router.delete('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.cartItem.deleteMany({
      where: { userId: req.user!.id }
    });
    res.json({ message: 'Cart cleared.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear cart.' });
  }
});

export default router;
