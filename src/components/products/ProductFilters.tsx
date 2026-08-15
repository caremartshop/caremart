import React from 'react';
import { Filter, RotateCcw, Star, Check } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { useLanguage } from '../../context/LanguageContext';

export const ProductFilters: React.FC = () => {
  const { filters, setFilters, resetFilters, categories, products } = useShop();
  const { t, translateCategory } = useLanguage();

  const brands = Array.from(new Set(products.map((p) => p.brand))).filter(Boolean);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-6 text-xs shadow-xs">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2 font-extrabold text-sm text-slate-900">
          <Filter className="w-4 h-4 text-red-600" />
          <span>{t('shop.filters_button', 'Filters')}</span>
        </div>
        <button
          onClick={resetFilters}
          className="text-slate-500 hover:text-red-600 transition-colors flex items-center gap-1 text-[11px] font-bold cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>{t('shop.reset_all', 'Reset All')}</span>
        </button>
      </div>

      {/* Category Filter */}
      <div>
        <h4 className="font-extrabold text-slate-900 mb-2.5 uppercase tracking-wider text-[11px]">
          {t('shop.category_label', 'Category')}
        </h4>
        <div className="space-y-1">
          <button
            onClick={() => setFilters((prev) => ({ ...prev, category: 'All' }))}
            className={`w-full px-3 py-2 rounded-xl text-left transition-colors flex items-center justify-between cursor-pointer ${
              filters.category === 'All'
                ? 'bg-red-50 text-red-600 font-extrabold border border-red-200'
                : 'text-slate-700 hover:bg-slate-50 font-medium'
            }`}
          >
            <span>{t('shop.all_products', 'All Products')}</span>
            {filters.category === 'All' && <Check className="w-3.5 h-3.5 text-red-600" />}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilters((prev) => ({ ...prev, category: cat.name }))}
              className={`w-full px-3 py-2 rounded-xl text-left transition-colors flex items-center justify-between cursor-pointer ${
                filters.category === cat.name
                  ? 'bg-red-50 text-red-600 font-extrabold border border-red-200'
                  : 'text-slate-700 hover:bg-slate-50 font-medium'
              }`}
            >
              <span>{translateCategory(cat.name)}</span>
              {filters.category === cat.name && <Check className="w-3.5 h-3.5 text-red-600" />}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Slider */}
      <div className="pt-2 border-t border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px]">
            {t('shop.max_price', 'Max Price :')} {filters.maxPrice.toLocaleString()} Frw
          </h4>
        </div>
        <input
          type="range"
          min="5000"
          max="300000"
          step="5000"
          value={filters.maxPrice}
          onChange={(e) => setFilters((prev) => ({ ...prev, maxPrice: Number(e.target.value) }))}
          className="w-full accent-red-600 bg-slate-200 rounded-lg cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1">
          <span>5,000 Frw</span>
          <span>300,000 Frw</span>
        </div>
      </div>

      {/* Brand Selector */}
      <div className="pt-2 border-t border-gray-100">
        <h4 className="font-extrabold text-slate-900 mb-2.5 uppercase tracking-wider text-[11px]">
          {t('shop.brand_label', 'Brand')}
        </h4>
        <select
          value={filters.brand}
          onChange={(e) => setFilters((prev) => ({ ...prev, brand: e.target.value }))}
          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-semibold focus:outline-none focus:border-red-600 cursor-pointer"
        >
          <option value="All">{t('shop.all_brands', 'All Brands')}</option>
          {brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      {/* Minimum Rating */}
      <div className="pt-2 border-t border-gray-100">
        <h4 className="font-extrabold text-slate-900 mb-2.5 uppercase tracking-wider text-[11px]">
          {t('shop.min_rating', 'Minimum Rating')}
        </h4>
        <div className="space-y-1">
          {[4.5, 4.0, 3.5].map((starVal) => (
            <button
              key={starVal}
              onClick={() =>
                setFilters((prev) => ({ ...prev, rating: prev.rating === starVal ? 0 : starVal }))
              }
              className={`w-full px-3 py-1.5 rounded-xl text-left flex items-center justify-between transition-colors cursor-pointer ${
                filters.rating === starVal
                  ? 'bg-amber-50 text-amber-700 font-extrabold border border-amber-200'
                  : 'text-slate-600 hover:bg-slate-50 font-medium'
              }`}
            >
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{starVal} {t('shop.and_above', '& above')}</span>
              </div>
              {filters.rating === starVal && <Check className="w-3.5 h-3.5 text-amber-600" />}
            </button>
          ))}
        </div>
      </div>

      {/* In-Stock Only Toggle */}
      <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
        <span className="font-extrabold text-slate-900 text-[11px] uppercase tracking-wider">
          {t('shop.in_stock_only', 'In Stock Only')}
        </span>
        <button
          onClick={() => setFilters((prev) => ({ ...prev, inStockOnly: !prev.inStockOnly }))}
          className={`w-10 h-6 rounded-full p-1 transition-colors relative cursor-pointer ${
            filters.inStockOnly ? 'bg-red-600' : 'bg-slate-300'
          }`}
        >
          <div
            className={`w-4 h-4 rounded-full bg-white transition-transform ${
              filters.inStockOnly ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

    </div>
  );
};
