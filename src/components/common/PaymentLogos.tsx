import React from 'react';

export const MtnMomoLogo: React.FC<{ className?: string }> = ({ className = "h-7" }) => (
  <svg className={className} viewBox="0 0 130 42" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Yellow background container */}
    <rect width="130" height="42" rx="8" fill="#FFCC00" />
    {/* Dark oval badge for MTN */}
    <ellipse cx="32" cy="21" rx="21" ry="13" fill="#0E1726" />
    <text x="32" y="25" fontFamily="Arial Black, Impact, sans-serif" fontSize="14" fontWeight="900" fill="#FFCC00" textAnchor="middle" letterSpacing="-0.5">MTN</text>
    {/* MoMo text badge */}
    <text x="86" y="26" fontFamily="Arial Black, sans-serif" fontSize="17" fontWeight="900" fill="#0E1726" textAnchor="middle">MoMo</text>
  </svg>
);

export const AirtelMoneyLogo: React.FC<{ className?: string }> = ({ className = "h-7" }) => (
  <svg className={className} viewBox="0 0 140 42" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Airtel Red background container */}
    <rect width="140" height="42" rx="8" fill="#E40812" />
    {/* Airtel 'a' ribbon icon */}
    <g transform="translate(10, 7)">
      <path d="M 14 26 C 7 26 5 20 8 13 C 11 6 18 3 23 7 C 27 10 27 16 23 21 C 20 24 16 26 14 26 Z" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
      <path d="M 12 21 C 15 21 17 19 16 16 C 15 13 12 14 11 16" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
    </g>
    {/* Airtel Money brand text */}
    <text x="88" y="21" fontFamily="Arial, Helvetica, sans-serif" fontSize="13" fontWeight="900" fill="#FFFFFF" textAnchor="middle">airtel</text>
    <text x="88" y="33" fontFamily="Arial, Helvetica, sans-serif" fontSize="11" fontWeight="800" fill="#FFD700" textAnchor="middle" letterSpacing="0.8">money</text>
  </svg>
);

export const PayPalLogo: React.FC<{ className?: string }> = ({ className = "h-7" }) => (
  <svg className={className} viewBox="0 0 130 42" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="130" height="42" rx="8" fill="#003087" />
    {/* Dual 'P' PayPal Icon */}
    <g transform="translate(14, 8)">
      <path d="M 10 3 L 5 25 L 10 25 L 12 17 L 17 17 C 22 17 25 14 25 10 C 25 5 22 3 17 3 L 10 3 Z" fill="#0079C1" />
      <path d="M 6 7 L 1 29 L 6 29 L 8 21 L 13 21 C 18 21 21 18 21 14 C 21 9 18 7 13 7 L 6 7 Z" fill="#00457C" opacity="0.8" />
    </g>
    <text x="78" y="26" fontFamily="Arial Black, Impact, sans-serif" fontSize="15" fontWeight="900" fill="#FFFFFF" textAnchor="middle" letterSpacing="0.2">PayPal</text>
  </svg>
);

export const CardPaymentLogo: React.FC<{ className?: string }> = ({ className = "h-7" }) => (
  <svg className={className} viewBox="0 0 130 42" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="130" height="42" rx="8" fill="#1E293B" />
    <circle cx="28" cy="21" r="10" fill="#EB001B" />
    <circle cx="38" cy="21" r="10" fill="#F79E1B" fillOpacity="0.85" />
    <text x="82" y="25" fontFamily="Arial, sans-serif" fontSize="12" fontWeight="800" fill="#FFFFFF" textAnchor="middle">VISA / MC</text>
  </svg>
);

export const GoogleGLogo: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </svg>
);

