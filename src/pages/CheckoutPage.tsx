import React, { useState, useEffect, useRef } from 'react';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ShippingAddress, Order } from '../types';
import { ShieldCheck, Lock, Box, CheckCircle2, ArrowRight, Smartphone, Zap, Loader2, AlertCircle, RefreshCw, Sparkles, UserCheck, Shield, Copy, Check, Info, MapPin, Truck, Phone, Package } from 'lucide-react';
import { MtnMomoLogo, AirtelMoneyLogo } from '../components/common/PaymentLogos';
import { DeliveryAnimationOverlay } from '../components/common/DeliveryAnimationOverlay';

export const CheckoutPage: React.FC = () => {
  const { cart, appliedCoupon, placeOrder, navigateTo, addToast } = useShop();
  const { currentUser, userProfile } = useAuth();
  const { t } = useLanguage();

  const [address, setAddress] = useState<ShippingAddress>({
    fullName: userProfile?.displayName || '',
    streetAddress: userProfile?.addresses?.[0]?.streetAddress || '',
    apartment: userProfile?.addresses?.[0]?.apartment || '',
    city: userProfile?.addresses?.[0]?.city || 'Kigali',
    state: userProfile?.addresses?.[0]?.state || 'Kigali',
    postalCode: userProfile?.addresses?.[0]?.postalCode || '00000',
    country: 'Rwanda',
    phone: userProfile?.phone || '0788000000',
    deliveryInstructions: 'Deliver in plain unbranded packaging.'
  });

  const [paymentMethod, setPaymentMethod] = useState<'MTN MoMo (Paypack)' | 'Airtel Money (Paypack)'>('MTN MoMo (Paypack)');
  
  // Payment Verification Modal state
  const [paymentPhone, setPaymentPhone] = useState(userProfile?.phone || '0788123456');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'initiating' | 'waiting_verification' | 'approved' | 'failed'>('idle');
  const [paymentTxRef, setPaymentTxRef] = useState<string | null>(null);
  const [paymentMessage, setPaymentMessage] = useState('');
  const pollIntervalRef = useRef<any>(null);
  const isFinalizingRef = useRef<boolean>(false);

  // Delivery animation overlay state (5-10 second sequence)
  const [showDeliveryAnimation, setShowDeliveryAnimation] = useState(false);
  const [createdOrderRef, setCreatedOrderRef] = useState<Order | null>(null);
  const [copiedOrderId, setCopiedOrderId] = useState(false);
  const [reservedOrderId, setReservedOrderId] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const discountAmount = appliedCoupon ? (subtotal * appliedCoupon.discountPercent) / 100 : 0;
  const shipping = 0; // 100% Free Delivery
  const total = Math.max(0, subtotal - discountAmount + shipping);

  const handleCopyOrderId = (idToCopy: string) => {
    navigator.clipboard.writeText(idToCopy);
    setCopiedOrderId(true);
    addToast('Order ID Copied!', `Order ID ${idToCopy} copied to clipboard.`);
    setTimeout(() => setCopiedOrderId(false), 3000);
  };

  // Autofill checkout form if user is logged in
  useEffect(() => {
    if (userProfile || currentUser) {
      const savedAddr = userProfile?.addresses?.[0];
      setAddress((prev) => ({
        ...prev,
        fullName: userProfile?.displayName || currentUser?.displayName || prev.fullName || '',
        phone: userProfile?.phone || prev.phone || '0788000000',
        streetAddress: savedAddr?.streetAddress || prev.streetAddress || 'Kigali',
        apartment: savedAddr?.apartment || prev.apartment || '',
        city: savedAddr?.city || prev.city || 'Kigali',
        state: savedAddr?.state || prev.state || 'Kigali',
        postalCode: savedAddr?.postalCode || prev.postalCode || '00000',
        country: savedAddr?.country || prev.country || 'Rwanda',
        deliveryInstructions: savedAddr?.deliveryInstructions || prev.deliveryInstructions || 'Deliver in plain unbranded packaging.'
      }));

      if (userProfile?.phone) {
        setPaymentPhone(userProfile.phone);
      }
      if (userProfile?.preferredPaymentMethod) {
        setPaymentMethod(userProfile.preferredPaymentMethod as any);
      }
    }
  }, [userProfile, currentUser]);

  // Synchronize payment phone when address phone changes
  useEffect(() => {
    if (address.phone && address.phone.trim().length >= 8) {
      setPaymentPhone(address.phone);
    }
  }, [address.phone]);

  // Clean up polling interval on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, []);

  const finalizeOrder = async (txRef?: string) => {
    // Atomic lock to guarantee single execution per checkout
    if (isFinalizingRef.current) {
      return;
    }
    isFinalizingRef.current = true;

    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }

    setIsSubmitting(true);
    try {
      const createdOrder = await placeOrder({
        userId: currentUser ? currentUser.uid : 'guest',
        isGuest: !currentUser,
        userEmail: currentUser?.email || undefined,
        items: cart,
        subtotal,
        discount: discountAmount,
        shipping,
        tax: 0,
        total,
        status: 'Processing',
        shippingAddress: address,
        paymentMethod,
        paymentRef: txRef,
        discretePackaging: true,
        couponCode: appliedCoupon?.code
      });

      setCreatedOrderRef(createdOrder);
      setReservedOrderId(createdOrder.id);
      setPaymentStatus('approved');
      setPaymentMessage('Payment confirmed & order registered by system!');
      
      // Immediately navigate to Order Success Page so it is shown directly
      setPaymentModalOpen(false);
      setShowDeliveryAnimation(false);
      navigateTo('order-success', { productId: createdOrder.id });
    } catch (err) {
      console.error('Checkout error:', err);
      isFinalizingRef.current = false;
      addToast('Order Placement Error', 'Failed to record order. Please contact support.', 'info');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Automated Paypack (MTN MoMo / Airtel) Payment Verification
  const handlePaypackPayment = async () => {
    if (isFinalizingRef.current || isSubmitting) return;

    if (!paymentPhone || paymentPhone.trim().length === 0) {
      addToast('Phone Number Required', 'Please enter your Mobile Money / Airtel phone number.', 'info');
      return;
    }

    if (Math.round(total) < 100) {
      addToast('Minimum Order Amount', 'Payment gateway requires an order amount of at least 100 Frw.', 'error');
      return;
    }

    setPaymentModalOpen(true);
    setPaymentStatus('initiating');
    setPaymentMessage('Connecting to Paypack Rwanda gateway...');

    try {
      const mode = paymentMethod.includes('MoMo') ? 'momo' : 'airtel';
      const response = await fetch('/api/paypack/cashin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: paymentPhone.trim(),
          amount: Math.round(total),
          mode
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setPaymentStatus('failed');
        setPaymentMessage(data.error || 'Failed to trigger Paypack payment push prompt.');
        return;
      }

      const txRef = data.ref;
      setPaymentTxRef(txRef);
      setPaymentStatus('waiting_verification');
      setPaymentMessage(`Payment prompt sent to ${paymentPhone}. System is automatically tracking payment confirmation...`);

      // Automatically poll backend status: system confirms payment, user CANNOT manually approve
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }

      pollIntervalRef.current = setInterval(async () => {
        try {
          if (isFinalizingRef.current) {
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
            return;
          }

          const statusRes = await fetch(`/api/paypack/status/${txRef}`);
          const statusData = await statusRes.json();

          if (statusData.success) {
            const rawStatus = (statusData.status || '').toLowerCase();
            const approvedStatuses = ['successful', 'completed', 'approved', 'paid', 'success', 'processed'];
            const failedStatuses = ['failed', 'rejected', 'expired', 'cancelled', 'declined'];

            if (approvedStatuses.includes(rawStatus)) {
              if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
                pollIntervalRef.current = null;
              }
              if (isFinalizingRef.current) return;
              setPaymentStatus('approved');
              setPaymentMessage('Payment verified automatically by system!');
              // Immediately finalize order
              await finalizeOrder(txRef);
            } else if (failedStatuses.includes(rawStatus)) {
              if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
                pollIntervalRef.current = null;
              }
              setPaymentStatus('failed');
              setPaymentMessage(statusData.message || 'Payment request was cancelled or declined on handset.');
            }
          }
        } catch (err) {
          console.warn('Paypack status poll error:', err);
        }
      }, 2000);

    } catch (err: any) {
      setPaymentStatus('failed');
      setPaymentMessage(err.message || 'Payment server network error.');
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0 || isFinalizingRef.current || isSubmitting) return;

    if (paymentMethod.includes('Paypack')) {
      await handlePaypackPayment();
    } else {
      setIsSubmitting(true);
      setPaymentModalOpen(true);
      setPaymentStatus('waiting_verification');
      setPaymentMessage('Registering order in system...');
      await finalizeOrder();
    }
  };

  if (cart.length === 0 && !createdOrderRef && !isSubmitting && !paymentModalOpen && !showDeliveryAnimation) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-500 font-medium">
        Your cart is empty. <button onClick={() => navigateTo('shop')} className="text-red-600 font-bold underline cursor-pointer">Browse Shop</button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-extrabold text-slate-900">Secure Checkout</h1>
      </div>

      {currentUser && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-amber-600 fill-amber-500 shrink-0" />
            <div>
              <p className="font-extrabold text-slate-900 text-xs">
                Welcome, {userProfile?.displayName || currentUser.email}! Details pre-filled from your account.
              </p>
              <p className="text-[11px] text-slate-600 font-medium">
                Your shipping address, phone number & payment method were automatically populated.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigateTo('profile')}
            className="px-3.5 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-900 font-bold hover:bg-amber-100 shrink-0 cursor-pointer text-[11px] shadow-2xs"
          >
            Manage Saved Profile →
          </button>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Shipping Address & Payment Selection */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Section 1: Shipping Address */}
          <div className="p-6 rounded-3xl bg-white border border-gray-200 space-y-4 text-slate-900 shadow-xs">
            <h3 className="text-base font-extrabold flex items-center gap-2 border-b border-gray-100 pb-3 text-slate-900">
              <Box className="w-5 h-5 text-red-600" />
              <span>{t('checkout.shipping_address_title', '1. Discrete Shipping Address')}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">{t('checkout.full_name', 'Full Name *')}</label>
                <input
                  type="text"
                  value={address.fullName}
                  onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                  placeholder="John Doe"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-red-600"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">{t('checkout.phone_number', 'Phone Number (For Courier SMS) *')}</label>
                <input
                  type="tel"
                  value={address.phone}
                  onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                  placeholder="0788000000"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-red-600"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">{t('checkout.street_address', 'Street Address *')}</label>
                <input
                  type="text"
                  value={address.streetAddress}
                  onChange={(e) => setAddress({ ...address, streetAddress: e.target.value })}
                  placeholder="KG 125 St, House 14"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-red-600"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">{t('checkout.apartment_landmark', 'Apartment / Landmark')}</label>
                <input
                  type="text"
                  value={address.apartment || ''}
                  onChange={(e) => setAddress({ ...address, apartment: e.target.value })}
                  placeholder="Near KCB Bank / Door 4"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">{t('checkout.city_district', 'City / District *')}</label>
                <input
                  type="text"
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  placeholder="Kigali"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-red-600"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">{t('checkout.country', 'Country')}</label>
                <input
                  type="text"
                  value={address.country}
                  disabled
                  className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-medium cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1 text-xs">{t('checkout.delivery_instructions', 'Delivery Instructions (Confidential)')}</label>
              <textarea
                value={address.deliveryInstructions || ''}
                onChange={(e) => setAddress({ ...address, deliveryInstructions: e.target.value })}
                rows={2}
                placeholder={t('checkout.delivery_instructions_ph', 'e.g., Leave package at reception in plain packaging, call on arrival.')}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium text-xs focus:outline-none focus:border-red-600"
              />
            </div>
          </div>

          {/* Section 2: Payment Method */}
          <div className="p-6 rounded-3xl bg-white border border-gray-200 space-y-4 text-slate-900 shadow-xs">
            <h3 className="text-base font-extrabold flex items-center gap-2 border-b border-gray-100 pb-3 text-slate-900">
              <Smartphone className="w-5 h-5 text-red-600" />
              <span>{t('checkout.payment_method_title', '2. Payment Method (Automated Verification)')}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {[
                { 
                  key: 'MTN MoMo (Paypack)', 
                  title: t('checkout.momo_title', 'MTN Mobile Money (MoMo)'), 
                  desc: t('checkout.momo_desc', 'Instant prompt on phone (078/079)'), 
                  LogoComponent: MtnMomoLogo 
                },
                { 
                  key: 'Airtel Money (Paypack)', 
                  title: t('checkout.airtel_title', 'Airtel Money (Rwanda)'), 
                  desc: t('checkout.airtel_desc', 'Instant prompt on phone (072/073)'), 
                  LogoComponent: AirtelMoneyLogo 
                }
              ].map((m) => (
                <div
                  key={m.key}
                  onClick={() => setPaymentMethod(m.key as any)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                    paymentMethod === m.key
                      ? 'bg-red-50/60 border-red-600 text-slate-900 shadow-xs ring-1 ring-red-600'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      paymentMethod === m.key ? 'border-red-600 bg-red-600' : 'border-slate-400'
                    }`}>
                      {paymentMethod === m.key && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                        <span>{m.title}</span>
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">{m.desc}</p>
                    </div>
                  </div>
                  <div className="shrink-0 pl-1">
                    <m.LogoComponent className="h-7 w-auto" />
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile Money Phone Input */}
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-3 text-xs mt-2">
              <div className="flex items-center gap-2 border-b border-amber-200/80 pb-2.5">
                <Smartphone className="w-4 h-4 text-amber-700" />
                <span className="font-extrabold text-slate-900 text-xs">
                  {paymentMethod.includes('MoMo') 
                    ? t('checkout.momo_phone_section_momo', 'MTN Mobile Money Phone Number') 
                    : t('checkout.momo_phone_section_airtel', 'Airtel Money Phone Number')}
                </span>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  {t('checkout.enter_momo_number', 'Enter Mobile Money Number (e.g., 0788123456 or 0731234567) *')}
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={paymentPhone}
                    onChange={(e) => setPaymentPhone(e.target.value)}
                    placeholder={paymentMethod.includes('MoMo') ? '0788000000' : '0730000000'}
                    className="w-full p-2.5 pl-3 bg-white border border-amber-300 rounded-xl text-slate-900 font-bold text-sm focus:outline-none focus:border-red-600"
                    required
                  />
                  <div className="absolute right-3 top-2.5 text-[10px] font-bold text-slate-400">
                    RWANDA (+250)
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                {t('checkout.prompt_instruction', 'When you click Pay & Place Order, the system will send a push payment prompt to your phone and track confirmation automatically through the network.')}
              </p>
            </div>
          </div>

        </div>

        {/* Right Column: Order Items Summary & Confirm */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-gray-200 space-y-6 text-slate-900 shadow-xs">
            <h3 className="font-extrabold text-base border-b border-gray-100 pb-3 text-slate-900">{t('checkout.order_items', 'Order Items')} ({cart.length})</h3>

            {/* Items list */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.product.id} className="flex items-center gap-3 text-xs">
                  <img src={item.product.images[0]} alt={item.product.name} className="w-10 h-10 rounded-lg object-cover bg-slate-50 border border-slate-200" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 truncate">{item.product.name}</p>
                    <p className="text-slate-500 text-[11px] font-medium">{t('checkout.qty', 'Qty :')} {item.quantity}</p>
                  </div>
                  <span className="font-extrabold text-slate-900">{(item.product.price * item.quantity).toLocaleString()} Frw</span>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2 text-xs text-slate-600 font-medium border-t border-gray-100 pt-4">
              <div className="flex justify-between">
                <span>{t('checkout.items_subtotal', 'Items Subtotal')}</span>
                <span className="text-slate-900 font-bold">{subtotal.toLocaleString()} Frw</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>{t('cart.discount_label', 'Discount')}</span>
                  <span>-{discountAmount.toLocaleString()} Frw</span>
                </div>
              )}
              <div className="flex justify-between text-base font-extrabold text-slate-900 pt-3 border-t border-gray-200">
                <span>{t('checkout.grand_total', 'Grand Total')}</span>
                <span className="text-red-600 text-xl">{total.toLocaleString()} Frw</span>
              </div>
            </div>

            {/* Discrete Guarantee Badge */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-700 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t('checkout.discretion_assured', '100% Discretion Assured')}</span>
              </div>
              <p className="text-slate-500 font-medium">{t('checkout.discretion_desc', 'Your order will be packaged in a plain, unbranded outer box without store branding.')}</p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 to-amber-500 text-white font-extrabold text-xs shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-98"
            >
              <Lock className="w-4 h-4" />
              <span>{isSubmitting ? t('checkout.processing_payment', 'Processing Payment...') : `${t('checkout.pay_and_place', 'Pay & Place Order')} (${total.toLocaleString()} Frw)`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </form>

      {/* Automated System Payment Tracking Modal (Stays until user clicks Okay) */}
      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-7 max-w-lg w-full text-center space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-auto max-h-[92vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-700 font-black text-xs">
                  {paymentMethod === 'PayPal' ? 'PP' : 'PAY'}
                </div>
                <div className="text-left">
                  <h3 className="font-extrabold text-sm text-slate-900">
                    {paymentMethod === 'PayPal' ? 'PayPal Gateway Confirmation' : 'Automated Payment Verification'}
                  </h3>
                  <p className="text-[10px] text-slate-500 font-medium">System-Only Automated Verification Engine</p>
                </div>
              </div>
              <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded-full text-slate-600 font-bold">
                {paymentMethod}
              </span>
            </div>

            {/* Status Body: Initiating */}
            {paymentStatus === 'initiating' && (
              <div className="py-8 space-y-4">
                <Loader2 className="w-12 h-12 text-red-600 animate-spin mx-auto" />
                <div>
                  <h4 className="font-extrabold text-slate-900 text-base">Connecting Gateway...</h4>
                  <p className="text-xs text-slate-500 font-medium mt-1">{paymentMessage}</p>
                </div>
              </div>
            )}

            {/* Status Body: System Tracking Verification (No Manual Confirmation Button) */}
            {paymentStatus === 'waiting_verification' && (
              <div className="py-4 space-y-5">
                <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-amber-400/20 animate-ping" />
                  <div className="relative w-16 h-16 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-lg">
                    {paymentMethod.includes('MoMo') || paymentMethod.includes('Airtel') ? (
                      <Smartphone className="w-8 h-8" />
                    ) : (
                      <Shield className="w-8 h-8" />
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="font-extrabold text-slate-900 text-lg">System Verifying Payment...</h4>
                  <p className="text-xs text-slate-600 font-semibold">
                    Amount: <strong className="text-red-600">{total.toLocaleString()} Frw</strong>
                  </p>
                  <p className="font-mono text-sm font-black text-slate-900 bg-slate-100 py-1.5 px-4 rounded-xl inline-block mt-1 border border-slate-200">
                    {paymentPhone}
                  </p>
                </div>

                {/* System Tracking Info Box */}
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-[11px] text-emerald-950 space-y-2 text-left shadow-xs">
                  <div className="flex items-center gap-2 font-bold text-emerald-800">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-700 shrink-0" />
                    <span>Live Gateway Feedback Active</span>
                  </div>
                  <p className="text-emerald-900 font-medium text-[11px] leading-relaxed">
                    The system is directly tracking confirmation feedback from {paymentMethod}. Once received, your order will automatically be confirmed and dispatched.
                  </p>
                </div>

                {paymentTxRef && (
                  <p className="text-[10px] font-mono text-slate-400">
                    Gateway Ref: {paymentTxRef}
                  </p>
                )}

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
                      setPaymentModalOpen(false);
                      setPaymentStatus('idle');
                    }}
                    className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel Payment
                  </button>
                </div>
              </div>
            )}

            {/* Status Body: Approved by System */}
            {paymentStatus === 'approved' && (
              <div className="py-2 space-y-4 text-left">
                
                {/* Success Header */}
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-xl tracking-tight">Payment Confirmed by System!</h4>
                    <p className="text-xs text-slate-600 font-medium mt-0.5">
                      Payment of <strong className="text-emerald-700">{total.toLocaleString()} Frw</strong> verified successfully.
                    </p>
                  </div>
                </div>

                {/* Prominent Order ID & 1-Click Copy Card */}
                {(() => {
                  const displayOrderId = createdOrderRef?.id || reservedOrderId || 'ORD-849201';
                  const displayPhone = createdOrderRef?.shippingAddress?.phone || paymentPhone || address.phone;

                  return (
                    <div className="p-4 bg-slate-900 text-white rounded-2xl border border-amber-500/40 shadow-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-black tracking-wider text-amber-400 flex items-center gap-1.5">
                          <Package className="w-3.5 h-3.5 text-amber-400" />
                          <span>Your Official Order ID</span>
                        </span>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                          Active & Confirmed
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <div>
                          <span className="font-mono text-xl sm:text-2xl font-black text-yellow-300 tracking-wider block">
                            {displayOrderId}
                          </span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium mt-0.5">
                            <Phone className="w-3 h-3 text-emerald-400" />
                            <span>Linked Phone: <strong className="text-white font-mono">{displayPhone}</strong></span>
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCopyOrderId(displayOrderId)}
                          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-700 hover:to-amber-600 active:scale-95 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all shrink-0"
                        >
                          {copiedOrderId ? (
                            <>
                              <Check className="w-4 h-4 text-emerald-300" />
                              <span>Order ID Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              <span>Copy Order ID</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Comprehensive Guide: What, Where & How to Use Your Order ID */}
                      <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/60 text-slate-200 text-xs space-y-2">
                        <div className="flex items-center gap-1.5 text-amber-300 font-bold text-[11px]">
                          <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>How, Where & What to Use Your Order ID For:</span>
                        </div>

                        <ul className="space-y-1.5 text-[11px] text-slate-300 pl-1 leading-relaxed">
                          <li className="flex items-start gap-1.5">
                            <span className="text-amber-400 font-black">•</span>
                            <span>
                              <strong className="text-white">What it is for:</strong> Your private proof of purchase and discrete verification key to track your package without exposing sensitive details.
                            </span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="text-amber-400 font-black">•</span>
                            <span>
                              <strong className="text-white">Where to track:</strong> Click <strong className="text-amber-300">"Track Order"</strong> in the top navigation bar anytime, or visit the Order Tracking page.
                            </span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="text-amber-400 font-black">•</span>
                            <span>
                              <strong className="text-white">How to track:</strong> Enter this <strong className="font-mono text-yellow-300">{displayOrderId}</strong> and your phone number <strong className="font-mono text-white">({displayPhone})</strong> to view live packaging status, express bike courier movement, and estimated arrival.
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  );
                })()}

                {/* Primary Action Buttons (Card stays permanently until user clicks Okay) */}
                <div className="space-y-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentModalOpen(false);
                      setShowDeliveryAnimation(true);
                    }}
                    className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-red-600 to-amber-500 text-white font-black text-xs sm:text-sm shadow-lg hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                    <span>Okay, Got It • Watch Express Delivery Animation</span>
                    <ArrowRight className="w-4 h-4 text-amber-200 shrink-0" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPaymentModalOpen(false);
                      const orderId = createdOrderRef?.id || reservedOrderId || 'ORD-849201';
                      navigateTo('order-success', { productId: orderId });
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-900 text-xs font-black transition-colors text-center cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Okay, Go Directly to Order Summary & Receipt →</span>
                  </button>

                  <p className="text-[10px] text-slate-400 font-medium text-center pt-1">
                    📌 This confirmation card will remain on screen until you tap an Okay button above. Take your time to copy your Order ID.
                  </p>
                </div>

              </div>
            )}

            {/* Status Body: Failed */}
            {paymentStatus === 'failed' && (
              <div className="py-4 space-y-4">
                <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
                  <AlertCircle className="w-10 h-10" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-base">Payment Not Completed</h4>
                  <p className="text-xs text-rose-600 font-medium mt-1">{paymentMessage}</p>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => {
                      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
                      setPaymentModalOpen(false);
                      setPaymentStatus('idle');
                    }}
                    className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    onClick={handlePaypackPayment}
                    className="flex-1 py-3 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Try Again</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* 5-10 Second Packaging & Bike Moving Animation Overlay */}
      {showDeliveryAnimation && createdOrderRef && (
        <DeliveryAnimationOverlay
          orderId={createdOrderRef.id}
          trackingNumber={createdOrderRef.trackingNumber}
          customerPhone={createdOrderRef.shippingAddress?.phone || paymentPhone || address.phone}
          onComplete={() => {
            setShowDeliveryAnimation(false);
            navigateTo('order-success', { productId: createdOrderRef.id });
          }}
        />
      )}

    </div>
  );
};
