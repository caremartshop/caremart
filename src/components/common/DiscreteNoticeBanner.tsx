import React from 'react';
import { EyeOff } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export const DiscreteNoticeBanner: React.FC = () => {
  const { quickHide, discreteMode } = useShop();

  return (
    <div className="bg-white text-slate-800 py-1.5 px-4 text-xs font-semibold border-b border-gray-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-center">
        <div className="flex-1 flex items-center justify-center gap-2 text-xs text-slate-700">
          <span className="text-emerald-600 font-extrabold">✓</span>
          <span className="font-semibold text-slate-900">Certified Rwandan Pharmacy Partner Network</span>
          <span className="hidden sm:inline text-slate-300">•</span>
          <span className="hidden sm:inline text-slate-600">100% Confidential Marketplace & Plain Courier Packaging</span>
        </div>

        <button
          onClick={quickHide}
          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-all font-bold text-[11px] shrink-0"
          title="Instantly exit to plain document tab"
        >
          <EyeOff className="w-3 h-3 text-rose-500" />
          <span className="hidden sm:inline">{discreteMode ? 'Mode Active' : 'Quick Hide'}</span>
        </button>
      </div>
    </div>
  );
};

