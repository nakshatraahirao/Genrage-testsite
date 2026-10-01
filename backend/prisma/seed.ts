import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding GENRAGE Database...');

  // 1. Clear existing data
  await prisma.notification.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();
  await prisma.review.deleteMany();
  await prisma.contactMessage.deleteMany();

  // 2. Create Users
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const userPasswordHash = await bcrypt.hash('customer123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@genrage.com',
      passwordHash: adminPasswordHash,
      name: 'GENRAGE Admin',
      phone: '+91 98765 43210',
      role: 'ADMIN'
    }
  });

  const customer = await prisma.user.create({
    data: {
      email: 'customer@genrage.com',
      passwordHash: userPasswordHash,
      name: 'Rager Karan',
      phone: '+91 99887 76655',
      role: 'CUSTOMER',
      addresses: {
        create: {
          fullName: 'Rager Karan',
          phone: '+91 99887 76655',
          street: 'Flat 402, Dark Horizon Apts, Bandra West',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400050',
          country: 'India',
          isDefault: true
        }
      }
    }
  });

  console.log('👤 Users created: Admin (admin@genrage.com) & Customer (customer@genrage.com)');

  // 3. Create Categories
  const categoryData = [
    { name: 'Tops', slug: 'tops', description: 'Gothic graphic tees, sleeveless hoodies, vests and ringer shirts.', displayOrder: 1, imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80' },
    { name: 'Bottoms', slug: 'bottoms', description: 'Oversized parachute baggy pants, balloon denim and sweatpants.', displayOrder: 2, imageUrl: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&auto=format&fit=crop&q=80' },
    { name: 'Basics', slug: 'basics', description: 'Essential heavy 420 GSM silhouettes with subtle monogram branding.', displayOrder: 3, imageUrl: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80' },
    { name: 'Jackets', slug: 'jackets', description: 'Boxy cropped bombers, zip hoodies with tribal chrome prints.', displayOrder: 4, imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80' },
    { name: 'Accessories', slug: 'accessories', description: 'Embossed leather backpacks, rings, skull pendants and straps.', displayOrder: 5, imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80' },
    { name: 'Clearance', slug: 'clearance', description: 'Last drop archive pieces with final markdowns.', displayOrder: 6, imageUrl: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop&q=80' }
  ];

  const categories: Record<string, string> = {};
  for (const cat of categoryData) {
    const created = await prisma.category.create({ data: cat });
    categories[cat.slug] = created.id;
  }

  // 4. Curated Streetwear Images
  const images = {
    baggyBlackPants: 'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?w=800&auto=format&fit=crop&q=80',
    baggyGreyPants: 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=800&auto=format&fit=crop&q=80',
    baggyBrownPants: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=800&auto=format&fit=crop&q=80',
    baggyNavyPants: 'https://images.unsplash.com/photo-1542272604-780c96856592?w=800&auto=format&fit=crop&q=80',
    gothicJacket: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?w=800&auto=format&fit=crop&q=80',
    ringerTee: 'https://images.unsplash.com/photo-1503342394128-c104d54dba01?w=800&auto=format&fit=crop&q=80',
    sleevelessHoodie: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800&auto=format&fit=crop&q=80',
    vestBlack: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&auto=format&fit=crop&q=80',
    vestGrey: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop&q=80',
    gothicFullSleeve: 'https://images.unsplash.com/photo-1618354691438-25bc04584c03?w=800&auto=format&fit=crop&q=80',
    leatherBackpack: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80',
    cargoBaggy: 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=800&auto=format&fit=crop&q=80'
  };

  // 5. Products List
  const productsList = [
    // GENRAGE BASICS
    {
      name: 'BASIC BLACK BAGGY PANTS',
      slug: 'basic-black-baggy-pants',
      price: 1899,
      originalPrice: 2599,
      discountPercent: 26,
      categorySlug: 'basics',
      isBasic: true,
      isFeatured: true,
      description: 'Ultra-heavy 420 GSM French terry baggy silhouette with relaxed taper, custom chrome eyelets, and embroidered GenRage crest.',
      details: 'Fabric: 100% Heavy Cotton French Terry (420 GSM). Wash inside out in cold water. Tumble dry low.',
      image: images.baggyBlackPants,
      variants: [
        { size: 'S', color: 'Washed Black', colorHex: '#121212', stock: 15 },
        { size: 'M', color: 'Washed Black', colorHex: '#121212', stock: 24 },
        { size: 'L', color: 'Washed Black', colorHex: '#121212', stock: 18 },
        { size: 'XL', color: 'Washed Black', colorHex: '#121212', stock: 10 }
      ]
    },
    {
      name: 'BASIC GREY BAGGY PANTS',
      slug: 'basic-grey-baggy-pants',
      price: 1899,
      originalPrice: 2599,
      discountPercent: 26,
      categorySlug: 'basics',
      isBasic: true,
      isFeatured: true,
      description: 'Ash grey tone-on-tone oversized sweatpants with elongated drawstrings and side concealed cargo zip pockets.',
      details: 'Fabric: 100% French Terry Cotton. Pre-shrunk finish. Deep pockets engineered for large smartphones.',
      image: images.baggyGreyPants,
      variants: [
        { size: 'S', color: 'Ash Grey', colorHex: '#808080', stock: 12 },
        { size: 'M', color: 'Ash Grey', colorHex: '#808080', stock: 20 },
        { size: 'L', color: 'Ash Grey', colorHex: '#808080', stock: 14 }
      ]
    },
    {
      name: 'BASIC BROWN BAGGY PANTS',
      slug: 'basic-brown-baggy-pants',
      price: 1899,
      originalPrice: 2599,
      discountPercent: 26,
      categorySlug: 'basics',
      isBasic: true,
      isFeatured: false,
      description: 'Earthy mocha brown oversized joggers featuring custom ribbed cuffs and distressed hem detailing.',
      details: 'Fabric: 420 GSM organic fleece. Garment-dyed for vintage washed aesthetics.',
      image: images.baggyBrownPants,
      variants: [
        { size: 'M', color: 'Mocha Brown', colorHex: '#4a3728', stock: 16 },
        { size: 'L', color: 'Mocha Brown', colorHex: '#4a3728', stock: 8 }
      ]
    },
    {
      name: 'BASIC NAVY BAGGY PANTS',
      slug: 'basic-navy-baggy-pants',
      price: 1899,
      originalPrice: 2599,
      discountPercent: 26,
      categorySlug: 'basics',
      isBasic: true,
      isFeatured: false,
      description: 'Midnight navy relaxed drape sweatpants designed to stack perfectly over chunky sneakers and combat boots.',
      details: '100% Heavy Terry. Double-stitched seams. Machine washable.',
      image: images.baggyNavyPants,
      variants: [
        { size: 'S', color: 'Midnight Navy', colorHex: '#0f172a', stock: 10 },
        { size: 'M', color: 'Midnight Navy', colorHex: '#0f172a', stock: 19 },
        { size: 'L', color: 'Midnight Navy', colorHex: '#0f172a', stock: 7 }
      ]
    },

    // JUST DROPPED / NEW ARRIVALS
    {
      name: 'DEVOUR BLACK BOXY JACKET',
      slug: 'devour-black-boxy-jacket',
      price: 2199,
      originalPrice: 2999,
      discountPercent: 27,
      categorySlug: 'jackets',
      isNewArrival: true,
      isFeatured: true,
      description: 'Cropped boxy fit zip-up jacket with gothic tribal chrome chest screen-print, dual heavy metal sliders, and exaggerated drop shoulders.',
      details: 'Outer: 100% Twill Cotton. Gunmetal YKK 2-way zipper. Inner satin lining with hidden chest pocket.',
      image: images.gothicJacket,
      variants: [
        { size: 'S', color: 'Pitch Black', colorHex: '#050505', stock: 8 },
        { size: 'M', color: 'Pitch Black', colorHex: '#050505', stock: 14 },
        { size: 'L', color: 'Pitch Black', colorHex: '#050505', stock: 12 },
        { size: 'XL', color: 'Pitch Black', colorHex: '#050505', stock: 6 }
      ]
    },
    {
      name: 'AGONY BLACK RINGER TSHIRT',
      slug: 'agony-black-ringer-tshirt',
      price: 1299,
      originalPrice: 1899,
      discountPercent: 32,
      categorySlug: 'tops',
      isNewArrival: true,
      isFeatured: true,
      description: 'Contrasting rib collar ringer tee with dark occult angel vector illustration on front and signature GenRage spinal runic print on back.',
      details: 'Fabric: 240 GSM Bio-Washed Combed Cotton. High-density screen print that does not crack or fade.',
      image: images.ringerTee,
      variants: [
        { size: 'S', color: 'Black/White', colorHex: '#111111', stock: 20 },
        { size: 'M', color: 'Black/White', colorHex: '#111111', stock: 35 },
        { size: 'L', color: 'Black/White', colorHex: '#111111', stock: 25 }
      ]
    },
    {
      name: 'RIVAL BLACK SLEEVELESS HOODIE',
      slug: 'rival-black-sleeveless-hoodie',
      price: 1399,
      originalPrice: 1999,
      discountPercent: 30,
      categorySlug: 'tops',
      isNewArrival: true,
      isFeatured: true,
      description: 'Raw-edge armhole drop hoodie featuring large gothic cross print with silver tribal accents and oversized double-layered hood.',
      details: '360 GSM Terry Fleece. Raw armhole cut with anti-fray stay-stitch. Kangaroo pocket.',
      image: images.sleevelessHoodie,
      variants: [
        { size: 'M', color: 'Black', colorHex: '#000000', stock: 15 },
        { size: 'L', color: 'Black', colorHex: '#000000', stock: 20 },
        { size: 'XL', color: 'Black', colorHex: '#000000', stock: 10 }
      ]
    },
    {
      name: 'BUTCHER BLACK BAGGY PANTS',
      slug: 'butcher-black-baggy-pants',
      price: 1799,
      originalPrice: 2599,
      discountPercent: 31,
      categorySlug: 'bottoms',
      isNewArrival: true,
      isFeatured: true,
      description: 'Multi-pocket tactical baggy pants with contrast blood-red topstitching, D-ring loops, and leg graphic silk screens.',
      details: 'Heavy Twill & Poly blend. 6 utilitarian pockets. Adjustable ankle toggle bungees.',
      image: images.cargoBaggy,
      variants: [
        { size: 'S', color: 'Black', colorHex: '#000000', stock: 10 },
        { size: 'M', color: 'Black', colorHex: '#000000', stock: 18 },
        { size: 'L', color: 'Black', colorHex: '#000000', stock: 12 }
      ]
    },
    {
      name: 'VIXEN BLACK VEST',
      slug: 'vixen-black-vest',
      price: 999,
      originalPrice: 1499,
      discountPercent: 33,
      categorySlug: 'tops',
      isNewArrival: true,
      isFeatured: false,
      description: 'Minimal ribbed tank vest with subtle tonal chest monogram. Cut close to body with deep scoop neck.',
      details: '95% Cotton, 5% Spandex 2x2 Rib. Breathable, stretchy, and holds shape.',
      image: images.vestBlack,
      variants: [
        { size: 'S', color: 'Black', colorHex: '#111111', stock: 18 },
        { size: 'M', color: 'Black', colorHex: '#111111', stock: 30 },
        { size: 'L', color: 'Black', colorHex: '#111111', stock: 20 }
      ]
    },
    {
      name: 'MOTH GREY BAGGY PANTS',
      slug: 'moth-grey-baggy-pants',
      price: 1799,
      originalPrice: 2599,
      discountPercent: 31,
      categorySlug: 'bottoms',
      isNewArrival: true,
      isFeatured: false,
      description: 'Acid washed faded grey balloon sweatpants with gothic Moth illustration crawling up left calf.',
      details: 'Custom mineral acid wash. Elasticated waistband with thick natural rope tie.',
      image: images.baggyGreyPants,
      variants: [
        { size: 'M', color: 'Moth Grey', colorHex: '#6b7280', stock: 14 },
        { size: 'L', color: 'Moth Grey', colorHex: '#6b7280', stock: 9 }
      ]
    },
    {
      name: 'ENIGMA BLACK BOXY JACKET',
      slug: 'enigma-black-boxy-jacket',
      price: 2199,
      originalPrice: 2999,
      discountPercent: 27,
      categorySlug: 'jackets',
      isNewArrival: true,
      isFeatured: false,
      description: 'Stand-collar boxy windbreaker jacket with reflective cyber-sigilism chest print and concealed storm flap.',
      details: 'Ripstop water-resistant shell. Breathable mesh inner lining. Adjustable hem cinch.',
      image: images.gothicJacket,
      variants: [
        { size: 'M', color: 'Stealth Black', colorHex: '#080808', stock: 11 },
        { size: 'L', color: 'Stealth Black', colorHex: '#080808', stock: 17 }
      ]
    },
    {
      name: 'STARE GREY VEST',
      slug: 'stare-grey-vest',
      price: 999,
      originalPrice: 1499,
      discountPercent: 33,
      categorySlug: 'tops',
      isNewArrival: true,
      isFeatured: false,
      description: 'Light grey raw hem vest with all-seeing demonic eye illustration on front torso.',
      details: 'Lightweight 200 GSM jersey cotton. Vintage sun-faded wash effect.',
      image: images.vestGrey,
      variants: [
        { size: 'S', color: 'Stare Grey', colorHex: '#9ca3af', stock: 15 },
        { size: 'M', color: 'Stare Grey', colorHex: '#9ca3af', stock: 22 }
      ]
    },
    {
      name: 'WIDOW BLACK SLEEVELESS HOODIE',
      slug: 'widow-black-sleeveless-hoodie',
      price: 1399,
      originalPrice: 1999,
      discountPercent: 30,
      categorySlug: 'tops',
      isNewArrival: true,
      isFeatured: false,
      description: 'Sleeveless drop-shoulder hoodie with arachnid filigree artwork on front and gothic typography.',
      details: 'Heavy french terry. Reinforced armhole piping for long-lasting drape.',
      image: images.sleevelessHoodie,
      variants: [
        { size: 'M', color: 'Black', colorHex: '#0a0a0a', stock: 12 },
        { size: 'L', color: 'Black', colorHex: '#0a0a0a', stock: 8 }
      ]
    },
    {
      name: 'PROFANE BLACK FULL SLEEVES',
      slug: 'profane-black-full-sleeves',
      price: 1499,
      originalPrice: 2299,
      discountPercent: 35,
      categorySlug: 'tops',
      isNewArrival: true,
      isFeatured: false,
      description: 'Heavyweight oversized long sleeve t-shirt with chrome cyber spine print along sleeves and GenRage chest insignia.',
      details: '280 GSM heavyweight cotton. Ribbed cuffs with thumbholes.',
      image: images.gothicFullSleeve,
      variants: [
        { size: 'S', color: 'Black', colorHex: '#000000', stock: 16 },
        { size: 'M', color: 'Black', colorHex: '#000000', stock: 24 },
        { size: 'L', color: 'Black', colorHex: '#000000', stock: 15 }
      ]
    },
    {
      name: 'FATE GREY RINGER TSHIRT',
      slug: 'fate-grey-ringer-tshirt',
      price: 1299,
      originalPrice: 1899,
      discountPercent: 32,
      categorySlug: 'tops',
      isNewArrival: true,
      isFeatured: false,
      description: 'White and charcoal ringer collar tee with medieval sword and angel sigil graphic on chest.',
      details: '100% Combed Compact Cotton. Tailored boxy cut with standard shoulder seams.',
      image: images.ringerTee,
      variants: [
        { size: 'S', color: 'Grey/White', colorHex: '#d1d5db', stock: 10 },
        { size: 'M', color: 'Grey/White', colorHex: '#d1d5db', stock: 20 },
        { size: 'L', color: 'Grey/White', colorHex: '#d1d5db', stock: 15 }
      ]
    },
    {
      name: 'MYSTIC BLACK BAGGY PANTS',
      slug: 'mystic-black-baggy-pants',
      price: 1899,
      originalPrice: 2599,
      discountPercent: 26,
      categorySlug: 'bottoms',
      isNewArrival: true,
      isFeatured: false,
      description: 'Oversized wide-leg sweatpants featuring mystical snake and sword screenprints wrapping around both calves.',
      details: '420 GSM Terry. Hidden internal drawstring. Extra wide 12-inch leg opening.',
      image: images.baggyBlackPants,
      variants: [
        { size: 'M', color: 'Black', colorHex: '#0f0f0f', stock: 18 },
        { size: 'L', color: 'Black', colorHex: '#0f0f0f', stock: 12 }
      ]
    },
    {
      name: 'DOOMED BROWN VEST',
      slug: 'doomed-brown-vest',
      price: 999,
      originalPrice: 1499,
      discountPercent: 33,
      categorySlug: 'tops',
      isNewArrival: true,
      isFeatured: false,
      description: 'Raw cut chocolate brown ribbed vest with centered distressed skull graphic.',
      details: '100% Cotton Rib. Hand-distressed seams ensure every garment is unique.',
      image: images.vestBlack,
      variants: [
        { size: 'M', color: 'Doomed Brown', colorHex: '#3b2f2f', stock: 14 },
        { size: 'L', color: 'Doomed Brown', colorHex: '#3b2f2f', stock: 9 }
      ]
    },
    {
      name: 'STRAIN BLACK VEST',
      slug: 'strain-black-vest',
      price: 999,
      originalPrice: 1499,
      discountPercent: 33,
      categorySlug: 'tops',
      isNewArrival: true,
      isFeatured: false,
      description: 'Black sleeveless tank with centered chrome tribal angel wings artwork.',
      details: 'Lightweight jersey. Pre-shrunk with enzyme wash.',
      image: images.vestBlack,
      variants: [
        { size: 'S', color: 'Black', colorHex: '#050505', stock: 20 },
        { size: 'M', color: 'Black', colorHex: '#050505', stock: 25 }
      ]
    },
    {
      name: 'GRACE BLACK BAGGY PANTS',
      slug: 'grace-black-baggy-pants',
      price: 1899,
      originalPrice: 2699,
      discountPercent: 30,
      categorySlug: 'bottoms',
      isNewArrival: true,
      isFeatured: false,
      description: 'High-rise ultra-wide parachute pants with gothic cross artwork on front thigh and zippered utility ankle cuffs.',
      details: 'Durable nylon-cotton blend. Water repellent coating.',
      image: images.baggyBlackPants,
      variants: [
        { size: 'S', color: 'Black', colorHex: '#000000', stock: 11 },
        { size: 'M', color: 'Black', colorHex: '#000000', stock: 16 }
      ]
    },
    {
      name: 'MORTAL DARK GREY BAGGY PANTS',
      slug: 'mortal-dark-grey-baggy-pants',
      price: 1899,
      originalPrice: 2599,
      discountPercent: 26,
      categorySlug: 'bottoms',
      isNewArrival: true,
      isFeatured: false,
      description: 'Charcoal dark grey fleece baggy pants with stylized skull and spine motifs.',
      details: 'French terry 400 GSM. Deep drop crotch with relaxed stacking.',
      image: images.baggyGreyPants,
      variants: [
        { size: 'M', color: 'Dark Grey', colorHex: '#374151', stock: 14 },
        { size: 'L', color: 'Dark Grey', colorHex: '#374151', stock: 10 }
      ]
    },
    {
      name: 'LEATHER BACKPACK',
      slug: 'leather-backpack',
      price: 1999,
      originalPrice: 2699,
      discountPercent: 26,
      categorySlug: 'accessories',
      isNewArrival: false,
      isFeatured: true,
      description: 'Structured vegan pebble leather backpack with debossed GENRAGE gothic crest, gunmetal hardware, and padded 16-inch laptop compartment.',
      details: 'Premium Cruelty-Free Vegan Leather. Reinforced grab handle and breathable ergonomic back mesh.',
      image: images.leatherBackpack,
      variants: [
        { size: 'One Size', color: 'Obsidian Black', colorHex: '#0a0a0a', stock: 25 }
      ]
    },
    {
      name: 'FADE GREY BALLOON PANTS',
      slug: 'fade-grey-balloon-pants',
      price: 1899,
      originalPrice: 2599,
      discountPercent: 26,
      categorySlug: 'bottoms',
      isNewArrival: false,
      isFeatured: false,
      description: 'Dramatic balloon silhouette sweatpants with custom pleating at waist and knees for sculptural volume.',
      details: 'Heavy 440 GSM Terry. Triple-pleat knee construction.',
      image: images.baggyGreyPants,
      variants: [
        { size: 'M', color: 'Fade Grey', colorHex: '#9ca3af', stock: 15 },
        { size: 'L', color: 'Fade Grey', colorHex: '#9ca3af', stock: 12 }
      ]
    }
  ];

  for (const p of productsList) {
    const createdProduct = await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        price: p.price,
        originalPrice: p.originalPrice,
        discountPercent: p.discountPercent,
        description: p.description,
        details: p.details,
        categoryId: categories[p.categorySlug],
        isBasic: p.isBasic || false,
        isNewArrival: p.isNewArrival || false,
        isFeatured: p.isFeatured || false,
        isActive: true,
        images: {
          create: [
            { imageUrl: p.image, isPrimary: true, displayOrder: 0 },
            { imageUrl: p.image, isPrimary: false, displayOrder: 1 }
          ]
        },
        variants: {
          create: p.variants.map((v, i) => ({
            size: v.size,
            color: v.color,
            colorHex: v.colorHex,
            sku: `${p.slug}-${v.size}-${i}`,
            stockQuantity: v.stock
          }))
        }
      }
    });
  }

  console.log(`👕 Seeded ${productsList.length} products with variants and images.`);

  // 6. Testimonials from "Let RAGERS' speak for us" (from schema image)
  const reviewsData = [
    { reviewerName: 'Hamza Muhammad', rating: 5, comment: 'I really enjoyed th... Matte finishing outstanding fit and feel.' },
    { reviewerName: 'Sahil Singh', rating: 5, comment: 'Excellent materia... The weight of the 420 GSM terry is unmatched.' },
    { reviewerName: 'Anonymous Rager', rating: 5, comment: 'Amazing products... True luxury gothic streetwear vibe.' },
    { reviewerName: 'Shubhanshu Singh', rating: 5, comment: 'Amazing pants... The baggy silhouette stacks effortlessly over boots.' },
    { reviewerName: 'Karan Sharma', rating: 5, comment: 'Great quality, fast delivery under 48 hours as promised.' }
  ];

  for (const rev of reviewsData) {
    await prisma.review.create({ data: rev });
  }

  // 7. Seed an initial demo order for customer
  const firstProduct = await prisma.product.findFirst({
    where: { slug: 'basic-black-baggy-pants' },
    include: { variants: true }
  });

  if (firstProduct && firstProduct.variants.length > 0) {
    const variant = firstProduct.variants[0];
    await prisma.order.create({
      data: {
        userId: customer.id,
        orderNumber: 'GR-889021',
        totalAmount: 1899,
        status: 'SHIPPED',
        paymentStatus: 'PAID',
        paymentMethod: 'UPI',
        shippingAddressSnapshot: JSON.stringify({
          fullName: 'Rager Karan',
          phone: '+91 99887 76655',
          street: 'Flat 402, Dark Horizon Apts, Bandra West',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400050'
        }),
        trackingNumber: 'TRK-GENRAGE-889021',
        estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        items: {
          create: {
            productId: firstProduct.id,
            variantId: variant.id,
            productName: firstProduct.name,
            size: variant.size,
            color: variant.color,
            quantity: 1,
            priceAtPurchase: 1899,
            imageUrl: images.baggyBlackPants
          }
        },
        notifications: {
          create: {
            userId: customer.id,
            type: 'ORDER_UPDATE',
            title: 'Order Shipped!',
            message: 'Your order #GR-889021 has been shipped via BlueDart Air. Tracking: TRK-GENRAGE-889021.'
          }
        }
      }
    });
  }

  console.log('✅ GENRAGE database seed complete!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
