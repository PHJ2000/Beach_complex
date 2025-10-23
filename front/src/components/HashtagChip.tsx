interface HashtagChipProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export function HashtagChip({ label, isActive, onClick }: HashtagChipProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg transition-all whitespace-nowrap flex-shrink-0 ${
        isActive 
          ? 'bg-[#007DFC] text-white' 
          : 'bg-muted text-foreground hover:bg-accent dark:bg-gray-700 dark:hover:bg-gray-600'
      }`}
    >
      <span className="font-['Noto_Sans_KR:Regular',_sans-serif] text-[12px]">
        {label}
      </span>
    </button>
  );
}
