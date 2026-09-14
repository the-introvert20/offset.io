import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full bg-surface-container-lowest border-t border-on-surface text-on-surface">
      {/* 4-Column Broadsheet Row */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-b border-on-surface">
        {/* Col 1: Colophon */}
        <div className="p-space-lg border-b sm:border-b lg:border-b-0 lg:border-r border-on-surface flex flex-col justify-between">
          <div className="space-y-space-sm">
            <div className="font-label-caps-md text-label-caps-md uppercase font-bold text-on-surface">
              OFFSET.IO / COLOPHON
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              Open-source decarbonization accounting framework and personal emissions audit ledger. Swiss International grid architecture with deterministic math models.
            </p>
          </div>
          <div className="mt-space-md pt-space-sm border-t border-on-surface">
            <span className="font-label-caps-sm text-label-caps-sm text-on-surface-variant uppercase">
              SYS_BUILD_VER: 2026.09-R4
            </span>
          </div>
        </div>

        {/* Col 2: Methodology & Standards */}
        <div className="p-space-lg border-b sm:border-b lg:border-b-0 lg:border-r border-on-surface flex flex-col justify-between">
          <div className="space-y-space-sm">
            <div className="font-label-caps-md text-label-caps-md uppercase font-bold text-on-surface">
              METHODOLOGY &amp; STANDARDS
            </div>
            <ul className="font-body-sm text-body-sm text-on-surface-variant space-y-1">
              <li>• GHG Protocol Corporate Standard v3.1</li>
              <li>• IPCC Sixth Assessment Report (AR6 GWP-100)</li>
              <li>• DEFRA Conversion Factors 2025.08</li>
              <li>• EPA eGRID Subregion Matrix 2024</li>
            </ul>
          </div>
          <div className="mt-space-md">
            <span className="font-label-caps-sm text-label-caps-sm uppercase px-space-xs py-0.5 border border-on-surface bg-surface-container font-bold">
              AUDIT: ISO 14064-3
            </span>
          </div>
        </div>

        {/* Col 3: Ledger Dispatch */}
        <div className="p-space-lg border-b sm:border-b-0 lg:border-r border-on-surface flex flex-col justify-between">
          <div className="space-y-space-sm">
            <div className="font-label-caps-md text-label-caps-md uppercase font-bold text-on-surface">
              LEDGER DISPATCH
            </div>
            <div className="font-body-sm text-body-sm text-on-surface-variant space-y-1">
              <p>Scope 1 Direct Combustion: Monitored</p>
              <p>Scope 2 Grid Electricity: Location-based</p>
              <p>Scope 3 Value Chain: Capped 15-tier</p>
              <p>Offset Integrity Index: Gold Standard / Verra</p>
            </div>
          </div>
          <div className="mt-space-md pt-space-sm border-t border-on-surface">
            <span className="font-label-caps-sm text-label-caps-sm text-on-surface-variant uppercase">
              FACTOR_REV: EF-2026-Q3
            </span>
          </div>
        </div>

        {/* Col 4: Station Telemetry */}
        <div className="p-space-lg flex flex-col justify-between">
          <div className="space-y-space-sm">
            <div className="font-label-caps-md text-label-caps-md uppercase font-bold text-on-surface">
              STATION TELEMETRY
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              All emissions factors, grid carbon intensity feeds, and marginal abatement curves update synchronously at 00:00 UTC.
            </p>
          </div>
          <div className="mt-space-md pt-space-sm border-t border-on-surface flex items-center justify-between">
            <span className="font-label-caps-sm text-label-caps-sm uppercase font-bold text-on-surface">
              © 2026 OFFSET.IO
            </span>
            <span className="font-label-caps-sm text-label-caps-sm uppercase px-space-xs py-0.5 bg-primary text-on-primary font-bold">
              LIVE ACTIVE
            </span>
          </div>
        </div>
      </div>

      {/* Sub-Footer Keyline */}
      <div className="w-full px-space-lg py-space-sm flex flex-col sm:flex-row items-center justify-between gap-space-sm font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant bg-surface-container-low">
        <span>STRICT MECHANICAL GRID • ZERO BORDER RADIUS • ISO 14064 COMPLIANT</span>
        <div className="flex items-center space-x-space-md">
          <Link href="/insights" className="hover:text-on-surface">METHODOLOGY</Link>
          <Link href="/simulator" className="hover:text-on-surface">SIMULATION SPECS</Link>
          <Link href="/admin" className="hover:text-on-surface">REGISTRY</Link>
        </div>
      </div>
    </footer>
  );
}
