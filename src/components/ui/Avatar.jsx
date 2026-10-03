import { useState, useEffect } from 'react';
import { User } from 'lucide-react';

export default function Avatar({ src, alt = "Avatar", size = "md", className = "" }) {
  const [imageError, setImageError] = useState(false);

  // Reset error state if src changes
  useEffect(() => {
    setImageError(false);
  }, [src]);

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-20 h-20"
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;

  if (!src || imageError) {
    return (
      <div className={`rounded-full bg-[#E08A5B]/10 text-[#E08A5B] flex items-center justify-center flex-shrink-0 border border-[#E08A5B]/20 ${currentSize} ${className}`}>
        <User className="w-1/2 h-1/2 opacity-80" />
      </div>
    );
  }

  return (
    <div className={`rounded-full bg-surface overflow-hidden flex-shrink-0 border border-text-secondary/10 ${currentSize} ${className}`}>
      <img 
        src={src} 
        alt={alt} 
        className="w-full h-full object-cover" 
        onError={() => setImageError(true)}
      />
    </div>
  );
}
