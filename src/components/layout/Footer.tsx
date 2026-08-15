import React, { useState } from 'react';
import { Logo } from '../common/Logo';
import { Heart, LayoutDashboard, Download, Smartphone } from 'lucide-react';
import { PWAInstallModal } from '../common/PWAInstallModal';
import { useShop } from '../../context/ShopContext';

export const Footer: React.FC = () => {
  const { navigateTo, setFilters } = useShop();
  const [installModalOpen, setInstallModalOpen] = useState(false);

  return (
    <>
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-300 pt-12 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Links Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 py-12">
            
            {/* Col 1: Brand */}
            <div className="lg:col-span-2 space-y-4">
              <Logo size="lg" />
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                CareMart is your premier trusted online destination for sexual wellness, intimate care, and health planning with total privacy and body-safe assurance.
              </p>

              <div className="pt-2 space-y-1.5 text-xs">
                <p className="flex items-center gap-2 text-slate-300">
                  <span className="font-bold text-red-500">Email:</span>
                  <a href="mailto:support@caremart.shop" className="hover:underline font-medium text-slate-200">
                    support@caremart.shop
                  </a>
                </p>
                <p className="flex items-center gap-2 text-slate-300">
                  <span className="font-bold text-emerald-400">Phone & WhatsApp:</span>
                  <a href="https://wa.me/250788345678" target="_blank" rel="noreferrer" className="hover:underline font-bold text-emerald-300">
                    +250 788 345 678
                  </a>
                </p>
              </div>

              {/* Install PWA Badge */}
              <div className="pt-2">
                <button
                  onClick={() => setInstallModalOpen(true)}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>Download CareMart App (PWA)</span>
                </button>
              </div>
            </div>

            {/* Col 2: Categories */}
            <div>
              <h4 className="text-sm font-bold text-white mb-4">Categories</h4>
              <ul className="space-y-2.5 text-xs">
                {[
                  'Condoms',
                  'Contraceptives',
                  'Pregnancy Tests',
                  'Sex Time Enhancers',
                  'Lubricants',
                  'Personal Care'
                ].map((cat) => (
                  <li key={cat}>
                    <button
                      onClick={() => {
                        setFilters((prev) => ({ ...prev, category: cat }));
                        navigateTo('shop');
                      }}
                      className="hover:text-red-400 transition-colors text-slate-300 cursor-pointer"
                    >
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3: Customer Care */}
            <div>
              <h4 className="text-sm font-bold text-white mb-4">Customer Care</h4>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <button onClick={() => navigateTo('faq')} className="hover:text-red-400 transition-colors text-slate-300 cursor-pointer">
                    FAQ & Shipping
                  </button>
                </li>
                <li>
                  <button onClick={() => navigateTo('contact')} className="hover:text-red-400 transition-colors text-slate-300 cursor-pointer">
                    Contact Support
                  </button>
                </li>
                <li>
                  <button onClick={() => navigateTo('privacy')} className="hover:text-red-400 transition-colors text-slate-300 cursor-pointer">
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button onClick={() => navigateTo('terms')} className="hover:text-red-400 transition-colors text-slate-300 cursor-pointer">
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button onClick={() => navigateTo('tracking')} className="hover:text-yellow-400 font-bold text-yellow-400 transition-colors cursor-pointer">
                    Track Order Code
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setInstallModalOpen(true)} 
                    className="hover:text-amber-300 text-amber-400 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download App</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 4: Privacy & Guarantees */}
            <div>
              <h4 className="text-sm font-bold text-white mb-4">Privacy Guarantee</h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                We never share your purchase details, sell email addresses, or print sensitive labels on delivery packaging.
              </p>
              <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-[11px] text-slate-300">
                <span className="font-bold text-emerald-400 block mb-1">✓ Body-Safe Materials</span>
                All products undergo rigorous silicone, phthalate, and biocompatibility verification.
              </div>
            </div>

          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <p>© 2026 CareMart. All rights reserved. Built with discretion and privacy.</p>
            <div className="flex items-center gap-1 text-slate-300">
              <span>Crafted with</span>
              <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
              <span>for personal health & intimacy</span>
            </div>
          </div>

        </div>
      </footer>

      <PWAInstallModal 
        isOpen={installModalOpen} 
        onClose={() => setInstallModalOpen(false)} 
      />
    </>
  );
};
