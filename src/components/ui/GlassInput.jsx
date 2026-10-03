export default function GlassInput({ className = "", ...props }) {
  return (
    <input 
      className={`w-full px-5 py-3 rounded-2xl bg-surface/40 backdrop-blur-md border border-text-secondary/20 outline-none transition-all duration-300 focus:border-accent focus:ring-2 focus:ring-accent/20 text-text-primary placeholder:text-text-secondary ${className}`}
      {...props}
    />
  );
}
