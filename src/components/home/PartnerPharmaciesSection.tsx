import React, { useRef } from 'react';
import { Building2, CheckCircle2, ChevronLeft, ChevronRight, Lock, HeartHandshake } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { useLanguage } from '../../context/LanguageContext';

export const PartnerPharmaciesSection: React.FC = () => {
  const { partnerPharmacies } = useShop();
  const { t } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);

  const activePartners = partnerPharmacies.filter((p) => p.isActive !== false);

  if (activePartners.length === 0) {
    return null;
  }

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 py-6">
      
      {/* Header Banner & Marketplace Model Explanation */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white border border-slate-800 space-y-6 shadow-xl relative overflow-hidden">
        
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          
          <div className="space-y-3 max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {t('pharmacy.marketplace_title', 'Certified Pharmacy & Health Marketplace')}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              {t('pharmacy.marketplace_desc', 'Regulated pharmaceutical products (such as contraceptive pills, family planning supplies, and pregnancy tests) are strictly fulfilled by our accredited, Ministry of Health-certified partner pharmacies in Rwanda. General intimate wellness items, water-based lubricants, skincare, and menstrual hygiene care are available directly.')}
            </p>

            <div className="pt-1 flex flex-wrap gap-2 text-[11px] font-bold">
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t('pharmacy.verified_partners', 'Verified Pharmacy Partners for Regulated Items')}</span>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-yellow-400" />
                <span>{t('pharmacy.general_wellness', 'General Wellness & Intimate Care Items')}</span>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('pharmacy.confidential_packaging', '100% Confidential Parcel Packaging')}</span>
              </span>
            </div>
          </div>

          {/* Right Trust Card */}
          <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3 shrink-0 lg:max-w-xs text-xs">
            <div className="flex items-center gap-2 text-yellow-400 font-extrabold">
              <HeartHandshake className="w-5 h-5" />
              <span>{t('pharmacy.trust_title', 'Compliant & Confidential Fulfillment')}</span>
            </div>
            <p className="text-slate-300 font-medium text-[11px] leading-normal">
              {t('pharmacy.trust_desc', 'When ordering regulated pharmaceuticals, CareMart connects your order to a certified partner pharmacy for authorized fulfillment. All orders are delivered in plain, unbranded discrete packaging.')}
            </p>
          </div>

        </div>

      </div>

      {/* Partner Pharmacies Slider Bar */}
      <div className="space-y-4">
        
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Building2 className="w-6 h-6 text-red-600" />
              <span>{t('pharmacy.slider_title', 'Our Certified Partner Pharmacies in Rwanda')}</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {t('pharmacy.slider_subtitle', 'Accredited health partners fulfilling pharmaceutical & family planning orders')}
            </p>
          </div>

          {/* Carousel Arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              className="p-2 rounded-full border border-gray-300 bg-white hover:bg-slate-50 text-slate-700 hover:text-red-600 transition-colors shadow-2xs cursor-pointer"
              aria-label="Scroll left partners"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-2 rounded-full border border-gray-300 bg-white hover:bg-slate-50 text-slate-700 hover:text-red-600 transition-colors shadow-2xs cursor-pointer"
              aria-label="Scroll right partners"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sliding Cards */}
        <div
          ref={scrollRef}
          className="flex items-stretch gap-4 sm:gap-6 overflow-x-auto py-2 px-1 scroll-smooth snap-x snap-mandatory no-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {activePartners.map((pharm) => (
            <div
              key={pharm.id}
              className="w-[260px] sm:w-[290px] md:w-[320px] flex-none snap-start p-5 rounded-2xl bg-white border border-gray-200 shadow-xs hover:border-red-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Pharmacy Image */}
                <div className="h-32 rounded-xl overflow-hidden relative bg-slate-100 border border-slate-200">
                  <img src={pharm.image} alt={pharm.name} className="w-full h-full object-cover" />
                  <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-md bg-slate-900/90 text-emerald-400 font-extrabold text-[10px] backdrop-blur-xs border border-slate-700">
                    {pharm.badge === 'Ministry of Health Certified' ? t('pharmacy.moh_certified', pharm.badge) : pharm.badge}
                  </span>
                </div>

                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">{pharm.name}</h4>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">{pharm.licenseNo}</p>
                  <p className="text-xs text-slate-600 font-medium mt-1">{pharm.specialty}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-slate-500 font-bold">
                <span>📍 {pharm.location}</span>
                <span className="text-emerald-700 font-black bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {t('pharmacy.certified_active', 'Certified Active')}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>

    </section>
  );
};

