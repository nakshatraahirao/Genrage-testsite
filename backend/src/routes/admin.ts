import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import prisma from '../prisma.js';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Multer storage setup for image uploads
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Admin Authentication Guard applied to all routes below
router.use(authenticate);
router.use(requireAdmin);

// Dashboard Metrics
router.get('/metrics', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [
      totalOrders,
      totalCustomers,
      totalProducts,
      orders,
      pendingOrders,
      lowStockVariants,
      recentOrders,
      recentUsers
    ] = await Promise.all([
      prisma.order.count(),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.product.count(),
      prisma.order.findMany({ select: { totalAmount: true } }),
      prisma.order.count({ where: { status: { in: ['PENDING', 'CONFIRMED'] } } }),
      prisma.productVariant.findMany({
        where: { stockQuantity: { lte: 5 } },
        include: { product: { select: { name: true, slug: true } } },
        take: 10
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, email: true } }, items: true }
      }),
      prisma.user.findMany({
        where: { role: 'CUSTOMER' },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, createdAt: true }
      })
    ]);

    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

    res.json({
      metrics: {
        totalRevenue,
        totalOrders,
        totalCustomers,
        totalProducts,
        pendingOrders,
        lowStockCount: lowStockVariants.length
      },
      lowStockVariants,
      recentOrders,
      recentUsers
    });
  } catch (err: any) {
    console.error('Admin metrics error:', err);
    res.status(500).json({ error: 'Failed to retrieve admin metrics.' });
  }
});

// Image Upload
router.post('/upload', upload.single('image'), (req: AuthRequest, res: Response): void => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No image file provided.' });
      return;
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ imageUrl });
  } catch (err) {
    res.status(500).json({ error: 'Failed to upload image.' });
  }
});

// Product Management
router.get('/products', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        images: { orderBy: { displayOrder: 'asc' } },
        variants: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ products });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve products.' });
  }
});

router.post('/products', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      name,
      slug,
      description,
      details,
      price,
      originalPrice,
      discountPercent,
      categoryId,
      isNewArrival = false,
      isFeatured = false,
      isBasic = false,
      isActive = true,
      images = [],
      variants = []
    } = req.body;

    if (!name || !price || !categoryId) {
      res.status(400).json({ error: 'Name, price, and category are required.' });
      return;
    }

    const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const product = await prisma.product.create({
      data: {
        name,
        slug: finalSlug,
        description: description || '',
        details: details || '',
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        discountPercent: discountPercent ? parseInt(discountPercent, 10) : 0,
        categoryId,
        isNewArrival: Boolean(isNewArrival),
        isFeatured: Boolean(isFeatured),
        isBasic: Boolean(isBasic),
        isActive: Boolean(isActive),
        images: {
          create: images.map((img: any, idx: number) => ({
            imageUrl: typeof img === 'string' ? img : img.imageUrl,
            isPrimary: idx === 0,
            displayOrder: idx
          }))
        },
        variants: {
          create: variants.map((v: any) => ({
            size: v.size,
            color: v.color,
            colorHex: v.colorHex || null,
            sku: v.sku || `${finalSlug}-${v.size}-${v.color}-${Date.now()}`,
            stockQuantity: parseInt(v.stockQuantity, 10) || 0,
            priceOffset: parseFloat(v.priceOffset) || 0
          }))
        }
      },
      include: {
        images: true,
        variants: true,
        category: true
      }
    });

    res.status(201).json({ message: 'Product created successfully.', product });
  } catch (err: any) {
    console.error('Create product error:', err);
    res.status(500).json({ error: err.message || 'Failed to create product.' });
  }
});

router.put('/products/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      name,
      slug,
      description,
      details,
      price,
      originalPrice,
      discountPercent,
      categoryId,
      isNewArrival,
      isFeatured,
      isBasic,
      isActive,
      images,
      variants
    } = req.body;

    // Update product core info
    await prisma.product.update({
      where: { id },
      data: {
        name: name !== undefined ? name : undefined,
        slug: slug !== undefined ? slug : undefined,
        description: description !== undefined ? description : undefined,
        details: details !== undefined ? details : undefined,
        price: price !== undefined ? parseFloat(price) : undefined,
        originalPrice: originalPrice !== undefined ? (originalPrice ? parseFloat(originalPrice) : null) : undefined,
        discountPercent: discountPercent !== undefined ? parseInt(discountPercent, 10) : undefined,
        categoryId: categoryId !== undefined ? categoryId : undefined,
        isNewArrival: isNewArrival !== undefined ? Boolean(isNewArrival) : undefined,
        isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : undefined,
        isBasic: isBasic !== undefined ? Boolean(isBasic) : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined
      }
    });

    // Update images if provided
    if (images && Array.isArray(images)) {
      await prisma.productImage.deleteMany({ where: { productId: id } });
      await prisma.productImage.createMany({
        data: images.map((img: any, idx: number) => ({
          productId: id,
          imageUrl: typeof img === 'string' ? img : img.imageUrl,
          isPrimary: idx === 0,
          displayOrder: idx
        }))
      });
    }

    // Update variants if provided
    if (variants && Array.isArray(variants)) {
      await prisma.productVariant.deleteMany({ where: { productId: id } });
      await prisma.productVariant.createMany({
        data: variants.map((v: any) => ({
          productId: id,
          size: v.size,
          color: v.color,
          colorHex: v.colorHex || null,
          sku: v.sku || `${id}-${v.size}-${v.color}-${Math.floor(Math.random() * 10000)}`,
          stockQuantity: parseInt(v.stockQuantity, 10) || 0,
          priceOffset: parseFloat(v.priceOffset) || 0
        }))
      });
    }

    const updatedProduct = await prisma.product.findUnique({
      where: { id },
      include: { category: true, images: true, variants: true }
    });

    res.json({ message: 'Product updated successfully.', product: updatedProduct });
  } catch (err: any) {
    console.error('Update product error:', err);
    res.status(500).json({ error: 'Failed to update product.' });
  }
});

router.delete('/products/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.product.delete({ where: { id } });
    res.json({ message: 'Product deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product.' });
  }
});

// Order Management
router.get('/orders', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, search } = req.query;
    const where: any = {};

    if (status && status !== 'ALL') {
      where.status = String(status);
    }

    if (search) {
      const q = String(search);
      where.OR = [
        { orderNumber: { contains: q } },
        { user: { name: { contains: q } } },
        { user: { email: { contains: q } } }
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        items: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ orders });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve orders.' });
  }
});

// Update Order Status and trigger Customer Notification
router.put('/orders/:id/status', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, paymentStatus, trackingNumber } = req.body;

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }

    const updated = await prisma.order.update({
      where: { id },
      data: {
        status: status || undefined,
        paymentStatus: paymentStatus || undefined,
        trackingNumber: trackingNumber !== undefined ? trackingNumber : undefined
      }
    });

    // Create automatic customer notification
    if (status && status !== order.status) {
      let message = `Your order #${order.orderNumber} status changed to ${status}.`;
      if (status === 'SHIPPED') message = `Your order #${order.orderNumber} has shipped! Tracking number: ${updated.trackingNumber || 'Available shortly'}.`;
      if (status === 'DELIVERED') message = `Your order #${order.orderNumber} has been delivered. Thank you for shopping with GENRAGE!`;
      if (status === 'CANCELLED') message = `Your order #${order.orderNumber} has been cancelled.`;

      await prisma.notification.create({
        data: {
          userId: order.userId,
          orderId: order.id,
          type: 'ORDER_UPDATE',
          title: `Order ${status.charAt(0) + status.slice(1).toLowerCase()}`,
          message
        }
      });
    }

    res.json({ message: 'Order status updated successfully.', order: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order status.' });
  }
});

// Customer Management
router.get('/customers', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customers = await prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        orders: {
          select: {
            id: true,
            totalAmount: true,
            status: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = customers.map(c => {
      const orderCount = c.orders.length;
      const totalSpent = c.orders.reduce((sum, o) => sum + o.totalAmount, 0);
      return {
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        createdAt: c.createdAt,
        orderCount,
        totalSpent
      };
    });

    res.json({ customers: formatted });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve customers.' });
  }
});

// Category Management
router.post('/categories', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, slug, description, imageUrl, displayOrder } = req.body;
    if (!name) {
      res.status(400).json({ error: 'Category name is required.' });
      return;
    }
    const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const category = await prisma.category.create({
      data: {
        name,
        slug: finalSlug,
        description,
        imageUrl,
        displayOrder: displayOrder ? parseInt(displayOrder, 10) : 0
      }
    });
    res.status(201).json({ category });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create category.' });
  }
});

router.put('/categories/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, slug, description, imageUrl, displayOrder } = req.body;
    const category = await prisma.category.update({
      where: { id },
      data: {
        name: name !== undefined ? name : undefined,
        slug: slug !== undefined ? slug : undefined,
        description: description !== undefined ? description : undefined,
        imageUrl: imageUrl !== undefined ? imageUrl : undefined,
        displayOrder: displayOrder !== undefined ? parseInt(displayOrder, 10) : undefined
      }
    });
    res.json({ category });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update category.' });
  }
});

router.delete('/categories/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.category.delete({ where: { id } });
    res.json({ message: 'Category deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete category.' });
  }
});

export default router;
