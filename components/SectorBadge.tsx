import React from 'react';

export type SectorKey =
  | 'transport'
  | 'energy'
  | 'food'
  | 'waste'
  | 'TRANSPORTATION'
  | 'ENERGY'
  | 'FOOD'
  | 'CONSUMPTION'
  | 'WASTE'
  | string;

export function normalizeSector(cat: string): 'transport' | 'energy' | 'food' | 'waste' {
  const c = cat.toLowerCase();
  if (c.includes('transport') || c.includes('mobility') || c.includes('car') || c.includes('flight')) {
    return 'transport';
  }
  if (c.includes('energy') || c.includes('power') || c.includes('electric') || c.includes('heat') || c.includes('residential')) {
    return 'energy';
  }
  if (c.includes('food') || c.includes('diet') || c.includes('nutrition')) {
    return 'food';
  }
  return 'waste'; // goods, waste, consumption
}

export const SECTOR_STYLES = {
  transport: {
    color: '#00B0FF',
    label: 'Transport',
    className: 'bg-[#00B0FF] text-[#1c1b1b] border border-[#1c1b1b] font-bold',
    bgClass: 'bg-[#00B0FF]',
    textClass: 'text-[#00B0FF]',
    borderClass: 'border-[#00B0FF]',
  },
  energy: {
    color: '#0022CC',
    label: 'Home energy',
    className: 'bg-[#0022CC] text-white border border-[#1c1b1b] font-bold',
    bgClass: 'bg-[#0022CC]',
    textClass: 'text-[#0022CC]',
    borderClass: 'border-[#0022CC]',
  },
  food: {
    color: '#FF4D30',
    label: 'Food',
    className: 'bg-[#FF4D30] text-[#1c1b1b] border border-[#1c1b1b] font-bold',
    bgClass: 'bg-[#FF4D30]',
    textClass: 'text-[#FF4D30]',
    borderClass: 'border-[#FF4D30]',
  },
  waste: {
    color: '#FFC700',
    label: 'Goods & waste',
    className: 'bg-[#FFC700] text-[#1c1b1b] border border-[#1c1b1b] font-bold',
    bgClass: 'bg-[#FFC700]',
    textClass: 'text-[#FFC700]',
    borderClass: 'border-[#FFC700]',
  },
} as const;

interface SectorBadgeProps {
  category: SectorKey;
  labelOverride?: string;
  className?: string;
  showIndicator?: boolean;
}

export default function SectorBadge({
  category,
  labelOverride,
  className = '',
  showIndicator = false,
}: SectorBadgeProps) {
  const norm = normalizeSector(category);
  const info = SECTOR_STYLES[norm];
  const label = labelOverride || info.label;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-bold uppercase tracking-wider select-none ${info.className} ${className}`}
    >
      {showIndicator && (
        <span
          className="w-2 h-2 inline-block border border-current"
          style={{ backgroundColor: info.color }}
          aria-hidden="true"
        />
      )}
      <span>{label}</span>
    </span>
  );
}
