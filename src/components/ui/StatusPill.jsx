export default function StatusPill({ status, customText }) {
  const s = status.toLowerCase();
  
  let colorClass = 'bg-[#A34A3A]/10 text-[#A34A3A] border border-[#A34A3A]/20';
  let dotColor = null;
  
  if (s === 'closed') {
    colorClass = 'bg-white text-[#A34A3A] shadow-sm';
  } else if (s === 'open' || s === 'delivered') {
    colorClass = 'bg-[#4C7A5E]/10 text-[#4C7A5E] border border-[#4C7A5E]/20';
    dotColor = 'bg-[#4C7A5E]';
  } else if (s === 'preparing' || s === 'out_for_delivery') {
    colorClass = 'bg-[#5B88A5]/10 text-[#5B88A5] border border-[#5B88A5]/20';
    dotColor = 'bg-[#5B88A5]';
  } else if (s === 'new' || s === 'pending') {
    colorClass = 'bg-[#D18F52]/10 text-[#D18F52] border border-[#D18F52]/20';
    dotColor = 'bg-[#D18F52]';
  }

  const displayText = customText || status;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider shrink-0 whitespace-nowrap ${colorClass}`}>
      {dotColor && (
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${dotColor} opacity-75`}></span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColor}`}></span>
        </span>
      )}
      <span>{displayText}</span>
    </div>
  );
}
