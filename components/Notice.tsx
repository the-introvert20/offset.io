'use client';

import type { ReactNode } from 'react';

interface NoticeProps {
  tone: 'success' | 'error' | 'info';
  children: ReactNode;
  className?: string;
}

/**
 * Consistent inline feedback banner. Errors use role="alert" so
 * assistive tech announces them; success/info use role="status".
 */
export default function Notice({ tone, children, className = '' }: NoticeProps) {
  const styles =
    tone === 'error'
      ? 'border-error bg-error/10 text-error'
      : tone === 'success'
        ? 'border-primary bg-primary/10 text-on-surface'
        : 'border-on-surface bg-surface-container text-on-surface';

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`border p-space-sm flex items-start gap-space-sm ${styles} ${className}`}
    >
      <span className="material-symbols-outlined text-[18px] shrink-0" aria-hidden="true">
        {tone === 'error' ? 'error' : tone === 'success' ? 'check_circle' : 'info'}
      </span>
      <div className="font-body-sm text-body-sm leading-relaxed">{children}</div>
    </div>
  );
}
