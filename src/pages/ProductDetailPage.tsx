import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Heart, 
  ShoppingBag, 
  ShieldCheck, 
  Box, 
  CheckCircle2, 
  Plus, 
  Minus, 
  Maximize2, 
  Zap, 
  Share2,
  X,
  CreditCard
} from 'lucide-react';
import { ProductCard } from '../components/products/ProductCard';

export const ProductDetailPage: React.FC = () => {
  const { products, activeProductId, addToCart, toggleWishlist, isInWishlist, navigateTo, addToast } = useShop();
  const { t, translateCategory } = useLanguage();
  
  const product = products.find((p) => p.id === activeProductId) || products[0];

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [zoomOpen, setZoomOpen] = useState(false);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-500 font-medium">
        Product not found. <button onClick={() => navigateTo('shop')} className="text-red-600 font-bold underline">Return to Shop</button>
      </div>
    );
  }

  const saved = isInWishlist(product.id);

  // Suggested products from the same category first, padded with other products if needed
  const sameCategoryProducts = products.filter((p) => p.category === product.category && p.id !== product.id);
  const otherCategoryProducts = products.filter((p) => p.category !== product.category && p.id !== product.id);
  const suggestedProducts = [...sameCategoryProducts, ...otherCategoryProducts].slice(0, 4);

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigateTo('checkout');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      
      {/* Product Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
            {/* Left: Gallery & Zoom */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-3xl bg-white border border-gray-200 overflow-hidden shadow-sm group">
            {(() => {
              const currentMedia = product.images[selectedImageIndex] || product.images[0];
              const isVid = currentMedia && (currentMedia.includes('/video/upload/') || currentMedia.match(/\.(mp4|webm|mov|m3u8)(\?|$)/i) || currentMedia.startsWith('data:video/'));
              if (isVid) {
                return (
                  <video
                    src={currentMedia}
                    controls
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                );
              }
              return (
                <img
                  src={currentMedia}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              );
            })()}

            <button
              onClick={() => setZoomOpen(true)}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-white/90 text-slate-600 hover:text-slate-900 shadow-md backdrop-blur-md border border-gray-200 transition-colors"
              title="Zoom Image"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Gallery Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => {
                const isVid = img && (img.includes('/video/upload/') || img.match(/\.(mp4|webm|mov|m3u8)(\?|$)/i) || img.startsWith('data:video/'));
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${
                      selectedImageIndex === idx ? 'border-red-600 shadow-sm' : 'border-gray-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    {isVid ? (
                      <video src={img} className="w-full h-full object-cover" />
                    ) : (
                      <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                    )}
                    {isVid && (
                      <span className="absolute bottom-1 right-1 px-1 py-0.5 bg-black/70 text-white text-[9px] font-bold rounded">
                        VIDEO
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Product Meta & Purchase Panel */}
        <div className="space-y-6">
          
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-red-50 border border-red-200 text-xs font-bold text-red-600">
                {translateCategory(product.category)}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
              {product.name}
            </h1>
          </div>

          {/* Price Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-red-600">{product.price.toLocaleString()} Frw</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-slate-400 line-through font-medium">
                {product.originalPrice.toLocaleString()} Frw
              </span>
            )}
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="ml-auto text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                {t('product.save_amount', 'Save')} {(product.originalPrice - product.price).toLocaleString()} Frw
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
            {product.description}
          </p>

          {/* Quantity & CTA Buttons */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-900">{t('product.quantity', 'Quantity :')}</span>
              <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-1.5 text-slate-600 hover:text-slate-900"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-xs font-extrabold text-slate-900">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="p-1.5 text-slate-600 hover:text-slate-900"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className="text-xs text-emerald-700 font-bold ml-auto">
                ✓ {t('product.in_stock', 'In Stock')} ({product.stockCount || 100} {t('product.available', 'available')})
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => addToCart(product, quantity)}
                className="py-3.5 px-6 rounded-2xl bg-gradient-to-r from-red-600 to-amber-500 text-white font-extrabold text-xs shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{t('product.add_to_cart', 'Add to Shopping Cart')}</span>
              </button>

              <button
                onClick={handleBuyNow}
                className="py-3.5 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>{t('product.buy_now_1click', 'Buy Now with 1-Click')}</span>
              </button>
            </div>

            <button
              onClick={() => toggleWishlist(product.id)}
              className={`w-full py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                saved
                  ? 'bg-red-50 text-red-600 border-red-200'
                  : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900'
              }`}
            >
              <Heart className={`w-4 h-4 ${saved ? 'fill-red-600 text-red-600' : ''}`} />
              <span>{saved ? t('product.in_wishlist', 'In Your Private Wishlist') : t('product.add_to_wishlist', 'Add to Wishlist')}</span>
            </button>
          </div>

        </div>

      </div>

      {/* Suggested Products in Same Category */}
      {suggestedProducts.length > 0 && (
        <div className="border-t border-gray-200 pt-10 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">{t('product.suggested_title', 'Suggested Products')}</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                {t('product.more_items_in', 'More items in')} <span className="font-bold text-red-600">{translateCategory(product.category)}</span>
              </p>
            </div>
            <button
              onClick={() => navigateTo('shop')}
              className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
            >
              {t('product.view_all_products', 'View All Products')} &rarr;
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {suggestedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Zoom Modal */}
      {zoomOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <button
            onClick={() => setZoomOpen(false)}
            className="absolute top-6 right-6 p-3 text-slate-900 bg-white rounded-full shadow-lg"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={product.images[selectedImageIndex] || product.images[0]}
            alt="Zoomed Product"
            className="max-w-full max-h-[85vh] object-contain rounded-2xl bg-white border border-gray-200 p-2 shadow-2xl"
          />
        </div>
      )}

    </div>
  );
};
