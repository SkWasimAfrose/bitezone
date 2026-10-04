import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

/**
 * On mobile: slides up from the bottom as a sheet.
 * On sm+ (≥640px): renders as a centered modal dialog.
 */
export default function BottomSheet({ isOpen, onClose, title, children }) {
  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center pointer-events-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto"
          />

          {/* Sheet / Modal */}
          <motion.div
            initial={{ y: '100%', opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className={[
              'relative w-full pointer-events-auto',
              'bg-surface/95 backdrop-blur-2xl',
              'border border-text-secondary/20 shadow-2xl',
              'max-h-[92vh] overflow-y-auto scrollbar-hide',
              // Mobile: full-width sheet from bottom
              'rounded-t-[28px]',
              // sm+: centered modal, constrained width, fully rounded
              'sm:rounded-[28px] sm:max-w-lg sm:w-full',
              'p-6',
            ].join(' ')}
            style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 1.5rem)' }}
          >
            {/* Mobile drag handle — hidden on sm+ */}
            <div className="w-10 h-1 bg-text-secondary/20 rounded-full mx-auto mb-5 sm:hidden" />

            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-text-primary tracking-tight">{title}</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-surface hover:bg-surface-hover text-text-secondary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
