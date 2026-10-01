import { Router, Request, Response } from 'express';
import prisma from '../prisma.js';

const router = Router();

// List products with filters, search, sort, pagination
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      size,
      color,
      sort,
      isNewArrival,
      isBasic,
      isFeatured,
      page = '1',
      limit = '40'
    } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const take = parseInt(limit as string, 10) || 40;
    const skip = (pageNum - 1) * take;

    const where: any = {
      isActive: true
    };

    if (category) {
      where.category = {
        slug: String(category).toLowerCase()
      };
    }

    if (search) {
      const q = String(search);
      where.OR = [
        { name: { contains: q } },
        { description: { contains: q } },
        { details: { contains: q } },
        { category: { name: { contains: q } } }
      ];
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice as string);
      if (maxPrice) where.price.lte = parseFloat(maxPrice as string);
    }

    if (isNewArrival === 'true') where.isNewArrival = true;
    if (isBasic === 'true') where.isBasic = true;
    if (isFeatured === 'true') where.isFeatured = true;

    if (size || color) {
      where.variants = {
        some: {
          ...(size ? { size: String(size) } : {}),
          ...(color ? { color: { equals: String(color) } } : {}),
          stockQuantity: { gt: 0 }
        }
      };
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    if (sort === 'price_desc') orderBy = { price: 'desc' };
    if (sort === 'name_asc') orderBy = { name: 'asc' };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          images: { orderBy: { displayOrder: 'asc' } },
          variants: true
        },
        orderBy,
        skip,
        take
      }),
      prisma.product.count({ where })
    ]);

    res.json({
      products,
      pagination: {
        total,
        page: pageNum,
        limit: take,
        totalPages: Math.ceil(total / take)
      }
    });
  } catch (err: any) {
    console.error('Fetch products error:', err);
    res.status(500).json({ error: 'Failed to retrieve products.' });
  }
});

// Meta filter options (available categories, colors, sizes, min/max price)
router.get('/meta/filters', async (_req: Request, res: Response): Promise<void> => {
  try {
    const [categories, variants, priceStats] = await Promise.all([
      prisma.category.findMany({ select: { id: true, name: true, slug: true } }),
      prisma.productVariant.findMany({
        select: { size: true, color: true, colorHex: true },
        distinct: ['size', 'color']
      }),
      prisma.product.aggregate({
        _min: { price: true },
        _max: { price: true }
      })
    ]);

    const sizes = Array.from(new Set(variants.map(v => v.size).filter(Boolean)));
    const colors = Array.from(new Set(variants.map(v => JSON.stringify({ name: v.color, hex: v.colorHex }))))
      .map(s => JSON.parse(s));

    res.json({
      categories,
      sizes,
      colors,
      priceRange: {
        min: priceStats._min.price || 0,
        max: priceStats._max.price || 5000
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve filter metadata.' });
  }
});

// Single product by slug or id
router.get('/:slugOrId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { slugOrId } = req.params;
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { slug: slugOrId },
          { id: slugOrId }
        ]
      },
      include: {
        category: true,
        images: { orderBy: { displayOrder: 'asc' } },
        variants: { orderBy: [{ color: 'asc' }, { size: 'asc' }] }
      }
    });

    if (!product) {
      res.status(404).json({ error: 'Product not found.' });
      return;
    }

    // Also get related products from same category
    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        isActive: true
      },
      include: {
        images: true,
        category: true,
        variants: true
      },
      take: 4
    });

    res.json({ product, relatedProducts });
  } catch (err: any) {
    console.error('Fetch product detail error:', err);
    res.status(500).json({ error: 'Failed to retrieve product details.' });
  }
});

export default router;
