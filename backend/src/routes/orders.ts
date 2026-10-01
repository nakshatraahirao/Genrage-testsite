import { Router, Response } from 'express';
import prisma from '../prisma.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Create order (Checkout)
router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      addressId,
      shippingAddress, // Custom address if not selecting existing
      paymentMethod = 'CARD',
      directItem // Optional for Buy Now without cart
    } = req.body;

    const userId = req.user!.id;
    let orderItemsData: any[] = [];
    let subtotal = 0;

    if (directItem) {
      // Buy Now flow
      const product = await prisma.product.findUnique({
        where: { id: directItem.productId },
        include: { images: true }
      });
      if (!product || !product.isActive) {
        res.status(400).json({ error: 'Product is currently unavailable.' });
        return;
      }

      let variant: any = null;
      if (directItem.variantId) {
        variant = await prisma.productVariant.findUnique({ where: { id: directItem.variantId } });
        if (!variant || variant.stockQuantity < directItem.quantity) {
          res.status(400).json({ error: 'Selected variant is out of stock.' });
          return;
        }
      }

      const unitPrice = product.price + (variant?.priceOffset || 0);
      subtotal = unitPrice * (directItem.quantity || 1);
      orderItemsData.push({
        productId: product.id,
        variantId: variant?.id || null,
        productName: product.name,
        size: variant?.size || null,
        color: variant?.color || null,
        quantity: directItem.quantity || 1,
        priceAtPurchase: unitPrice,
        imageUrl: product.images[0]?.imageUrl || ''
      });
    } else {
      // Cart checkout flow
      const cartItems = await prisma.cartItem.findMany({
        where: { userId },
        include: {
          product: { include: { images: true } },
          variant: true
        }
      });

      if (cartItems.length === 0) {
        res.status(400).json({ error: 'Cart is empty.' });
        return;
      }

      for (const item of cartItems) {
        if (item.variant && item.variant.stockQuantity < item.quantity) {
          res.status(400).json({
            error: `Item "${item.product.name}" (${item.variant.size}/${item.variant.color}) only has ${item.variant.stockQuantity} remaining.`
          });
          return;
        }
        const unitPrice = item.product.price + (item.variant?.priceOffset || 0);
        subtotal += unitPrice * item.quantity;
        orderItemsData.push({
          productId: item.productId,
          variantId: item.variantId,
          productName: item.product.name,
          size: item.variant?.size || null,
          color: item.variant?.color || null,
          quantity: item.quantity,
          priceAtPurchase: unitPrice,
          imageUrl: item.product.images[0]?.imageUrl || ''
        });
      }
    }

    // Resolve address snapshot
    let addressSnapshot = shippingAddress;
    if (addressId) {
      const savedAddress = await prisma.address.findUnique({ where: { id: addressId } });
      if (savedAddress) {
        addressSnapshot = savedAddress;
      }
    }

    if (!addressSnapshot) {
      res.status(400).json({ error: 'Shipping address is required.' });
      return;
    }

    const shippingFee = subtotal > 2000 ? 0 : 150;
    const finalTotal = subtotal + shippingFee;
    const orderNumber = `GR-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    // Atomic transaction: Create order, insert order items, decrement stock, clear cart, create notification
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId,
          orderNumber,
          totalAmount: finalTotal,
          status: 'CONFIRMED',
          paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PAID',
          paymentMethod,
          shippingAddressSnapshot: JSON.stringify(addressSnapshot),
          trackingNumber: `TRK-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
          estimatedDelivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days
          items: {
            create: orderItemsData
          }
        },
        include: { items: true }
      });

      // Decrement stock quantities
      for (const item of orderItemsData) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stockQuantity: { decrement: item.quantity } }
          });
        }
      }

      // If cart checkout, clear cart
      if (!directItem) {
        await tx.cartItem.deleteMany({ where: { userId } });
      }

      // Create notification
      await tx.notification.create({
        data: {
          userId,
          orderId: newOrder.id,
          type: 'ORDER_UPDATE',
          title: 'Order Confirmed!',
          message: `Your order #${newOrder.orderNumber} for ₹${finalTotal.toLocaleString('en-IN')} has been placed successfully.`
        }
      });

      return newOrder;
    });

    res.status(201).json({
      message: 'Order created successfully.',
      order
    });
  } catch (err: any) {
    console.error('Order creation error:', err);
    res.status(500).json({ error: 'Failed to process order.' });
  }
});

// List user orders
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user!.id },
      include: {
        items: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ orders });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve orders.' });
  }
});

// Single order details
router.get('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findFirst({
      where: {
        id,
        ...(req.user!.role === 'ADMIN' ? {} : { userId: req.user!.id })
      },
      include: {
        items: true,
        user: { select: { id: true, name: true, email: true, phone: true } }
      }
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }

    res.json({ order });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve order.' });
  }
});

// Public Track order by Order Number
router.get('/track/:orderNumber', async (req, res: Response): Promise<void> => {
  try {
    const { orderNumber } = req.params;
    const order = await prisma.order.findUnique({
      where: { orderNumber: orderNumber.trim() },
      select: {
        orderNumber: true,
        status: true,
        paymentStatus: true,
        trackingNumber: true,
        estimatedDelivery: true,
        createdAt: true,
        totalAmount: true,
        items: {
          select: {
            productName: true,
            size: true,
            color: true,
            quantity: true,
            priceAtPurchase: true,
            imageUrl: true
          }
        }
      }
    });

    if (!order) {
      res.status(404).json({ error: 'No order found with this tracking/order number.' });
      return;
    }

    res.json({ order });
  } catch (err) {
    res.status(500).json({ error: 'Failed to track order.' });
  }
});

export default router;
