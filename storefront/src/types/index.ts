export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  displayOrder: number;
  _count?: { products: number };
}

export interface ProductVariant {
  id: string;
  productId: string;
  size: string;
  color: string;
  colorHex?: string;
  sku: string;
  stockQuantity: number;
  priceOffset: number;
}

export interface ProductImage {
  id: string;
  productId: string;
  imageUrl: string;
  altText?: string;
  isPrimary: boolean;
  displayOrder: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  details?: string;
  price: number;
  originalPrice?: number | null;
  discountPercent?: number | null;
  categoryId: string;
  category?: Category;
  isNewArrival: boolean;
  isFeatured: boolean;
  isBasic: boolean;
  isActive: boolean;
  releaseDate?: string | null;
  images: ProductImage[];
  variants: ProductVariant[];
  createdAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string | null;
  productName: string;
  slug: string;
  imageUrl: string;
  size?: string | null;
  color?: string | null;
  stockAvailable: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface CartSummary {
  itemCount: number;
  subtotal: number;
  shipping: number;
  total: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  createdAt: string;
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  size?: string | null;
  color?: string | null;
  quantity: number;
  priceAtPurchase: number;
  imageUrl?: string | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  paymentStatus: string;
  paymentMethod: string;
  shippingAddressSnapshot: string;
  trackingNumber?: string | null;
  estimatedDelivery?: string | null;
  createdAt: string;
  items: OrderItem[];
}

export interface Notification {
  id: string;
  userId: string;
  orderId?: string | null;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface Review {
  id: string;
  reviewerName: string;
  rating: number;
  comment: string;
  verified: boolean;
  createdAt: string;
}
