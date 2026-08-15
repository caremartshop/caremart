import React, { useState } from 'react';
import { Order } from '../../types';
import { downloadReceiptPDF } from '../../lib/pdfReceipt';
import { 
  FileText, 
  X, 
  Download, 
  ShieldCheck, 
  Package, 
  Truck, 
  CreditCard, 
  Calendar,
  User,
  Phone,
  MapPin,
  Loader2,
  CheckCircle2
} from 'lucide-react';

interface ReceiptModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ order, isOpen, onClose }) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen || !order) return null;

  const orderDate = order.createdAt 
    ? new Date(order.createdAt).toLocaleString('en-GB', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) 
    : new Date().toLocaleString();

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      await downloadReceiptPDF(order, 'printable-receipt-container');
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3500);
    } catch (error) {
      console.error('Error generating PDF receipt:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      
      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-fade-in flex flex-col max-h-[92vh]">
        
        {/* Top Header Actions Bar */}
        <div className="p-4 sm:px-6 bg-slate-900 text-white flex items-center justify-between gap-2 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Official Sales Receipt</h3>
              <p className="text-[11px] text-slate-400 font-medium">Order #{order.id} • PDF Document</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-xs font-black transition-all flex items-center gap-1.5 shadow-sm cursor-pointer active:scale-95"
            >
              {isGeneratingPDF ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Downloaded PDF!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer ml-1"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Receipt Preview */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-6 flex-1 bg-white text-slate-900" id="printable-receipt-container">
          
          {/* Invoice Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-slate-900 pb-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <img src="/icon.svg" alt="CareMart" className="w-8 h-8 rounded-lg shadow-sm" />
                <span className="text-xl font-black tracking-tight text-slate-900">
                  Care<span className="text-red-600">Mart</span>
                </span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                  Rwanda
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Discrete Health & Wellness Fulfillment Store</p>
              <p className="text-[11px] text-slate-500 font-mono">Web: tumacaremart.shop | Kigali, Rwanda</p>
            </div>

            <div className="text-left sm:text-right space-y-0.5">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400 block">Sales Receipt</span>
              <p className="text-lg font-black font-mono text-slate-900">#{order.id}</p>
              <p className="text-xs text-slate-500 font-medium flex items-center sm:justify-end gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{orderDate}</span>
              </p>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
                ✓ Payment Received
              </span>
            </div>
          </div>

          {/* Customer & Courier Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <div className="space-y-1.5">
              <span className="font-black text-slate-400 uppercase tracking-wider text-[10px] block">Customer Details</span>
              <div className="flex items-center gap-2 text-slate-800 font-bold">
                <User className="w-3.5 h-3.5 text-red-600" />
                <span>{order.shippingAddress?.fullName || 'Valued Customer'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-800 font-mono font-bold">
                <Phone className="w-3.5 h-3.5 text-red-600" />
                <span>{order.shippingAddress?.phone || 'N/A'}</span>
              </div>
              <div className="flex items-start gap-2 text-slate-700 font-medium">
                <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                <span>{order.shippingAddress?.streetAddress}, {order.shippingAddress?.city}</span>
              </div>
            </div>

            <div className="space-y-1.5 border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-4">
              <span className="font-black text-slate-400 uppercase tracking-wider text-[10px] block">Dispatch & Courier Info</span>
              <div className="flex items-center gap-2 text-slate-800 font-bold">
                <Truck className="w-3.5 h-3.5 text-red-600" />
                <span>Express Motorbike Courier</span>
              </div>
              <div className="flex items-center gap-2 text-slate-800 font-medium">
                <CreditCard className="w-3.5 h-3.5 text-red-600" />
                <span>Method: <strong>{order.paymentMethod || 'Mobile Money'}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-800 font-mono font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tracking: {order.trackingNumber || 'SS-TRK-' + order.id}</span>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 text-slate-700 font-black border-b border-slate-200">
                  <th className="p-3">Item Description</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-right">Unit Price</th>
                  <th className="p-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="p-3 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-slate-400 shrink-0 hidden sm:inline" />
                        <span className="leading-snug">{item.product.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-center font-mono font-bold text-slate-700">
                      {item.quantity}
                    </td>
                    <td className="p-3 text-right font-mono text-slate-600">
                      {item.product.price.toLocaleString()} Frw
                    </td>
                    <td className="p-3 text-right font-mono font-black text-slate-900">
                      {(item.product.price * item.quantity).toLocaleString()} Frw
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & Calculations */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2">
            
            {/* Discrete Packaging Seal */}
            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-[11px] text-amber-900 space-y-1 max-w-sm">
              <div className="flex items-center gap-1.5 font-black text-amber-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>100% Discrete Packaging Verified</span>
              </div>
              <p className="text-amber-800 leading-relaxed">
                Items packed in plain tamper-proof unbranded packaging with zero intimate labels or descriptions on the outside.
              </p>
            </div>

            {/* Financial Summary */}
            <div className="w-full sm:w-64 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-mono font-bold">{(order.subtotal || order.total).toLocaleString()} Frw</span>
              </div>
              {order.discount ? (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Promo / Discount</span>
                  <span className="font-mono">-{order.discount.toLocaleString()} Frw</span>
                </div>
              ) : null}
              <div className="flex justify-between text-slate-600">
                <span>Delivery (Express Bike)</span>
                <span className="font-mono font-bold text-emerald-600">FREE</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 border-t-2 border-slate-900 pt-2">
                <span>Grand Total</span>
                <span className="font-mono text-red-600">{order.total.toLocaleString()} Frw</span>
              </div>
            </div>

          </div>

          {/* Footer Note */}
          <div className="border-t border-slate-100 pt-4 text-center space-y-1 text-[11px] text-slate-400">
            <p className="font-bold text-slate-600">CareMart Rwanda • tumacaremart.shop • Discrete Health Partner</p>
            <p>For inquiries, WhatsApp or Call +250 788 000 000 • PDF invoice valid for courier dispatch.</p>
          </div>

        </div>

        {/* Bottom Modal Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer"
          >
            Close
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="px-8 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-700 hover:to-amber-600 text-white text-xs font-black shadow-lg shadow-red-500/20 flex items-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-60"
          >
            {isGeneratingPDF ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Exporting Official PDF...</span>
              </>
            ) : downloadSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                <span>Receipt PDF Saved!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download PDF Receipt</span>
              </>
            )}
          </button>
        </div>

      </div>

    </div>
  );
};
