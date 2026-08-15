import React from 'react';
import { useShop } from '../context/ShopContext';
import { useLanguage } from '../context/LanguageContext';
import { ProductCard } from '../components/products/ProductCard';
import { Heart, ShoppingBag } from 'lucide-react';

export const WishlistPage: React.FC = () => {
  const { wishlist, products, navigateTo } = useShop();
  const { t } = useLanguage();

  const savedProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-red-600 mb-1">
            <Heart className="w-4 h-4 fill-red-600" />
            <span>{t('wishlist.confidential_tag', 'Confidential Saved Items')}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">{t('wishlist.title', 'Your Private Wishlist')}</h1>
        </div>

        <span className="text-xs text-slate-600 font-bold bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-full">
          {savedProducts.length} {t('wishlist.saved_count', 'Saved')}
        </span>
      </div>

      {savedProducts.length === 0 ? (
        <div className="rounded-3xl bg-white border border-gray-200 p-16 text-center max-w-md mx-auto my-10 space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-600 mx-auto">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-extrabold text-slate-900">{t('wishlist.empty_title', 'Your Wishlist is Empty')}</h3>
          <p className="text-xs text-slate-500 font-medium">
            {t('wishlist.empty_desc', 'Save items here for discrete viewing later or for quick future orders.')}
          </p>
          <button
            onClick={() => navigateTo('shop')}
            className="px-6 py-3 rounded-full bg-gradient-to-r from-red-600 to-amber-500 text-white text-xs font-extrabold shadow-md hover:opacity-95 cursor-pointer"
          >
            {t('wishlist.explore_catalog', 'Explore Catalog')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {savedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

    </div>
  );
};
