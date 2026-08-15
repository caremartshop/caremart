import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ReceiptModal } from '../components/orders/ReceiptModal';
import { 
  Search, 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  Copy, 
  Check, 
  Box, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  AlertCircle,
  ArrowRight,
  User,
  Sparkles,
  MessageSquare,
  FileText,
  Download
} from 'lucide-react';

export const OrderTrackingPage: React.FC = () => {
  const { orders, activeProductId, navigateTo, addToast } = useShop();
  const { currentUser, userProfile } = useAuth();
  const { t } = useLanguage();

  const [orderIdInput, setOrderIdInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [searched, setSearched] = useState(false);
  const [foundOrder, setFoundOrder] = useState<any | null>(null);
  const [copiedOrderId, setCopiedOrderId] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptOrder, setReceiptOrder] = useState<any | null>(null);


  const [searchMode, setSearchMode] = useState<'id_and_phone' | 'phone_only'>('id_and_phone');
  const [foundOrdersList, setFoundOrdersList] = useState<any[]>([]);

  // Auto pre-fill Order ID & Phone when coming from Order Success or user profile
  useEffect(() => {
    if (activeProductId) {
      setOrderIdInput(activeProductId);
      
      // Attempt auto search for active order if user or phone matches
      const matchedOrder = orders.find((o) => o.id === activeProductId || o.trackingNumber === activeProductId);
      if (matchedOrder) {
        setPhoneInput(matchedOrder.shippingAddress.phone || userProfile?.phone || '');
        setFoundOrder(matchedOrder);
        setSearched(true);
      }
    } else if (userProfile?.phone && !phoneInput) {
      setPhoneInput(userProfile.phone);
    }
  }, [activeProductId, orders, userProfile]);

  const normalizePhone = (ph: string) => {
    return ph.replace(/\D/g, '').slice(-8); // compare trailing 8 digits
  };

  const handleTrackSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanCode = orderIdInput.trim().toUpperCase();
    const cleanPhone = normalizePhone(phoneInput);

    if (!cleanCode && !cleanPhone) {
      addToast(t('track.info_required', 'Information Required'), t('track.info_required_desc', 'Please enter your Order ID or Phone Number.'), 'info');
      return;
    }

    setSearched(true);

    // Find order matching Order ID and/or Phone Number
    const match = orders.find((o) => {
      const matchesCode = cleanCode ? (
        o.id.toUpperCase() === cleanCode ||
        o.trackingNumber.toUpperCase() === cleanCode ||
        o.id.toUpperCase().includes(cleanCode) ||
        o.trackingNumber.toUpperCase().includes(cleanCode)
      ) : true;

      const orderPhoneClean = normalizePhone(o.shippingAddress?.phone || '');
      const matchesPhone = cleanPhone ? (
        orderPhoneClean.includes(cleanPhone) || cleanPhone.includes(orderPhoneClean)
      ) : true;

      return matchesCode && matchesPhone;
    });

    if (match) {
      setFoundOrder(match);
      setFoundOrdersList([match]);
      addToast(t('track.order_found', 'Order Found!'), `${t('track.status_for', 'Showing real-time status for Order ID:')} ${match.id}`, 'success');
    } else {
      // Fallback matching
      const fallbackMatches = orders.filter((o) => {
        const orderPhoneClean = normalizePhone(o.shippingAddress?.phone || '');
        const matchesCode = cleanCode ? (o.id.toUpperCase().includes(cleanCode) || o.trackingNumber.toUpperCase().includes(cleanCode)) : false;
        const matchesPhone = cleanPhone ? (orderPhoneClean.includes(cleanPhone) || cleanPhone.includes(orderPhoneClean)) : false;
        return matchesCode || matchesPhone;
      });

      if (fallbackMatches.length > 0) {
        setFoundOrder(fallbackMatches[0]);
        setFoundOrdersList(fallbackMatches);
        addToast(t('track.order_found', 'Order Found!'), `${t('track.status_for', 'Showing status for Order ID:')} ${fallbackMatches[0].id}`, 'success');
      } else {
        setFoundOrder(null);
        setFoundOrdersList([]);
        addToast(t('track.not_found', 'Order Not Found'), t('track.not_found_desc', 'No matching order found. Please check your Order ID and Phone Number.'), 'error');
      }
    }
  };

  const copyOrderIdToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedOrderId(true);
    addToast(t('track.copied_toast', 'Order ID Copied!'), t('track.copied_toast_desc', 'Order ID copied to clipboard.'), 'success');
    setTimeout(() => setCopiedOrderId(false), 2500);
  };

  // Recent account orders for quick tap if logged in
  const userRecentOrders = currentUser 
    ? orders.filter((o) => o.userId === currentUser.uid)
    : [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Title Header */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t('track.title', 'Track Your Order')}</h1>
        <p className="text-xs sm:text-sm text-slate-600 font-medium">
          {t('track.subtitle', 'Enter the Order ID and the Phone Number used when placing your order to inspect live courier dispatch status and admin delivery updates.')}
        </p>
      </div>

      {/* TRACKING PLACE FORM CARD */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-200 shadow-md max-w-2xl mx-auto space-y-6">
        
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
          <Search className="w-5 h-5 text-red-600" />
          <h2 className="font-extrabold text-slate-900 text-sm">
            {t('track.form_header_id', 'Enter Order ID & Phone Number')}
          </h2>
        </div>

        <form onSubmit={handleTrackSearch} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-extrabold text-xs mb-1">
                {t('track.order_id_label', 'Order ID / Tracking Code *')}
              </label>
              <input
                type="text"
                value={orderIdInput}
                onChange={(e) => setOrderIdInput(e.target.value)}
                placeholder="e.g. ORD-849201"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-xs font-bold focus:outline-none focus:border-red-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-extrabold text-xs mb-1">
                {t('track.phone_label', 'Phone Number Used *')}
              </label>
              <input
                type="tel"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="e.g. 0788123456"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-xs font-bold focus:outline-none focus:border-red-600 focus:bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-amber-500 text-white font-extrabold text-xs shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <Search className="w-4 h-4" />
            <span>{searchMode === 'phone_only' ? t('track.btn_find_recover', 'Find My Order ID & Track Order') : t('track.btn_track_now', 'Track Order Now')}</span>
          </button>
        </form>

        {/* Found Orders Selection Bar if user searched by Phone and has multiple */}
        {foundOrdersList.length > 1 && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
            <span className="text-xs font-black text-amber-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>{t('track.multiple_orders_found', 'We found orders associated with this phone number:')} ({foundOrdersList.length})</span>
            </span>
            <div className="flex flex-wrap gap-2">
              {foundOrdersList.map((ord) => (
                <button
                  key={ord.id}
                  onClick={() => {
                    setFoundOrder(ord);
                    setOrderIdInput(ord.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs font-black border transition-all flex items-center gap-2 cursor-pointer ${
                    foundOrder?.id === ord.id
                      ? 'bg-red-600 text-white border-red-600 shadow-xs'
                      : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span>{ord.id}</span>
                  <span className="text-[10px] font-sans opacity-80">({ord.total?.toLocaleString()} Frw)</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Account Recent Orders Quick Selector */}
        {userRecentOrders.length > 0 && (
          <div className="border-t border-gray-100 pt-4 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              {t('track.quick_tap_account', 'Quick Tap From Your Account Orders:')}
            </span>
            <div className="flex flex-wrap gap-2">
              {userRecentOrders.slice(0, 3).map((o) => (
                <button
                  key={o.id}
                  onClick={() => {
                    setOrderIdInput(o.id);
                    setPhoneInput(o.shippingAddress.phone || '');
                    setFoundOrder(o);
                    setSearched(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-700 text-xs font-mono font-bold border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Package className="w-3.5 h-3.5 text-red-600" />
                  <span>{o.id} ({o.shippingAddress.phone})</span>
                </button>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* TRACKING RESULTS DISPLAY */}
      {searched && (
        foundOrder ? (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Main Order Header Card */}
            <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-5">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">{t('track.order_id_lbl', 'Order ID:')}</span>
                    <span className="font-mono font-black text-slate-900 text-base">{foundOrder.id}</span>
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-extrabold ml-1">
                      ✓ {t('track.paid_success', 'Paid Successfully')} ({foundOrder.status})
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    {t('track.order_placed', 'Order Placed')}: {new Date(foundOrder.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                {/* Copy Order ID Widget & Print Action */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setReceiptOrder(foundOrder);
                      setShowReceiptModal(true);
                    }}
                    className="p-3 rounded-2xl bg-white border border-slate-200 hover:bg-red-50 hover:text-red-600 text-slate-700 text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                    title="Download official PDF sales receipt"
                  >
                    <Download className="w-4 h-4 text-red-600" />
                    <span className="hidden sm:inline">PDF Receipt</span>
                  </button>

                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl flex items-center gap-3">
                    <div>
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase block">{t('track.order_id_lbl', 'Order ID')}</span>
                      <span className="font-mono font-black text-red-600 text-sm">{foundOrder.id}</span>
                    </div>
                    <button
                      onClick={() => copyOrderIdToClipboard(foundOrder.id)}
                      className="p-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-extrabold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {copiedOrderId ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-red-600" />}
                      <span>{copiedOrderId ? t('track.copied', 'Copied') : t('track.copy', 'Copy')}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                  {t('track.timeline_title', 'Live Dispatch Status & Express Bike Journey')}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
                  {[
                    { label: t('track.step_paid', 'Order Paid & Confirmed'), sub: t('track.step_paid_sub', 'Payment verified'), icon: CheckCircle2, active: true },
                    { label: t('track.step_sealed', 'Closed Package Sealed'), sub: t('track.step_sealed_sub', 'Unbranded box'), icon: Box, active: true },
                    { label: t('track.step_driver', 'Express Bike Driver'), sub: t('track.step_driver_sub', 'Driver en route'), icon: Truck, active: foundOrder.status !== 'Processing' },
                    { label: t('track.step_delivered', 'Delivered'), sub: t('track.step_delivered_sub', 'Est. Same-Day Delivery'), icon: ShieldCheck, active: foundOrder.status === 'Delivered' }
                  ].map((step, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        step.active
                          ? 'bg-red-50/60 border-red-600 text-slate-900 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                      }`}
                    >
                      <step.icon className={`w-5 h-5 mx-auto mb-1 ${step.active ? 'text-red-600' : 'text-slate-400'}`} />
                      <p className="text-xs font-extrabold">{step.label}</p>
                      <p className="text-[10px] font-medium text-slate-500 mt-0.5">{step.sub}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Admin Updates & Courier Note Callout */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2 text-xs text-amber-900">
                <div className="flex items-center gap-2 font-black text-amber-950">
                  <MessageSquare className="w-4 h-4 text-amber-600" />
                  <span>{t('track.courier_update_title', 'Admin & Express Courier Dispatch Update')}</span>
                </div>
                <p className="text-amber-900 font-medium leading-relaxed">
                  {t('track.courier_msg_pre', 'Your order is currently')} <strong>{foundOrder.status === 'Processing' ? t('track.status_dispatched', 'Dispatched / On Delivery') : foundOrder.status}</strong>. {t('track.courier_msg_post', 'The driver will contact phone number')} <strong className="font-mono">{foundOrder.shippingAddress.phone}</strong> {t('track.courier_msg_end', 'upon arrival at your shipping destination.')}
                </p>
              </div>

            </div>

            {/* Order Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Left Column: Purchased Items */}
              <div className="md:col-span-2 p-6 rounded-3xl bg-white border border-gray-200 shadow-xs space-y-4">
                <h3 className="font-extrabold text-sm text-slate-900 border-b border-gray-100 pb-3">
                  {t('track.parcel_contents', 'Parcel Contents')} ({foundOrder.items.length} {t('track.items_count', 'items')})
                </h3>

                <div className="space-y-3">
                  {foundOrder.items.map((item: any) => (
                    <div key={item.product.id} className="flex items-center gap-3 text-xs p-2 bg-slate-50 rounded-xl border border-slate-100">
                      <img src={item.product.images[0]} alt={item.product.name} className="w-12 h-12 rounded-xl object-cover bg-white border border-slate-200" />
                      <div className="flex-1 min-w-0">
                        <p className="font-extrabold text-slate-900 truncate">{item.product.name}</p>
                        <p className="text-slate-500 text-[11px] font-medium">{t('track.qty', 'Qty')}: {item.quantity} × {item.product.price.toLocaleString()} Frw</p>
                      </div>
                      <span className="font-black text-slate-900">{(item.product.price * item.quantity).toLocaleString()} Frw</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-3 flex justify-between items-center text-xs text-slate-600 font-bold">
                  <span>{t('track.grand_total_paid', 'Grand Total Paid')} ({foundOrder.paymentMethod}):</span>
                  <span className="text-red-600 font-black text-base">{foundOrder.total.toLocaleString()} Frw</span>
                </div>
              </div>

              {/* Right Column: Customer Details & Shipping Address */}
              <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-xs space-y-4 text-xs">
                <h3 className="font-extrabold text-sm text-slate-900 border-b border-gray-100 pb-3">
                  {t('track.customer_shipping_info', 'Customer & Shipping Info')}
                </h3>

                <div className="space-y-3 text-slate-700 font-medium">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">{t('track.customer_name', 'Customer Name')}</span>
                    <p className="font-extrabold text-slate-900">{foundOrder.shippingAddress.fullName}</p>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">{t('track.phone_used', 'Phone Number Used')}</span>
                    <p className="font-mono font-extrabold text-slate-900">{foundOrder.shippingAddress.phone}</p>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">{t('track.delivery_destination', 'Delivery Destination')}</span>
                    <p className="font-bold text-slate-900">
                      {foundOrder.shippingAddress.streetAddress}, {foundOrder.shippingAddress.city}
                    </p>
                  </div>

                  {foundOrder.shippingAddress.deliveryInstructions && (
                    <div className="pt-2 border-t border-gray-100">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">{t('track.delivery_instructions', 'Delivery Instructions')}</span>
                      <p className="text-[11px] text-slate-600 italic">"{foundOrder.shippingAddress.deliveryInstructions}"</p>
                    </div>
                  )}
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-[11px] text-emerald-800 space-y-0.5">
                  <span className="font-bold block">✓ {t('track.confidential_delivery', '100% Confidential Delivery')}</span>
                  <p className="text-emerald-700 font-medium">{t('track.plain_box_note', 'Plain unbranded box delivered fast.')}</p>
                </div>
              </div>

            </div>

          </div>
        ) : (
          <div className="p-8 text-center rounded-3xl bg-rose-50 border border-rose-200 max-w-xl mx-auto space-y-3">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <h3 className="text-base font-extrabold text-slate-900">{t('track.not_matched_title', 'Order Credentials Not Matched')}</h3>
            <p className="text-xs text-slate-700 font-semibold">
              {t('track.not_matched_desc', "We couldn't find an order matching Order ID")} <strong className="font-mono text-slate-900">{orderIdInput}</strong> {t('track.and_phone', 'and phone number')} <strong className="font-mono text-slate-900">{phoneInput}</strong>.
            </p>
            <p className="text-[11px] text-slate-500">
              {t('track.not_matched_hint', 'Please double check the Order ID and Phone Number entered when placing the order, or try copying the exact Order ID from your confirmation receipt.')}
            </p>
          </div>
        )
      )}

      {/* Official Receipt Modal */}
      {receiptOrder && (
        <ReceiptModal
          order={receiptOrder}
          isOpen={showReceiptModal}
          onClose={() => setShowReceiptModal(false)}
        />
      )}

    </div>
  );
};

