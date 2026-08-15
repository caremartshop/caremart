import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Logo: React.FC<LogoProps> = ({ className = '', showText = true, size = 'md' }) => {
  const heightClasses = {
    sm: 'h-7',
    md: 'h-9',
    lg: 'h-11',
    xl: 'h-14'
  };

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <div className={`relative flex items-center ${heightClasses[size]}`}>
        <svg
          viewBox="0 0 170 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-auto"
        >
          {/* "Care" in Bold Crimson Red */}
          <text
            x="4"
            y="32"
            fill="#DC2626"
            fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            fontSize="31"
            fontWeight="900"
            letterSpacing="-0.5px"
          >
            Care
          </text>
          
          {/* "Mart" in Vibrant Yellow */}
          <text
            x="76"
            y="32"
            fill="#F59E0B"
            fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            fontSize="31"
            fontWeight="900"
            letterSpacing="-0.5px"
          >
            Mart
          </text>

          {/* Dynamic smile swoosh curve underneath "Mart" */}
          <path
            d="M78 38C98 45 136 44 154 36"
            stroke="#DC2626"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {!showText && (
        <span className="sr-only">CareMart</span>
      )}
    </div>
  );
};


