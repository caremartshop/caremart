import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export const TermsPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 text-slate-600 text-xs leading-relaxed">
      
      <div className="border-b border-gray-200 pb-6 space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900">{t('terms.title', 'Terms & Conditions of Sale')}</h1>
        <p className="text-slate-400 font-medium">{t('terms.effective_date', 'Effective Date: July 2026')}</p>
      </div>

      <div className="space-y-6 bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-2">{t('terms.age_title', '1. Age Requirement')}</h3>
          <p className="font-medium text-slate-600">
            {t('terms.age_desc', 'You must be at least 18 years of age (or the legal age of majority in your jurisdiction) to purchase items from CareMart. By placing an order, you represent that you meet this age requirement.')}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-2">{t('terms.safety_title', '2. Product Intended Use & Safety')}</h3>
          <p className="font-medium text-slate-600">
            {t('terms.safety_desc', 'All intimate care and wellness items offered on CareMart are designed for adult personal care and health planning. Users are advised to review product instructions, material compositions, and lubricant compatibility before use.')}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-2">{t('terms.pricing_title', '3. Pricing & Availability')}</h3>
          <p className="font-medium text-slate-600">
            {t('terms.pricing_desc', 'Prices listed on the website are in Rwandan Francs (Frw). We reserve the right to adjust pricing, promotional discounts, or stock counts at any time prior to order confirmation.')}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-2">{t('terms.return_title', '4. Health Hygiene & Return Policy')}</h3>
          <p className="font-medium text-slate-600">
            {t('terms.return_desc', 'Due to strict health and hygiene safety standards, opened or used intimate wellness products cannot be returned. Unopened, factory-sealed products may be returned within 30 days of delivery.')}
          </p>
        </div>
      </div>

    </div>
  );
};
