export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  brand: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stockCount: number;
  images: string[];
  description: string;
  features: string[];
  materials?: string;
  isFeatured?: boolean;
  isFlashDeal?: boolean;
  isBestSeller?: boolean;
  discretePackaging: boolean;
  tags: string[];
  createdAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  itemCount: number;
  iconName?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: string;
}

export interface ShippingAddress {
  fullName: string;
  streetAddress: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  deliveryInstructions?: string;
}

export interface Order {
  id: string;
  userId: string; // The user's UID for registered users, or 'guest' for guest checkouts
  isGuest?: boolean;
  userEmail?: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  status: 'Processing' | 'Packaging' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  shippingAddress: ShippingAddress;
  paymentMethod: 'Credit Card' | 'Google Pay' | 'PayPal' | 'Discrete Cash on Delivery' | 'MTN MoMo (Paypack)' | 'Airtel Money (Paypack)';
  paymentRef?: string;
  createdAt: string;
  estimatedDeliveryDate: string;
  discretePackaging: boolean;
  trackingNumber: string;
  couponCode?: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  createdAt: string;
}

export interface Coupon {
  code: string;
  discountPercent: number;
  active: boolean;
  minSpend: number;
  description: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'admin' | 'customer';
  addresses?: ShippingAddress[];
  createdAt: string;
  phone?: string;
  preferredPaymentMethod?: 'MTN MoMo (Paypack)' | 'Airtel Money (Paypack)' | 'Credit Card' | 'Google Pay' | 'PayPal' | 'Discrete Cash on Delivery';
}

export interface HeroSlide {
  id: string;
  badge: string;
  title: string;
  image: string;
  bannerBg: string;
  textColor?: string;
  badgeBg?: string;
  primaryBtnLabel: string;
  primaryBtnAction?: 'shop' | 'categories' | 'discount' | 'profile';
}

export interface PartnerPharmacy {
  id: string;
  name: string;
  licenseNo: string;
  location: string;
  specialty: string;
  badge: string;
  rating: number;
  image: string;
  phone?: string;
  isActive?: boolean;
}

export interface CustomerInquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  createdAt: string;
  status: 'new' | 'in-progress' | 'replied' | 'resolved';
}

export interface FilterState {
  searchQuery: string;
  category: string;
  brand: string;
  minPrice: number;
  maxPrice: number;
  rating: number;
  inStockOnly: boolean;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest';
}
