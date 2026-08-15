import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { ShoppingBag, Trash2, Plus, Minus, Tag, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';

export const CartPage: React.FC = () => {
  const { 
    cart, 
    updateCartQuantity, 
    removeFromCart, 
    appliedCoupon, 
    applyCoupon, 
    removeCoupon, 
    navigateTo 
  } = useShop();

  const [couponInput, setCouponInput] = useState('');

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const discountAmount = appliedCoupon ? (subtotal * appliedCoupon.discountPercent) / 100 : 0;
  const shipping = 0; // 100% Free Delivery
  const total = Math.max(0, subtotal - discountAmount + shipping);

  const handleCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponInput.trim()) {
      applyCoupon(couponInput);
      setCouponInput('');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="max-w-md mx-auto rounded-3xl bg-zinc-900/50 border border-zinc-800 p-12 space-y-4">
          <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">Your Shopping Cart is Empty</h2>
          <p className="text-xs text-zinc-400">
            Browse our discreet product catalog and add health & intimate care essentials to your cart.
          </p>
          <button
            onClick={() => navigateTo('shop')}
            className="px-6 py-3 rounded-full bg-gradient-to-r from-[#FF6F61] to-[#FF3D00] text-white text-xs font-bold hover:brightness-110 shadow-lg"
          >
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Shopping Cart</h1>
          <p className="text-xs text-zinc-400 mt-1">Review your items before secure discrete checkout</p>
        </div>
        <button
          onClick={() => navigateTo('shop')}
          className="text-xs font-semibold text-[#FF6F61] hover:underline flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Continue Shopping</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Cart Items Table */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div
              key={item.product.id}
              className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 flex flex-col sm:flex-row items-center gap-4 text-white"
            >
              <img
                src={item.product.images[0]}
                alt={item.product.name}
                className="w-20 h-20 rounded-xl object-cover bg-zinc-950 shrink-0"
              />

              <div className="flex-1 min-w-0 text-center sm:text-left">
                <h3 className="text-sm font-semibold text-white truncate">{item.product.name}</h3>
                <p className="text-xs text-zinc-400 mt-0.5">{item.product.price.toLocaleString()} Frw each</p>
                
                {item.product.discretePackaging && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 mt-1">
                    <ShieldCheck className="w-3 h-3" /> Plain packaging box
                  </span>
                )}
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center border border-zinc-800 rounded-xl bg-zinc-950 p-1">
                <button
                  onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                  className="p-1.5 text-zinc-400 hover:text-white"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-3 text-xs font-bold">{item.quantity}</span>
                <button
                  onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                  className="p-1.5 text-zinc-400 hover:text-white"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Item Total */}
              <div className="text-right min-w-[80px]">
                <span className="text-sm font-bold text-red-600">
                  {(item.product.price * item.quantity).toLocaleString()} Frw
                </span>
              </div>

              <button
                onClick={() => removeFromCart(item.product.id)}
                className="p-2 text-zinc-500 hover:text-rose-400 transition-colors"
                title="Remove item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Order Summary Sidebar */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800/80 space-y-6 text-white">
            <h3 className="font-bold text-base border-b border-zinc-800 pb-4">Order Summary</h3>

            {/* Coupon Code input */}
            {appliedCoupon ? (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  <span>Code <strong>{appliedCoupon.code}</strong> ({appliedCoupon.discountPercent}% OFF)</span>
                </div>
                <button onClick={removeCoupon} className="underline text-xs hover:text-white">
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleCouponSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="Promo code (e.g. DISCRETION10)"
                  className="flex-1 px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-600"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-semibold"
                >
                  Apply
                </button>
              </form>
            )}

            {/* Price Calculations */}
            <div className="space-y-2.5 text-xs text-zinc-400">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-white">{subtotal.toLocaleString()} Frw</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Discount ({appliedCoupon?.code})</span>
                  <span>-{discountAmount.toLocaleString()} Frw</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-white pt-3 border-t border-zinc-800">
                <span>Total Amount</span>
                <span className="text-xl text-red-500">{total.toLocaleString()} Frw</span>
              </div>
            </div>

            <button
              onClick={() => navigateTo('checkout')}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-amber-500 text-white font-bold text-xs shadow-xl shadow-red-600/25 hover:brightness-110 transition-all flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
