import React from 'react';
import { ProductCard } from './ProductCard';
import { Product, FilterState } from '../../types';
import { ArrowUpDown, PackageX } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { useLanguage } from '../../context/LanguageContext';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ products, isLoading = false }) => {
  const { filters, setFilters, resetFilters } = useShop();
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-2xl bg-slate-50 border border-slate-200 p-3 sm:p-4 space-y-3 sm:space-y-4 animate-pulse">
            <div className="aspect-square bg-slate-200 rounded-xl" />
            <div className="h-4 bg-slate-200 rounded w-3/4" />
            <div className="h-4 bg-slate-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="rounded-3xl bg-slate-50 border border-slate-200 p-12 text-center flex flex-col items-center justify-center my-6">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
          <PackageX className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">{t('shop.no_products_title', 'No Products Match Your Criteria')}</h3>
        <p className="text-xs text-slate-500 max-w-sm mb-6 font-medium">
          {t('shop.no_products_desc', 'Try broadening your price limit, changing selected category, or clearing search query filters.')}
        </p>
        <button
          onClick={resetFilters}
          className="px-6 py-2.5 rounded-full bg-gradient-to-r from-red-600 to-amber-500 text-white text-xs font-bold hover:opacity-95 transition-all shadow-sm cursor-pointer"
        >
          {t('shop.reset_all_filters', 'Reset All Filters')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-gray-200 px-4 py-3 rounded-2xl shadow-xs">
        <div className="text-xs text-slate-600 font-medium">
          {t('shop.showing', 'Showing')} <span className="font-extrabold text-slate-900">{products.length}</span> {t('shop.items_count', 'items')}
        </div>

        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-3.5 h-3.5 text-red-600" />
          <span className="text-xs text-slate-600 font-semibold">{t('shop.sort_by', 'Sort by:')}</span>
          <select
            value={filters.sortBy}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                sortBy: e.target.value as FilterState['sortBy']
              }))
            }
            className="bg-slate-50 border border-slate-200 text-xs text-slate-900 font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:border-red-600 cursor-pointer"
          >
            <option value="featured">{t('shop.sort_featured', 'Featured & Recommended')}</option>
            <option value="price-asc">{t('shop.sort_price_asc', 'Price: Low to High')}</option>
            <option value="price-desc">{t('shop.sort_price_desc', 'Price: High to Low')}</option>
            <option value="rating">{t('shop.sort_rating', 'Highest Customer Rating')}</option>
            <option value="newest">{t('shop.sort_newest', 'Newest Arrivals')}</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};
