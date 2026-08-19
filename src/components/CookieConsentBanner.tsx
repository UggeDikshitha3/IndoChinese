import React, { useState, useEffect } from 'react';
import { Shield, Cookie, Check, X } from 'lucide-react';

interface CookieConsentBannerProps {
  onOpenPrivacyPolicy: () => void;
}

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({ onOpenPrivacyPolicy }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('indochinese_cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('indochinese_cookie_consent', JSON.stringify({
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString()
    }));
    setIsVisible(false);
  };

  const handleAcceptEssential = () => {
    localStorage.setItem('indochinese_cookie_consent', JSON.stringify({
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString()
    }));
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-5 shadow-2xl shadow-black/60 text-slate-200">
        <div className="flex items-start space-x-3.5">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex-shrink-0 mt-0.5">
            <Cookie className="w-5 h-5" />
          </div>
          <div className="flex-1 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white text-sm">Cookie & Privacy Preferences</h4>
            </div>
            <p className="text-slate-400 leading-relaxed">
              We use essential cookies to ensure table reservations and booking management function securely. Review our{' '}
              <button
                onClick={onOpenPrivacyPolicy}
                className="text-red-400 underline hover:text-red-300 font-medium"
              >
                Privacy Policy
              </button>{' '}
              for details (UK GDPR compliant).
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button
                onClick={handleAcceptAll}
                className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition-colors flex items-center gap-1 shadow-md shadow-red-600/20"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Accept All</span>
              </button>
              <button
                onClick={handleAcceptEssential}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs border border-slate-700 transition-colors"
              >
                Essential Only
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
