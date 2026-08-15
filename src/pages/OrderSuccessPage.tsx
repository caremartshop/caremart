import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { ReceiptModal } from '../components/orders/ReceiptModal';
import { 
  CheckCircle2, 
  Truck, 
  ShieldCheck, 
  FileText,
  Download, 
  ArrowRight, 
  Copy, 
  Check, 
  Search, 
  Sparkles, 
  User, 
  Phone, 
  MapPin, 
  CreditCard, 
  ShoppingBag,
  PackageCheck
} from 'lucide-react';

export const OrderSuccessPage: React.FC = () => {
  const { orders, activeProductId, navigateTo, addToast } = useShop();
  const [copiedOrderId, setCopiedOrderId] = useState(false);
  const [copiedTrackingId, setCopiedTrackingId] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);


  // Robust order retrieval with sessionStorage caching fallback
  const cachedOrder = (() => {
    if (typeof sessionStorage !== 'undefined') {
      try {
        const raw = sessionStorage.getItem('last_caremart_order_data');
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    }
    return null;
  })();

  const targetOrderId = activeProductId || (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('last_caremart_order_id') : null);
  const order = orders.find((o) => o.id === targetOrderId) || (cachedOrder?.id === targetOrderId ? cachedOrder : null) || orders[0] || cachedOrder;

  const orderId = order?.id || targetOrderId || 'ORD-849201';
  const trackingNumber = order?.trackingNumber || 'SS-TRK-' + (orderId.replace(/[^0-9]/g, '') || '8849');
  const customerName = order?.shippingAddress?.fullName || 'Valued Customer';
  const customerPhone = order?.shippingAddress?.phone || '0788000000';
  const deliveryAddress = order ? `${order.shippingAddress.streetAddress}, ${order.shippingAddress.city}` : 'Kigali, Rwanda';

  const copyOrderId = () => {
    navigator.clipboard.writeText(orderId);
    setCopiedOrderId(true);
    addToast('Order ID Copied!', 'Order ID saved to clipboard. Use it to track your order.', 'success');
    setTimeout(() => setCopiedOrderId(false), 2500);
  };

  const copyTrackingId = () => {
    navigator.clipboard.writeText(trackingNumber);
    setCopiedTrackingId(true);
    addToast('Tracking Number Copied!', 'Tracking number saved to clipboard.', 'success');
    setTimeout(() => setCopiedTrackingId(false), 2500);
  };

  const handleOpenTrackingPlace = () => {
    // Navigate to tracking portal pre-filled with order ID
    navigateTo('tracking', { productId: orderId });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      
      {/* Top Success Hero Banner */}
      <div className="rounded-3xl bg-white border border-emerald-200 p-8 text-center space-y-3 shadow-xs relative overflow-hidden">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 border border-emerald-300 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-1">
          <div className="inline-flex items-center justify-center gap-2">
            <span className="px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
              <PackageCheck className="w-4 h-4 text-emerald-600" />
              <span>Paid & Order Placed Successfully</span>
            </span>
          </div>

          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Order Confirmed!</h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-md mx-auto">
            Your order has been paid and registered. Our express bike courier will deliver your items in 100% plain unbranded packaging.
          </p>
        </div>
      </div>

      {/* CARD 1: ORDER ID & COPY CARD WITH TRACKING LINK */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-red-950 text-white space-y-5 shadow-xl border border-red-900/40 relative overflow-hidden">
        
        {/* Decorative Ambient Radial Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-700/80 pb-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-yellow-300 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-yellow-300 fill-yellow-300" />
              <span>Official Order Tracking Credentials</span>
            </div>
            <h2 className="text-2xl font-black text-white">Order ID: {orderId}</h2>
            <p className="text-xs text-yellow-200/90 font-semibold leading-relaxed">
              Use this Order ID to track your live order progress anytime.
            </p>
          </div>

          <div className="w-full sm:w-auto bg-slate-950/90 p-4 rounded-2xl border border-yellow-500/40 flex items-center justify-between gap-4 shrink-0 shadow-inner">
            <div>
              <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Order ID</span>
              <span className="font-mono text-xl font-black text-yellow-300 tracking-wider">{orderId}</span>
            </div>

            <button
              onClick={copyOrderId}
              className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-md cursor-pointer shrink-0 active:scale-95"
            >
              {copiedOrderId ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copiedOrderId ? 'Copied Order ID!' : 'Copy Order ID'}</span>
            </button>
          </div>
        </div>

        {/* Card 1 Description & Direct Tracking Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <p className="text-xs text-slate-300 font-medium max-w-lg">
            Tap the button below to open the **Order Tracking Place**. Simply enter your Order ID (<strong className="text-yellow-300 font-mono">{orderId}</strong>) and your Phone Number (<strong className="text-yellow-300 font-mono">{customerPhone}</strong>) to check real-time courier updates.
          </p>

          <button
            onClick={handleOpenTrackingPlace}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-yellow-500 text-white text-xs font-extrabold transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer shrink-0 hover:opacity-95"
          >
            <Search className="w-4 h-4" />
            <span>Open Tracking Place</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* CARD 2: PRIMARY USER DETAILS & ORDER SUMMARY CARD */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-200 text-slate-900 space-y-6 shadow-md">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
          <div>
            <span className="text-[10px] font-black uppercase text-red-600 tracking-wider block">
              Customer & Payment Details
            </span>
            <h3 className="text-lg font-extrabold text-slate-900">Order Information & Status</h3>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-extrabold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Status: Paid & In Fulfillment</span>
          </div>
        </div>

        {/* Primary User Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
              <User className="w-4 h-4 text-red-600" />
              <span>Customer Name</span>
            </div>
            <p className="font-extrabold text-slate-900 text-sm">{customerName}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
              <Phone className="w-4 h-4 text-red-600" />
              <span>Phone Number Used</span>
            </div>
            <p className="font-mono font-extrabold text-slate-900 text-sm">{customerPhone}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
              <MapPin className="w-4 h-4 text-red-600" />
              <span>Delivery Destination</span>
            </div>
            <p className="font-extrabold text-slate-900 text-sm truncate">{deliveryAddress}</p>
          </div>

        </div>

        {/* Secondary Info: Payment & Tracking Code */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          
          <div className="p-4 rounded-2xl bg-yellow-50/60 border border-yellow-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-red-600" />
                <span>Payment Confirmation</span>
              </span>
              <span className="font-mono text-emerald-700 font-extrabold">PAID</span>
            </div>
            <p className="text-slate-600 font-medium">Method: <strong>{order?.paymentMethod || 'Mobile Money'}</strong></p>
            <p className="text-slate-600 font-medium">Grand Total: <strong className="text-red-600 font-black">{order?.total.toLocaleString() || '0'} Frw</strong></p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-red-600" />
                <span>Courier Tracking Code</span>
              </span>
              <button
                onClick={copyTrackingId}
                className="text-[10px] font-bold text-red-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copiedTrackingId ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="font-mono font-black text-slate-900 text-sm">{trackingNumber}</p>
            <p className="text-slate-500 text-[11px] font-medium">Discrete Courier: Express Motorbike Delivery</p>
          </div>

        </div>

        {/* Ordered Items List */}
        {order && order.items.length > 0 && (
          <div className="border-t border-gray-100 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-slate-900 text-xs">Ordered Items ({order.items.length})</h4>
              <button
                onClick={() => setShowReceiptModal(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 flex items-center gap-1.5 text-xs font-extrabold border border-slate-200 transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <Download className="w-3.5 h-3.5 text-red-600" />
                <span>Download PDF Receipt</span>
              </button>
            </div>

            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={item.product.id} className="flex items-center gap-3 p-2 bg-slate-50/80 rounded-xl border border-slate-100 text-xs">
                  <img src={item.product.images[0]} alt={item.product.name} className="w-10 h-10 rounded-lg object-cover bg-white border border-slate-200" />
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-slate-900 truncate">{item.product.name}</p>
                    <p className="text-slate-500 text-[11px] font-medium">Qty: {item.quantity} × {item.product.price.toLocaleString()} Frw</p>
                  </div>
                  <span className="font-extrabold text-slate-900">{(item.product.price * item.quantity).toLocaleString()} Frw</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Navigation Footer Buttons - Stays indefinitely until user taps Continue Shopping */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 pb-12">
        <button
          onClick={handleOpenTrackingPlace}
          className="w-full sm:w-auto px-8 py-4 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md inline-flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-105 active:scale-95"
        >
          <Search className="w-4 h-4 text-yellow-400" />
          <span>Go to Order Tracking Place</span>
        </button>

        <button
          onClick={() => setShowReceiptModal(true)}
          className="w-full sm:w-auto px-8 py-4 rounded-full bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-extrabold text-xs shadow-md inline-flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-105 active:scale-95"
        >
          <Download className="w-4 h-4 text-red-600" />
          <span>Download PDF Receipt</span>
        </button>

        <button
          onClick={() => navigateTo('shop')}
          className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-red-600 to-yellow-500 hover:from-red-500 hover:to-yellow-400 text-white font-extrabold text-xs shadow-lg hover:shadow-xl inline-flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-105 active:scale-95"
        >
          <ShoppingBag className="w-4 h-4 text-white" />
          <span>Continue Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Official Receipt Modal */}
      {order && (
        <ReceiptModal
          order={order}
          isOpen={showReceiptModal}
          onClose={() => setShowReceiptModal(false)}
        />
      )}

    </div>
  );
};



