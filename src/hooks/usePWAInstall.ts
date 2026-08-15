import { useState, useEffect } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isInstallable, setIsInstallable] = useState<boolean>(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop' | 'other'>('other');

  useEffect(() => {
    // 1. Detect if already installed (standalone mode)
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    
    if (isStandalone) {
      setIsInstalled(true);
    }

    // 2. Detect platform
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    const isDesktop = !isIOS && !isAndroid;

    if (isIOS) {
      setPlatform('ios');
      setIsInstallable(!isStandalone); // iOS is always installable via Safari "Add to Home Screen"
    } else if (isAndroid) {
      setPlatform('android');
    } else if (isDesktop) {
      setPlatform('desktop');
    }

    // 3. Listen for Chromium beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    // 4. Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const triggerInstall = async (): Promise<'accepted' | 'dismissed' | 'manual_needed'> => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult.outcome === 'accepted') {
          setIsInstalled(true);
          setDeferredPrompt(null);
          return 'accepted';
        } else {
          return 'dismissed';
        }
      } catch (err) {
        console.warn('PWA prompt execution error:', err);
        return 'manual_needed';
      }
    }
    return 'manual_needed';
  };

  return {
    deferredPrompt,
    isInstalled,
    isInstallable,
    platform,
    triggerInstall
  };
}
