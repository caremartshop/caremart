import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ShieldCheck } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 text-slate-600 text-xs leading-relaxed">
      
      <div className="border-b border-gray-200 pb-6 space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900">{t('privacy.title', 'Privacy Policy & Discretion Standards')}</h1>
        <p className="text-slate-400 font-medium">{t('privacy.last_updated', 'Last updated: July 2026')}</p>
      </div>

      <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2 text-slate-900 shadow-xs">
        <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-sm">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <span>{t('privacy.guarantee_title', 'Our Zero Data Sharing Guarantee')}</span>
        </div>
        <p className="text-xs text-slate-700 font-medium leading-relaxed">
          {t('privacy.guarantee_desc', 'At CareMart, your privacy is our single highest priority. We do not sell, rent, trade, or share your personal health data, purchase history, or email address with any third-party marketing companies under any circumstances.')}
        </p>
      </div>

      <div className="space-y-6 bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-2">{t('privacy.encryption_title', '1. Data Encryption & Security')}</h3>
          <p className="font-medium text-slate-600">
            {t('privacy.encryption_desc', 'All communications between your browser and our servers are encrypted using standard 256-bit SSL (Secure Sockets Layer) encryption protocol. Your credentials and order metadata are protected with industry-leading security rules.')}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-2">{t('privacy.packaging_title', '2. Discrete Shipping Packaging')}</h3>
          <p className="font-medium text-slate-600">
            {t('privacy.packaging_desc', 'Products are packaged strictly in unbranded, plain cardboard boxes or bubble mailers. The exterior shipping label contains only recipient details and a neutral return address. No product details are visible.')}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-2">{t('privacy.bank_title', '3. Bank Statement Anonymity')}</h3>
          <p className="font-medium text-slate-600">
            {t('privacy.bank_desc', 'Your bank or credit card statements will display only a neutral payment descriptor ("CM Retail" or "CM Online"). The name "CareMart" or individual item descriptions will never appear on your bank statements.')}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-2">{t('privacy.cookies_title', '4. Cookie Policy')}</h3>
          <p className="font-medium text-slate-600">
            {t('privacy.cookies_desc', 'We use functional cookies strictly to maintain your active shopping cart items, preserve your wishlist preferences, and manage authentication state.')}
          </p>
        </div>
      </div>

    </div>
  );
};
