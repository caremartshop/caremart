import React, { useState } from 'react';
import { Order } from '../../types';
import { downloadReceiptPDF } from '../../lib/pdfReceipt';
import { 
  X, 
  Package, 
  Truck, 
  CreditCard, 
  Calendar, 
  User, 
  Phone, 
  MapPin, 
  Download, 
  Trash2, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  ExternalLink,
  MessageCircle,
  Copy,
  Check,
  AlertCircle,
  Hash,
  Loader2
} from 'lucide-react';

interface AdminOrderDetailModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: Order['status']) => void;
  onOpenReceipt: (order: Order) => void;
  onDeleteOrder: (orderId: string) => void;
}

export const AdminOrderDetailModal: React.FC<AdminOrderDetailModalProps> = ({
  order,
  isOpen,
  onClose,
  onUpdateStatus,
  onOpenReceipt,
  onDeleteOrder
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  if (!isOpen || !order) return null;

  const isRegistered = order.userId && order.userId !== 'guest' && order.userId !== 'guest-user' && !order.isGuest;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      await downloadReceiptPDF(order);
    } catch (err) {
      console.error('PDF error:', err);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const formattedDate = order.createdAt 
    ? new Date(order.createdAt).toLocaleString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    : 'N/A';

  const cleanPhone = order.shippingAddress?.phone?.replace(/[^0-9]/g, '') || '';
  const waPhone = cleanPhone.startsWith('250') ? cleanPhone : cleanPhone.startsWith('0') ? '250' + cleanPhone.slice(1) : cleanPhone;
  const whatsappUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(`Hello ${order.shippingAddress?.fullName || 'Customer'}, this is CareMart Rwanda regarding your order #${order.id}.`)}`;

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-500/10 text-emerald-700 border-emerald-300';
      case 'Out for Delivery':
      case 'Shipped':
        return 'bg-blue-500/10 text-blue-700 border-blue-300';
      case 'Packaging':
      case 'Processing':
        return 'bg-amber-500/10 text-amber-700 border-amber-300';
      case 'Cancelled':
        return 'bg-rose-500/10 text-rose-700 border-rose-300';
      default:
        return 'bg-slate-500/10 text-slate-700 border-slate-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-5 sm:px-6 bg-slate-900 text-white flex items-center justify-between gap-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center font-bold">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">Order Details</h3>
                <span className="font-mono font-bold text-red-400 bg-red-950/80 px-2 py-0.5 rounded text-xs border border-red-800">
                  #{order.id}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>Placed on {formattedDate}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
              title="Download Official PDF Receipt"
            >
              {isGeneratingPDF ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">PDF Receipt</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-6 flex-1 bg-slate-50/50">
          
          {/* Status & Live Update Banner */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-bold text-slate-500">Current Status:</span>
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="modal-status-select" className="text-xs font-bold text-slate-600">
                Update Status:
              </label>
              <select
                id="modal-status-select"
                value={order.status}
                onChange={(e) => onUpdateStatus(order.id, e.target.value as Order['status'])}
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-black text-slate-900 focus:outline-none focus:border-red-600 cursor-pointer shadow-xs"
              >
                <option value="Processing">Processing</option>
                <option value="Packaging">Plain Packaging</option>
                <option value="Shipped">Shipped</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Customer & Shipping Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Customer Information Card */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-red-600" />
                  <span>Customer Details</span>
                </span>
                {isRegistered ? (
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-black">
                    Registered Member
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-black">
                    Guest Checkout
                  </span>
                )}
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 font-medium block text-[11px]">Full Name</span>
                  <p className="font-extrabold text-slate-900 text-sm">{order.shippingAddress?.fullName || 'Valued Customer'}</p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 font-medium block text-[11px]">Phone Number</span>
                    <p className="font-mono font-bold text-slate-900">{order.shippingAddress?.phone || 'N/A'}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {order.shippingAddress?.phone && (
                      <>
                        <a
                          href={`tel:${order.shippingAddress.phone}`}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          title="Call customer"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors flex items-center gap-1 text-[11px] font-bold"
                          title="Chat on WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      </>
                    )}
                  </div>
                </div>

                {order.shippingAddress?.email && (
                  <div>
                    <span className="text-slate-400 font-medium block text-[11px]">Email Address</span>
                    <p className="font-medium text-slate-700">{order.shippingAddress.email}</p>
                  </div>
                )}

                {isRegistered && (
                  <div>
                    <span className="text-slate-400 font-medium block text-[11px]">Account User ID</span>
                    <p className="font-mono text-[11px] text-slate-500 break-all">{order.userId}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery & Dispatch Card */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-red-600" />
                  <span>Delivery & Courier</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black">
                  Discrete Delivery
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 font-medium block text-[11px]">Delivery Address</span>
                  <p className="font-bold text-slate-900">{order.shippingAddress?.streetAddress}</p>
                  <p className="text-slate-600">{order.shippingAddress?.city}, {order.shippingAddress?.state || 'Kigali, Rwanda'}</p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-slate-400 font-medium block text-[11px]">Tracking Code</span>
                    <p className="font-mono font-bold text-slate-900">{order.trackingNumber || `SS-TRK-${order.id}`}</p>
                  </div>
                  <button
                    onClick={() => handleCopy(order.trackingNumber || `SS-TRK-${order.id}`, 'tracking')}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    title="Copy tracking code"
                  >
                    {copiedField === 'tracking' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="pt-1">
                  <span className="text-slate-400 font-medium block text-[11px]">Payment Method</span>
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <CreditCard className="w-3.5 h-3.5 text-red-600" />
                    <span>{order.paymentMethod || 'Mobile Money (MTN MoMo / Airtel)'}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Purchased Items Table */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-red-600" />
                <span>Ordered Items ({order.items?.length || 0})</span>
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {order.items?.map((item, idx) => (
                <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100&auto=format&fit=crop&q=80'}
                      alt={item.product?.name || 'Product'}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 bg-slate-50 shrink-0"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 leading-snug line-clamp-1">{item.product?.name}</h4>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {item.product?.category || 'Wellness'} • Qty: <span className="font-extrabold text-slate-800">{item.quantity}</span>
                      </p>
                      <p className="text-[11px] text-slate-600 font-mono">
                        {item.product?.price?.toLocaleString()} Frw / unit
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-black text-slate-900 text-sm">
                      {((item.product?.price || 0) * item.quantity).toLocaleString()} Frw
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Summary */}
            <div className="border-t border-slate-200 pt-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-mono font-bold">{(order.subtotal || order.total).toLocaleString()} Frw</span>
              </div>
              {order.discount ? (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Discount Applied</span>
                  <span className="font-mono">-{order.discount.toLocaleString()} Frw</span>
                </div>
              ) : null}
              <div className="flex justify-between text-slate-600">
                <span>Discreet Courier Delivery</span>
                <span className="font-mono font-bold text-emerald-600">FREE</span>
              </div>
              <div className="flex justify-between text-sm font-black text-slate-900 border-t border-slate-900 pt-2">
                <span>Total Amount</span>
                <span className="font-mono text-red-600 text-base">{order.total.toLocaleString()} Frw</span>
              </div>
            </div>
          </div>

          {/* Discrete Packaging Seal */}
          <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">100% Discrete Packaging Assurance Verified</p>
              <p className="text-[11px] text-amber-800">
                The parcel is packed in unmarked tamper-evident neutral packaging with no reference to intimate items on courier bills.
              </p>
            </div>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete order #${order.id}? This cannot be undone.`)) {
                onDeleteOrder(order.id);
                onClose();
              }
            }}
            className="px-4 py-2 rounded-xl text-red-600 hover:bg-red-50 border border-red-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Order</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onOpenReceipt(order);
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4 text-red-600" />
              <span>Preview PDF Receipt</span>
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
