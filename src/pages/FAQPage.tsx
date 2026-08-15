import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ChevronDown, HelpCircle } from 'lucide-react';

export const FAQPage: React.FC = () => {
  const { t } = useLanguage();
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: t('faq.q1', 'How will my package look when it arrives at my doorstep?'),
      a: t('faq.a1', 'All orders are shipped in standard, plain brown cardboard boxes or durable bubble mailers. There are zero store logos, product descriptions, or intimate graphics anywhere on the outer box or shipping label.')
    },
    {
      q: t('faq.q2', 'What name will appear on my credit card / bank statement?'),
      a: t('faq.a2', 'To guarantee absolute financial privacy, all credit card and bank transactions are billed silently under the neutral descriptor "CM Retail" or "CM Online".')
    },
    {
      q: t('faq.q3', 'Are your products certified 100% body-safe and non-toxic?'),
      a: t('faq.a3', 'Yes. Every item in our wellness catalog is crafted exclusively from medical-grade silicone, phthalate-free polymers, or hypoallergenic organic aloe formulations tested under strict quality standards.')
    },
    {
      q: t('faq.q4', 'How fast is discrete order dispatch?'),
      a: t('faq.a4', 'Orders placed before 2:00 PM EST Monday through Friday are packaged and handed to the postal courier on the very same day. Standard discrete delivery takes 30-90 minutes in Kigali.')
    },
    {
      q: t('faq.q5', 'What is your return policy for unopened items?'),
      a: t('faq.a5', 'Due to personal health and hygiene safety regulations, opened intimate items cannot be returned. However, any unopened, factory-sealed item can be returned within 30 days for a full refund using our plain return label.')
    },
    {
      q: t('faq.q6', 'Can I track my shipment without disclosing contents?'),
      a: t('faq.a6', 'Yes. You will receive a confidential tracking link via email or in your account dashboard. Tracking updates show standard postal checkpoints without item details.')
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 border border-red-200 text-xs font-bold">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>{t('faq.tag', 'Help & Transparency')}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">{t('faq.title', 'Frequently Asked Questions')}</h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-lg mx-auto">
          {t('faq.subtitle', 'Everything you need to know about our privacy protocols, packaging, and body-safe materials.')}
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl bg-white border border-gray-200 overflow-hidden transition-all shadow-xs"
            >
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between text-sm font-extrabold text-slate-900 hover:text-red-600 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-red-600' : ''}`} />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 text-xs text-slate-600 font-medium leading-relaxed border-t border-gray-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
