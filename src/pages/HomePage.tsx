import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Box, 
  ArrowRight, 
  Zap, 
  Star, 
  Lock, 
  Heart, 
  Clock, 
  Award, 
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Truck,
  Headphones,
  Flame,
  Pill,
  Droplets,
  Activity,
  Layers,
  Search
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useLanguage } from '../context/LanguageContext';
import { ProductCard } from '../components/products/ProductCard';
import { PartnerPharmaciesSection } from '../components/home/PartnerPharmaciesSection';
import { motion, AnimatePresence } from 'motion/react';
import { HeroSlide } from '../types';

export const HomePage: React.FC = () => {
  const { products, categories, navigateTo, filters, setFilters, heroSlides } = useShop();
  const { t, translateCategory } = useLanguage();

  const [searchFocused, setSearchFocused] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isSlidePaused, setIsSlidePaused] = useState(false);

  const bestSellersRef = useRef<HTMLDivElement>(null);
  const onDiscountRef = useRef<HTMLDivElement>(null);
  const topPicksRef = useRef<HTMLDivElement>(null);

  // Top search live suggestions
  const liveSearchResults = filters.searchQuery.trim()
    ? products.filter((p) => p.name.toLowerCase().includes(filters.searchQuery.toLowerCase())).slice(0, 5)
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (filters.searchQuery.trim()) {
      navigateTo('shop');
      setSearchFocused(false);
    }
  };

  // Build active hero banners using real uploaded slides from Firestore + default hero
  const defaultHeroSlides: HeroSlide[] = [
    {
      id: 'default-primary',
      badge: '100% DISCRETE & CONFIDENTIAL',
      title: 'Better Health\nBetter Life\nBetter You',
      image: '/hero-couple.jpg',
      bannerBg: 'bg-gradient-to-r from-[#991b1b] via-[#dc2626] to-[#b91c1c]',
      primaryBtnLabel: t('home.shop_now', 'Shop Now'),
      primaryBtnAction: 'shop'
    },
    {
      id: 'default-pharmacy',
      badge: 'KIGALI RAPID COURIER',
      title: 'Certified Rwandan Pharmacy & Intimate Care',
      image: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=1600&auto=format&fit=crop&q=80',
      bannerBg: 'bg-gradient-to-r from-slate-950 via-slate-900 to-red-950',
      primaryBtnLabel: t('home.browse_categories', 'Browse Categories'),
      primaryBtnAction: 'categories'
    }
  ];

  const activeHeroSlides: HeroSlide[] = heroSlides && heroSlides.length > 0 
    ? heroSlides 
    : defaultHeroSlides;

  // Auto-rotate hero banner slides
  useEffect(() => {
    if (activeHeroSlides.length <= 1 || isSlidePaused) return;

    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % activeHeroSlides.length);
    }, 5500);

    return () => clearInterval(interval);
  }, [activeHeroSlides.length, isSlidePaused]);

  // Keep index within bounds if slides array updates
  useEffect(() => {
    if (currentSlideIndex >= activeHeroSlides.length) {
      setCurrentSlideIndex(0);
    }
  }, [activeHeroSlides.length, currentSlideIndex]);

  const currentSlide = activeHeroSlides[currentSlideIndex] || activeHeroSlides[0];

  const handleHeroAction = (action?: string) => {
    switch (action) {
      case 'categories':
        navigateTo('categories');
        break;
      case 'discount':
        setFilters((prev) => ({ ...prev, category: 'All' }));
        navigateTo('shop');
        break;
      case 'profile':
        navigateTo('tracking');
        break;
      case 'shop':
      default:
        navigateTo('shop');
        break;
    }
  };

  const scrollContainer = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Top picks from real products
  const topPicksList = products.slice(0, 8);
  const bestSellersList = products.filter((p) => p.isBestSeller);
  const onDiscountList = products.filter((p) => Boolean(p.originalPrice && p.originalPrice > p.price));

  // Real store category visual cards mapping
  const categoryHighlights = [
    {
      name: 'Condoms',
      filter: 'Condoms',
      icon: (
        <div className="w-12 h-12 rounded-2xl bg-red-100/90 text-red-600 flex items-center justify-center shadow-xs">
          <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
        </div>
      ),
      bgGlow: 'hover:border-red-300'
    },
    {
      name: 'Contraceptives',
      filter: 'Contraceptives',
      icon: (
        <div className="w-12 h-12 rounded-2xl bg-amber-100/90 text-amber-600 flex items-center justify-center shadow-xs">
          <Pill className="w-6 h-6 stroke-[2.2]" />
        </div>
      ),
      bgGlow: 'hover:border-amber-300'
    },
    {
      name: 'Pregnancy Tests',
      filter: 'Pregnancy Tests',
      icon: (
        <div className="w-12 h-12 rounded-2xl bg-sky-100/90 text-sky-600 flex items-center justify-center shadow-xs">
          <Activity className="w-6 h-6 stroke-[2.2]" />
        </div>
      ),
      bgGlow: 'hover:border-sky-300'
    },
    {
      name: 'Sex Time Enhancers',
      filter: 'Sex Time Enhancers',
      icon: (
        <div className="w-12 h-12 rounded-2xl bg-orange-100/90 text-orange-600 flex items-center justify-center shadow-xs">
          <Zap className="w-6 h-6 stroke-[2.2]" />
        </div>
      ),
      bgGlow: 'hover:border-orange-300'
    },
    {
      name: 'Lubricants',
      filter: 'Lubricants',
      icon: (
        <div className="w-12 h-12 rounded-2xl bg-purple-100/90 text-purple-600 flex items-center justify-center shadow-xs">
          <Droplets className="w-6 h-6 stroke-[2.2]" />
        </div>
      ),
      bgGlow: 'hover:border-purple-300'
    },
    {
      name: 'Personal Care',
      filter: 'Personal Care',
      icon: (
        <div className="w-12 h-12 rounded-2xl bg-emerald-100/90 text-emerald-600 flex items-center justify-center shadow-xs">
          <Sparkles className="w-6 h-6 stroke-[2.2]" />
        </div>
      ),
      bgGlow: 'hover:border-emerald-300'
    }
  ];

  return (
    <div className="space-y-8 pb-16 bg-slate-50/50 text-slate-900">
      
      {/* Search Bar on Hero Page at top with NO container background and clean single search icon */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3">
        <div className="relative z-40 max-w-2xl mx-auto">
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="relative flex items-center">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <Search className="w-4 h-4 stroke-[2.2]" />
              </div>
              <input
                type="text"
                value={filters.searchQuery}
                onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 250)}
                placeholder={t('nav.search_placeholder', 'Search condoms, contraceptives, lubricants, pregnancy tests...')}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100/90 hover:bg-white focus:bg-white border border-slate-200/90 hover:border-slate-300 focus:border-red-500 rounded-full text-sm text-slate-900 placeholder-slate-400 font-medium focus:outline-none transition-all shadow-2xs"
              />
            </div>
          </form>

          {/* Live Search Suggestions Dropdown */}
          {searchFocused && liveSearchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-12 bg-white border border-gray-200 rounded-2xl shadow-xl py-2 z-50 overflow-hidden text-xs animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3.5 py-1.5 text-[10px] font-black tracking-wider text-slate-400 uppercase border-b border-gray-100">
                {t('header.suggested_products', 'Suggested Products')}
              </div>
              {liveSearchResults.map((prod) => (
                <button
                  key={prod.id}
                  type="button"
                  onClick={() => {
                    navigateTo('product-detail', { productId: prod.id });
                    setSearchFocused(false);
                  }}
                  className="w-full px-3.5 py-2.5 flex items-center gap-3 hover:bg-red-50/50 text-left transition-colors cursor-pointer"
                >
                  <img 
                    src={prod.images[0] || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200'} 
                    alt={prod.name} 
                    className="w-9 h-9 rounded-lg object-cover shrink-0 bg-slate-50 border border-slate-100" 
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{prod.name}</p>
                    <p className="text-[11px] font-extrabold text-red-600">{prod.price.toLocaleString()} Frw</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Auto-Rotating Hero Banner Carousel with Custom Banner Background Color & Text */}
      <section 
        className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8"
        onMouseEnter={() => setIsSlidePaused(true)}
        onMouseLeave={() => setIsSlidePaused(false)}
        onTouchStart={() => setIsSlidePaused(true)}
        onTouchEnd={() => setIsSlidePaused(false)}
      >
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-md border border-slate-200/80 bg-slate-100">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide.id || currentSlideIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="flex flex-col md:flex-row items-stretch overflow-hidden"
            >
              {/* Top/Left Banner Media Image */}
              <div className="relative w-full md:w-3/5 h-[230px] sm:h-[300px] md:h-[380px] bg-slate-900 shrink-0 overflow-hidden">
                <img
                  src={currentSlide.image || '/hero-couple.jpg'}
                  alt={currentSlide.title || 'CareMart Banner'}
                  className="w-full h-full object-cover object-center"
                />

                {/* Soft Gradient Overlay blend where image meets color section */}
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 via-black/20 to-transparent md:hidden pointer-events-none" />
                <div className="hidden md:block absolute inset-y-0 right-0 w-20 bg-gradient-to-r from-transparent to-black/40 pointer-events-none" />
              </div>

              {/* Bottom/Right Content Area taking the Banner's Configured Background Color & Text */}
              <div className={`w-full md:w-2/5 p-5 sm:p-7 flex flex-col justify-between text-white ${currentSlide.bannerBg || 'bg-red-600'}`}>
                <div className="space-y-2.5">
                  {/* Title / Headline */}
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight tracking-tight drop-shadow-xs">
                    {currentSlide.title}
                  </h1>

                  <p className="text-xs sm:text-sm text-white/90 font-medium leading-relaxed">
                    100% discrete packaging • Certified pharmacy wellness products • Rapid confidential courier delivery across Rwanda.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleHeroAction(currentSlide.primaryBtnAction || 'shop');
                    }}
                    className="px-5 py-2.5 rounded-full bg-white text-slate-900 font-extrabold text-xs sm:text-sm hover:bg-slate-100 transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <span>{currentSlide.primaryBtnLabel || t('home.shop_now', 'Shop Now')}</span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateTo('tracking');
                    }}
                    className="px-4 py-2.5 rounded-full bg-black/35 hover:bg-black/50 text-white font-bold text-xs sm:text-sm backdrop-blur-xs border border-white/20 transition-all shadow-xs active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <Truck className="w-3.5 h-3.5 text-amber-400" />
                    <span>{t('home.track_order', 'Track Order')}</span>
                  </button>
                </div>
              </div>

            </motion.div>
          </AnimatePresence>

          {/* Slide Navigation Controls & Indicator Dots */}
          {activeHeroSlides.length > 1 && (
            <div className="absolute bottom-4 right-4 sm:right-7 z-20 flex items-center justify-center gap-1.5 pointer-events-none">
              {activeHeroSlides.map((slide, idx) => (
                <button
                  key={slide.id || idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentSlideIndex(idx);
                  }}
                  className={`h-2 rounded-full transition-all duration-300 pointer-events-auto cursor-pointer ${
                    idx === currentSlideIndex 
                      ? 'w-7 bg-red-600 shadow-sm' 
                      : 'w-2 bg-white/80 hover:bg-white border border-black/10'
                  }`}
                  aria-label={`Jump to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}

          {/* Left / Right Arrow Chevrons on Hover */}
          {activeHeroSlides.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentSlideIndex((prev) => (prev - 1 + activeHeroSlides.length) % activeHeroSlides.length);
                }}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-xs flex items-center justify-center transition-all opacity-75 hover:opacity-100 cursor-pointer z-20 shadow-xs"
                aria-label="Previous hero slide"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentSlideIndex((prev) => (prev + 1) % activeHeroSlides.length);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-xs flex items-center justify-center transition-all opacity-75 hover:opacity-100 cursor-pointer z-20 shadow-xs"
                aria-label="Next hero slide"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

        </div>
      </section>

      {/* Shop by Category Section - Sleek Rounded Category Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
            {t('home.shop_by_category', 'Shop by Category')}
          </h2>
          <button
            onClick={() => navigateTo('categories')}
            className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>{t('home.view_all_categories', 'View All')}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Categories Grid / Horizontal Scroll on Mobile */}
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-2.5 sm:gap-3.5">
          {categoryHighlights.map((cat, idx) => (
            <motion.button
              key={idx}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                setFilters((prev) => ({ ...prev, category: cat.filter }));
                navigateTo('shop');
              }}
              className={`bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-2xs ${cat.bgGlow} flex flex-col items-center justify-center text-center transition-all duration-200 cursor-pointer group`}
            >
              {/* Category Icon */}
              <div className="mb-2 transition-transform duration-200 group-hover:scale-110">
                {cat.icon}
              </div>

              {/* Category Title */}
              <span className="text-[11px] sm:text-xs font-bold text-slate-800 group-hover:text-red-600 transition-colors line-clamp-2 leading-tight">
                {translateCategory(cat.name)}
              </span>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Top Picks for You Section - Featuring Real Products from Database */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
              {t('home.top_picks_title', 'Top Picks for You')}
            </h2>
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-black uppercase">
              <Flame className="w-3 h-3 text-red-600 fill-red-600" />
              Trending
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollContainer(topPicksRef, 'left')}
              className="p-1.5 sm:p-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-red-600 transition-colors shadow-2xs cursor-pointer"
              aria-label="Scroll left top picks"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollContainer(topPicksRef, 'right')}
              className="p-1.5 sm:p-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-red-600 transition-colors shadow-2xs cursor-pointer"
              aria-label="Scroll right top picks"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Real Products Carousel */}
        <div
          ref={topPicksRef}
          className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto py-2 px-1 scroll-smooth snap-x snap-mandatory no-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {topPicksList.map((product) => (
            <div key={product.id} className="w-[170px] sm:w-[210px] md:w-[230px] flex-none snap-start">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>

      {/* Bestsellers Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
            {t('home.bestsellers_title', 'Bestsellers')}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollContainer(bestSellersRef, 'left')}
              className="p-1.5 sm:p-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-red-600 transition-colors shadow-2xs cursor-pointer"
              aria-label="Scroll left bestsellers"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollContainer(bestSellersRef, 'right')}
              className="p-1.5 sm:p-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-red-600 transition-colors shadow-2xs cursor-pointer"
              aria-label="Scroll right bestsellers"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div
          ref={bestSellersRef}
          className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto py-2 px-1 scroll-smooth snap-x snap-mandatory no-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {bestSellersList.map((product) => (
            <div key={product.id} className="w-[170px] sm:w-[210px] md:w-[230px] flex-none snap-start">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>

      {/* On Discount Section */}
      {onDiscountList.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
                {t('home.on_discount_title', 'Special Offers & Discounts')}
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase">
                Save Big
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => scrollContainer(onDiscountRef, 'left')}
                className="p-1.5 sm:p-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-red-600 transition-colors shadow-2xs cursor-pointer"
                aria-label="Scroll left discount products"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollContainer(onDiscountRef, 'right')}
                className="p-1.5 sm:p-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-red-600 transition-colors shadow-2xs cursor-pointer"
                aria-label="Scroll right discount products"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div
            ref={onDiscountRef}
            className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto py-2 px-1 scroll-smooth snap-x snap-mandatory no-scrollbar"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {onDiscountList.map((product) => (
              <div key={product.id} className="w-[170px] sm:w-[210px] md:w-[230px] flex-none snap-start">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Trust & Confidentiality Highlights (Lock & Headphone Badges from reference image) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* Badge 1: 100% Discrete Packaging (Red Lock) */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3.5 hover:border-red-300 transition-colors">
            <div className="w-11 h-11 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
              <Lock className="w-5 h-5 stroke-[2.4]" />
            </div>
            <div>
              <h4 className="font-extrabold text-xs text-slate-900">{t('home.plain_shipping_title', '100% Discrete Packaging')}</h4>
              <p className="text-[11px] text-slate-500 font-medium">Unbranded plain brown box with zero outer markings.</p>
            </div>
          </div>

          {/* Badge 2: 24/7 Helpline & Support (Red Headset) */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3.5 hover:border-red-300 transition-colors">
            <div className="w-11 h-11 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
              <Headphones className="w-5 h-5 stroke-[2.4]" />
            </div>
            <div>
              <h4 className="font-extrabold text-xs text-slate-900">{t('home.support_title', '24/7 Support Helpline')}</h4>
              <p className="text-[11px] text-slate-500 font-medium">Confidential care at <strong className="text-slate-800 font-bold">+250 788 345 678</strong>.</p>
            </div>
          </div>

          {/* Badge 3: Fast Dispatch */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3.5 hover:border-red-300 transition-colors">
            <div className="w-11 h-11 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
              <Truck className="w-5 h-5 stroke-[2.4]" />
            </div>
            <div>
              <h4 className="font-extrabold text-xs text-slate-900">{t('home.fast_dispatch_title', 'Fast Confidential Delivery')}</h4>
              <p className="text-[11px] text-slate-500 font-medium">Express moto courier dispatch across Kigali & Rwanda.</p>
            </div>
          </div>

        </div>
      </section>

      {/* Certified Partner Pharmacies in Rwanda */}
      <PartnerPharmaciesSection />

    </div>
  );
};
