import React from 'react';
import { useShop } from '../context/ShopContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const { navigateTo } = useShop();

  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-600 mx-auto shadow-xs">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <h1 className="text-4xl font-extrabold text-slate-900">404 - Page Not Found</h1>
      <p className="text-xs text-slate-500 font-medium leading-relaxed">
        The discrete URL or product page you requested could not be located or may have been updated.
      </p>

      <button
        onClick={() => navigateTo('home')}
        className="px-6 py-3 rounded-full bg-gradient-to-r from-red-600 to-amber-500 text-white font-extrabold text-xs inline-flex items-center gap-2 hover:opacity-95 shadow-md"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Home</span>
      </button>
    </div>
  );
};
