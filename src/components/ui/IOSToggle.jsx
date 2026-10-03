import { motion } from 'framer-motion';

export default function IOSToggle({ isOn, onToggle, disabled = false, className = '' }) {
  return (
    <button
      onClick={() => !disabled && onToggle(!isOn)}
      disabled={disabled}
      className={`w-[52px] h-8 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none ${
        isOn ? 'bg-[#34C759]' : 'bg-surface border border-text-secondary/20'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      <motion.div
        layout
        initial={false}
        animate={{
          x: isOn ? 20 : 0,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="bg-white w-6 h-6 rounded-full shadow-md"
      />
    </button>
  );
}
