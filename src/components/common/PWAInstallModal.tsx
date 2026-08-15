import React, { useState } from 'react';
import { 
  Download, 
  Smartphone, 
  Monitor, 
  Share, 
  PlusSquare, 
  CheckCircle2, 
  X, 
  ShieldCheck, 
  Zap, 
  BellRing,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstalled, isInstallable, platform, triggerInstall, deferredPrompt } = usePWAInstall();
  const [installSuccess, setInstallSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'auto' | 'mobile' | 'desktop'>(
    platform === 'desktop' ? 'desktop' : 'mobile'
  );

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      const outcome = await triggerInstall();
      if (outcome === 'accepted') {
        setInstallSuccess(true);
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } else if (platform === 'ios') {
      setActiveTab('mobile');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-7 max-w-lg w-full shadow-2xl space-y-5 my-auto max-h-[94vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-md text-white">
              <Download className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                Download & Install CareMart App
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                Install as a native Progressive Web App on Mobile or Desktop
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Banner if Installed */}
        {isInstalled || installSuccess ? (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h3 className="text-sm font-black text-emerald-950">App Successfully Installed!</h3>
            <p className="text-xs text-emerald-800 font-medium">
              You can now launch CareMart directly from your home screen or application launcher with instant access.
            </p>
          </div>
        ) : (
          <>
            {/* Top Device Platform Switcher */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab('mobile')}
                className={`flex-1 py-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'mobile'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile (iOS & Android)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('desktop')}
                className={`flex-1 py-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'desktop'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Desktop (PC & Mac)</span>
              </button>
            </div>

            {/* Direct 1-Click Install Button for Android & Windows / Desktop */}
            <button
              type="button"
              onClick={handleInstallClick}
              className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-amber-500 hover:from-red-700 hover:to-amber-600 text-white font-black text-sm shadow-lg hover:shadow-xl active:scale-98 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Download className="w-5 h-5 stroke-[2.5]" />
              <span>
                {activeTab === 'mobile'
                  ? 'Download & Install App (Android)'
                  : 'Download & Install for Windows / PC'}
              </span>
              <Sparkles className="w-4 h-4 text-amber-200 fill-amber-200" />
            </button>

            {/* Device-Specific Guides */}
            {activeTab === 'mobile' ? (
              <div className="space-y-3">
                {/* Android Direct Guide */}
                <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-black text-slate-900">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">🤖</span>
                    <span>Android Instant Install:</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Click the download button above to install directly. If prompted, confirm <strong className="text-emerald-700">"Install"</strong> or tap your browser menu <strong className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-900">(⋮ 3 dots)</strong> &rarr; <strong className="text-slate-900">"Install app"</strong>.
                  </p>
                </div>

                {/* iPhone / iPad Guide */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-black text-slate-900">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">🍎</span>
                    <span>For iPhone & iPad (Apple Safari):</span>
                  </div>
                  <ol className="text-xs text-slate-700 space-y-2 pl-2">
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-red-600 shrink-0">1.</span>
                      <span>Tap the <strong className="inline-flex items-center gap-1 bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-900"><Share className="w-3 h-3 text-blue-600" /> Share</strong> button at the bottom of Safari.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-red-600 shrink-0">2.</span>
                      <span>Scroll down and tap <strong className="inline-flex items-center gap-1 bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-900"><PlusSquare className="w-3 h-3 text-slate-800" /> Add to Home Screen</strong>.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-red-600 shrink-0">3.</span>
                      <span>Tap <strong className="text-red-600">Add</strong> in top right corner.</span>
                    </li>
                  </ol>
                </div>
              </div>
            ) : (
              /* Desktop Guide (Windows & Mac) */
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-black text-slate-900">
                    <Monitor className="w-4 h-4 text-slate-800" />
                    <span>For Windows PC & Desktop:</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Click the download button above or click the <strong className="inline-flex items-center gap-1 bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-900"><Download className="w-3 h-3 text-red-600" /> Install App</strong> icon in your browser address bar to launch CareMart as a standalone app.
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {/* Footer Actions */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-extrabold transition-colors text-center cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
