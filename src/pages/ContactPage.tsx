import React, { useState } from 'react';
import { Mail, Phone, MessageSquare, Send, Box } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useLanguage } from '../context/LanguageContext';

export const ContactPage: React.FC = () => {
  const { addInquiry } = useShop();
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('Order & Discrete Shipping');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    await addInquiry({
      name,
      email,
      phone,
      subject,
      message
    });

    setName('');
    setEmail('');
    setPhone('');
    setMessage('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">{t('contact.support_title', 'Confidential Customer Support')}</h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          {t('contact.support_desc', 'Have questions regarding discrete packaging, shipping timelines, or product specifications? Our dedicated support team is available 24/7.')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Contact Info */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-gray-200 space-y-5 text-slate-900 text-xs shadow-xs">
            <h3 className="font-extrabold text-base border-b border-gray-100 pb-2 text-slate-900">{t('contact.channels_title', 'Direct Contact Channels')}</h3>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-red-50 text-red-600 shrink-0 border border-red-100">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">{t('contact.email_support', 'Encrypted Email Support')}</h4>
                <a href="mailto:support@caremart.shop" className="text-red-600 font-bold text-xs mt-0.5 hover:underline block">
                  support@caremart.shop
                </a>
                <p className="text-slate-400 text-[10px] mt-0.5">{t('contact.response_time', 'Response within 2 hours')}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 shrink-0 border border-emerald-100">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">{t('contact.phone_whatsapp', 'Phone Call & WhatsApp')}</h4>
                <a href="tel:0781111155" className="text-slate-900 font-extrabold text-xs mt-0.5 hover:text-red-600 block">
                  0781111155
                </a>
                <div className="flex items-center gap-2 mt-1.5">
                  <a
                    href="https://wa.me/250781111155"
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] flex items-center gap-1 transition-colors"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>{t('contact.whatsapp_chat', 'WhatsApp Chat')}</span>
                  </a>
                  <a
                    href="tel:0781111155"
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-900 text-slate-100 font-bold text-[10px] flex items-center gap-1 transition-colors"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{t('contact.call_now', 'Call Now')}</span>
                  </a>
                </div>
                <p className="text-slate-400 text-[10px] mt-1">{t('contact.availability_247', 'Mon-Sun: 24/7 Availability')}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-sky-50 text-sky-700 shrink-0 border border-sky-100">
                <Box className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">{t('contact.office_title', 'Discretion Office')}</h4>
                <p className="text-slate-600 font-medium text-[11px] mt-0.5">{t('contact.office_location', 'Kigali Confidential Logistics Hub')}</p>
                <p className="text-slate-400 text-[10px]">{t('contact.office_promise', 'Plain Unbranded Packaging Assured')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-2 p-8 rounded-3xl bg-white border border-gray-200 space-y-6 text-slate-900 text-xs shadow-xs">
          <h3 className="font-extrabold text-base border-b border-gray-100 pb-3 text-slate-900">{t('contact.form_title', 'Send a Confidential Inquiry')}</h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1">{t('contact.your_name', 'Your Name *')}</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('contact.name_placeholder', 'e.g. Marie Mutoni')}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-red-600"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">{t('contact.your_email', 'Your Email Address *')}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('contact.email_placeholder', 'you@domain.com')}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-red-600"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1">{t('contact.your_phone', 'Phone Number (Optional)')}</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0781111155"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">{t('contact.subject_label', 'Subject')}</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-red-600"
                >
                  <option value="Order & Discrete Shipping">{t('contact.sub_order_shipping', 'Order & Discrete Shipping')}</option>
                  <option value="Product Material Guidance">{t('contact.sub_product_guidance', 'Product Material Guidance')}</option>
                  <option value="Partner Pharmacy Inquiry">{t('contact.sub_pharmacy_inquiry', 'Partner Pharmacy Inquiry')}</option>
                  <option value="Billing & Privacy Inquiry">{t('contact.sub_billing_privacy', 'Billing & Privacy Inquiry')}</option>
                  <option value="Return or Exchange Request">{t('contact.sub_return_request', 'Return or Exchange Request')}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">{t('contact.your_message', 'Your Message *')}</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t('contact.placeholder_msg', 'How can we assist your private order...')}
                rows={5}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-red-600"
                required
              />
            </div>

            <button
              type="submit"
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 text-white font-extrabold text-xs shadow-md hover:opacity-95 flex items-center gap-2 cursor-pointer transition-all"
            >
              <span>{t('contact.send_btn', 'Send Confidential Inquiry')}</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
