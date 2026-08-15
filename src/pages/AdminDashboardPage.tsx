import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import { Product, Coupon, Order, HeroSlide, PartnerPharmacy, CustomerInquiry } from '../types';
import { uploadMediaToCloudinary } from '../lib/cloudinary';
import { ReceiptModal } from '../components/orders/ReceiptModal';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Tag, 
  Users, 
  TrendingUp, 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  RefreshCw, 
  Search, 
  Percent, 
  Sparkles, 
  Image as ImageIcon, 
  Upload, 
  ArrowLeft, 
  ArrowRight, 
  Star, 
  Building2, 
  Phone, 
  MapPin, 
  Award, 
  MessageSquare, 
  Mail, 
  Clock, 
  MessageCircle, 
  Loader2, 
  Video, 
  Film,
  Lock,
  Eye,
  FileText,
  Download,

  EyeOff,
  ShieldAlert,
  AlertCircle,
  LogOut,
  KeyRound,
  User
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { 
    products, 
    categories, 
    orders, 
    coupons, 
    heroSlides, 
    partnerPharmacies, 
    inquiries, 
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
    updateInquiryStatus, 
    deleteInquiry, 
    addToast,
    navigateTo 
  } = useShop();

  const { currentUser, userProfile, isAdmin, loading, login, logout } = useAuth();

  // Admin Login State for unauthenticated or non-admin users
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [adminLoginError, setAdminLoginError] = useState<string | null>(null);
  const [isAdminLoggingIn, setIsAdminLoggingIn] = useState(false);

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'coupons' | 'hero' | 'partners' | 'inquiries'>('overview');

  // Receipt Modal State
  const [adminReceiptOrder, setAdminReceiptOrder] = useState<Order | null>(null);
  const [showAdminReceiptModal, setShowAdminReceiptModal] = useState(false);


  // Inquiry Filter & Search State
  const [inquirySearchQuery, setInquirySearchQuery] = useState('');
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState<'all' | 'new' | 'in-progress' | 'replied' | 'resolved'>('all');

  // Product Modal State
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states for Product
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState(categories[0]?.name || 'Condoms');
  const [prodBrand, setProdBrand] = useState('Secure Shop');
  const [prodPrice, setProdPrice] = useState(19.99);
  const [prodOriginalPrice, setProdOriginalPrice] = useState(25.99);
  const [prodStock, setProdStock] = useState(50);
  const [prodImages, setProdImages] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);

  // Helper functions for multi-image management
  const handleAddImageUrl = () => {
    if (imageUrlInput.trim()) {
      setProdImages((prev) => [...prev, imageUrlInput.trim()]);
      setImageUrlInput('');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingMedia(true);
    addToast('Processing photo/video upload...', 'info');

    try {
      const fileList = Array.from(files) as File[];
      let fallbackCount = 0;
      for (const file of fileList) {
        const cloudRes = await uploadMediaToCloudinary(file, 'caremart_products');
        if (cloudRes.url) {
          setProdImages((prev) => [...prev, cloudRes.url]);
          if (cloudRes.isFallback) fallbackCount++;
        }
      }

      if (fallbackCount > 0) {
        addToast(`Uploaded ${files.length} item(s)! (Used local data URL fallback for invalid Cloud Name)`, 'info');
      } else {
        addToast(`Successfully hosted ${files.length} item(s) on Cloudinary!`, 'success');
      }
    } catch (err: any) {
      console.error('Media upload error:', err);
      addToast(`Upload failed: ${err.message || 'Error'}`, 'error');
    } finally {
      setIsUploadingMedia(false);
      e.target.value = '';
    }
  };

  const handleHeroFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingMedia(true);
    addToast('Processing hero banner photo/video upload...', 'info');

    try {
      const file = files[0];
      const cloudRes = await uploadMediaToCloudinary(file, 'caremart_hero');
      if (cloudRes.url) {
        setHeroImage(cloudRes.url);
        if (cloudRes.isFallback) {
          addToast('Hero banner media uploaded! (Local data URL fallback used)', 'info');
        } else {
          addToast('Hero banner media hosted on Cloudinary!', 'success');
        }
      }
    } catch (err: any) {
      console.error('Hero slide upload error:', err);
      addToast(`Hero upload failed: ${err.message || 'Error'}`, 'error');
    } finally {
      setIsUploadingMedia(false);
      e.target.value = '';
    }
  };

  const handlePartnerFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingMedia(true);
    addToast('Processing pharmacy photo upload...', 'info');

    try {
      const file = files[0];
      const cloudRes = await uploadMediaToCloudinary(file, 'caremart_pharmacies');
      if (cloudRes.url) {
        setPharmImage(cloudRes.url);
        if (cloudRes.isFallback) {
          addToast('Pharmacy photo uploaded! (Local data URL fallback used)', 'info');
        } else {
          addToast('Pharmacy photo hosted on Cloudinary!', 'success');
        }
      }
    } catch (err: any) {
      console.error('Partner pharmacy upload error:', err);
      addToast(`Pharmacy upload failed: ${err.message || 'Error'}`, 'error');
    } finally {
      setIsUploadingMedia(false);
      e.target.value = '';
    }
  };
  const handleRemoveImage = (index: number) => {
    setProdImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMakePrimary = (index: number) => {
    setProdImages((prev) => {
      const next = [...prev];
      const [selected] = next.splice(index, 1);
      return [selected, ...next];
    });
  };

  const handleMoveImage = (index: number, direction: 'left' | 'right') => {
    setProdImages((prev) => {
      const newIdx = direction === 'left' ? index - 1 : index + 1;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[newIdx];
      copy[newIdx] = temp;
      return copy;
    });
  };
  
  // Product Checkbox Flags
  const [prodIsBestSeller, setProdIsBestSeller] = useState(false);
  const [prodIsOnDiscount, setProdIsOnDiscount] = useState(false);
  const [prodDiscountPercent, setProdDiscountPercent] = useState(20);

  // Hero Slide Modal State
  const [heroModalOpen, setHeroModalOpen] = useState(false);
  const [editingHeroSlide, setEditingHeroSlide] = useState<HeroSlide | null>(null);
  const [heroBadge, setHeroBadge] = useState('');
  const [heroTitle, setHeroTitle] = useState('');
  const [heroImage, setHeroImage] = useState('');
  const [heroBannerBg, setHeroBannerBg] = useState('bg-red-600');
  const [heroBtnLabel, setHeroBtnLabel] = useState('Shop now');
  const [heroBtnAction, setHeroBtnAction] = useState<'shop' | 'categories' | 'discount' | 'profile'>('shop');

  // Coupon Modal State
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState(15);
  const [newCouponMinSpend, setNewCouponMinSpend] = useState(0);

  // Discount Modal State
  const [discountModalOpen, setDiscountModalOpen] = useState(false);
  const [discountProduct, setDiscountProduct] = useState<Product | null>(null);
  const [discountedPriceInput, setDiscountedPriceInput] = useState<number>(0);
  const [discountPercentInput, setDiscountPercentInput] = useState<number>(10);

  const openDiscountModal = (p: Product) => {
    setDiscountProduct(p);
    const basePrice = (p.discountPercent && p.discountPercent > 0 && p.originalPrice) ? p.originalPrice : p.price;
    if (p.discountPercent && p.discountPercent > 0) {
      setDiscountedPriceInput(p.price);
      setDiscountPercentInput(p.discountPercent);
    } else {
      const defaultPct = 20;
      const defaultDiscountedPrice = Math.round(basePrice * (1 - defaultPct / 100));
      setDiscountedPriceInput(defaultDiscountedPrice);
      setDiscountPercentInput(defaultPct);
    }
    setDiscountModalOpen(true);
  };

  const handlePriceInputChange = (val: number) => {
    setDiscountedPriceInput(val);
    const basePrice = (discountProduct?.originalPrice && discountProduct?.discountPercent && discountProduct.discountPercent > 0) 
      ? discountProduct.originalPrice 
      : (discountProduct?.price || 0);
    if (basePrice > 0 && val < basePrice && val > 0) {
      const pct = Math.round(((basePrice - val) / basePrice) * 100);
      setDiscountPercentInput(pct);
    }
  };

  const handlePercentInputChange = (pct: number) => {
    setDiscountPercentInput(pct);
    const basePrice = (discountProduct?.originalPrice && discountProduct?.discountPercent && discountProduct.discountPercent > 0) 
      ? discountProduct.originalPrice 
      : (discountProduct?.price || 0);
    if (basePrice > 0 && pct >= 0 && pct <= 90) {
      const calculatedPrice = Math.round(basePrice * (1 - pct / 100));
      setDiscountedPriceInput(calculatedPrice);
    }
  };

  const handleApplyDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!discountProduct) return;

    const basePrice = (discountProduct.originalPrice && discountProduct.discountPercent && discountProduct.discountPercent > 0)
      ? discountProduct.originalPrice
      : discountProduct.price;

    if (discountedPriceInput >= basePrice || discountedPriceInput <= 0) {
      addToast('Invalid Discount Price', 'Discounted price must be less than regular price.', 'error');
      return;
    }

    const calculatedPct = Math.round(((basePrice - discountedPriceInput) / basePrice) * 100);

    await updateProduct(discountProduct.id, {
      price: discountedPriceInput,
      originalPrice: basePrice,
      discountPercent: calculatedPct,
      isFlashDeal: true
    });

    addToast('Discount Applied!', `Applied -${calculatedPct}% OFF on ${discountProduct.name}. Listed under On Discount.`);
    setDiscountModalOpen(false);
  };

  const handleRemoveDiscount = async () => {
    if (!discountProduct) return;
    const regularPrice = discountProduct.originalPrice || discountProduct.price;

    await updateProduct(discountProduct.id, {
      price: regularPrice,
      originalPrice: undefined,
      discountPercent: 0,
      isFlashDeal: false
    });

    addToast('Discount Removed', `${discountProduct.name} restored to regular price (${regularPrice.toLocaleString()} Frw).`);
    setDiscountModalOpen(false);
  };

  // Stats calculation from real data
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalOrdersCount = orders.length;
  const uniqueCustomerCount = new Set(orders.map((o) => o.shippingAddress?.phone || o.shippingAddress?.email).filter(Boolean)).size;

  const openAddProduct = () => {
    setEditingProduct(null);
    setProdName('');
    setProdCategory(categories[0]?.name || 'Condoms');
    setProdBrand('CareMart');
    setProdPrice(0);
    setProdOriginalPrice(0);
    setProdStock(50);
    setProdImages([]);
    setImageUrlInput('');
    setProdDesc('');
    setProdIsBestSeller(false);
    setProdIsOnDiscount(false);
    setProdDiscountPercent(20);
    setProductModalOpen(true);
  };

  const openEditProduct = (p: Product) => {
    setEditingProduct(p);
    setProdName(p.name);
    setProdCategory(p.category);
    setProdBrand(p.brand);
    setProdPrice(p.price);
    setProdOriginalPrice(p.originalPrice || p.price);
    setProdStock(p.stockCount || 50);
    setProdImages(p.images && p.images.length > 0 ? [...p.images] : ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80']);
    setImageUrlInput('');
    setProdDesc(p.description);
    setProdIsBestSeller(Boolean(p.isBestSeller));
    const hasDiscount = Boolean((p.discountPercent && p.discountPercent > 0) || p.isFlashDeal);
    setProdIsOnDiscount(hasDiscount);
    setProdDiscountPercent(p.discountPercent || 20);
    setProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim()) {
      addToast('Missing Name', 'Please enter a product name before saving.', 'error');
      return;
    }

    try {
      const validImages = prodImages.filter((img) => img.trim().length > 0);
      const finalImages = validImages.length > 0
        ? validImages
        : ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80'];

      let finalPrice = Number(prodPrice);
      let finalOriginalPrice: number | undefined = undefined;
      let finalDiscountPct: number | undefined = undefined;

      if (prodIsOnDiscount) {
        const orig = Number(prodOriginalPrice) > finalPrice ? Number(prodOriginalPrice) : Math.round(finalPrice * 1.25);
        finalOriginalPrice = orig;
        finalDiscountPct = prodDiscountPercent > 0 ? prodDiscountPercent : Math.round(((orig - finalPrice) / orig) * 100);
      }

      if (editingProduct) {
        await updateProduct(editingProduct.id, {
          name: prodName,
          category: prodCategory,
          brand: prodBrand,
          price: finalPrice,
          originalPrice: finalOriginalPrice,
          discountPercent: finalDiscountPct,
          isFlashDeal: prodIsOnDiscount,
          isBestSeller: prodIsBestSeller,
          stockCount: Number(prodStock),
          images: finalImages,
          description: prodDesc
        });
        addToast('Product Saved', `"${prodName}" updated with ${finalImages.length} image(s).`);
      } else {
        await addProduct({
          name: prodName,
          slug: prodName.toLowerCase().replace(/\s+/g, '-'),
          category: prodCategory,
          brand: prodBrand,
          price: finalPrice,
          originalPrice: finalOriginalPrice,
          discountPercent: finalDiscountPct,
          isFlashDeal: prodIsOnDiscount,
          isBestSeller: prodIsBestSeller,
          rating: 5.0,
          reviewCount: 1,
          inStock: true,
          stockCount: Number(prodStock),
          images: finalImages,
          description: prodDesc,
          features: ['Plain box discrete shipping', '100% Body safe'],
          discretePackaging: true,
          tags: prodIsBestSeller ? ['Best Seller', 'Popular'] : ['New Arrival']
        });
        addToast('Product Added', `"${prodName}" created with ${finalImages.length} image(s).`);
      }
      setProductModalOpen(false);
    } catch (err: any) {
      console.error('Error saving product:', err);
      addToast('Save Failed', `Could not save product: ${err.message || 'Unknown error'}`, 'error');
    }
  };

  // Hero Slide Modal Handlers
  const openAddHeroSlide = () => {
    setEditingHeroSlide(null);
    setHeroBadge('SPECIAL OFFERS & DEALS');
    setHeroTitle('Upgrade your wellness routine with discrete care');
    setHeroImage('https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=1600&auto=format&fit=crop&q=80');
    setHeroBannerBg('bg-red-600');
    setHeroBtnLabel('Shop now');
    setHeroBtnAction('shop');
    setHeroModalOpen(true);
  };

  const openEditHeroSlide = (slide: HeroSlide) => {
    setEditingHeroSlide(slide);
    setHeroBadge(slide.badge);
    setHeroTitle(slide.title);
    setHeroImage(slide.image);
    setHeroBannerBg(slide.bannerBg);
    setHeroBtnLabel(slide.primaryBtnLabel);
    setHeroBtnAction(slide.primaryBtnAction || 'shop');
    setHeroModalOpen(true);
  };

  const handleSaveHeroSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroTitle.trim() || !heroImage.trim()) return;

    if (editingHeroSlide) {
      await updateHeroSlide(editingHeroSlide.id, {
        badge: heroBadge,
        title: heroTitle,
        image: heroImage,
        bannerBg: heroBannerBg,
        primaryBtnLabel: heroBtnLabel,
        primaryBtnAction: heroBtnAction,
        textColor: heroBannerBg.includes('slate-900') ? 'text-slate-900' : 'text-red-600',
        badgeBg: heroBannerBg.includes('slate-900') ? 'bg-red-600 text-white' : 'bg-slate-950 text-white'
      });
    } else {
      await addHeroSlide({
        badge: heroBadge,
        title: heroTitle,
        image: heroImage,
        bannerBg: heroBannerBg,
        primaryBtnLabel: heroBtnLabel,
        primaryBtnAction: heroBtnAction,
        textColor: heroBannerBg.includes('slate-900') ? 'text-slate-900' : 'text-red-600',
        badgeBg: heroBannerBg.includes('slate-900') ? 'bg-red-600 text-white' : 'bg-slate-950 text-white'
      });
    }

    setHeroModalOpen(false);
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;

    await addCoupon({
      code: newCouponCode.trim().toUpperCase(),
      discountPercent: Number(newCouponDiscount),
      active: true,
      minSpend: Number(newCouponMinSpend),
      description: `${newCouponDiscount}% off promo code`
    });

    setCouponModalOpen(false);
    setNewCouponCode('');
  };

  // Partner Pharmacy Modal State & Handlers
  const [partnerModalOpen, setPartnerModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<PartnerPharmacy | null>(null);
  const [pharmName, setPharmName] = useState('');
  const [pharmLicense, setPharmLicense] = useState('');
  const [pharmLocation, setPharmLocation] = useState('');
  const [pharmSpecialty, setPharmSpecialty] = useState('');
  const [pharmBadge, setPharmBadge] = useState('Ministry of Health Certified');
  const [pharmRating, setPharmRating] = useState(4.9);
  const [pharmImage, setPharmImage] = useState('');
  const [pharmPhone, setPharmPhone] = useState('');
  const [pharmIsActive, setPharmIsActive] = useState(true);

  const openAddPartner = () => {
    setEditingPartner(null);
    setPharmName('');
    setPharmLicense(`MOH/RWA/2024/${Math.floor(1000 + Math.random() * 9000)}`);
    setPharmLocation('Kigali City Center');
    setPharmSpecialty('Family Planning & Contraceptive Supplies');
    setPharmBadge('Ministry of Health Certified');
    setPharmRating(4.9);
    setPharmImage('https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=800&auto=format&fit=crop&q=80');
    setPharmPhone('+250 788 123 456');
    setPharmIsActive(true);
    setPartnerModalOpen(true);
  };

  const openEditPartner = (p: PartnerPharmacy) => {
    setEditingPartner(p);
    setPharmName(p.name);
    setPharmLicense(p.licenseNo);
    setPharmLocation(p.location);
    setPharmSpecialty(p.specialty);
    setPharmBadge(p.badge);
    setPharmRating(p.rating || 4.9);
    setPharmImage(p.image);
    setPharmPhone(p.phone || '+250 788 123 456');
    setPharmIsActive(p.isActive !== false);
    setPartnerModalOpen(true);
  };

  const handleSavePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pharmName.trim()) return;

    if (editingPartner) {
      await updatePartnerPharmacy(editingPartner.id, {
        name: pharmName,
        licenseNo: pharmLicense,
        location: pharmLocation,
        specialty: pharmSpecialty,
        badge: pharmBadge,
        rating: Number(pharmRating),
        image: pharmImage || 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=800&auto=format&fit=crop&q=80',
        phone: pharmPhone,
        isActive: pharmIsActive
      });
    } else {
      await addPartnerPharmacy({
        name: pharmName,
        licenseNo: pharmLicense,
        location: pharmLocation,
        specialty: pharmSpecialty,
        badge: pharmBadge,
        rating: Number(pharmRating),
        image: pharmImage || 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=800&auto=format&fit=crop&q=80',
        phone: pharmPhone,
        isActive: pharmIsActive
      });
    }

    setPartnerModalOpen(false);
  };

  const handleTogglePartnerActive = async (partner: PartnerPharmacy) => {
    const nextActive = partner.isActive === false ? true : false;
    await updatePartnerPharmacy(partner.id, { isActive: nextActive });
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoginError(null);
    setIsAdminLoggingIn(true);
    try {
      await login(adminEmail.trim(), adminPassword);
      addToast('Admin Authenticated', 'Store administration console unlocked.');
    } catch (err: any) {
      console.error('Admin login error:', err);
      setAdminLoginError(err?.message || 'Authentication failed. Please verify your admin Gmail and password.');
    } finally {
      setIsAdminLoggingIn(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 px-4">
        <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-600">Verifying administrator authorization...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto text-red-600 border border-red-200 shadow-xs">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 pt-2">Admin Portal Authentication</h1>
          <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto">
            Restricted area: Enter your Administrator credentials to access store management.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white border border-gray-200 space-y-5 shadow-sm">
          {adminLoginError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{adminLoginError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Admin Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@caremart.shop"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:border-red-600 focus:outline-none text-xs font-semibold text-slate-900"
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Admin Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-300 focus:border-red-600 focus:outline-none text-xs font-semibold text-slate-900"
                />
                <KeyRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isAdminLoggingIn}
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isAdminLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Sign In to Admin Dashboard</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigateTo('home')}
              className="w-full py-2 rounded-xl text-center text-slate-600 hover:text-slate-900 font-bold text-xs"
            >
              ← Return to Online Store
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto text-amber-600 border border-amber-200 shadow-xs">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 pt-2">Access Denied</h1>
          <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto">
            Administrator privileges required to access the Store Management Dashboard.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white border border-gray-200 space-y-5 shadow-sm text-center">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
            <p className="font-semibold text-slate-500">Signed In As:</p>
            <p className="font-bold text-slate-900 text-sm truncate">{currentUser.email}</p>
            <p className="text-[11px] text-slate-500">
              Role in database: <span className="font-extrabold text-amber-700 uppercase">{userProfile?.role || 'customer'}</span>
            </p>
          </div>

          <p className="text-xs text-slate-600">
            This account does not have the <code className="px-1.5 py-0.5 bg-slate-100 rounded text-red-600 font-mono text-[11px]">admin</code> role in the Firestore <code className="px-1.5 py-0.5 bg-slate-100 rounded font-mono text-[11px]">users</code> collection.
          </p>

          <div className="space-y-3 pt-2">
            <button
              onClick={async () => {
                await logout();
                setAdminPassword('');
              }}
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out & Log In as Admin</span>
            </button>
            <button
              onClick={() => navigateTo('home')}
              className="w-full py-2.5 rounded-xl border border-gray-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors"
            >
              Return to Store Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-amber-600 text-xs font-bold mb-1">
            <LayoutDashboard className="w-4 h-4" />
            <span>CareMart Admin Console</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Store Administration</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Authenticated Admin: <span className="font-bold text-slate-800">{currentUser.email}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => logout()}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 text-xs font-bold gap-6 text-slate-500">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'overview' ? 'border-red-600 text-red-600 font-extrabold' : 'border-transparent hover:text-slate-900'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-red-600" />
          <span>Analytics & Sales</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'products' ? 'border-red-600 text-red-600 font-extrabold' : 'border-transparent hover:text-slate-900'
          }`}
        >
          <Package className="w-4 h-4 text-red-600" />
          <span>Products CRUD ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'orders' ? 'border-red-600 text-red-600 font-extrabold' : 'border-transparent hover:text-slate-900'
          }`}
        >
          <ShoppingBag className="w-4 h-4 text-red-600" />
          <span>Orders Management ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('coupons')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'coupons' ? 'border-red-600 text-red-600 font-extrabold' : 'border-transparent hover:text-slate-900'
          }`}
        >
          <Tag className="w-4 h-4 text-red-600" />
          <span>Coupons ({coupons.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('hero')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'hero' ? 'border-red-600 text-red-600 font-extrabold' : 'border-transparent hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4 text-red-600" />
          <span>Hero Banners ({heroSlides.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('partners')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'partners' ? 'border-red-600 text-red-600 font-extrabold' : 'border-transparent hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4 text-red-600" />
          <span>Partner Pharmacies ({partnerPharmacies.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('inquiries')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 relative ${
            activeTab === 'inquiries' ? 'border-red-600 text-red-600 font-extrabold' : 'border-transparent hover:text-slate-900'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-red-600" />
          <span>Inquiries ({inquiries.length})</span>
          {inquiries.filter((i) => i.status === 'new').length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white font-extrabold text-[10px] animate-pulse">
              {inquiries.filter((i) => i.status === 'new').length} New
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-white border border-gray-200 space-y-2 shadow-xs">
              <span className="text-xs text-slate-500 font-bold">Total Gross Sales</span>
              <p className="text-3xl font-extrabold text-slate-900">{totalRevenue.toLocaleString()} Frw</p>
              <span className="text-[11px] text-emerald-700 font-bold">Live database synced</span>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-gray-200 space-y-2 shadow-xs">
              <span className="text-xs text-slate-500 font-bold">Total Orders</span>
              <p className="text-3xl font-extrabold text-slate-900">{totalOrdersCount}</p>
              <span className="text-[11px] text-emerald-700 font-bold">100% Discrete packaging</span>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-gray-200 space-y-2 shadow-xs">
              <span className="text-xs text-slate-500 font-bold">Customer Contacts</span>
              <p className="text-3xl font-extrabold text-slate-900">{uniqueCustomerCount}</p>
              <span className="text-[11px] text-slate-500 font-medium">Zero data leaks</span>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-gray-200 space-y-2 shadow-xs cursor-pointer hover:border-red-600 transition-all" onClick={() => setActiveTab('inquiries')}>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-bold">Customer Inquiries</span>
                <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-600 font-extrabold text-[10px] border border-red-200">
                  {inquiries.filter((i) => i.status === 'new').length} New
                </span>
              </div>
              <p className="text-3xl font-extrabold text-slate-900">{inquiries.length}</p>
              <span className="text-[11px] text-red-600 font-bold flex items-center gap-1">
                <span>View & reply in Inquiries tab →</span>
              </span>
            </div>
          </div>

          {/* Graphical Visualizer */}
          <div className="p-6 rounded-3xl bg-white border border-gray-200 space-y-4 shadow-xs">
            <h3 className="font-extrabold text-slate-900 text-base">Sales & Performance Trends</h3>
            <div className="h-48 flex items-end gap-3 pt-6 pb-2 px-2 border-b border-gray-100">
              {[40, 65, 50, 80, 95, 70, 85, 110, 130, 145, 160, 180].map((val, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                  <div
                    style={{ height: `${val}px` }}
                    className="w-full bg-gradient-to-t from-amber-500 to-red-600 rounded-t-md group-hover:brightness-110 transition-all"
                  />
                  <span className="text-[9px] text-slate-400 uppercase font-mono font-bold">{`M${idx + 1}`}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: PRODUCTS CRUD */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-base">Catalog Inventory ({products.length})</h3>
            <button
              onClick={openAddProduct}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 text-white text-xs font-extrabold hover:opacity-95 flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          </div>

          {/* Products Table */}
          <div className="rounded-3xl bg-white border border-gray-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 border-b border-gray-200 uppercase text-[10px] tracking-wider font-extrabold">
                  <tr>
                    <th className="p-4">Product</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <div className="relative shrink-0">
                          <img src={p.images[0]} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-slate-50 border border-slate-200" />
                          {p.images.length > 1 && (
                            <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full border border-white shadow-2xs">
                              {p.images.length}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 max-w-xs truncate">{p.name}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400 font-mono">ID: {p.id}</span>
                            {p.images.length > 1 && (
                              <span className="text-[10px] text-red-600 font-bold">
                                {p.images.length} photos
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-slate-600">{p.category}</td>
                      <td className="p-4 font-extrabold text-slate-900">{p.price.toLocaleString()} Frw</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          p.inStock ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}>
                          {p.stockCount || 50} units
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        {p.discountPercent && p.discountPercent > 0 ? (
                          <button
                            onClick={() => openDiscountModal(p)}
                            className="px-2.5 py-1 text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg inline-flex items-center gap-1 transition-colors"
                            title="Edit Active Discount"
                          >
                            <Tag className="w-3.5 h-3.5" />
                            <span>-{p.discountPercent}% OFF</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => openDiscountModal(p)}
                            className="px-2.5 py-1 text-[11px] font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg inline-flex items-center gap-1 transition-colors"
                            title="Add Discount to Product"
                          >
                            <Percent className="w-3.5 h-3.5" />
                            <span>Add Discount</span>
                          </button>
                        )}
                        <button
                          onClick={() => openEditProduct(p)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg inline-flex items-center"
                          title="Edit Product Details"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteProduct(p.id)}
                          className="p-1.5 text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-lg inline-flex items-center"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <h3 className="font-extrabold text-slate-900 text-base">Customer Orders Management ({orders.length})</h3>

          <div className="rounded-3xl bg-white border border-gray-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 border-b border-gray-200 uppercase text-[10px] tracking-wider font-extrabold">
                  <tr>
                    <th className="p-4">Order ID</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Fulfillment Status</th>
                    <th className="p-4">Update Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((ord) => {
                    const isRegistered = ord.userId && ord.userId !== 'guest' && ord.userId !== 'guest-user' && !ord.isGuest;
                    return (
                      <tr key={ord.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4">
                          <p className="font-mono font-bold text-slate-900">{ord.id}</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">{ord.trackingNumber}</p>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-bold text-slate-900">{ord.shippingAddress.fullName}</p>
                            {isRegistered ? (
                              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[9px] font-extrabold flex items-center gap-1">
                                <User className="w-2.5 h-2.5" />
                                <span>User Account</span>
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-extrabold flex items-center gap-1">
                                <span>Guest (No Account)</span>
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium">
                            {ord.shippingAddress.phone} • {ord.shippingAddress.city}, {ord.shippingAddress.state}
                          </p>
                          {isRegistered && (
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                              UID: {ord.userId.substring(0, 12)}...
                            </p>
                          )}
                        </td>
                        <td className="p-4">
                          <p className="font-extrabold text-red-600">{ord.total.toLocaleString()} Frw</p>
                          <p className="text-[10px] text-slate-400 font-medium">{ord.items.length} item(s)</p>
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                            {ord.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <select
                            value={ord.status}
                            onChange={(e) => updateOrderStatus(ord.id, e.target.value as Order['status'])}
                            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-900 text-xs font-bold focus:outline-none focus:border-red-600"
                          >
                            <option value="Processing">Processing</option>
                            <option value="Packaging">Plain Packaging</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setAdminReceiptOrder(ord);
                                setShowAdminReceiptModal(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors inline-flex items-center"
                              title="Download Official PDF Receipt"
                            >
                              <FileText className="w-4 h-4 text-red-600" />
                            </button>

                            <button
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to delete order #${ord.id}? This cannot be undone.`)) {
                                  deleteOrder(ord.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors inline-flex items-center"
                              title="Delete Order"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: COUPONS */}
      {activeTab === 'coupons' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-base">Active Discount Coupons ({coupons.length})</h3>
            <button
              onClick={() => setCouponModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Create Promo Code</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {coupons.map((c) => (
              <div key={c.code} className="p-4 rounded-2xl bg-white border border-gray-200 flex items-center justify-between text-xs shadow-xs">
                <div>
                  <span className="font-mono font-extrabold text-sm text-red-600">{c.code}</span>
                  <p className="text-slate-500 text-[11px] font-medium mt-0.5">{c.discountPercent}% Discount</p>
                </div>
                <button
                  onClick={() => deleteCoupon(c.code)}
                  className="p-1.5 text-rose-600 hover:text-rose-800 bg-rose-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: HERO BANNERS MANAGEMENT */}
      {activeTab === 'hero' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-gray-200 p-6 rounded-3xl shadow-xs">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <span>Home Page Hero Banners</span>
                <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-600 text-xs font-bold">
                  {heroSlides.length} Active
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Manage hero slider images, headlines, subtext badges, button labels, and link destinations.
              </p>
            </div>

            <button
              onClick={openAddHeroSlide}
              className="px-5 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold flex items-center gap-2 transition-all shadow-md cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Hero Banner</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {heroSlides.map((slide, idx) => (
              <div key={slide.id} className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-xs flex flex-col justify-between">
                <div className="relative h-48 overflow-hidden bg-slate-900">
                  <img src={slide.image} alt={slide.title} className="w-full h-full object-cover brightness-95" />
                  <div className="absolute top-3 left-3">
                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-xs shadow-xs ${slide.badgeBg || 'bg-slate-950 text-white'}`}>
                      {slide.badge}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-xs text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                    Slide #{idx + 1}
                  </div>
                </div>

                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-base leading-snug mb-2">
                      {slide.title}
                    </h4>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 font-mono text-[10px] text-slate-600 font-bold">Theme: {slide.bannerBg}</span>
                      <span className="px-2.5 py-1 rounded-lg bg-red-50 text-red-600 font-bold text-[10px]">Btn: "{slide.primaryBtnLabel}"</span>
                      <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-white font-bold text-[10px]">Target: {slide.primaryBtnAction || 'shop'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => openEditHeroSlide(slide)}
                      className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit Banner</span>
                    </button>
                    <button
                      onClick={() => deleteHeroSlide(slide.id)}
                      className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs flex items-center justify-center cursor-pointer transition-colors"
                      title="Delete Slide"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: PARTNER PHARMACIES MANAGEMENT */}
      {activeTab === 'partners' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-gray-200 p-6 rounded-3xl shadow-xs">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-red-600" />
                <span>Partner Pharmacies Network in Rwanda</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  {partnerPharmacies.filter((p) => p.isActive !== false).length} Active
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Manage accredited partner pharmacies authorized to fulfill Ministry of Health regulated pharmaceuticals, contraceptives, and family planning items.
              </p>
            </div>

            <button
              onClick={openAddPartner}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-amber-500 text-white text-xs font-extrabold flex items-center gap-2 transition-all shadow-md cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Partner Pharmacy</span>
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-white border border-gray-200 rounded-2xl space-y-1 shadow-xs">
              <span className="text-xs text-slate-500 font-bold">Total Network Partners</span>
              <p className="text-2xl font-extrabold text-slate-900">{partnerPharmacies.length}</p>
            </div>
            <div className="p-5 bg-white border border-gray-200 rounded-2xl space-y-1 shadow-xs">
              <span className="text-xs text-slate-500 font-bold">Active Certified Partners</span>
              <p className="text-2xl font-extrabold text-emerald-600">
                {partnerPharmacies.filter((p) => p.isActive !== false).length}
              </p>
            </div>
            <div className="p-5 bg-white border border-gray-200 rounded-2xl space-y-1 shadow-xs">
              <span className="text-xs text-slate-500 font-bold">Ministry of Health Compliance</span>
              <p className="text-2xl font-extrabold text-red-600">100% Verified</p>
            </div>
          </div>

          {/* Partner Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {partnerPharmacies.map((pharm) => {
              const isActive = pharm.isActive !== false;
              return (
                <div
                  key={pharm.id}
                  className={`bg-white border rounded-3xl overflow-hidden shadow-xs flex flex-col justify-between transition-all ${
                    isActive ? 'border-gray-200' : 'border-slate-300 opacity-70 bg-slate-50/50'
                  }`}
                >
                  <div className="space-y-4 p-5">
                    {/* Header Image & Badge */}
                    <div className="h-36 rounded-2xl overflow-hidden relative bg-slate-100 border border-slate-200">
                      <img src={pharm.image} alt={pharm.name} className="w-full h-full object-cover" />
                      <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-slate-900/90 text-emerald-400 font-extrabold text-[10px] backdrop-blur-xs border border-slate-700 shadow-sm flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        <span>{pharm.badge}</span>
                      </span>
                      <span
                        className={`absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full text-[10px] font-black border shadow-xs ${
                          isActive
                            ? 'bg-emerald-500 text-white border-emerald-400'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {isActive ? 'Active' : 'Disabled'}
                      </span>
                    </div>

                    {/* Pharmacy Info */}
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-extrabold text-base text-slate-900 leading-tight">
                          {pharm.name}
                        </h4>
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-black text-[11px] border border-amber-200 shrink-0">
                          ★ {pharm.rating || 4.9}
                        </span>
                      </div>

                      <div className="space-y-1 text-xs">
                        <p className="text-slate-500 font-mono font-bold flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-red-600" />
                          <span>{pharm.licenseNo}</span>
                        </p>
                        <p className="text-slate-600 font-medium flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{pharm.location}</span>
                        </p>
                        {pharm.phone && (
                          <p className="text-slate-600 font-medium flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{pharm.phone}</span>
                          </p>
                        )}
                        <p className="text-slate-700 font-semibold pt-1 border-t border-gray-100 text-[11px]">
                          Specialty: <span className="font-bold text-red-600">{pharm.specialty}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-4 bg-slate-50 border-t border-gray-100 flex items-center gap-2">
                    <button
                      onClick={() => handleTogglePartnerActive(pharm)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                      title={isActive ? 'Disable Partner' : 'Activate Partner'}
                    >
                      {isActive ? 'Disable' : 'Enable'}
                    </button>

                    <button
                      onClick={() => openEditPartner(pharm)}
                      className="flex-1 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs border border-gray-200 flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                    >
                      <Edit className="w-3.5 h-3.5 text-red-600" />
                      <span>Edit Details</span>
                    </button>

                    <button
                      onClick={() => deletePartnerPharmacy(pharm.id)}
                      className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs border border-rose-200 flex items-center justify-center cursor-pointer transition-colors"
                      title="Delete Partner Pharmacy"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 7: INQUIRIES MANAGEMENT */}
      {activeTab === 'inquiries' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">Customer Support Inquiries ({inquiries.length})</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Review inquiries sent by customers, inspect subjects & message content, and contact or update status.
              </p>
            </div>

            {/* Quick Status Stats Pill */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-extrabold text-[11px] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span>{inquiries.filter((i) => i.status === 'new').length} New</span>
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 font-extrabold text-[11px]">
                {inquiries.filter((i) => i.status === 'in-progress').length} In Progress
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 font-extrabold text-[11px]">
                {inquiries.filter((i) => i.status === 'replied').length} Replied
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-extrabold text-[11px]">
                {inquiries.filter((i) => i.status === 'resolved').length} Resolved
              </span>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={inquirySearchQuery}
                onChange={(e) => setInquirySearchQuery(e.target.value)}
                placeholder="Search by customer name, email, subject, or message..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-red-600"
              />
              {inquirySearchQuery && (
                <button
                  onClick={() => setInquirySearchQuery('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Status Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0 overflow-x-auto">
              {(['all', 'new', 'in-progress', 'replied', 'resolved'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setInquiryStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg font-bold text-[11px] capitalize transition-all cursor-pointer whitespace-nowrap ${
                    inquiryStatusFilter === st
                      ? 'bg-white text-slate-900 shadow-xs border border-gray-200 font-extrabold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st === 'all' ? 'All Inquiries' : st.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Inquiry Cards List */}
          {(() => {
            const filteredInquiries = inquiries.filter((inq) => {
              const matchesStatus = inquiryStatusFilter === 'all' || inq.status === inquiryStatusFilter;
              const q = inquirySearchQuery.toLowerCase().trim();
              const matchesQuery =
                !q ||
                inq.name.toLowerCase().includes(q) ||
                inq.email.toLowerCase().includes(q) ||
                (inq.phone && inq.phone.toLowerCase().includes(q)) ||
                inq.subject.toLowerCase().includes(q) ||
                inq.message.toLowerCase().includes(q);
              return matchesStatus && matchesQuery;
            });

            if (filteredInquiries.length === 0) {
              return (
                <div className="p-12 text-center rounded-3xl bg-white border border-gray-200 space-y-3">
                  <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="font-bold text-slate-700 text-sm">No Customer Inquiries Found</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    {inquirySearchQuery || inquiryStatusFilter !== 'all'
                      ? 'Try clearing your search query or switching filters.'
                      : 'No customer inquiries have been submitted yet.'}
                  </p>
                </div>
              );
            }

            return (
              <div className="space-y-4">
                {filteredInquiries.map((inq) => {
                  const formattedDate = new Date(inq.createdAt).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  const statusColors = {
                    new: 'bg-rose-50 text-rose-700 border-rose-200 font-extrabold',
                    'in-progress': 'bg-amber-50 text-amber-700 border-amber-200 font-extrabold',
                    replied: 'bg-sky-50 text-sky-700 border-sky-200 font-extrabold',
                    resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-extrabold'
                  };

                  return (
                    <div
                      key={inq.id}
                      className="p-6 rounded-3xl bg-white border border-gray-200 space-y-4 shadow-xs hover:border-gray-300 transition-all text-xs"
                    >
                      {/* Top Header Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 font-extrabold text-sm shrink-0">
                            {inq.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-extrabold text-slate-900 text-sm">{inq.name}</h4>
                              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px]">
                                ID: {inq.id}
                              </span>
                            </div>
                            <p className="text-slate-400 text-[11px] flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3" />
                              <span>{formattedDate}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          <span className={`px-3 py-1 rounded-xl text-[11px] border capitalize ${statusColors[inq.status]}`}>
                            {inq.status.replace('-', ' ')}
                          </span>
                        </div>
                      </div>

                      {/* Contact Info & Subject Badges */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Customer Email</span>
                          <a
                            href={`mailto:${inq.email}?subject=Re: CareMart Support - ${encodeURIComponent(inq.subject)}`}
                            className="text-red-600 font-bold text-xs hover:underline flex items-center gap-1 mt-0.5"
                          >
                            <Mail className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{inq.email}</span>
                          </a>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Contact Phone / WhatsApp</span>
                          {inq.phone ? (
                            <a
                              href={`https://wa.me/${inq.phone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-700 font-bold text-xs hover:underline flex items-center gap-1 mt-0.5"
                            >
                              <Phone className="w-3.5 h-3.5 shrink-0" />
                              <span>{inq.phone}</span>
                            </a>
                          ) : (
                            <span className="text-slate-400 font-medium text-xs mt-0.5 block">Not provided</span>
                          )}
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Inquiry Subject</span>
                          <span className="font-extrabold text-slate-900 text-xs mt-0.5 block truncate">
                            {inq.subject}
                          </span>
                        </div>
                      </div>

                      {/* Message Content */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Customer Message</span>
                        <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 text-xs font-medium leading-relaxed shadow-inner border border-slate-800">
                          <p className="whitespace-pre-wrap">{inq.message}</p>
                        </div>
                      </div>

                      {/* Actions Footer */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                        {/* Status Change Selector */}
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 font-bold text-[11px] shrink-0">Update Status:</span>
                          <div className="flex items-center gap-1 flex-wrap">
                            {(['new', 'in-progress', 'replied', 'resolved'] as const).map((st) => (
                              <button
                                key={st}
                                onClick={() => updateInquiryStatus(inq.id, st)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold capitalize transition-all cursor-pointer ${
                                  inq.status === st
                                    ? 'bg-slate-900 text-white font-extrabold shadow-xs'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                }`}
                              >
                                {st.replace('-', ' ')}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Direct Communication Buttons */}
                        <div className="flex items-center gap-2">
                          <a
                            href={`mailto:${inq.email}?subject=Re: CareMart Support - ${encodeURIComponent(inq.subject)}&body=${encodeURIComponent('Dear ' + inq.name + ',\n\nThank you for reaching out to CareMart support regarding "' + inq.subject + '".\n\n')}`}
                            className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-extrabold text-xs border border-red-200 flex items-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span>Reply via Email</span>
                          </a>

                          <a
                            href={`https://wa.me/${inq.phone ? inq.phone.replace(/[^0-9]/g, '') : '250781111155'}?text=${encodeURIComponent('Hello ' + inq.name + ', this is CareMart support following up regarding your inquiry about "' + inq.subject + '".')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-extrabold text-xs border border-emerald-200 flex items-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>WhatsApp Reply</span>
                          </a>

                          <button
                            onClick={() => deleteInquiry(inq.id)}
                            className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs border border-rose-200 flex items-center justify-center cursor-pointer transition-colors"
                            title="Delete Inquiry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-6 max-w-lg w-full max-h-[88vh] flex flex-col text-slate-900 text-xs shadow-xl my-auto">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3 shrink-0">
              <h3 className="font-extrabold text-base text-slate-900">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => setProductModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="flex flex-col flex-1 min-h-0 pt-2">
              <div className="space-y-4 overflow-y-auto flex-1 pr-1 pb-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Product Title</label>
                  <input
                    type="text"
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-red-600"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Category</label>
                    <select
                      value={prodCategory}
                      onChange={(e) => setProdCategory(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Brand Name</label>
                    <input
                      type="text"
                      value={prodBrand}
                      onChange={(e) => setProdBrand(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={prodPrice}
                      onChange={(e) => setProdPrice(Number(e.target.value))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Original ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={prodOriginalPrice}
                      onChange={(e) => setProdOriginalPrice(Number(e.target.value))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Stock Units</label>
                    <input
                      type="number"
                      value={prodStock}
                      onChange={(e) => setProdStock(Number(e.target.value))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                      required
                    />
                  </div>
                </div>

                {/* Multi-Image Gallery Manager */}
                <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <label className="block text-slate-900 font-extrabold text-xs">
                      Product Gallery Images ({prodImages.length})
                    </label>
                    <span className="text-[10px] text-slate-500 font-medium">
                      First image is primary cover photo
                    </span>
                  </div>

                  {/* Thumbnails Grid */}
                  {prodImages.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {prodImages.map((imgUrl, index) => (
                        <div 
                          key={index} 
                          className={`relative group rounded-xl overflow-hidden border bg-white aspect-square shadow-xs flex flex-col justify-between ${
                            index === 0 ? 'border-red-600 ring-2 ring-red-600/20' : 'border-slate-200'
                          }`}
                        >
                          <img src={imgUrl} alt={`Product photo ${index + 1}`} className="w-full h-full object-cover" />
                          
                          {/* Cover / Index badge */}
                          {index === 0 ? (
                            <span className="absolute top-1.5 left-1.5 bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1 z-10">
                              <Star className="w-2.5 h-2.5 fill-current" /> Cover
                            </span>
                          ) : (
                            <span className="absolute top-1.5 left-1.5 bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md z-10">
                              #{index + 1}
                            </span>
                          )}

                          {/* Always Visible Corner Delete Icon Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveImage(index);
                              addToast('Image Removed', `Photo #${index + 1} deleted. Remember to click Save Changes to persist.`, 'info');
                            }}
                            className="absolute top-1.5 right-1.5 z-30 p-1.5 bg-rose-600 hover:bg-rose-700 active:scale-90 text-white rounded-full shadow-md transition-all cursor-pointer flex items-center justify-center border border-white/50"
                            title="Delete Image"
                          >
                            <X className="w-3.5 h-3.5 stroke-[3]" />
                          </button>

                          {/* Hover Overlay Controls */}
                          <div className="absolute inset-0 bg-slate-900/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 gap-1.5 backdrop-blur-[2px] z-20">
                            {index !== 0 && (
                              <button
                                type="button"
                                onClick={() => handleMakePrimary(index)}
                                className="w-full py-1 px-2 bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <Star className="w-3 h-3 fill-current" /> Set Cover
                              </button>
                            )}
                            
                            <div className="flex items-center gap-1 w-full">
                              {index > 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleMoveImage(index, 'left')}
                                  className="flex-1 py-1 bg-white/20 hover:bg-white/40 text-white font-bold text-[10px] rounded-lg transition-colors flex items-center justify-center cursor-pointer"
                                  title="Move Left"
                                >
                                  <ArrowLeft className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {index < prodImages.length - 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleMoveImage(index, 'right')}
                                  className="flex-1 py-1 bg-white/20 hover:bg-white/40 text-white font-bold text-[10px] rounded-lg transition-colors flex items-center justify-center cursor-pointer"
                                  title="Move Right"
                                >
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(index)}
                                className="flex-1 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] rounded-lg transition-colors flex items-center justify-center cursor-pointer"
                                title="Remove Image"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload & Add URL controls */}
                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <label className={`flex-1 cursor-pointer py-2.5 px-3 bg-white border ${isUploadingMedia ? 'border-amber-400 bg-amber-50/50' : 'border-slate-300 hover:border-red-600'} rounded-xl text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-2xs`}>
                        {isUploadingMedia ? (
                          <>
                            <Loader2 className="w-4 h-4 text-amber-600 animate-spin" />
                            <span className="text-amber-800">Uploading to Cloudinary...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 text-red-600" />
                            <span>Upload Photos & Videos (Cloudinary Hosted)</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*,video/*"
                          multiple
                          disabled={isUploadingMedia}
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        value={imageUrlInput}
                        onChange={(e) => setImageUrlInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddImageUrl();
                          }
                        }}
                        placeholder="Or paste image URL (e.g. https://...)"
                        className="flex-1 p-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs font-medium focus:outline-none focus:border-red-600"
                      />
                      <button
                        type="button"
                        onClick={handleAddImageUrl}
                        disabled={!imageUrlInput.trim()}
                        className="px-3.5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl flex items-center gap-1 transition-colors shrink-0 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" /> Add Photo
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <span className="text-[11px] font-extrabold uppercase text-red-600 tracking-wider block">Special Flags & Promotion Status</span>
                  
                  <div className="flex flex-wrap items-center gap-4">
                    <label className="flex items-center gap-2 font-bold text-slate-900 cursor-pointer select-none text-xs">
                      <input
                        type="checkbox"
                        checked={prodIsBestSeller}
                        onChange={(e) => setProdIsBestSeller(e.target.checked)}
                        className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-600 cursor-pointer"
                      />
                      <span>⭐ Best Seller</span>
                    </label>

                    <label className="flex items-center gap-2 font-bold text-slate-900 cursor-pointer select-none text-xs">
                      <input
                        type="checkbox"
                        checked={prodIsOnDiscount}
                        onChange={(e) => setProdIsOnDiscount(e.target.checked)}
                        className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-600 cursor-pointer"
                      />
                      <span>🔥 Put on Discount</span>
                    </label>
                  </div>

                  {prodIsOnDiscount && (
                    <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Discount Tag (% OFF)</label>
                        <input
                          type="number"
                          min="1"
                          max="90"
                          value={prodDiscountPercent}
                          onChange={(e) => setProdDiscountPercent(Number(e.target.value))}
                          className="w-full p-2 bg-white border border-red-300 rounded-xl text-slate-900 font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Original Price (Frw)</label>
                        <input
                          type="number"
                          value={prodOriginalPrice}
                          onChange={(e) => setProdOriginalPrice(Number(e.target.value))}
                          className="w-full p-2 bg-white border border-red-300 rounded-xl text-slate-900 font-bold"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Description</label>
                  <textarea
                    value={prodDesc}
                    onChange={(e) => setProdDesc(e.target.value)}
                    rows={3}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-gray-100 shrink-0 mt-auto">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 text-white font-extrabold shadow-md hover:opacity-95 transition-all cursor-pointer"
                >
                  {editingProduct ? 'Save Product Changes' : 'Confirm & Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Coupon Modal */}
      {couponModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 max-w-sm w-full space-y-4 text-slate-900 text-xs shadow-xl">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-base text-slate-900">Create Coupon Code</h3>
              <button onClick={() => setCouponModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="space-y-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Code (Uppercase)</label>
                <input
                  type="text"
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value)}
                  placeholder="DISCRETION15"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Discount %</label>
                <input
                  type="number"
                  value={newCouponDiscount}
                  onChange={(e) => setNewCouponDiscount(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCouponModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 text-white font-extrabold shadow-sm"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Manage Discount Modal */}
      {discountModalOpen && discountProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 max-w-md w-full space-y-5 text-slate-900 text-xs shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-red-50 text-red-600 rounded-xl border border-red-100">
                  <Percent className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    {discountProduct.discountPercent && discountProduct.discountPercent > 0 ? 'Edit Active Discount' : 'Add Discount to Product'}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">Set special sale pricing & badge</p>
                </div>
              </div>
              <button onClick={() => setDiscountModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Product Overview */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
              <img src={discountProduct.images[0]} alt={discountProduct.name} className="w-12 h-12 rounded-xl object-cover bg-white border border-slate-200 shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-900 truncate">{discountProduct.name}</h4>
                <p className="text-[11px] text-slate-500 font-medium">
                  Regular Price: <strong className="text-slate-900 font-bold">{((discountProduct.originalPrice && discountProduct.discountPercent && discountProduct.discountPercent > 0) ? discountProduct.originalPrice : discountProduct.price).toLocaleString()} Frw</strong>
                </p>
              </div>
            </div>

            <form onSubmit={handleApplyDiscount} className="space-y-4">
              {/* Discount Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1.5">New Discounted Price (Frw)</label>
                  <input
                    type="number"
                    step="500"
                    value={discountedPriceInput}
                    onChange={(e) => handlePriceInputChange(Number(e.target.value))}
                    className="w-full p-3 bg-white border border-slate-300 rounded-xl text-slate-900 font-bold text-sm focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                    placeholder="e.g. 15000"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1.5">Discount Tag (% OFF)</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="90"
                      value={discountPercentInput}
                      onChange={(e) => handlePercentInputChange(Number(e.target.value))}
                      className="w-full p-3 bg-white border border-slate-300 rounded-xl text-slate-900 font-bold text-sm focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                      placeholder="e.g. 20"
                      required
                    />
                    <span className="absolute right-3 top-3.5 text-xs font-black text-slate-400">%</span>
                  </div>
                </div>
              </div>

              {/* Customer View Preview */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-red-50/80 to-amber-50/80 border border-red-200 space-y-2">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-red-600">Live Customer Display Preview</span>
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-extrabold text-red-600">
                      {discountedPriceInput > 0 ? discountedPriceInput.toLocaleString() : 0} Frw
                    </span>
                    <span className="text-xs text-slate-400 line-through font-medium">
                      {((discountProduct.originalPrice && discountProduct.discountPercent && discountProduct.discountPercent > 0) ? discountProduct.originalPrice : discountProduct.price).toLocaleString()} Frw
                    </span>
                  </div>
                  {discountPercentInput > 0 && (
                    <span className="px-2.5 py-1 rounded-md bg-red-600 text-white text-xs font-black tracking-tight shadow-xs">
                      -{discountPercentInput}%
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 font-medium pt-1">
                  * Item will immediately feature in <strong>"On discount"</strong> section with red <strong>-{discountPercentInput}%</strong> tag.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                {discountProduct.discountPercent && discountProduct.discountPercent > 0 ? (
                  <button
                    type="button"
                    onClick={handleRemoveDiscount}
                    className="px-4 py-3 rounded-xl border border-rose-200 text-rose-700 font-bold hover:bg-rose-50 transition-colors"
                  >
                    Remove Discount
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setDiscountModalOpen(false)}
                    className="flex-1 py-3 rounded-xl border border-gray-200 font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                )}

                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 text-white font-extrabold shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2"
                >
                  <Tag className="w-4 h-4" />
                  <span>Apply & Publish Discount</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hero Banner Add/Edit Modal */}
      {heroModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-6 max-w-lg w-full max-h-[88vh] flex flex-col text-slate-900 text-xs shadow-xl animate-in fade-in zoom-in-95 duration-200 my-auto">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-red-50 text-red-600 rounded-xl border border-red-100">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    {editingHeroSlide ? 'Edit Hero Banner' : 'Add New Hero Banner'}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">Customize Home Page hero slider slide</p>
                </div>
              </div>
              <button onClick={() => setHeroModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveHeroSlide} className="flex flex-col flex-1 min-h-0 pt-2">
              <div className="space-y-4 overflow-y-auto flex-1 pr-1 pb-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Headline Title</label>
                  <input
                    type="text"
                    value={heroTitle}
                    onChange={(e) => setHeroTitle(e.target.value)}
                    placeholder="Upgrade your bedroom with our seductive deals"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold text-sm focus:outline-none focus:border-red-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Badge Text (Top Pill)</label>
                  <input
                    type="text"
                    value={heroBadge}
                    onChange={(e) => setHeroBadge(e.target.value)}
                    placeholder="100% DISCRETE & CONFIDENTIAL"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-red-600"
                    required
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-slate-700 font-bold">Hero Media URL (Photo or Video)</label>
                    <label className={`cursor-pointer text-[11px] font-bold px-2.5 py-1 rounded-lg border ${isUploadingMedia ? 'bg-amber-50 text-amber-700 border-amber-300' : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'} flex items-center gap-1 transition-colors`}>
                      {isUploadingMedia ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin text-amber-600" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3 h-3" />
                          <span>Upload to Cloudinary</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*,video/*"
                        disabled={isUploadingMedia}
                        onChange={handleHeroFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <input
                    type="text"
                    value={heroImage}
                    onChange={(e) => setHeroImage(e.target.value)}
                    placeholder="https://res.cloudinary.com/..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-[11px]"
                    required
                  />
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    <span className="text-[10px] text-slate-400 font-bold self-center">Presets:</span>
                    {[
                      { label: 'Bedroom Luxury', url: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=1600&auto=format&fit=crop&q=80' },
                      { label: 'Discrete Parcel', url: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=1600&auto=format&fit=crop&q=80' },
                      { label: 'Wellness Rose', url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1600&auto=format&fit=crop&q=80' }
                    ].map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setHeroImage(preset.url)}
                        className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold cursor-pointer"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Button Label</label>
                    <input
                      type="text"
                      value={heroBtnLabel}
                      onChange={(e) => setHeroBtnLabel(e.target.value)}
                      placeholder="Shop now"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Link Target</label>
                    <select
                      value={heroBtnAction}
                      onChange={(e) => setHeroBtnAction(e.target.value as any)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
                    >
                      <option value="shop">All Products Page</option>
                      <option value="categories">Categories Page</option>
                      <option value="discount">Flash Deals Section</option>
                      <option value="profile">Order Tracking</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Banner Background Style</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: 'Vibrant Red', class: 'bg-red-600' },
                      { name: 'Dark Slate', class: 'bg-slate-900' },
                      { name: 'Warm Crimson Gradient', class: 'bg-gradient-to-r from-red-600 via-red-500 to-amber-500' },
                      { name: 'Deep Burgundy Gradient', class: 'bg-gradient-to-r from-red-950 to-red-800' }
                    ].map((bg, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setHeroBannerBg(bg.class)}
                        className={`p-2.5 rounded-xl text-white text-[11px] font-bold text-left transition-all cursor-pointer ${bg.class} ${
                          heroBannerBg === bg.class ? 'ring-2 ring-offset-2 ring-red-600 shadow-sm' : 'opacity-80 hover:opacity-100'
                        }`}
                      >
                        {bg.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-gray-100 shrink-0 mt-auto">
                <button
                  type="button"
                  onClick={() => setHeroModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 text-white font-extrabold shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{editingHeroSlide ? 'Save Banner Changes' : 'Publish Hero Banner'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Partner Pharmacy Modal */}
      {partnerModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-6 max-w-lg w-full max-h-[88vh] flex flex-col text-slate-900 text-xs shadow-xl my-auto">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3 shrink-0">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-red-600" />
                <span>{editingPartner ? 'Edit Partner Pharmacy' : 'Register New Partner Pharmacy'}</span>
              </h3>
              <button onClick={() => setPartnerModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePartner} className="flex flex-col flex-1 min-h-0 pt-3">
              <div className="space-y-4 overflow-y-auto flex-1 pr-1 pb-3">
                
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Pharmacy Name</label>
                  <input
                    type="text"
                    value={pharmName}
                    onChange={(e) => setPharmName(e.target.value)}
                    placeholder="e.g. Kigali Central Pharmacy"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-red-600"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">MOH License Number</label>
                    <input
                      type="text"
                      value={pharmLicense}
                      onChange={(e) => setPharmLicense(e.target.value)}
                      placeholder="e.g. MOH/RWA/2024/0148"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-medium focus:outline-none focus:border-red-600"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Location / District</label>
                    <input
                      type="text"
                      value={pharmLocation}
                      onChange={(e) => setPharmLocation(e.target.value)}
                      placeholder="e.g. Nyarugenge, Kigali"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-red-600"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Accreditation Badge</label>
                  <select
                    value={pharmBadge}
                    onChange={(e) => setPharmBadge(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-red-600"
                  >
                    <option value="Ministry of Health Certified">Ministry of Health Certified</option>
                    <option value="Accredited Partner">Accredited Partner</option>
                    <option value="Licensed Partner">Licensed Partner</option>
                    <option value="Verified Quality">Verified Quality</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Authorized Specialty & Supplies</label>
                  <input
                    type="text"
                    value={pharmSpecialty}
                    onChange={(e) => setPharmSpecialty(e.target.value)}
                    placeholder="e.g. Family Planning, Contraceptive Supplies & Pregnancy Tests"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-red-600"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Phone Contact</label>
                    <input
                      type="text"
                      value={pharmPhone}
                      onChange={(e) => setPharmPhone(e.target.value)}
                      placeholder="+250 788 000 000"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Rating (Out of 5.0)</label>
                    <input
                      type="number"
                      step="0.05"
                      min="1"
                      max="5"
                      value={pharmRating}
                      onChange={(e) => setPharmRating(Number(e.target.value))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-red-600"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-slate-700 font-bold">Pharmacy Photo URL</label>
                    <label className={`cursor-pointer text-[11px] font-bold px-2.5 py-1 rounded-lg border ${isUploadingMedia ? 'bg-amber-50 text-amber-700 border-amber-300' : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'} flex items-center gap-1 transition-colors`}>
                      {isUploadingMedia ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin text-amber-600" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3 h-3" />
                          <span>Upload to Cloudinary</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isUploadingMedia}
                        onChange={handlePartnerFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <input
                    type="url"
                    value={pharmImage}
                    onChange={(e) => setPharmImage(e.target.value)}
                    placeholder="https://res.cloudinary.com/..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-red-600"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="pharmIsActive"
                    checked={pharmIsActive}
                    onChange={(e) => setPharmIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-red-600 focus:ring-red-600 cursor-pointer"
                  />
                  <label htmlFor="pharmIsActive" className="text-slate-800 font-bold cursor-pointer">
                    Enable Active Partner Status (Visible on Storefront)
                  </label>
                </div>

              </div>

              <div className="flex gap-2 pt-3 border-t border-gray-100 shrink-0 mt-auto">
                <button
                  type="button"
                  onClick={() => setPartnerModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 text-white font-extrabold shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingPartner ? 'Save Changes' : 'Register Partner'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Order Sales Receipt Modal */}
      {adminReceiptOrder && (
        <ReceiptModal
          order={adminReceiptOrder}
          isOpen={showAdminReceiptModal}
          onClose={() => setShowAdminReceiptModal(false)}
        />
      )}

    </div>
  );

};
