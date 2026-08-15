import React, { useEffect, useState } from 'react';
import { Package, CheckCircle2, Sparkles, ShieldCheck, Zap, ArrowRight, Copy, Check, Phone } from 'lucide-react';

interface DeliveryAnimationOverlayProps {
  orderId: string;
  trackingNumber: string;
  customerPhone?: string;
  onComplete: () => void;
}

export const DeliveryAnimationOverlay: React.FC<DeliveryAnimationOverlayProps> = ({
  orderId,
  trackingNumber,
  customerPhone,
  onComplete
}) => {
  const [progress, setProgress] = useState(0);
  const [copiedOrderId, setCopiedOrderId] = useState(false);
  const [phase, setPhase] = useState<'packaging' | 'loading' | 'bike_riding' | 'dispatched'>('packaging');

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(orderId);
    setCopiedOrderId(true);
    setTimeout(() => setCopiedOrderId(false), 2500);
  };

  useEffect(() => {
    const duration = 7500; // ~7.5 seconds
    const intervalTime = 50;
    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed += intervalTime;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(pct);

      if (elapsed < 2400) {
        setPhase('packaging');
      } else if (elapsed < 4400) {
        setPhase('loading');
      } else if (elapsed < 7000) {
        setPhase('bike_riding');
      } else {
        setPhase('dispatched');
      }

      if (elapsed >= duration) {
        clearInterval(timer);
        setTimeout(() => {
          onComplete();
        }, 200);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-300">
      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-2xl relative overflow-hidden">
        
        {/* Background Ambient Lights */}
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-red-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-amber-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />

        {/* Top Header Badge */}
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 font-extrabold text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Payment Verified by System • Order Confirmed</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Packaging & Express Bike Dispatch
          </h2>

          {/* Prominent Order ID & Phone Number Box */}
          <div className="p-3 bg-slate-950/90 border border-yellow-500/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-left shadow-inner">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-red-600/20 border border-red-500/30 text-yellow-300">
                <Package className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">Your Official Order ID</span>
                <span className="font-mono text-base sm:text-lg font-black text-yellow-300 tracking-wide">{orderId}</span>
                {customerPhone && (
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium mt-0.5">
                    <Phone className="w-3 h-3 text-emerald-400" />
                    <span>Linked Phone: <strong className="text-white font-mono">{customerPhone}</strong></span>
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopyOrderId}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all shrink-0"
            >
              {copiedOrderId ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedOrderId ? 'Order ID Copied!' : 'Copy Order ID'}</span>
            </button>
          </div>
        </div>

        {/* Dynamic Animation Canvas Stage */}
        <div className="relative h-64 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex flex-col justify-between p-4 shadow-inner">
          
          {/* Top Stage Bar */}
          <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 border-b border-slate-800/80 pb-2 z-10">
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% DISCRETE PACKAGING</span>
            </span>
            <span className="flex items-center gap-1 text-amber-400 font-bold">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>EXPRESS BIKE COURIER</span>
            </span>
          </div>

          {/* Center Stage Scene */}
          <div className="relative flex-1 flex items-center justify-center my-1 overflow-hidden">
            
            {/* Speed Dashes in Background */}
            {phase === 'bike_riding' && (
              <div className="absolute inset-0 pointer-events-none flex flex-col justify-around opacity-40">
                <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-speed-dash" style={{ animationDuration: '0.5s' }} />
                <div className="h-0.5 w-32 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-speed-dash ml-auto" style={{ animationDuration: '0.7s', animationDelay: '0.2s' }} />
                <div className="h-0.5 w-20 bg-gradient-to-r from-transparent via-yellow-300 to-transparent animate-speed-dash" style={{ animationDuration: '0.4s', animationDelay: '0.1s' }} />
              </div>
            )}

            {/* Road Canvas at Bottom */}
            {(phase === 'bike_riding' || phase === 'loading' || phase === 'dispatched') && (
              <div className="absolute bottom-1 left-0 right-0 z-0">
                {/* Road surface */}
                <div className="h-4 bg-slate-900 border-t border-slate-800 w-full relative">
                  {/* Moving dashed center line */}
                  <div className={`h-1 w-full absolute top-1.5 ${phase === 'bike_riding' ? 'animate-road' : 'bg-slate-800'}`} />
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* STAGE 1: CARD BOARD BOX PACKAGING & SECURITY TAPING     */}
            {/* ======================================================== */}
            {phase === 'packaging' && (
              <div className="flex flex-col items-center justify-center space-y-3 animate-in fade-in zoom-in-95 duration-300">
                {/* Animated Box Container */}
                <div className="relative w-28 h-28 bg-gradient-to-b from-amber-700 to-amber-800 border-4 border-amber-600 rounded-2xl shadow-2xl flex flex-col items-center justify-between p-2.5 text-amber-100 transform transition-transform">
                  
                  {/* Flaps at top */}
                  <div className="w-full flex justify-between gap-1">
                    <div className="h-2.5 flex-1 bg-amber-900/90 rounded-sm border border-amber-950" />
                    <div className="h-2.5 flex-1 bg-amber-900/90 rounded-sm border border-amber-950" />
                  </div>

                  {/* Center Sealed Security Tape */}
                  <div className="w-full relative py-1 my-auto">
                    <div className="h-4 bg-amber-400 border-y border-amber-900/80 rounded-xs flex items-center justify-center overflow-hidden shadow-xs">
                      <span className="text-[8px] font-black text-amber-950 tracking-wider animate-pulse">
                        ✓ SECURE SEALED
                      </span>
                    </div>
                  </div>

                  {/* Discrete Package Icon & Confidential Stamp */}
                  <div className="w-full flex items-center justify-between px-1">
                    <Package className="w-6 h-6 text-amber-200" />
                    <div className="bg-red-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider shadow-xs">
                      CONFIDENTIAL
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <span className="text-xs font-black text-amber-300 flex items-center justify-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-400" />
                    <span>Sealing package in plain unbranded protective box...</span>
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">Discretion guaranteed • Zero external markings</p>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* STAGE 2: LOADING SEALED BOX ONTO BIKE CARRIER TRUNK      */}
            {/* ======================================================== */}
            {phase === 'loading' && (
              <div className="relative w-full h-full flex items-center justify-center animate-in fade-in duration-300">
                {/* Bike at Stop with Carrier Trunk */}
                <div className="relative flex items-end">
                  
                  {/* Motorbike SVG */}
                  <div className="relative">
                    <svg className="w-56 h-36" viewBox="0 0 240 160" fill="none" xmlns="http://www.w3.org/2000/svg">
                      {/* Bike Body */}
                      <path d="M 60 110 L 90 70 L 140 70 L 170 110" stroke="#DC2626" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M 90 70 L 110 110 L 155 110" stroke="#991B1B" strokeWidth="6" strokeLinecap="round" />
                      <path d="M 140 70 L 175 45 L 165 40" stroke="#F59E0B" strokeWidth="5" strokeLinecap="round" />
                      
                      {/* Fuel Tank & Seat */}
                      <path d="M 105 66 C 105 60 145 60 150 72 L 105 72 Z" fill="#DC2626" />
                      <path d="M 75 70 C 80 66 105 66 110 72 L 75 72 Z" fill="#1E293B" />
                      
                      {/* Courier Rider Helmet & Jacket */}
                      <circle cx="120" cy="30" r="14" fill="#E11D48" stroke="#FFFFFF" strokeWidth="2" />
                      <path d="M 124 28 L 133 30 L 126 36 Z" fill="#0F172A" /> {/* Visor */}
                      <path d="M 112 44 L 132 46 L 145 68 L 115 68 Z" fill="#B91C1C" /> {/* Torso */}
                      <path d="M 130 50 L 165 48" stroke="#B91C1C" strokeWidth="5" strokeLinecap="round" /> {/* Arms to handlebar */}

                      {/* Rear Carrier Box (Receiving Package) */}
                      <rect x="40" y="48" width="40" height="34" rx="6" fill="#1E293B" stroke="#F59E0B" strokeWidth="3" strokeDasharray="3 3" />
                      
                      {/* Wheels */}
                      <g transform="translate(55, 110)">
                        <circle cx="0" cy="0" r="22" fill="#0F172A" stroke="#475569" strokeWidth="6" />
                        <circle cx="0" cy="0" r="12" fill="#334155" stroke="#94A3B8" strokeWidth="2" />
                      </g>
                      <g transform="translate(175, 110)">
                        <circle cx="0" cy="0" r="22" fill="#0F172A" stroke="#475569" strokeWidth="6" />
                        <circle cx="0" cy="0" r="12" fill="#334155" stroke="#94A3B8" strokeWidth="2" />
                      </g>

                      {/* Headlight */}
                      <circle cx="180" cy="50" r="5" fill="#FEF08A" />
                    </svg>

                    {/* Floating Sealed Box Landing into Bike Trunk */}
                    <div className="absolute top-2 left-6 w-12 h-10 bg-amber-700 border-2 border-amber-400 rounded-lg shadow-lg flex flex-col items-center justify-center p-0.5 animate-bounce">
                      <div className="w-full h-1 bg-amber-300 rounded-full" />
                      <Package className="w-5 h-5 text-amber-100" />
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-1 text-center">
                  <p className="text-xs font-black text-amber-300 flex items-center justify-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-400" />
                    <span>Loading sealed box into express bike carrier trunk...</span>
                  </p>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* STAGE 3: BIKE ENGINE STARTED & DRIVING ON ROAD           */}
            {/* ======================================================== */}
            {phase === 'bike_riding' && (
              <div className="relative w-full h-full flex items-center justify-center animate-in fade-in duration-300">
                
                {/* Moving Motorbike with CSS Animations */}
                <div className="relative animate-bike-ride flex items-end">
                  
                  {/* Exhaust smoke puffs */}
                  <div className="absolute bottom-8 left-2 pointer-events-none">
                    <div className="w-4 h-4 rounded-full bg-slate-400/80 animate-exhaust-1" />
                    <div className="w-5 h-5 rounded-full bg-slate-500/60 animate-exhaust-2" />
                  </div>

                  {/* Headlight beam */}
                  <div className="absolute top-8 -right-16 w-36 h-16 bg-gradient-to-r from-yellow-300/60 via-yellow-100/20 to-transparent blur-xs pointer-events-none transform -rotate-6" />

                  {/* Motorbike SVG with spinning wheels */}
                  <svg className="w-60 h-40" viewBox="0 0 240 160" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Bike Body */}
                    <path d="M 60 110 L 90 70 L 140 70 L 170 110" stroke="#DC2626" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M 90 70 L 110 110 L 155 110" stroke="#991B1B" strokeWidth="6" strokeLinecap="round" />
                    <path d="M 140 70 L 175 45 L 165 40" stroke="#F59E0B" strokeWidth="5" strokeLinecap="round" />
                    
                    {/* Fuel Tank & Seat */}
                    <path d="M 105 66 C 105 60 145 60 150 72 L 105 72 Z" fill="#DC2626" />
                    <path d="M 75 70 C 80 66 105 66 110 72 L 75 72 Z" fill="#1E293B" />
                    
                    {/* Rider */}
                    <circle cx="120" cy="30" r="14" fill="#E11D48" stroke="#FFFFFF" strokeWidth="2" />
                    <path d="M 124 28 L 133 30 L 126 36 Z" fill="#0F172A" /> {/* Visor */}
                    <path d="M 112 44 L 132 46 L 145 68 L 115 68 Z" fill="#B91C1C" /> {/* Torso */}
                    <path d="M 130 50 L 165 48" stroke="#B91C1C" strokeWidth="5" strokeLinecap="round" />

                    {/* Locked Rear Carrier Trunk with Package Icon */}
                    <rect x="40" y="48" width="40" height="34" rx="6" fill="#1E293B" stroke="#10B981" strokeWidth="3" />
                    <g transform="translate(52, 57)">
                      <rect width="16" height="14" rx="2" fill="#D97706" />
                      <rect x="6" y="0" width="4" height="14" fill="#FEF08A" />
                    </g>
                    
                    {/* Rear Wheel (Spinning) */}
                    <g transform="translate(55, 110)">
                      <circle cx="0" cy="0" r="22" fill="#0F172A" stroke="#334155" strokeWidth="5" />
                      <g className="animate-wheel">
                        <line x1="-18" y1="0" x2="18" y2="0" stroke="#94A3B8" strokeWidth="2.5" />
                        <line x1="0" y1="-18" x2="0" y2="18" stroke="#94A3B8" strokeWidth="2.5" />
                        <line x1="-13" y1="-13" x2="13" y2="13" stroke="#94A3B8" strokeWidth="2.5" />
                        <line x1="-13" y1="13" x2="13" y2="-13" stroke="#94A3B8" strokeWidth="2.5" />
                        <circle cx="0" cy="0" r="6" fill="#EF4444" />
                      </g>
                    </g>

                    {/* Front Wheel (Spinning) */}
                    <g transform="translate(175, 110)">
                      <circle cx="0" cy="0" r="22" fill="#0F172A" stroke="#334155" strokeWidth="5" />
                      <g className="animate-wheel">
                        <line x1="-18" y1="0" x2="18" y2="0" stroke="#94A3B8" strokeWidth="2.5" />
                        <line x1="0" y1="-18" x2="0" y2="18" stroke="#94A3B8" strokeWidth="2.5" />
                        <line x1="-13" y1="-13" x2="13" y2="13" stroke="#94A3B8" strokeWidth="2.5" />
                        <line x1="-13" y1="13" x2="13" y2="-13" stroke="#94A3B8" strokeWidth="2.5" />
                        <circle cx="0" cy="0" r="6" fill="#EF4444" />
                      </g>
                    </g>

                    {/* Headlight & Indicator */}
                    <circle cx="180" cy="50" r="6" fill="#FEF08A" />
                    <circle cx="180" cy="50" r="3" fill="#FFFFFF" />
                  </svg>
                </div>

                <div className="absolute bottom-1 text-center">
                  <p className="text-xs font-black text-amber-300 flex items-center justify-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-yellow-400 animate-bounce" />
                    <span>Bike engine started! Courier is moving and dispatched with your order...</span>
                  </p>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* STAGE 4: DISPATCH FINALIZED                              */}
            {/* ======================================================== */}
            {phase === 'dispatched' && (
              <div className="flex flex-col items-center justify-center space-y-2 animate-in fade-in zoom-in-95 duration-200">
                <div className="w-14 h-14 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-lg">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h3 className="text-sm font-black text-white">Order Dispatched Successfully!</h3>
                <p className="text-[11px] text-emerald-400 font-bold">Opening your tracking details...</p>
              </div>
            )}

          </div>

          {/* Bottom Progress Bar */}
          <div className="space-y-1.5 z-10 pt-2 border-t border-slate-800">
            <div className="flex justify-between text-[11px] text-slate-300 font-bold">
              <span>{phase === 'packaging' ? '1. Sealing Box' : phase === 'loading' ? '2. Loading to Bike' : '3. Bike Moving & Dispatched'}</span>
              <span className="font-mono text-amber-400 font-black">{progress}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div 
                className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-yellow-400 rounded-full transition-all duration-100 ease-linear shadow-lg"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

        </div>

        {/* Skip Animation Button if user wants instant tracking */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <span>Tracking Ref: <strong className="text-amber-300 font-mono">{trackingNumber}</strong></span>
          <button
            type="button"
            onClick={onComplete}
            className="text-amber-400 hover:text-amber-300 underline font-bold cursor-pointer flex items-center gap-1"
          >
            <span>Skip & View Tracking Cards</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
