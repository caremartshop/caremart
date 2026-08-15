import React from 'react';
import { useShop } from '../context/ShopContext';
import { useLanguage } from '../context/LanguageContext';
import { ArrowRight, Sparkles } from 'lucide-react';

export const CategoriesPage: React.FC = () => {
  const { categories, setFilters, navigateTo } = useShop();
  const { t, translateCategory } = useLanguage();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">{t('catpage.title', 'Explore By Health Category')}</h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
          {t('catpage.subtitle', 'From physician-approved protection and reproductive planning to premium luxury intimate care. Shipped with 100% discrete unbranded packaging.')}
        </p>
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => {
          const translatedName = translateCategory(cat.name);
          return (
            <div
              key={cat.id}
              onClick={() => {
                setFilters((prev) => ({ ...prev, category: cat.name }));
                navigateTo('shop');
              }}
              className="group relative rounded-3xl bg-white border border-gray-200 overflow-hidden cursor-pointer hover:border-red-600 hover:shadow-xl transition-all duration-300 flex flex-col shadow-xs"
            >
              {/* Category Image */}
              <div className="relative aspect-[16/9] bg-slate-100 overflow-hidden">
                <img
                  src={cat.image}
                  alt={translatedName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent" />
                
                <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-gray-200 text-xs font-bold text-slate-900 shadow-xs">
                  {cat.itemCount} {t('catpage.products_count', 'Products')}
                </span>
              </div>

              {/* Content */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-red-600 transition-colors mb-2">
                    {translatedName}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs font-bold text-red-600 group-hover:text-red-700">
                  <span>{t('catpage.browse_cat', 'Browse')} {translatedName}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
