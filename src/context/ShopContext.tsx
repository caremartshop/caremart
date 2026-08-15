import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  addDoc 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { seedFirestoreIfEmpty } from '../lib/seedFirestore';
import { Product, Category, CartItem, Order, Coupon, FilterState, HeroSlide, PartnerPharmacy, CustomerInquiry } from '../types';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'error';
  title: string;
  description?: string;
}

interface ShopContextType {
  products: Product[];
  categories: Category[];
  coupons: Coupon[];
  heroSlides: HeroSlide[];
  partnerPharmacies: PartnerPharmacy[];
  inquiries: CustomerInquiry[];
  cart: CartItem[];
  wishlist: string[]; // product IDs
  orders: Order[];
  appliedCoupon: Coupon | null;
  discreteMode: boolean;
  toasts: ToastMessage[];
  filters: FilterState;
  currentPage: string;
  activeProductId: string | null;
  activeCategorySlug: string | null;
  
  // Navigation
  navigateTo: (page: string, params?: { productId?: string; categorySlug?: string }) => void;
  
  // Cart actions
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;

  // Wishlist actions
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // Discrete Mode
  toggleDiscreteMode: () => void;
  quickHide: () => void;

  // Filter actions
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;

  // Orders
  placeOrder: (orderData: Omit<Order, 'id' | 'createdAt' | 'trackingNumber'>) => Promise<Order>;

  // Toasts
  addToast: (title: string, description?: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;

  // Admin CRUD
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  addCoupon: (coupon: Coupon) => Promise<void>;
  deleteCoupon: (code: string) => Promise<void>;
  addHeroSlide: (slide: Omit<HeroSlide, 'id'>) => Promise<void>;
  updateHeroSlide: (id: string, slide: Partial<HeroSlide>) => Promise<void>;
  deleteHeroSlide: (id: string) => Promise<void>;
  addPartnerPharmacy: (pharmacy: Omit<PartnerPharmacy, 'id'>) => Promise<void>;
  updatePartnerPharmacy: (id: string, pharmacy: Partial<PartnerPharmacy>) => Promise<void>;
  deletePartnerPharmacy: (id: string) => Promise<void>;
  addInquiry: (inquiry: Omit<CustomerInquiry, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  updateInquiryStatus: (id: string, status: CustomerInquiry['status']) => Promise<void>;
  deleteInquiry: (id: string) => Promise<void>;
}

const DEFAULT_FILTERS: FilterState = {
  searchQuery: '',
  category: 'All',
  brand: 'All',
  minPrice: 0,
  maxPrice: 300000,
  rating: 0,
  inStockOnly: false,
  sortBy: 'featured'
};

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [partnerPharmacies, setPartnerPharmacies] = useState<PartnerPharmacy[]>([]);
  const [inquiries, setInquiries] = useState<CustomerInquiry[]>([]);
  
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('secureshop_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('secureshop_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('secureshop_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [discreteMode, setDiscreteMode] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  
  // Navigation State with URL deep linking for tumacaremart.shop
  const getInitialPageFromUrl = (): { page: string; productId?: string; categorySlug?: string; searchQuery?: string } => {
    if (typeof window === 'undefined') return { page: 'home' };

    const pathname = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view')?.toLowerCase();
    const searchParam = params.get('search') || params.get('q') || '';
    const categoryParam = params.get('category') || '';
    const productParam = params.get('product') || params.get('id') || '';

    if (pathname === '/shop' || viewParam === 'shop') {
      return { page: 'shop', searchQuery: searchParam, categorySlug: categoryParam };
    }
    if (pathname === '/track-order' || pathname === '/tracking' || pathname === '/track' || viewParam === 'tracking' || viewParam === 'track-order') {
      return { page: 'tracking' };
    }
    if (pathname === '/contact' || pathname === '/contact-us' || viewParam === 'contact' || viewParam === 'contact-us') {
      return { page: 'contact' };
    }
    if (pathname === '/categories' || viewParam === 'categories') {
      return { page: 'categories' };
    }
    if (pathname === '/order-success' || pathname === '/order-confirmed' || pathname === '/success' || viewParam === 'order-success' || viewParam === 'success') {
      const orderIdParam = params.get('id') || params.get('orderId') || productParam || '';
      return { page: 'order-success', productId: orderIdParam || undefined };
    }
    if (pathname === '/cart' || viewParam === 'cart') {
      return { page: 'cart' };
    }
    if (pathname === '/checkout' || viewParam === 'checkout') {
      return { page: 'checkout' };
    }
    if (pathname === '/login' || viewParam === 'login') {
      return { page: 'login' };
    }
    if (pathname === '/register' || viewParam === 'register') {
      return { page: 'register' };
    }
    if (pathname === '/faq' || viewParam === 'faq') {
      return { page: 'faq' };
    }
    if (pathname === '/privacy' || viewParam === 'privacy') {
      return { page: 'privacy' };
    }
    if (pathname === '/terms' || viewParam === 'terms') {
      return { page: 'terms' };
    }
    if (pathname === '/admin' || viewParam === 'admin') {
      return { page: 'admin' };
    }
    if (productParam) {
      return { page: 'product-detail', productId: productParam };
    }

    return { page: 'home' };
  };

  const initialRoute = getInitialPageFromUrl();
  const [currentPage, setCurrentPage] = useState<string>(initialRoute.page);
  const [activeProductId, setActiveProductId] = useState<string | null>(initialRoute.productId || null);
  const [activeCategorySlug, setActiveCategorySlug] = useState<string | null>(initialRoute.categorySlug || null);

  // SEO & URL sync helper
  const updatePageSeoAndUrl = (page: string, params?: { productId?: string; categorySlug?: string }, pushState = true) => {
    let urlPath = '/';
    let docTitle = 'CareMart - 100% Discrete Health, Wellness & Pharmacy Store Rwanda | tumacaremart.shop';
    let canonicalUrl = 'https://tumacaremart.shop/';

    switch (page) {
      case 'shop':
        urlPath = '/shop';
        docTitle = 'Shop Health, Intimate & Wellness Products | CareMart (tumacaremart.shop)';
        canonicalUrl = 'https://tumacaremart.shop/shop';
        break;
      case 'tracking':
        urlPath = '/track-order';
        docTitle = 'Track Discrete Order & Live GPS Courier Dispatch | CareMart (tumacaremart.shop)';
        canonicalUrl = 'https://tumacaremart.shop/track-order';
        break;
      case 'contact':
        urlPath = '/contact';
        docTitle = 'Contact Us - 24/7 Confidential Customer Support (+250 788 345 678) | CareMart (tumacaremart.shop)';
        canonicalUrl = 'https://tumacaremart.shop/contact';
        break;
      case 'categories':
        urlPath = '/categories';
        docTitle = 'Browse Health & Intimate Categories | CareMart Rwanda (tumacaremart.shop)';
        canonicalUrl = 'https://tumacaremart.shop/categories';
        break;
      case 'product-detail':
        urlPath = params?.productId ? `/shop?product=${encodeURIComponent(params.productId)}` : '/shop';
        docTitle = 'Product Details | CareMart (tumacaremart.shop)';
        canonicalUrl = 'https://tumacaremart.shop/shop';
        break;
      case 'cart':
        urlPath = '/cart';
        docTitle = 'Discrete Shopping Cart | CareMart Rwanda (tumacaremart.shop)';
        canonicalUrl = 'https://tumacaremart.shop/cart';
        break;
      case 'checkout':
        urlPath = '/checkout';
        docTitle = 'Secure Checkout (MTN MoMo & Airtel Money) | CareMart Rwanda';
        canonicalUrl = 'https://tumacaremart.shop/checkout';
        break;
      case 'order-success':
        urlPath = params?.productId ? `/order-success?id=${encodeURIComponent(params.productId)}` : '/order-success';
        docTitle = 'Order Confirmed & Placed | CareMart Rwanda (tumacaremart.shop)';
        canonicalUrl = 'https://tumacaremart.shop/order-success';
        break;
      case 'login':
        urlPath = '/login';
        docTitle = 'Sign In to Your Account | CareMart (tumacaremart.shop)';
        canonicalUrl = 'https://tumacaremart.shop/login';
        break;
      case 'register':
        urlPath = '/register';
        docTitle = 'Create Discrete Account | CareMart (tumacaremart.shop)';
        canonicalUrl = 'https://tumacaremart.shop/register';
        break;
      case 'faq':
        urlPath = '/faq';
        docTitle = 'Frequently Asked Questions & Delivery Guide | CareMart (tumacaremart.shop)';
        canonicalUrl = 'https://tumacaremart.shop/faq';
        break;
      case 'privacy':
        urlPath = '/privacy';
        docTitle = 'Discretion & Privacy Policy | CareMart Rwanda (tumacaremart.shop)';
        canonicalUrl = 'https://tumacaremart.shop/privacy';
        break;
      case 'terms':
        urlPath = '/terms';
        docTitle = 'Terms & Conditions | CareMart Rwanda (tumacaremart.shop)';
        canonicalUrl = 'https://tumacaremart.shop/terms';
        break;
      case 'admin':
        urlPath = '/admin';
        docTitle = 'Store Administration Console | CareMart';
        canonicalUrl = 'https://tumacaremart.shop/admin';
        break;
      default:
        urlPath = '/';
        docTitle = 'CareMart - 100% Discrete Health, Wellness & Pharmacy Store Rwanda | tumacaremart.shop';
        canonicalUrl = 'https://tumacaremart.shop/';
    }

    if (typeof document !== 'undefined') {
      document.title = docTitle;
      const canonicalTag = document.querySelector('link[rel="canonical"]');
      if (canonicalTag) {
        canonicalTag.setAttribute('href', canonicalUrl);
      }
    }

    if (pushState && typeof window !== 'undefined' && window.location.pathname !== urlPath) {
      window.history.pushState({ page, params }, docTitle, urlPath);
    }
  };

  // Listen to browser Back/Forward navigation
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (e.state && e.state.page) {
        setCurrentPage(e.state.page);
        if (e.state.params?.productId) setActiveProductId(e.state.params.productId);
        if (e.state.params?.categorySlug) setActiveCategorySlug(e.state.params.categorySlug);
        updatePageSeoAndUrl(e.state.page, e.state.params, false);
      } else {
        const route = getInitialPageFromUrl();
        setCurrentPage(route.page);
        if (route.productId) setActiveProductId(route.productId);
        if (route.categorySlug) setActiveCategorySlug(route.categorySlug);
        updatePageSeoAndUrl(route.page, { productId: route.productId, categorySlug: route.categorySlug }, false);
      }
    };

    window.addEventListener('popstate', handlePopState);
    // Initial SEO update
    updatePageSeoAndUrl(initialRoute.page, { productId: initialRoute.productId, categorySlug: initialRoute.categorySlug }, false);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Firestore initial seeding & listener
  useEffect(() => {
    seedFirestoreIfEmpty();

    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const loaded: Product[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      } as Product));
      setProducts(loaded);
    }, (error) => {
      console.warn('Firestore products snapshot listener error:', error);
    });

    const unsubCategories = onSnapshot(collection(db, 'categories'), (snapshot) => {
      const loaded: Category[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      } as Category));
      setCategories(loaded);
    }, (error) => {
      console.warn('Firestore categories snapshot listener error:', error);
    });

    const unsubCoupons = onSnapshot(collection(db, 'coupons'), (snapshot) => {
      const loaded: Coupon[] = snapshot.docs.map((docSnap) => ({
        ...docSnap.data()
      } as Coupon));
      setCoupons(loaded);
    }, (error) => {
      console.warn('Firestore coupons snapshot listener error:', error);
    });

    const unsubHeroSlides = onSnapshot(collection(db, 'hero_slides'), (snapshot) => {
      const loaded: HeroSlide[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      } as HeroSlide));
      setHeroSlides(loaded);
    }, (error) => {
      console.warn('Firestore hero_slides snapshot listener error:', error);
    });

    const unsubPartners = onSnapshot(collection(db, 'partner_pharmacies'), (snapshot) => {
      const loaded: PartnerPharmacy[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      } as PartnerPharmacy));
      setPartnerPharmacies(loaded);
    }, (error) => {
      console.warn('Firestore partner_pharmacies snapshot listener error:', error);
    });

    const unsubOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
      const loaded: Order[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      } as Order));
      // Deduplicate by ID
      const orderMap = new Map<string, Order>();
      loaded.forEach((ord) => {
        if (ord && ord.id) {
          orderMap.set(ord.id, ord);
        }
      });
      const uniqueList = Array.from(orderMap.values());
      uniqueList.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setOrders(uniqueList);
    }, (error) => {
      console.warn('Firestore orders snapshot listener error:', error);
    });

    const unsubInquiries = onSnapshot(collection(db, 'inquiries'), (snapshot) => {
      const loaded: CustomerInquiry[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      } as CustomerInquiry));
      loaded.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setInquiries(loaded);
    }, (error) => {
      console.warn('Firestore inquiries snapshot listener error:', error);
    });

    return () => {
      unsubProducts();
      unsubCategories();
      unsubCoupons();
      unsubHeroSlides();
      unsubPartners();
      unsubOrders();
      unsubInquiries();
    };
  }, []);

  // Save cart & wishlist local state
  useEffect(() => {
    localStorage.setItem('secureshop_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('secureshop_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('secureshop_orders', JSON.stringify(orders));
  }, [orders]);

  const navigateTo = (page: string, params?: { productId?: string; categorySlug?: string }) => {
    setCurrentPage(page);
    if (params?.productId) setActiveProductId(params.productId);
    if (params?.categorySlug) setActiveCategorySlug(params.categorySlug);
    updatePageSeoAndUrl(page, params, true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addToast = (title: string, description?: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [...prev, { product, quantity }];
    });
    addToast('Added to Cart', `${product.name} (x${quantity}) added discreetly to your cart.`);
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    addToast('Item Removed', 'Product removed from shopping cart.', 'info');
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const applyCoupon = (code: string): boolean => {
    const found = coupons.find((c) => c.code.toUpperCase() === code.trim().toUpperCase() && c.active);
    if (found) {
      setAppliedCoupon(found);
      addToast('Coupon Applied!', `${found.discountPercent}% discount code ${found.code} active.`);
      return true;
    }
    addToast('Invalid Coupon', 'The entered promo code is expired or invalid.', 'error');
    return false;
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    addToast('Coupon Removed', 'Discount coupon cleared from cart.', 'info');
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const isSaved = prev.includes(productId);
      if (isSaved) {
        addToast('Removed from Wishlist', 'Item removed from saved list.', 'info');
        return prev.filter((id) => id !== productId);
      } else {
        addToast('Saved to Wishlist', 'Item added to your private wishlist.');
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  const toggleDiscreteMode = () => {
    setDiscreteMode((prev) => !prev);
  };

  const quickHide = () => {
    document.title = 'Notes - System Calculator';
    // Navigate to neutral screen or blank view if activated
    navigateTo('home');
    setDiscreteMode(true);
    addToast('Discrete Panic Mode Activated', 'Page branding silenced & tab title masked.', 'info');
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  // Helper to remove undefined properties from Firestore payloads
  const sanitizeDocData = (data: Record<string, any>) => {
    const clean: Record<string, any> = {};
    Object.keys(data).forEach((key) => {
      if (data[key] !== undefined) {
        clean[key] = data[key];
      }
    });
    return clean;
  };

  const placeOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'trackingNumber'>): Promise<Order> => {
    const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
    const trackingNumber = 'SS-TRK-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    
    const newOrder: Order = {
      ...orderData,
      id: orderId,
      createdAt: new Date().toISOString(),
      trackingNumber,
      estimatedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      })
    };

    try {
      await setDoc(doc(db, 'orders', orderId), sanitizeDocData(newOrder));
    } catch (e) {
      console.warn('Firestore order save notice:', e);
    }

    setOrders((prev) => [newOrder, ...prev]);
    setActiveProductId(orderId);
    if (typeof sessionStorage !== 'undefined') {
      try {
        sessionStorage.setItem('last_caremart_order_id', orderId);
        sessionStorage.setItem('last_caremart_order_data', JSON.stringify(newOrder));
      } catch (err) {
        // ignore storage errors
      }
    }
    clearCart();
    addToast('Order Placed Successfully!', `Order #${orderId} confirmed with plain discrete packaging.`);
    return newOrder;
  };

  // Admin Actions
  const addProduct = async (productData: Omit<Product, 'id'>) => {
    const id = 'prod-' + (products.length + 1);
    const newProduct: Product = { ...productData, id };
    setProducts((prev) => [newProduct, ...prev]);
    addToast('Product Added', `${newProduct.name} created in database.`);
    try {
      await setDoc(doc(db, 'products', id), sanitizeDocData(newProduct));
    } catch (e) {
      console.warn('Firestore addProduct error:', e);
    }
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    const existing = products.find((p) => p.id === id);
    if (!existing) return;
    const updated = { ...existing, ...productData };
    setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
    addToast('Product Updated', `Changes saved for ${updated.name}.`);
    try {
      await setDoc(doc(db, 'products', id), sanitizeDocData(updated), { merge: true });
    } catch (e) {
      console.warn('Firestore updateProduct error:', e);
    }
  };

  const deleteProduct = async (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    addToast('Product Deleted', 'Item removed from database.', 'info');
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (e) {
      console.warn('Firestore deleteProduct error:', e);
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    addToast('Order Status Updated', `Order #${orderId} marked as ${status}.`);
    try {
      await setDoc(doc(db, 'orders', orderId), sanitizeDocData({ status }), { merge: true });
    } catch (e) {
      console.warn('Firestore updateOrderStatus error:', e);
    }
  };

  const deleteOrder = async (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    addToast('Order Removed', `Order #${orderId} deleted from database.`, 'info');
    try {
      await deleteDoc(doc(db, 'orders', orderId));
    } catch (e) {
      console.warn('Firestore deleteOrder error:', e);
    }
  };

  const addCoupon = async (coupon: Coupon) => {
    setCoupons((prev) => [...prev, coupon]);
    addToast('Coupon Created', `Promo code ${coupon.code} activated.`);
    try {
      await setDoc(doc(db, 'coupons', coupon.code), sanitizeDocData(coupon));
    } catch (e) {
      console.warn('Firestore addCoupon error:', e);
    }
  };

  const deleteCoupon = async (code: string) => {
    setCoupons((prev) => prev.filter((c) => c.code !== code));
    addToast('Coupon Removed', `Code ${code} deleted.`, 'info');
    try {
      await deleteDoc(doc(db, 'coupons', code));
    } catch (e) {
      console.warn('Firestore deleteCoupon error:', e);
    }
  };

  const addHeroSlide = async (slide: Omit<HeroSlide, 'id'>) => {
    const newId = `hero-${Date.now()}`;
    const newSlide: HeroSlide = { ...slide, id: newId };
    setHeroSlides((prev) => [...prev, newSlide]);
    try {
      await setDoc(doc(db, 'hero_slides', newId), sanitizeDocData(newSlide));
      addToast('Hero Banner Added', 'New hero banner published.');
    } catch (err) {
      console.warn('Firestore addHeroSlide error:', err);
    }
  };

  const updateHeroSlide = async (id: string, slide: Partial<HeroSlide>) => {
    setHeroSlides((prev) => prev.map((s) => (s.id === id ? { ...s, ...slide } : s)));
    try {
      await setDoc(doc(db, 'hero_slides', id), sanitizeDocData(slide), { merge: true });
      addToast('Hero Banner Updated', 'Banner modifications saved.');
    } catch (err) {
      console.warn('Firestore updateHeroSlide error:', err);
    }
  };

  const deleteHeroSlide = async (id: string) => {
    setHeroSlides((prev) => prev.filter((s) => s.id !== id));
    try {
      await deleteDoc(doc(db, 'hero_slides', id));
      addToast('Hero Banner Removed', 'Hero slide deleted.', 'info');
    } catch (err) {
      console.warn('Firestore deleteHeroSlide error:', err);
    }
  };

  const addPartnerPharmacy = async (pharmacy: Omit<PartnerPharmacy, 'id'>) => {
    const newId = `pharm-${Date.now()}`;
    const newPharm: PartnerPharmacy = { ...pharmacy, id: newId, isActive: pharmacy.isActive ?? true };
    setPartnerPharmacies((prev) => [...prev, newPharm]);
    try {
      await setDoc(doc(db, 'partner_pharmacies', newId), sanitizeDocData(newPharm));
      addToast('Partner Pharmacy Added', `${newPharm.name} registered as certified partner.`);
    } catch (err) {
      console.warn('Firestore addPartnerPharmacy error:', err);
    }
  };

  const updatePartnerPharmacy = async (id: string, pharmacy: Partial<PartnerPharmacy>) => {
    setPartnerPharmacies((prev) => prev.map((p) => (p.id === id ? { ...p, ...pharmacy } : p)));
    try {
      await setDoc(doc(db, 'partner_pharmacies', id), sanitizeDocData(pharmacy), { merge: true });
      addToast('Partner Updated', 'Partner pharmacy details updated.');
    } catch (err) {
      console.warn('Firestore updatePartnerPharmacy error:', err);
    }
  };

  const deletePartnerPharmacy = async (id: string) => {
    setPartnerPharmacies((prev) => prev.filter((p) => p.id !== id));
    try {
      await deleteDoc(doc(db, 'partner_pharmacies', id));
      addToast('Partner Removed', 'Partner pharmacy unlinked.', 'info');
    } catch (err) {
      console.warn('Firestore deletePartnerPharmacy error:', err);
    }
  };

  const addInquiry = async (inquiryData: Omit<CustomerInquiry, 'id' | 'createdAt' | 'status'>) => {
    const newId = `inq-${Date.now()}`;
    const newInquiry: CustomerInquiry = {
      ...inquiryData,
      id: newId,
      createdAt: new Date().toISOString(),
      status: 'new'
    };
    setInquiries((prev) => [newInquiry, ...prev]);
    try {
      await setDoc(doc(db, 'inquiries', newId), sanitizeDocData(newInquiry));
      addToast('Inquiry Transmitted', 'Our confidential support team will respond within 2 hours.');
    } catch (err) {
      console.warn('Firestore addInquiry error:', err);
    }
  };

  const updateInquiryStatus = async (id: string, status: CustomerInquiry['status']) => {
    setInquiries((prev) => prev.map((inq) => (inq.id === id ? { ...inq, status } : inq)));
    try {
      await setDoc(doc(db, 'inquiries', id), sanitizeDocData({ status }), { merge: true });
      addToast('Inquiry Status Updated', `Status changed to ${status}.`);
    } catch (err) {
      console.warn('Firestore updateInquiryStatus error:', err);
    }
  };

  const deleteInquiry = async (id: string) => {
    setInquiries((prev) => prev.filter((inq) => inq.id !== id));
    try {
      await deleteDoc(doc(db, 'inquiries', id));
      addToast('Inquiry Deleted', 'Inquiry removed from system.', 'info');
    } catch (err) {
      console.warn('Firestore deleteInquiry error:', err);
    }
  };

  return (
    <ShopContext.Provider
      value={{
        products,
        categories,
        coupons,
        heroSlides,
        partnerPharmacies,
        inquiries,
        cart,
        wishlist,
        orders,
        appliedCoupon,
        discreteMode,
        toasts,
        filters,
        currentPage,
        activeProductId,
        activeCategorySlug,
        navigateTo,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        applyCoupon,
        removeCoupon,
        toggleWishlist,
        isInWishlist,
        toggleDiscreteMode,
        quickHide,
        setFilters,
        resetFilters,
        placeOrder,
        addToast,
        removeToast,
        addProduct,
        updateProduct,
        deleteProduct,
        updateOrderStatus,
        deleteOrder,
        addCoupon,
        deleteCoupon,
        addHeroSlide,
        updateHeroSlide,
        deleteHeroSlide,
        addPartnerPharmacy,
        updatePartnerPharmacy,
        deletePartnerPharmacy,
        addInquiry,
        updateInquiryStatus,
        deleteInquiry
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
}
