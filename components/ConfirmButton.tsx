'use client';

import { useEffect, useRef, useState } from 'react';

interface ConfirmButtonProps {
  label: string;
  confirmLabel?: string;
  onConfirm: () => void;
  className?: string;
  ariaLabel?: string;
}

/**
 * Two-click delete confirmation. First click arms the button
 * ("Delete? Tap again to confirm"), second click executes.
 * Disarms after a few seconds or on Escape. No tiny bare ✕ deletes.
 */
export default function ConfirmButton({
  label,
  confirmLabel = 'Tap again to confirm',
  onConfirm,
  className = '',
  ariaLabel,
}: ConfirmButtonProps) {
  const [armed, setArmed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const handleClick = () => {
    if (!armed) {
      setArmed(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setArmed(false), 4000);
      return;
    }
    if (timer.current) clearTimeout(timer.current);
    setArmed(false);
    onConfirm();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Escape') setArmed(false);
      }}
      onBlur={() => setArmed(false)}
      aria-label={ariaLabel || (armed ? confirmLabel : label)}
      aria-live="polite"
      className={`min-h-[44px] min-w-[44px] inline-flex items-center justify-center px-space-sm font-label-caps-sm text-label-caps-sm uppercase font-bold ${
        armed ? 'bg-error text-white border border-error' : ''
      } ${className}`}
    >
      {armed ? confirmLabel : label}
    </button>
  );
}
