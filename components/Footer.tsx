import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full bg-surface-container-lowest border-t border-on-surface text-on-surface">
      {/* 4-Column Broadsheet Row */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-b border-on-surface">
        {/* Col 1: About */}
        <div className="p-space-lg border-b sm:border-b lg:border-b-0 lg:border-r border-on-surface flex flex-col justify-between">
          <div className="space-y-space-sm">
            <div className="font-label-caps-md text-label-caps-md uppercase font-bold text-on-surface">
              About offset.io
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              Estimate your personal carbon footprint from everyday activities — travel, home energy, food, and waste — then explore practical ways to reduce it.
            </p>
          </div>
          <div className="mt-space-md pt-space-sm border-t border-on-surface">
            <Link href="/calculate" className="font-label-caps-sm text-label-caps-sm text-primary uppercase font-bold hover:underline">
              See how we calculate →
            </Link>
          </div>
        </div>

        {/* Col 2: Data sources */}
        <div className="p-space-lg border-b sm:border-b lg:border-b-0 lg:border-r border-on-surface flex flex-col justify-between">
          <div className="space-y-space-sm">
            <div className="font-label-caps-md text-label-caps-md uppercase font-bold text-on-surface">
              Emission data sources
            </div>
            <ul className="font-body-sm text-body-sm text-on-surface-variant space-y-1">
              <li>• DEFRA 2023 conversion factors</li>
              <li>• US EPA eGRID 2023 grid data</li>
              <li>• IPCC greenhouse gas guidelines</li>
              <li>• IEA global electricity averages</li>
            </ul>
          </div>
          <div className="mt-space-md">
            <span className="font-label-caps-sm text-label-caps-sm uppercase px-space-xs py-0.5 border border-on-surface bg-surface-container font-bold">
              Estimates, not certified measurements
            </span>
          </div>
        </div>

        {/* Col 3: What you can do */}
        <div className="p-space-lg border-b sm:border-b-0 lg:border-r border-on-surface flex flex-col justify-between">
          <div className="space-y-space-sm">
            <div className="font-label-caps-md text-label-caps-md uppercase font-bold text-on-surface">
              What you can do
            </div>
            <div className="font-body-sm text-body-sm text-on-surface-variant space-y-1">
              <p><Link href="/dashboard" className="hover:text-on-surface hover:underline">See your footprint</Link></p>
              <p><Link href="/simulator" className="hover:text-on-surface hover:underline">Try changes before you make them</Link></p>
              <p><Link href="/reduction-plan" className="hover:text-on-surface hover:underline">Build a reduction plan</Link></p>
              <p><Link href="/diary" className="hover:text-on-surface hover:underline">Track each day</Link></p>
            </div>
          </div>
          <div className="mt-space-md pt-space-sm border-t border-on-surface">
            <span className="font-label-caps-sm text-label-caps-sm text-on-surface-variant uppercase">
              Free for personal use
            </span>
          </div>
        </div>

        {/* Col 4: Good to know */}
        <div className="p-space-lg flex flex-col justify-between">
          <div className="space-y-space-sm">
            <div className="font-label-caps-md text-label-caps-md uppercase font-bold text-on-surface">
              Good to know
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              Your estimates update whenever your activities change. The coach works offline using your saved data — no paid services required.
            </p>
          </div>
          <div className="mt-space-md pt-space-sm border-t border-on-surface flex items-center justify-between">
            <span className="font-label-caps-sm text-label-caps-sm uppercase font-bold text-on-surface">
              © 2026 offset.io
            </span>
          </div>
        </div>
      </div>

      {/* Sub-Footer Keyline */}
      <div className="w-full px-space-lg py-space-sm flex flex-col sm:flex-row items-center justify-between gap-space-sm font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant bg-surface-container-low">
        <span>Personal footprint estimates · sources shown on every result</span>
        <div className="flex items-center space-x-space-md">
          <Link href="/calculate" className="hover:text-on-surface min-h-[44px] inline-flex items-center">How we calculate</Link>
          <Link href="/simulator" className="hover:text-on-surface min-h-[44px] inline-flex items-center">Try changes</Link>
          <Link href="/diary" className="hover:text-on-surface min-h-[44px] inline-flex items-center">Daily log</Link>
        </div>
      </div>
    </footer>
  );
}
