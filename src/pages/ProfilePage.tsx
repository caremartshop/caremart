import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import { ShippingAddress, UserProfile, Order } from '../types';
import { ReceiptModal } from '../components/orders/ReceiptModal';
import { 
  User, Package, MapPin, Heart, Shield, LogOut, CheckCircle2, 
  Truck, Box, CreditCard, Save, Smartphone, ChevronRight, Clock,
  ShieldCheck, Sparkles, Navigation, Download, FileText
} from 'lucide-react';
import { MtnMomoLogo, AirtelMoneyLogo } from '../components/common/PaymentLogos';

export const ProfilePage: React.FC = () => {
  const { currentUser, userProfile, logout, updateProfileData } = useAuth();
  const { orders, wishlist, navigateTo, addToast } = useShop();

  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'addresses'>('orders');
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<Order | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);


  // Account & Profile state
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');

  // Shipping Address state
  const [streetAddress, setStreetAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [city, setCity] = useState('Kigali');
  const [state, setState] = useState('Kigali');
  const [postalCode, setPostalCode] = useState('00000');
  const [country, setCountry] = useState('Rwanda');
  const [deliveryInstructions, setDeliveryInstructions] = useState('Deliver in plain unbranded packaging.');

  // Preferred Payment Method
  const [preferredPayment, setPreferredPayment] = useState<UserProfile['preferredPaymentMethod']>('MTN MoMo (Paypack)');

  const [isSaving, setIsSaving] = useState(false);

  // Sync state with userProfile when available
  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || currentUser?.displayName || '');
      setPhone(userProfile.phone || '');
      
      const addr = userProfile.addresses?.[0];
      if (addr) {
        setStreetAddress(addr.streetAddress || '');
        setApartment(addr.apartment || '');
        setCity(addr.city || 'Kigali');
        setState(addr.state || 'Kigali');
        setPostalCode(addr.postalCode || '00000');
        setCountry(addr.country || 'Rwanda');
        setDeliveryInstructions(addr.deliveryInstructions || 'Deliver in plain unbranded packaging.');
      }
      if (userProfile.preferredPaymentMethod) {
        setPreferredPayment(userProfile.preferredPaymentMethod);
      }
    } else if (currentUser) {
      setDisplayName(currentUser.displayName || '');
    }
  }, [userProfile, currentUser]);

  // Strict user order filtering: Only orders explicitly created by this authenticated user
  const userOrders = currentUser
    ? orders.filter((o) => o.userId === currentUser.uid)
    : [];

  const handleSaveAllDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const savedAddress: ShippingAddress = {
        fullName: displayName,
        streetAddress,
        apartment,
        city,
        state,
        postalCode,
        country,
        phone,
        deliveryInstructions
      };

      await updateProfileData({
        displayName,
        phone,
        address: savedAddress,
        preferredPaymentMethod: preferredPayment
      });

      addToast('Profile & Address Saved!', 'Your location, contact & payment preferences will auto-fill at checkout.');
    } catch (err) {
      console.error('Error saving profile:', err);
      addToast('Save Failed', 'Could not save profile details.', 'info');
    } finally {
      setIsSaving(false);
    }
  };

  const orderStepIndex = (status: string) => {
    switch (status) {
      case 'Processing': return 0;
      case 'Packaging': return 1;
      case 'Shipped':
      case 'Out for Delivery': return 2;
      case 'Delivered': return 3;
      default: return 0;
    }
  };

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto text-red-600 border border-red-200 shadow-xs">
            <User className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 pt-2">Customer Account Required</h1>
          <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto">
            Sign in to access your unique personal order history, saved delivery locations, and autofill preferences.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white border border-gray-200 space-y-4 shadow-sm text-center">
          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            Every order placed with an account belongs exclusively to its user. Orders placed without an account (as a guest) do not belong to any account and can be tracked using your Order ID and Phone Number.
          </p>
          <div className="space-y-2.5 pt-2">
            <button
              onClick={() => navigateTo('auth')}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-700 hover:to-amber-600 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <User className="w-4 h-4" />
              <span>Sign In / Create Customer Account</span>
            </button>
            <button
              onClick={() => navigateTo('tracking')}
              className="w-full py-2.5 rounded-xl border border-gray-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Truck className="w-4 h-4 text-red-600" />
              <span>Track Guest Order (No Account)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Profile Card */}
      <div className="p-6 rounded-3xl bg-white border border-gray-200 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-red-600 to-amber-500 text-white text-xl font-extrabold flex items-center justify-center shadow-md shrink-0">
            {displayName ? displayName.charAt(0).toUpperCase() : (currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : 'U')}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">{displayName || 'Valued Buyer'}</h1>
            <p className="text-xs text-slate-500 font-medium">{currentUser?.email || 'Confidential Account'}</p>
            <div className="inline-flex items-center gap-1.5 text-[11px] text-emerald-700 font-bold mt-1">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified Private Account</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center md:justify-end gap-3">
          <button
            onClick={() => navigateTo('wishlist')}
            className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
          >
            <Heart className="w-4 h-4 text-red-600" />
            <span>Wishlist ({wishlist.length})</span>
          </button>

          <button
            onClick={() => logout()}
            className="px-4 py-2 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 hover:bg-rose-100 flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 text-xs font-bold gap-6 text-slate-500 overflow-x-auto">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'orders' ? 'border-red-600 text-red-600 font-extrabold' : 'border-transparent hover:text-slate-900'
          }`}
        >
          <Package className="w-4 h-4 text-red-600" />
          <span>My Orders & Live Status ({userOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'profile' ? 'border-red-600 text-red-600 font-extrabold' : 'border-transparent hover:text-slate-900'
          }`}
        >
          <User className="w-4 h-4 text-red-600" />
          <span>Personal Info & Payment Method</span>
        </button>

        <button
          onClick={() => setActiveTab('addresses')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'addresses' ? 'border-red-600 text-red-600 font-extrabold' : 'border-transparent hover:text-slate-900'
          }`}
        >
          <MapPin className="w-4 h-4 text-red-600" />
          <span>Saved Delivery Location</span>
        </button>
      </div>

      {/* Tab Content: Orders & Live Status */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {userOrders.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white border border-gray-200 space-y-3 shadow-xs">
              <Package className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-extrabold text-slate-900">No Orders Found</h3>
              <p className="text-xs text-slate-500 font-medium">When you place orders, track live status and order history here without entering any codes.</p>
              <button onClick={() => navigateTo('shop')} className="px-5 py-2.5 rounded-full bg-gradient-to-r from-red-600 to-amber-500 text-white text-xs font-extrabold shadow-sm cursor-pointer hover:opacity-95">
                Browse Products
              </button>
            </div>
          ) : (
            userOrders.map((order) => {
              const currentStep = orderStepIndex(order.status);
              const steps = ['Processing', 'Packaging', 'Out for Delivery', 'Delivered'];

              return (
                <div key={order.id} className="p-6 rounded-3xl bg-white border border-gray-200 space-y-5 text-slate-900 shadow-xs">
                  
                  {/* Top Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-base text-slate-900">Order #{order.id}</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-extrabold">
                          {order.status}
                        </span>
                      </div>
                      <span className="text-slate-500 text-[11px] font-medium block mt-0.5">
                        Placed on {new Date(order.createdAt).toLocaleDateString()} • Payment: <strong className="text-slate-800">{order.paymentMethod}</strong>
                      </span>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="font-extrabold text-red-600 text-base block">{order.total.toLocaleString()} Frw</span>
                      <span className="text-[10px] text-slate-400 font-mono font-bold">Tracking: {order.trackingNumber}</span>
                    </div>
                  </div>

                  {/* Live Order Step Tracking Progress Bar */}
                  <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
                        <Truck className="w-4 h-4 text-red-600 animate-pulse" />
                        <span>Live Delivery Status Tracker</span>
                      </span>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        Estimated: {order.estimatedDeliveryDate || 'Within 2 hours'}
                      </span>
                    </div>

                    {/* Progress Line */}
                    <div className="relative pt-2 pb-1">
                      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-slate-200">
                        <div
                          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-red-600 to-amber-500 transition-all duration-500"
                        />
                      </div>
                      <div className="grid grid-cols-4 text-[10px] sm:text-[11px] font-bold text-slate-600 text-center">
                        {steps.map((st, idx) => (
                          <div key={st} className={`flex flex-col items-center gap-1 ${idx <= currentStep ? 'text-red-600 font-black' : 'text-slate-400'}`}>
                            <div className={`w-3 h-3 rounded-full border-2 ${idx <= currentStep ? 'border-red-600 bg-red-600' : 'border-slate-300 bg-white'}`} />
                            <span>{st}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Items Summary */}
                  <div className="space-y-2 text-xs">
                    <h4 className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">Ordered Products</h4>
                    {order.items.map((it) => (
                      <div key={it.product.id} className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-100">
                        <img src={it.product.images[0]} alt={it.product.name} className="w-10 h-10 rounded-lg object-cover bg-white border border-slate-200" />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-900 truncate">{it.product.name}</p>
                          <p className="text-slate-500 text-[11px] font-medium">Qty: {it.quantity}</p>
                        </div>
                        <span className="font-extrabold text-slate-900">{(it.product.price * it.quantity).toLocaleString()} Frw</span>
                      </div>
                    ))}
                  </div>

                  {/* Actions & Receipt */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100 text-[11px]">
                    <div className="flex items-center gap-1.5 text-emerald-800 font-bold bg-emerald-50/80 px-3 py-1 rounded-xl border border-emerald-200">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Plain Unbranded Packaging Destination: {order.shippingAddress.city}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedReceiptOrder(order);
                          setShowReceiptModal(true);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-extrabold flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Download className="w-3.5 h-3.5 text-red-600" />
                        <span>PDF Receipt</span>
                      </button>

                      <button
                        onClick={() => navigateTo('order-success', { productId: order.id })}
                        className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-extrabold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <span>View Status & Animation →</span>
                      </button>
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab Content: Personal Info & Preferred Payment */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveAllDetails} className="p-8 rounded-3xl bg-white border border-gray-200 max-w-2xl space-y-6 text-xs text-slate-900 shadow-xs">
          <div>
            <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2 border-b border-gray-100 pb-3">
              <User className="w-5 h-5 text-red-600" />
              <span>Customer Personal Information</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Save your default contact details to automatically pre-fill future orders.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Full Name *</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-red-600"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Phone Number (MoMo / SMS) *</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0788000000"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-red-600"
                required
              />
            </div>
          </div>

          {/* Preferred Payment Selection */}
          <div className="space-y-3 pt-2 border-t border-gray-100">
            <label className="block text-slate-900 font-extrabold text-sm flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-red-600" />
              <span>Preferred Auto-fill Payment Method</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { key: 'MTN MoMo (Paypack)', title: 'MTN Mobile Money', LogoComponent: MtnMomoLogo },
                { key: 'Airtel Money (Paypack)', title: 'Airtel Money', LogoComponent: AirtelMoneyLogo },
                { key: 'Credit Card', title: 'Credit / Debit Card', LogoComponent: () => <CreditCard className="w-5 h-5 text-slate-600" /> },
                { key: 'Discrete Cash on Delivery', title: 'Cash on Delivery', LogoComponent: () => <Box className="w-5 h-5 text-slate-600" /> }
              ].map((m) => (
                <div
                  key={m.key}
                  onClick={() => setPreferredPayment(m.key as any)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-2 ${
                    preferredPayment === m.key
                      ? 'bg-red-50/70 border-red-600 text-slate-900 ring-1 ring-red-600'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      preferredPayment === m.key ? 'border-red-600 bg-red-600' : 'border-slate-400'
                    }`}>
                      {preferredPayment === m.key && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <span className="font-bold text-slate-900 text-xs">{m.title}</span>
                  </div>
                  <m.LogoComponent />
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 text-white font-extrabold shadow-md hover:opacity-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Profile & Preferences'}</span>
          </button>
        </form>
      )}

      {/* Tab Content: Saved Delivery Location */}
      {activeTab === 'addresses' && (
        <form onSubmit={handleSaveAllDetails} className="p-8 rounded-3xl bg-white border border-gray-200 max-w-2xl space-y-6 text-xs text-slate-900 shadow-xs">
          <div>
            <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2 border-b border-gray-100 pb-3">
              <MapPin className="w-5 h-5 text-red-600" />
              <span>Saved Discrete Delivery Location</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              This location will automatically populate during checkout to speed up your order placement.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-bold mb-1">Street Address / Landmark *</label>
              <input
                type="text"
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
                placeholder="e.g. KN 5 Rd, House 12 or Near Convention Center"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-red-600"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Apartment / Suite / Gate Code</label>
              <input
                type="text"
                value={apartment}
                onChange={(e) => setApartment(e.target.value)}
                placeholder="e.g. Apt 4B or Gate 2"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-red-600"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">City / Sector *</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Kigali, Nyarugenge"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-red-600"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">District / State *</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g. Gasabo or Kicukiro"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-red-600"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Country</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-bold cursor-not-allowed"
                disabled
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-bold mb-1">Special Delivery Note</label>
              <input
                type="text"
                value={deliveryInstructions}
                onChange={(e) => setDeliveryInstructions(e.target.value)}
                placeholder="Deliver in plain unbranded packaging."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-red-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 text-white font-extrabold shadow-md hover:opacity-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Location Details'}</span>
          </button>
        </form>
      )}

      {/* Official Receipt Modal */}
      {selectedReceiptOrder && (
        <ReceiptModal
          order={selectedReceiptOrder}
          isOpen={showReceiptModal}
          onClose={() => setShowReceiptModal(false)}
        />
      )}

    </div>
  );
};


