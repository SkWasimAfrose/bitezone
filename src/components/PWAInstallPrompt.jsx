import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export default function PWAInstallPrompt() {
  const { isInstallable, isInstalled, isIOS, promptInstall } = usePWAInstall();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user previously dismissed
    const dismissedAt = localStorage.getItem('pwa_install_dismissed_at');
    let shouldShow = true;

    if (dismissedAt) {
      const dismissedTime = new Date(dismissedAt).getTime();
      const currentTime = new Date().getTime();
      const daysSinceDismissed = (currentTime - dismissedTime) / (1000 * 3600 * 24);
      
      // Show again if it's been more than 7 days
      if (daysSinceDismissed < 7) {
        shouldShow = false;
      }
    }

    if (!isInstalled && (isInstallable || isIOS) && shouldShow) {
      // Small delay before showing prompt to not interrupt immediate loading
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isInstallable, isInstalled, isIOS]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('pwa_install_dismissed_at', new Date().toISOString());
  };

  const handleInstall = async () => {
    if (isIOS) {
      // iOS doesn't have an automated prompt, it shows instructions
      // so this might just be an acknowledgment or we just keep it visible
      return;
    }
    
    const success = await promptInstall();
    if (success) {
      setIsVisible(false);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 150, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 150, opacity: 0 }}
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          className="fixed bottom-4 left-4 right-4 z-[9999] md:bottom-8 md:left-auto md:right-8 md:w-[400px]"
        >
          <div className="bg-background/80 backdrop-blur-xl border border-white/10 p-5 rounded-3xl shadow-2xl overflow-hidden relative text-text-primary">
            {/* Glossy highlight effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
            
            <button 
              onClick={handleDismiss}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-surface/50 hover:bg-surface text-text-secondary transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <img 
                  src="/icon.png" 
                  alt="Bitezone" 
                  className="w-14 h-14 rounded-2xl shadow-sm object-cover bg-accent/10 p-1"
                />
              </div>
              
              <div className="flex-1 pr-6">
                <h3 className="font-semibold text-lg leading-tight mb-1">
                  {isIOS ? 'Install Bitezone on your iPhone' : 'Get the Bitezone App'}
                </h3>
                <p className="text-sm text-text-secondary mb-4">
                  Order from your favorite local restaurants faster. Install Bitezone for a smoother app-like experience.
                </p>
                
                {isIOS ? (
                  <div className="bg-surface/50 rounded-xl p-3 text-sm flex flex-col gap-2">
                    <p className="flex items-center gap-2">
                      1. Tap the <Share size={16} className="text-accent" /> Share button.
                    </p>
                    <p className="flex items-center gap-2">
                      2. Select <strong>Add to Home Screen</strong> <PlusSquare size={16} className="text-accent" />
                    </p>
                    <p className="flex items-center gap-2">
                      3. Tap <strong>Add</strong>.
                    </p>
                    <button 
                      onClick={handleDismiss}
                      className="mt-2 w-full py-2 px-4 rounded-xl font-medium border border-border text-text-primary hover:bg-surface transition-colors"
                    >
                      Got it
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button 
                      onClick={handleInstall}
                      className="flex-1 bg-accent hover:bg-accent/90 text-white py-2.5 px-4 rounded-xl font-medium transition-colors shadow-lg shadow-accent/20"
                    >
                      Install App
                    </button>
                    <button 
                      onClick={handleDismiss}
                      className="flex-1 py-2.5 px-4 rounded-xl font-medium bg-surface/50 hover:bg-surface border border-transparent hover:border-border transition-colors text-text-primary"
                    >
                      Maybe Later
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
