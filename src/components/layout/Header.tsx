import React, { useState, useRef, useEffect } from 'react';
import { 
  ShoppingBag, 
  Phone,
  MessageCircle,
  Download,
  Globe,
  ChevronDown,
  Check,
  Menu,
  User,
  Heart,
  Truck,
  LogIn
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { PWAInstallModal } from '../common/PWAInstallModal';
import { NavigationDrawer } from './NavigationDrawer';
import { useShop } from '../../context/ShopContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage, LANGUAGE_OPTIONS } from '../../context/LanguageContext';

interface HeaderProps {
  onOpenCart: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCart }) => {
  const { cart, wishlist, navigateTo, currentPage } = useShop();
  const { currentUser, userProfile } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [installModalOpen, setInstallModalOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLangObj = LANGUAGE_OPTIONS.find((l) => l.code === language) || LANGUAGE_OPTIONS[0];
  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);
  const wishlistCount = wishlist.length;

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-xs">
        
        {/* Top Header Row: Contact, Translation Switcher & Download App Banner */}
        <div className="bg-slate-950 text-slate-200 text-xs border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-1.5 sm:py-2 flex items-center justify-between gap-2">
            
            {/* Left: Contact Info (Always observed & prominent) */}
            <div className="flex items-center gap-2.5 sm:gap-4 text-[11px] sm:text-xs shrink-0">
              <a 
                href="tel:+250788345678" 
                className="flex items-center gap-1.5 text-slate-300 hover:text-white font-semibold transition-colors shrink-0"
              >
                <Phone className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span>{t('topbar.helpline', 'Helpline')}: <strong className="text-white font-black">+250 788 345 678</strong></span>
              </a>
              
              <span className="text-slate-700 hidden sm:inline">|</span>
              
              <a 
                href="https://wa.me/250788345678?text=Hello%20CareMart%2C%20I%20have%20an%20inquiry%20regarding%20my%20order" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-bold transition-colors shrink-0"
              >
                <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden xs:inline">{t('topbar.whatsapp', 'WhatsApp')}</span>
              </a>
            </div>

            {/* Right: Short & Compact Translate (World Icon + Flag) & Download (Icon + "App") */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              
              {/* Translate Language Button (World Icon + Flag + Chevron) */}
              <div className="relative" ref={langDropdownRef}>
                <button
                  type="button"
                  onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-[11px] sm:text-xs transition-all active:scale-95 cursor-pointer"
                  title="Translate Language (English, Français, Kinyarwanda)"
                >
                  <Globe className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs">{currentLangObj.flag}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {langDropdownOpen && (
                  <div className="absolute right-0 top-8 w-44 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1.5 z-50 text-xs text-slate-200 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-800 mb-1">
                      {t('topbar.select_language', 'Select Language')}
                    </div>
                    {LANGUAGE_OPTIONS.map((opt) => {
                      const isSelected = language === opt.code;
                      return (
                        <button
                          key={opt.code}
                          type="button"
                          onClick={() => {
                            setLanguage(opt.code);
                            setLangDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2 text-left flex items-center justify-between transition-colors cursor-pointer ${
                            isSelected ? 'bg-red-600/20 text-red-400 font-black' : 'hover:bg-slate-800 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{opt.flag}</span>
                            <span>{opt.nativeName}</span>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-red-400 stroke-[3]" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Short Download Button: Icon + "App" */}
              <button
                type="button"
                onClick={() => setInstallModalOpen(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-black text-[11px] sm:text-xs shadow-xs hover:shadow transition-all active:scale-95 cursor-pointer"
                title="Download & Install CareMart App"
              >
                <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>App</span>
              </button>
            </div>

          </div>
        </div>

        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          
          {/* Main Header Bar Row: Left Sidebar Menu Toggle, Brand Logo & Right Quick Nav Controls */}
          <div className="flex items-center justify-between h-14 sm:h-18 gap-2">
            
            {/* Left: Sidebar Navigation Toggle Button (Pointed by User's Orange Arrow) */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="p-2 sm:px-3 sm:py-2 rounded-xl text-slate-700 hover:text-red-600 hover:bg-slate-100 border border-slate-200/80 transition-all flex items-center gap-2 font-extrabold text-xs cursor-pointer shadow-xs active:scale-95"
                title="Open Navigation Menu & Profile"
                aria-label="Open Navigation Sidebar"
              >
                <Menu className="w-5 h-5 stroke-[2.4] text-slate-800" />
                <span className="hidden sm:inline font-black uppercase tracking-wider text-[11px] text-slate-800">
                  {t('header.menu', 'Menu')}
                </span>
              </button>
            </div>

            {/* Center: Brand Logo */}
            <div className="flex justify-center flex-1">
              <button 
                onClick={() => navigateTo('home')} 
                className="flex items-center text-center focus:outline-none cursor-pointer"
                aria-label="CareMart Home"
              >
                <Logo size="md" />
              </button>
            </div>

            {/* Right: Desktop Navigation Links & Quick Profile Access */}
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              
              {/* Desktop Quick Nav Links (Visible on Laptop / Desktop screens) */}
              <div className="hidden lg:flex items-center gap-1 text-xs font-extrabold">
                <button
                  type="button"
                  onClick={() => navigateTo('shop')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    currentPage === 'shop' ? 'text-red-600 bg-red-50 font-black' : 'text-slate-700 hover:text-red-600 hover:bg-slate-50'
                  }`}
                >
                  {t('nav.shop', 'Shop')}
                </button>
                <button
                  type="button"
                  onClick={() => navigateTo('categories')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    currentPage === 'categories' ? 'text-red-600 bg-red-50 font-black' : 'text-slate-700 hover:text-red-600 hover:bg-slate-50'
                  }`}
                >
                  {t('nav.categories', 'Categories')}
                </button>
                <button
                  type="button"
                  onClick={() => navigateTo('tracking')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                    currentPage === 'tracking' ? 'text-red-600 bg-red-50 font-black' : 'text-slate-700 hover:text-red-600 hover:bg-slate-50'
                  }`}
                >
                  <Truck className="w-3.5 h-3.5 text-blue-500" />
                  <span>{t('home.track_order', 'Track Order')}</span>
                </button>
              </div>

              {/* Wishlist Button */}
              <button
                type="button"
                onClick={() => navigateTo('wishlist')}
                className="relative p-2 text-slate-700 hover:text-red-600 hover:bg-slate-50 rounded-full transition-all cursor-pointer hidden md:flex items-center justify-center"
                title={t('nav.wishlist', 'Wishlist')}
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5 stroke-[2]" />
                {wishlistCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 min-w-[16px] h-[16px] px-1 rounded-full bg-pink-600 text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                    {wishlistCount}
                  </span>
                )}
              </button>

              {/* Profile / Account Trigger Button on Desktop */}
              <button
                type="button"
                onClick={() => {
                  if (currentUser) {
                    navigateTo('profile');
                  } else {
                    navigateTo('login');
                  }
                }}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 hover:border-red-300 hover:bg-red-50/50 transition-all text-xs font-bold text-slate-700 cursor-pointer active:scale-95"
                title={currentUser ? "View Profile & Orders" : "Sign In / Register"}
              >
                <User className="w-4 h-4 text-red-600" />
                <span className="max-w-[100px] truncate">
                  {currentUser 
                    ? (userProfile?.displayName?.split(' ')[0] || 'Profile') 
                    : t('auth.login', 'Account')}
                </span>
              </button>

              {/* Cart Button */}
              <button
                onClick={onOpenCart}
                className="relative p-2 text-slate-800 hover:text-red-600 hover:bg-slate-50 rounded-full transition-all cursor-pointer"
                title={t('header.cart', 'Shopping Basket')}
                aria-label="Open Cart"
              >
                <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
                {cartItemsCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                    {cartItemsCount}
                  </span>
                )}
              </button>
            </div>
          </div>

        </div>
      </header>

      {/* Navigation Sidebar Drawer */}
      <NavigationDrawer
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenCart={onOpenCart}
      />

      {/* PWA Install Modal */}
      <PWAInstallModal 
        isOpen={installModalOpen} 
        onClose={() => setInstallModalOpen(false)} 
      />
    </>
  );
};


