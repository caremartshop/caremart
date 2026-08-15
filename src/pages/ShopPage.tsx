import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { useLanguage } from '../context/LanguageContext';
import { ProductFilters } from '../components/products/ProductFilters';
import { ProductGrid } from '../components/products/ProductGrid';
import { Filter, X } from 'lucide-react';

export const ShopPage: React.FC = () => {
  const { products, filters, setFilters, resetFilters } = useShop();
  const { t, translateCategory } = useLanguage();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter products algorithm
  const filteredProducts = products.filter((product) => {
    // Search query match
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      const matchName = product.name.toLowerCase().includes(q);
      const matchCat = product.category.toLowerCase().includes(q);
      const matchBrand = product.brand.toLowerCase().includes(q);
      const matchTag = product.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchName && !matchCat && !matchBrand && !matchTag) return false;
    }

    // Category match
    if (filters.category !== 'All' && product.category !== filters.category) {
      return false;
    }

    // Brand match
    if (filters.brand !== 'All' && product.brand !== filters.brand) {
      return false;
    }

    // Price match
    if (product.price > filters.maxPrice) {
      return false;
    }

    // Minimum rating match
    if (filters.rating > 0 && product.rating < filters.rating) {
      return false;
    }

    // In stock only match
    if (filters.inStockOnly && !product.inStock) {
      return false;
    }

    return true;
  });

  // Sort filtered products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (filters.sortBy === 'price-asc') return a.price - b.price;
    if (filters.sortBy === 'price-desc') return b.price - a.price;
    if (filters.sortBy === 'rating') return b.rating - a.rating;
    if (filters.sortBy === 'newest') return b.id.localeCompare(a.id);
    return 0; // featured default
  });

  const activeFilterCount = [
    filters.category !== 'All',
    filters.brand !== 'All',
    filters.maxPrice < 300000,
    filters.rating > 0,
    filters.inStockOnly,
    filters.searchQuery !== ''
  ].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Page Title & Mobile Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">{t('shop.page_title', 'All Discrete Products')}</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            {t('shop.page_subtitle', 'Browse body-safe health, wellness, and intimate accessories.')}
          </p>
        </div>

        <button
          onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
          className="lg:hidden inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-xs text-slate-900 font-bold shadow-xs cursor-pointer"
        >
          <Filter className="w-4 h-4 text-red-600" />
          <span>{t('shop.filters_button', 'Filters')} ({activeFilterCount})</span>
        </button>
      </div>

      {/* Active Filter Chips */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
          <span className="text-xs text-slate-500 font-medium mr-1">{t('shop.active_filters', 'Active filters:')}</span>
          {filters.category !== 'All' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
              {t('shop.category_label', 'Category')}: {translateCategory(filters.category)}
              <X className="w-3 h-3 cursor-pointer" onClick={() => setFilters((p) => ({ ...p, category: 'All' }))} />
            </span>
          )}
          {filters.brand !== 'All' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-200 text-slate-800 text-xs font-bold">
              {t('shop.brand_label', 'Brand')}: {filters.brand}
              <X className="w-3 h-3 cursor-pointer" onClick={() => setFilters((p) => ({ ...p, brand: 'All' }))} />
            </span>
          )}
          {filters.searchQuery && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
              "{filters.searchQuery}"
              <X className="w-3 h-3 cursor-pointer" onClick={() => setFilters((p) => ({ ...p, searchQuery: '' }))} />
            </span>
          )}
          <button
            onClick={resetFilters}
            className="text-xs text-slate-500 hover:text-red-600 underline ml-auto font-medium cursor-pointer"
          >
            {t('shop.clear_all', 'Clear all')}
          </button>
        </div>
      )}

      {/* Main Layout: Sidebar Filters + Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Desktop Sidebar */}
        <div className="hidden lg:block lg:col-span-1">
          <ProductFilters />
        </div>

        {/* Mobile Filter Overlay Drawer */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs p-4 overflow-y-auto lg:hidden">
            <div className="flex justify-between items-center mb-4 bg-white p-4 rounded-2xl">
              <h3 className="font-extrabold text-slate-900 text-base">{t('shop.filter_options', 'Filter Options')}</h3>
              <button onClick={() => setMobileFilterOpen(false)} className="text-slate-500 hover:text-slate-900 cursor-pointer">
                <X className="w-6 h-6" />
              </button>
            </div>
            <ProductFilters />
          </div>
        )}

        {/* Product Grid */}
        <div className="lg:col-span-3">
          <ProductGrid products={sortedProducts} />
        </div>

      </div>

    </div>
  );
};
