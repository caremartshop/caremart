import React, { useEffect, useState } from 'react';
import Lottie from 'lottie-react';

// Self-contained, lightweight Lottie JSON for a package being processed & packed
const defaultPackageLottieData = {
  v: "5.7.4",
  fr: 30,
  ip: 0,
  op: 90,
  w: 300,
  h: 300,
  nm: "Package Processing Animation",
  ddd: 0,
  assets: [],
  layers: [
    // Pulse ring behind package
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Pulse Ring",
      sr: 1,
      ks: {
        o: {
          a: 1,
          k: [
            { t: 0, s: [80], e: [10] },
            { t: 45, s: [10], e: [80] },
            { t: 90, s: [80] }
          ]
        },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [150, 160, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [85, 85, 100], e: [115, 115, 100] },
            { t: 45, s: [115, 115, 100], e: [85, 85, 100] },
            { t: 90, s: [85, 85, 100] }
          ]
        }
      },
      shapes: [
        {
          ty: "ellipse",
          p: { a: 0, k: [0, 0] },
          s: { a: 0, k: [180, 180] }
        },
        {
          ty: "st",
          c: { a: 0, k: [0.92, 0.7, 0.03, 0.5] }, // Yellow accent
          w: { a: 0, k: 6 },
          lc: 2,
          lj: 2
        }
      ]
    },
    // Main Package Box body
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: "Package Box Base",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: {
          a: 1,
          k: [
            { t: 0, s: [0], e: [-4] },
            { t: 20, s: [-4], e: [4] },
            { t: 40, s: [4], e: [-2] },
            { t: 60, s: [-2], e: [2] },
            { t: 80, s: [2], e: [0] },
            { t: 90, s: [0] }
          ]
        },
        p: {
          a: 1,
          k: [
            { t: 0, s: [150, 160, 0], e: [150, 148, 0] },
            { t: 25, s: [150, 148, 0], e: [150, 160, 0] },
            { t: 50, s: [150, 160, 0], e: [150, 148, 0] },
            { t: 75, s: [150, 148, 0], e: [150, 160, 0] },
            { t: 90, s: [150, 160, 0] }
          ]
        },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [100, 100, 100], e: [106, 94, 100] },
            { t: 15, s: [106, 94, 100], e: [96, 104, 100] },
            { t: 30, s: [96, 104, 100], e: [100, 100, 100] },
            { t: 90, s: [100, 100, 100] }
          ]
        }
      },
      shapes: [
        {
          ty: "rect",
          p: { a: 0, k: [0, 0] },
          s: { a: 0, k: [120, 100] },
          r: { a: 0, k: 12 }
        },
        {
          ty: "fl",
          c: { a: 0, k: [0.93, 0.67, 0.44, 1] } // Cardboard brown (#EDAC70)
        },
        {
          ty: "st",
          c: { a: 0, k: [0.75, 0.5, 0.28, 1] },
          w: { a: 0, k: 4 }
        }
      ]
    },
    // Package Tape Strip across center
    {
      ddd: 0,
      ind: 3,
      ty: 4,
      nm: "Package Sealing Tape",
      sr: 1,
      ks: {
        o: { a: 0, k: 90 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [150, 160, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] }
      },
      shapes: [
        {
          ty: "rect",
          p: { a: 0, k: [0, 0] },
          s: { a: 0, k: [32, 100] },
          r: { a: 0, k: 2 }
        },
        {
          ty: "fl",
          c: { a: 0, k: [0.86, 0.15, 0.15, 1] } // Red branded tape (#DC2626)
        }
      ]
    },
    // Floating Check Badge or Sparkles
    {
      ddd: 0,
      ind: 4,
      ty: 4,
      nm: "Verification Badge",
      sr: 1,
      ks: {
        o: {
          a: 1,
          k: [
            { t: 0, s: [0], e: [100] },
            { t: 30, s: [100] },
            { t: 90, s: [100] }
          ]
        },
        r: { a: 0, k: 0 },
        p: {
          a: 1,
          k: [
            { t: 0, s: [195, 120, 0], e: [195, 110, 0] },
            { t: 45, s: [195, 110, 0], e: [195, 120, 0] },
            { t: 90, s: [195, 120, 0] }
          ]
        },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [0, 0, 100], e: [100, 100, 100] },
            { t: 25, s: [100, 100, 100] },
            { t: 90, s: [100, 100, 100] }
          ]
        }
      },
      shapes: [
        {
          ty: "ellipse",
          p: { a: 0, k: [0, 0] },
          s: { a: 0, k: [38, 38] }
        },
        {
          ty: "fl",
          c: { a: 0, k: [0.06, 0.73, 0.5, 1] } // Emerald green (#10B981)
        }
      ]
    }
  ]
};

interface PackageLottieAnimationProps {
  className?: string;
  style?: React.CSSProperties;
}

export const PackageLottieAnimation: React.FC<PackageLottieAnimationProps> = ({
  className = 'w-64 h-64 mx-auto',
  style,
}) => {
  const [animationData, setAnimationData] = useState<any>(defaultPackageLottieData);

  useEffect(() => {
    // Try fetching a high quality online package processing Lottie JSON as primary, fallback to offline built-in
    let isMounted = true;
    fetch('https://assets2.lottiefiles.com/packages/lf20_uc2424.json')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Failed to load online Lottie animation');
      })
      .then((data) => {
        if (isMounted && data) {
          setAnimationData(data);
        }
      })
      .catch(() => {
        // Soft fallback to default built-in Lottie data
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className={`relative flex items-center justify-center ${className}`} style={style}>
      <Lottie
        animationData={animationData}
        loop={true}
        autoplay={true}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};
