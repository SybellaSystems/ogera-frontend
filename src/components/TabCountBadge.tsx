type TabCountBadgeProps = {
  counts: number;
};

const TabCountBadge = ({ counts}: TabCountBadgeProps) => {
  if (counts < 0) return null;
console.log(counts, "count");

  return (
    <span className="absolute -right-1.5 -top-1.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold leading-none text-white shadow-sm">
      {counts}
    </span>
  );
};

export default TabCountBadge;
