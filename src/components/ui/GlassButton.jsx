export default function GlassButton({ children, variant = "primary", className = "", ...props }) {
  const baseClasses = "px-6 py-3 rounded-full font-semibold transition-all duration-300 active:scale-95 flex items-center justify-center";
  
  const variants = {
    primary: "bg-gradient-to-r from-[#C96A43] to-accent text-white shadow-[var(--shadow-warm)] hover:shadow-lg hover:shadow-accent/40",
    secondary: "bg-surface/60 backdrop-blur-md text-text-primary border border-accent/30 shadow-sm hover:bg-surface/80"
  };

  return (
    <button className={`${baseClasses} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
