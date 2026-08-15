import React, { useState } from 'react';
import { 
  X, 
  Home, 
  ShoppingBag, 
  LayoutGrid, 
  Truck, 
  Heart, 
  User, 
  LogOut, 
  LogIn, 
  ShieldCheck, 
  HelpCircle, 
  Phone, 
  MessageCircle, 
  ChevronRight, 
  Sparkles,
  Lock,
  Package,
  Globe,
  Settings,
  ChevronDown,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useShop } from '../../context/ShopContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage, LANGUAGE_OPTIONS } from '../../context/LanguageContext';
import { Logo } from '../common/Logo';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCart: () => void;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({ 
  isOpen, 
  onClose,
  onOpenCart
}) => {
  const { currentPage, navigateTo, categories, wishlist, cart } = useShop();
  const { currentUser, userProfile, logout, isAdmin } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const [categoriesExpanded, setCategoriesExpanded] = useState(true);
  const [langExpanded, setLangExpanded] = useState(false);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const wishlistCount = wishlist.length;

  const handleNav = (page: string, params?: { categorySlug?: string; productId?: string }) => {
    navigateTo(page, params);
    onClose();
  };

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Dark Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs"
            aria-hidden="true"
          />

          {/* Slide-out Sidebar Drawer from the Left */}
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            className="fixed top-0 bottom-0 left-0 z-50 w-full max-w-[340px] sm:max-w-[380px] bg-white shadow-2xl flex flex-col justify-between overflow-hidden border-r border-slate-200"
            aria-label="Navigation Menu & User Profile"
          >
            {/* Top Bar with Logo & Close button */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
              <div 
                onClick={() => handleNav('home')}
                className="cursor-pointer"
              >
                <Logo size="sm" />
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content Container */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
              
              {/* Profile Card Banner */}
              {currentUser ? (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-md relative overflow-hidden">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white font-black text-lg shadow-sm shrink-0 border-2 border-white/20">
                      {userProfile?.displayName ? userProfile.displayName.charAt(0).toUpperCase() : (currentUser.email ? currentUser.email.charAt(0).toUpperCase() : 'U')}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-extrabold text-sm text-white truncate">
                          {userProfile?.displayName || currentUser.displayName || 'CareMart Member'}
                        </h3>
                        {isAdmin && (
                          <span className="px-1.5 py-0.5 rounded-full bg-red-600/90 text-white text-[9px] font-black uppercase tracking-wider">
                            Admin
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 truncate font-mono">
                        {currentUser.email}
                      </p>
                    </div>
                  </div>

                  {/* Profile & Logout Action Buttons */}
                  <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleNav('profile')}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5 text-amber-400" />
                      <span>{t('nav.account', 'My Profile')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="py-1.5 px-3 rounded-xl bg-red-600/80 hover:bg-red-600 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      title="Log Out"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span className="hidden xs:inline">{t('auth.logout', 'Logout')}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-red-50 via-amber-50/40 to-red-50/30 border border-red-100 text-slate-800 space-y-2.5">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-white p-1.5 shadow-xs border border-red-100/90 flex items-center justify-center shrink-0 overflow-hidden">
                      <img 
                        src="/icon.svg" 
                        alt="CareMart Logo" 
                        className="w-full h-full object-contain rounded-xl"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-extrabold text-sm text-slate-900 leading-tight">{t('drawer.welcome', 'Welcome to CareMart')}</h3>
                      <p className="text-[11px] text-slate-600 font-medium leading-normal mt-0.5">{t('drawer.login_prompt', 'Log in for faster checkout & secret orders')}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleNav('login')}
                      className="flex-1 py-2 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>{t('auth.login', 'Sign In')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNav('register')}
                      className="flex-1 py-2 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center justify-center cursor-pointer"
                    >
                      <span>{t('auth.register', 'Register')}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Main Navigation Links */}
              <div className="space-y-1">
                <p className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  {t('drawer.navigation', 'Main Navigation')}
                </p>

                {/* Home */}
                <button
                  type="button"
                  onClick={() => handleNav('home')}
                  className={`w-full p-2.5 rounded-xl flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                    currentPage === 'home'
                      ? 'bg-red-50 text-red-600 font-extrabold'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Home className="w-4 h-4 text-red-500" />
                    <span>{t('nav.home', 'Home')}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Shop All Products */}
                <button
                  type="button"
                  onClick={() => handleNav('shop')}
                  className={`w-full p-2.5 rounded-xl flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                    currentPage === 'shop'
                      ? 'bg-red-50 text-red-600 font-extrabold'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ShoppingBag className="w-4 h-4 text-amber-500" />
                    <span>{t('nav.shop', 'Shop All Products')}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Categories Dropdown */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleNav('categories')}
                      className={`flex-1 p-2.5 rounded-xl flex items-center gap-3 text-xs font-bold text-left transition-all cursor-pointer ${
                        currentPage === 'categories'
                          ? 'bg-red-50 text-red-600 font-extrabold'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <LayoutGrid className="w-4 h-4 text-rose-500" />
                      <span>{t('nav.categories', 'Health Categories')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCategoriesExpanded(!categoriesExpanded)}
                      className="p-2 rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                      aria-label="Toggle categories list"
                    >
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${categoriesExpanded ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  {/* Expanded Categories Chips / Sub-menu */}
                  {categoriesExpanded && (
                    <div className="pl-9 pr-2 py-1 space-y-1">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => handleNav('shop', { categorySlug: cat.slug })}
                          className="w-full py-1.5 px-2.5 rounded-lg text-left text-xs font-medium text-slate-600 hover:text-red-600 hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer"
                        >
                          <span className="truncate">{cat.name}</span>
                          <span className="text-[10px] text-slate-400">→</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Track Live Order */}
                <button
                  type="button"
                  onClick={() => handleNav('tracking')}
                  className={`w-full p-2.5 rounded-xl flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                    currentPage === 'tracking'
                      ? 'bg-red-50 text-red-600 font-extrabold'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Truck className="w-4 h-4 text-blue-500" />
                    <span>{t('home.track_order', 'Track Order')}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black">
                    Live
                  </span>
                </button>

                {/* Wishlist */}
                <button
                  type="button"
                  onClick={() => handleNav('wishlist')}
                  className={`w-full p-2.5 rounded-xl flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                    currentPage === 'wishlist'
                      ? 'bg-red-50 text-red-600 font-extrabold'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Heart className="w-4 h-4 text-pink-500" />
                    <span>{t('nav.wishlist', 'My Wishlist')}</span>
                  </div>
                  {wishlistCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 text-[10px] font-black">
                      {wishlistCount}
                    </span>
                  )}
                </button>

                {/* Shopping Basket Drawer Trigger */}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenCart();
                  }}
                  className="w-full p-2.5 rounded-xl flex items-center justify-between text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Package className="w-4 h-4 text-purple-500" />
                    <span>{t('header.cart', 'Shopping Basket')}</span>
                  </div>
                  {cartCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black">
                      {cartCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Admin Portal (if admin or debug access) */}
              {(isAdmin || currentUser?.email?.includes('admin') || currentUser?.email === 'christianiyonzima01@gmail.com') && (
                <div className="pt-2 border-t border-slate-100">
                  <p className="px-3 text-[10px] font-black uppercase tracking-wider text-amber-600 mb-1">
                    Administration
                  </p>
                  <button
                    type="button"
                    onClick={() => handleNav('admin')}
                    className={`w-full p-2.5 rounded-xl flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                      currentPage === 'admin'
                        ? 'bg-amber-50 text-amber-900 font-extrabold border border-amber-200'
                        : 'text-amber-800 hover:bg-amber-50/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-4 h-4 text-amber-600" />
                      <span>Admin Management Dashboard</span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded-md bg-amber-200 text-amber-900 text-[9px] font-black">
                      PORTAL
                    </span>
                  </button>
                </div>
              )}

              {/* Help & Customer Care */}
              <div className="pt-2 border-t border-slate-100 space-y-1">
                <p className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Support & Policies
                </p>

                <a
                  href="https://wa.me/250788345678?text=Hello%20CareMart%20Support"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full p-2.5 rounded-xl flex items-center justify-between text-xs font-bold text-emerald-700 hover:bg-emerald-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span>WhatsApp Live Chat</span>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-bold">24/7</span>
                </a>

                <a
                  href="tel:+250788345678"
                  className="w-full p-2.5 rounded-xl flex items-center justify-between text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-red-500" />
                    <span>Helpline: +250 788 345 678</span>
                  </div>
                </a>

                <button
                  type="button"
                  onClick={() => handleNav('faq')}
                  className="w-full p-2.5 rounded-xl flex items-center justify-between text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle className="w-4 h-4 text-slate-500" />
                    <span>Frequently Asked Questions</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleNav('privacy')}
                  className="w-full p-2.5 rounded-xl flex items-center justify-between text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-4 h-4 text-slate-500" />
                    <span>100% Discrete Packaging Policy</span>
                  </div>
                </button>
              </div>

              {/* Language Selector in Drawer */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setLangExpanded(!langExpanded)}
                  className="w-full p-2.5 rounded-xl flex items-center justify-between text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-indigo-500" />
                    <span>Language ({language.toUpperCase()})</span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${langExpanded ? 'rotate-180' : ''}`} />
                </button>

                {langExpanded && (
                  <div className="pl-9 pr-2 py-1 space-y-1">
                    {LANGUAGE_OPTIONS.map((opt) => (
                      <button
                        key={opt.code}
                        type="button"
                        onClick={() => {
                          setLanguage(opt.code);
                          setLangExpanded(false);
                        }}
                        className={`w-full py-1.5 px-2.5 rounded-lg text-left text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                          language === opt.code
                            ? 'bg-red-50 text-red-600 font-extrabold'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{opt.flag}</span>
                          <span>{opt.nativeName}</span>
                        </span>
                        {language === opt.code && <Check className="w-3.5 h-3.5 text-red-600" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Bottom Confidentiality Guarantee Badge */}
            <div className="p-3.5 bg-slate-900 text-white shrink-0 border-t border-slate-800">
              <div className="flex items-center gap-2 text-[11px] text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>100% Unbranded discrete delivery across Rwanda</span>
              </div>
            </div>

          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
