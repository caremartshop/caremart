import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Trash2, Plus, Minus, Tag, ShieldCheck, ArrowRight } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { useLanguage } from '../../context/LanguageContext';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { 
    cart, 
    updateCartQuantity, 
    removeFromCart, 
    appliedCoupon, 
    applyCoupon, 
    removeCoupon, 
    navigateTo 
  } = useShop();
  const { t } = useLanguage();
  
  const [couponCode, setCouponCode] = useState('');

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const discountAmount = appliedCoupon ? (subtotal * appliedCoupon.discountPercent) / 100 : 0;
  const shipping = 0; // 100% Free Delivery
  const total = Math.max(0, subtotal - discountAmount + shipping);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.trim()) {
      applyCoupon(couponCode);
      setCouponCode('');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute inset-y-0 right-0 max-w-md w-full bg-white border-l border-gray-200 shadow-2xl flex flex-col z-10 text-slate-900"
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-red-50 text-red-600">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">{t('cart.discrete_cart', 'Your Discrete Cart')}</h3>
                  <p className="text-xs text-slate-500 font-medium">{cart.length} {t('cart.unique_items', 'unique items')}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                  <ShoppingBag className="w-12 h-12 stroke-[1.5] mb-3 text-red-300" />
                  <p className="font-bold text-slate-800 mb-1">{t('cart.empty_title', 'Your cart is currently empty')}</p>
                  <p className="text-xs text-slate-500 max-w-xs mb-6 font-medium">
                    {t('cart.empty_desc', 'Explore our private collection of intimate wellness and body-safe personal products.')}
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      navigateTo('shop');
                    }}
                    className="px-6 py-2.5 rounded-full bg-gradient-to-r from-red-600 to-amber-500 text-white text-xs font-bold hover:opacity-95 shadow-sm"
                  >
                    {t('cart.start_shopping', 'Start Shopping')}
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200 items-center"
                  >
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 bg-white border border-slate-100"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{item.product.name}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 font-medium">{item.product.price.toLocaleString()} Frw {t('cart.each', 'each')}</p>

                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center border border-slate-200 rounded-lg bg-white">
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 text-slate-500 hover:text-slate-900"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-bold text-slate-900">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                            className="p-1 text-slate-500 hover:text-slate-900"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors ml-auto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-extrabold text-red-600">
                        {(item.product.price * item.quantity).toLocaleString()} Frw
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Footer Summary */}
            {cart.length > 0 && (
              <div className="p-5 border-t border-gray-200 bg-slate-50 space-y-4">
                
                {/* Coupon Form */}
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium">
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t('cart.coupon_label', 'Coupon')} <strong>{appliedCoupon.code}</strong> ({appliedCoupon.discountPercent}% {t('cart.off', 'off')})</span>
                    </div>
                    <button onClick={removeCoupon} className="text-xs font-bold underline hover:text-slate-900">
                      {t('cart.remove', 'Remove')}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder={t('cart.promo_placeholder', 'Promo code (e.g. DISCRETION10)')}
                      className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-600"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold"
                    >
                      {t('cart.apply', 'Apply')}
                    </button>
                  </form>
                )}

                {/* Subtotal & Totals */}
                <div className="space-y-1.5 text-xs text-slate-600 font-medium">
                  <div className="flex justify-between">
                    <span>{t('cart.subtotal_label', 'Subtotal')}</span>
                    <span className="text-slate-900 font-bold">{subtotal.toLocaleString()} Frw</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>{t('cart.discount_label', 'Discount')}</span>
                      <span>-{discountAmount.toLocaleString()} Frw</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                    <span>{t('cart.total_label', 'Total')}</span>
                    <span className="text-red-600">{total.toLocaleString()} Frw</span>
                  </div>
                </div>

                {/* Packaging assurance */}
                <div className="flex items-center gap-2 text-[11px] text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{t('cart.discretion_billing_box', 'Shipped in unbranded plain box. Card billed as "SS Global".')}</span>
                </div>

                {/* Buttons */}
                <button
                  onClick={() => {
                    onClose();
                    navigateTo('checkout');
                  }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 text-white font-extrabold text-xs shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2"
                >
                  <span>{t('cart.proceed_checkout', 'Proceed to Secure Checkout')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
