import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Order } from '../types';

/**
 * Downloads the official CareMart electronic sales and delivery receipt in PDF format.
 * First tries capturing the high-resolution DOM element, with a direct jsPDF fallback.
 */
export async function downloadReceiptPDF(order: Order, elementId?: string): Promise<void> {
  const fileName = `CareMart-Receipt-${order.id}.pdf`;

  // Strategy 1: If DOM element exists, render with html2canvas and export to jsPDF for exact WYSIWYG
  if (elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      try {
        const canvas = await html2canvas(element, {
          scale: 2, // High resolution for crisp printing
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pdfWidth - 20; // 10mm margins on each side
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Add to PDF
        pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, Math.min(imgHeight, pdfHeight - 20));
        pdf.save(fileName);
        return;
      } catch (err) {
        console.warn('html2canvas PDF generation error, falling back to direct jsPDF rendering:', err);
      }
    }
  }

  // Strategy 2: Direct Vector / Text jsPDF generation (100% reliable standalone export)
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  let y = 18;

  // Header Banner Background
  pdf.setFillColor(15, 23, 42); // slate-900
  pdf.rect(10, 10, pageWidth - 20, 26, 'F');

  // Brand Name
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.setTextColor(255, 255, 255);
  pdf.text('CareMart', 16, 22);

  pdf.setFontSize(18);
  pdf.setTextColor(220, 38, 38); // red-600
  pdf.text('Rwanda', 48, 22);

  // Subtitle
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(148, 163, 184); // slate-400
  pdf.text('Discrete Health & Wellness Fulfillment Store | tumacaremart.shop', 16, 29);

  // Receipt Label & Number
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(220, 38, 38);
  pdf.text('OFFICIAL SALES RECEIPT', pageWidth - 16, 20, { align: 'right' });

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.setTextColor(255, 255, 255);
  pdf.text(`#${order.id}`, pageWidth - 16, 28, { align: 'right' });

  y = 44;

  // Metadata Bar
  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : new Date().toLocaleString();

  pdf.setFillColor(248, 250, 252);
  pdf.setDrawColor(226, 232, 240);
  pdf.roundedRect(10, y, pageWidth - 20, 32, 3, 3, 'FD');

  // Customer Info (Left)
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(100, 116, 139);
  pdf.text('CUSTOMER & DELIVERY DETAILS', 16, y + 7);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(15, 23, 42);
  pdf.text(order.shippingAddress?.fullName || 'Valued Customer', 16, y + 14);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(51, 65, 85);
  pdf.text(`Phone: ${order.shippingAddress?.phone || 'N/A'}`, 16, y + 20);
  pdf.text(`Address: ${order.shippingAddress?.streetAddress || 'Kigali'}, ${order.shippingAddress?.city || 'Rwanda'}`, 16, y + 26);

  // Order Details (Right)
  const rightColX = pageWidth / 2 + 10;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(100, 116, 139);
  pdf.text('ORDER & COURIER DISPATCH', rightColX, y + 7);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(51, 65, 85);
  pdf.text(`Date & Time: ${orderDate}`, rightColX, y + 14);
  pdf.text(`Payment: ${order.paymentMethod || 'Mobile Money'} (Confirmed)`, rightColX, y + 20);
  pdf.text(`Tracking Code: ${order.trackingNumber || 'SS-TRK-' + order.id}`, rightColX, y + 26);

  y += 40;

  // Items Table Header
  pdf.setFillColor(241, 245, 249);
  pdf.setDrawColor(203, 213, 225);
  pdf.rect(10, y, pageWidth - 20, 8, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(30, 41, 59);
  pdf.text('Item Description', 15, y + 5.5);
  pdf.text('Qty', 115, y + 5.5, { align: 'center' });
  pdf.text('Unit Price', 145, y + 5.5, { align: 'right' });
  pdf.text('Total (Frw)', pageWidth - 15, y + 5.5, { align: 'right' });

  y += 8;

  // Items List
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);

  order.items.forEach((item) => {
    // Draw line border
    pdf.setDrawColor(241, 245, 249);
    pdf.line(10, y + 9, pageWidth - 10, y + 9);

    pdf.setTextColor(15, 23, 42);
    pdf.setFont('helvetica', 'bold');
    
    // Trim item name if too long
    const itemName = item.product.name.length > 48 
      ? item.product.name.substring(0, 45) + '...' 
      : item.product.name;
    pdf.text(itemName, 15, y + 6);

    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(51, 65, 85);
    pdf.text(String(item.quantity), 115, y + 6, { align: 'center' });
    pdf.text(`${item.product.price.toLocaleString()} Frw`, 145, y + 6, { align: 'right' });

    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(15, 23, 42);
    pdf.text(`${(item.product.price * item.quantity).toLocaleString()} Frw`, pageWidth - 15, y + 6, { align: 'right' });

    y += 10;
  });

  y += 4;

  // Discrete Packaging Notice Box (Left)
  pdf.setFillColor(254, 243, 199); // amber-100
  pdf.setDrawColor(251, 191, 36); // amber-400
  pdf.roundedRect(10, y, 95, 24, 2, 2, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(120, 53, 15);
  pdf.text('✓ 100% DISCRETE PACKAGING VERIFIED', 14, y + 7);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);
  pdf.setTextColor(146, 64, 14);
  pdf.text('Sealed in plain tamper-proof unbranded packaging.', 14, y + 13);
  pdf.text('Zero intimate labels on exterior shipping label.', 14, y + 18);

  // Financial Breakdown Box (Right)
  const totalBoxX = pageWidth - 80;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(71, 85, 105);

  pdf.text('Subtotal:', totalBoxX, y + 5);
  pdf.text(`${(order.subtotal || order.total).toLocaleString()} Frw`, pageWidth - 15, y + 5, { align: 'right' });

  if (order.discount) {
    pdf.setTextColor(16, 185, 129); // emerald-600
    pdf.text('Promo Discount:', totalBoxX, y + 10);
    pdf.text(`-${order.discount.toLocaleString()} Frw`, pageWidth - 15, y + 10, { align: 'right' });
  }

  pdf.setTextColor(71, 85, 105);
  pdf.text('Express Courier:', totalBoxX, y + 15);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(16, 185, 129);
  pdf.text('FREE', pageWidth - 15, y + 15, { align: 'right' });

  pdf.setDrawColor(15, 23, 42);
  pdf.line(totalBoxX, y + 18, pageWidth - 10, y + 18);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(15, 23, 42);
  pdf.text('Grand Total:', totalBoxX, y + 24);

  pdf.setFontSize(12);
  pdf.setTextColor(220, 38, 38);
  pdf.text(`${order.total.toLocaleString()} Frw`, pageWidth - 15, y + 24, { align: 'right' });

  // Footer
  y += 38;
  pdf.setDrawColor(226, 232, 240);
  pdf.line(10, y, pageWidth - 10, y);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(100, 116, 139);
  pdf.text('CareMart Rwanda • tumacaremart.shop • Support: +250 788 000 000', pageWidth / 2, y + 6, { align: 'center' });

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);
  pdf.setTextColor(148, 163, 184);
  pdf.text('Official computer-generated receipt. Valid without signature for tracking and warranty purposes.', pageWidth / 2, y + 10, { align: 'center' });

  pdf.save(fileName);
}
