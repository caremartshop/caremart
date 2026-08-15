import React from 'react';
import { Product } from '../../types';
import { useShop } from '../../context/ShopContext';
import { useLanguage } from '../../context/LanguageContext';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { navigateTo } = useShop();
  const { t, translateCategory } = useLanguage();

  // A product is strictly on OFFER/discount ONLY if it has a crossed price (originalPrice > price)
  const isDiscounted = Boolean(product.originalPrice && product.originalPrice > product.price);

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      onClick={() => navigateTo('product-detail', { productId: product.id })}
      className="group relative flex flex-col rounded-2xl bg-white border border-gray-200 overflow-hidden shadow-xs hover:border-red-600 hover:shadow-md transition-all duration-300 cursor-pointer h-full select-none"
    >
      {/* Product Image Container & Badges */}
      <div className="relative aspect-square bg-white p-4 overflow-hidden flex items-center justify-center border-b border-gray-100">
        {product.images[0] && (product.images[0].includes('/video/upload/') || product.images[0].match(/\.(mp4|webm|mov|m3u8)(\?|$)/i) || product.images[0].startsWith('data:video/')) ? (
          <video
            src={product.images[0]}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        )}

        {/* Badges Container (Top Right corner like reference image) */}
        <div className="absolute top-2.5 right-2.5 z-10 flex flex-col items-end gap-1">
          {isDiscounted && (
            <span className="px-2.5 py-1 bg-red-600 text-white text-[10px] sm:text-xs font-black tracking-wider uppercase shadow-xs">
              {t('badge.offer', 'OFFER')}
            </span>
          )}
          {product.isBestSeller && (
            <span className="px-2.5 py-1 bg-slate-900 text-white text-[10px] sm:text-xs font-black tracking-wider uppercase shadow-xs">
              {t('badge.best_seller', 'BEST SELLER')}
            </span>
          )}
        </div>
      </div>

      {/* Product Details: Category/Brand, Name, Description, Price */}
      <div className="p-3.5 flex flex-col flex-1 justify-between bg-white text-center sm:text-left">
        <div className="space-y-1">
          {/* Category / Tag Subtitle */}
          <p className="text-[10px] font-bold tracking-widest text-amber-700 uppercase">
            {translateCategory(product.category) || t('badge.secure_toys', 'SECURE TOYS')}
          </p>

          {/* Name */}
          <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-red-600 transition-colors line-clamp-2 leading-snug">
            {product.name}
          </h3>

          {/* Short Description */}
          <p className="text-[11px] text-slate-500 font-medium line-clamp-2 leading-relaxed pt-0.5">
            {product.description}
          </p>
        </div>

        {/* Price & Original Crossed Price */}
        <div className="mt-3 pt-2.5 border-t border-gray-100 flex flex-col items-start gap-0.5">
          <div className="flex items-baseline gap-2">
            <span className="text-base sm:text-lg font-black text-slate-900 group-hover:text-red-600 transition-colors">
              {product.price.toLocaleString()} Frw
            </span>
          </div>

          {/* Cross price occurs ONLY if discounted */}
          {isDiscounted && product.originalPrice && (
            <span className="text-xs text-slate-400 line-through font-medium">
              {product.originalPrice.toLocaleString()} Frw
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};


