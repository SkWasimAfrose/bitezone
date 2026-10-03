export default function GlassCard({ children, className = "", ...props }) {
  return (
    <div 
      className={`rounded-[24px] bg-surface/60 backdrop-blur-xl border border-text-secondary/10 shadow-lg shadow-black/5 dark:shadow-black/20 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
