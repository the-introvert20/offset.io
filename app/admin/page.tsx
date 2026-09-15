'use client';

import { useState, useEffect } from 'react';
import Notice from '@/components/Notice';

interface Factor {
  id: string;
  category: string;
  activity: string;
  subtype: string;
  region: string;
  unit: string;
  factor: number;
  source: string;
  confidenceLevel: string;
  isActive: boolean;
}

export default function AdminPage() {
  const [factors, setFactors] = useState<Factor[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // New factor form state
  const [showModal, setShowModal] = useState(false);
  const [category, setCategory] = useState('TRANSPORTATION');
  const [activity, setActivity] = useState('');
  const [subtype, setSubtype] = useState('');
  const [unit, setUnit] = useState('km');
  const [factorVal, setFactorVal] = useState(0.2);
  const [source, setSource] = useState('');
  const [region, setRegion] = useState('GLOBAL');
  const [confidence, setConfidence] = useState('HIGH');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [formError, setFormError] = useState<string | null>(null);

  const fetchFactors = () => {
    fetch('/api/admin/emission-factors')
      .then((res) => {
        if (!res.ok) throw new Error('FORBIDDEN: ADMIN ACCESS REQUIRED');
        return res.json();
      })
      .then((data) => {
        if (data.factors) setFactors(data.factors);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchFactors();
  }, []);

  const handleAddFactor = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      const res = await fetch('/api/admin/emission-factors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          activity: activity.trim().toLowerCase().replace(/\s+/g, '_'),
          subtype: subtype.trim().toLowerCase().replace(/\s+/g, '_'),
          unit: unit.trim(),
          factor: Number(factorVal),
          source,
          region,
          confidenceLevel: confidence,
        }),
      });

      if (res.ok) {
        setShowModal(false);
        setActivity('');
        setSubtype('');
        setFormError(null);
        fetchFactors();
      } else {
        const data = await res.json().catch(() => null);
        setFormError(
          data?.error === 'DUPLICATE_EMISSION_FACTOR'
            ? 'That exact factor already exists. Change the activity, subtype, region, or unit.'
            : 'We couldn’t save that factor. Check the values and try again.'
        );
      }
    } catch {
      setFormError('Connection problem. Try again in a moment.');
    }
  };

  useEffect(() => {
    if (!showModal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowModal(false);
        setFormError(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showModal]);

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-space-xl text-on-surface">
        <div className="w-12 h-12 border-2 border-on-surface border-t-primary animate-spin mb-space-md" aria-hidden="true" />
        <span className="font-label-caps-md uppercase tracking-wider font-bold">
          Checking access…
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-space-xl text-on-surface">
        <div className="border border-coral-accent bg-coral-accent/10 p-space-xl max-w-lg w-full text-center space-y-space-md">
          <span className="material-symbols-outlined text-coral-accent text-[48px] block" aria-hidden="true">shield</span>
          <h2 className="font-headline text-headline-md uppercase font-bold text-error">Admins only</h2>
          <p className="font-body-md text-on-surface-variant">
            This page manages the emission factors everyone&apos;s results are built on. Sign in with an admin account to continue.
          </p>
        </div>
      </div>
    );
  }

  const categories = ['ALL', 'TRANSPORTATION', 'ENERGY', 'FOOD', 'CONSUMPTION', 'WASTE'];
  const categoryShort: Record<string, string> = {
    ALL: 'All',
    TRANSPORTATION: 'Transport',
    ENERGY: 'Energy',
    FOOD: 'Food',
    CONSUMPTION: 'Shopping',
    WASTE: 'Waste',
  };
  const filteredFactors = categoryFilter === 'ALL' ? factors : factors.filter((f) => f.category === categoryFilter);

  const confidenceColor = (level: string) => {
    if (level === 'HIGH') return 'text-primary';
    if (level === 'MEDIUM') return 'text-on-surface';
    return 'text-error';
  };

  return (
    <div className="flex flex-col w-full text-on-surface bg-surface-container-lowest">
      {/* Ticker Header */}
      <section className="w-full bg-surface-container-low border-b border-on-surface flex flex-col md:flex-row items-stretch justify-between text-on-surface select-none">
        <div className="px-space-md py-space-xs border-b md:border-b-0 md:border-r border-on-surface flex items-center space-x-space-sm bg-surface-container-lowest">
          <span className="w-2.5 h-2.5 bg-coral-accent animate-pulse" aria-hidden="true"></span>
          <span className="font-label-caps-md text-label-caps-md uppercase tracking-wider text-on-surface font-bold">
            Emission factors · admin
          </span>
        </div>
        <div className="px-space-md py-space-xs border-b md:border-b-0 md:border-r border-on-surface flex items-center flex-1 justify-center bg-surface-container-lowest">
          <span className="font-label-caps-md text-label-caps-md uppercase tracking-wide text-on-surface">
            {factors.length} factors in use by the calculator
          </span>
        </div>
        <div className="px-space-md py-space-xs flex items-center justify-between md:justify-end space-x-space-md bg-coral-accent text-on-surface">
          <span className="font-label-caps-sm text-label-caps-sm uppercase tracking-widest font-bold">
            Admin access
          </span>
          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">shield</span>
        </div>
      </section>

      {/* Main Body */}
      <div className="p-space-lg md:p-space-xl space-y-space-lg">

        {/* Header */}
        <div className="border-b border-on-surface pb-space-sm flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="font-label-caps-sm uppercase text-error font-bold tracking-widest">
              Handle with care
            </span>
            <h1 className="font-headline text-headline-xl uppercase font-bold tracking-tight mt-1">
              Emission factors
            </h1>
            <p className="font-body-md text-on-surface-variant max-w-3xl mt-1">
              These factors power every calculation in the app. Changing one changes everyone&apos;s results — add new rows carefully and cite the source.
            </p>
          </div>
          <button
            onClick={() => { setFormError(null); setShowModal(true); }}
            className="min-h-[44px] px-space-lg py-space-sm bg-on-surface text-surface-container-lowest font-label-caps-md text-label-caps-md uppercase font-bold border border-on-surface hover:bg-primary transition-none flex items-center gap-space-xs whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">add</span>
            <span>Add factor</span>
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap items-center border border-on-surface w-fit gap-0" role="group" aria-label="Filter factors by category">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              aria-pressed={categoryFilter === cat}
              className={`min-h-[44px] px-space-md py-space-xs font-label-caps-sm text-label-caps-sm uppercase font-bold border-r border-on-surface last:border-r-0 transition-none ${
                categoryFilter === cat
                  ? 'bg-on-surface text-surface-container-lowest'
                  : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container-high'
              }`}
            >
              {categoryShort[cat]} {cat !== 'ALL' ? `(${factors.filter((f) => f.category === cat).length})` : `(${factors.length})`}
            </button>
          ))}
        </div>

        {/* Factors Table */}
        <div className="border border-on-surface overflow-hidden">
          <div className="border-b border-on-surface bg-surface-container-low p-space-sm flex items-center justify-between">
            <span className="font-label-caps-md text-label-caps-md uppercase font-bold text-on-surface">
              Factors ({filteredFactors.length})
            </span>
            <span className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant font-bold">
              Sources: DEFRA · EPA · IPCC · IEA
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-on-surface bg-surface-container">
                  {['CATEGORY', 'ACTIVITY', 'SUBTYPE', 'REGION', 'FACTOR VALUE', 'SOURCE', 'CONFIDENCE'].map((col) => (
                    <th
                      key={col}
                      className="p-space-sm font-label-caps-sm text-label-caps-sm uppercase font-bold text-on-surface-variant border-r border-on-surface last:border-r-0 whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredFactors.map((f, idx) => (
                  <tr
                    key={f.id}
                    className={`border-b border-on-surface hover:bg-surface-container-low transition-none ${idx % 2 === 0 ? 'bg-surface-container-lowest' : 'bg-surface-container'}`}
                  >
                    <td className="p-space-sm border-r border-on-surface">
                      <span className="px-space-xs py-0.5 border border-on-surface bg-surface-container font-label-caps-sm text-label-caps-sm uppercase font-bold whitespace-nowrap">
                        {f.category}
                      </span>
                    </td>
                    <td className="p-space-sm border-r border-on-surface font-label-caps-sm text-label-caps-sm uppercase font-bold text-on-surface whitespace-nowrap">
                      {f.activity}
                    </td>
                    <td className="p-space-sm border-r border-on-surface font-body-sm text-body-sm text-on-surface-variant">
                      {f.subtype}
                    </td>
                    <td className="p-space-sm border-r border-on-surface font-mono text-xs text-on-surface-variant whitespace-nowrap">
                      {f.region}
                    </td>
                    <td className="p-space-sm border-r border-on-surface font-bold font-mono text-primary whitespace-nowrap">
                      {f.factor} kg CO₂e / {f.unit}
                    </td>
                    <td className="p-space-sm border-r border-on-surface font-body-sm text-body-sm text-on-surface-variant max-w-[200px] truncate">
                      {f.source}
                    </td>
                    <td className={`p-space-sm font-label-caps-sm text-label-caps-sm uppercase font-bold ${confidenceColor(f.confidenceLevel)}`}>
                      {f.confidenceLevel}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Factor Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-on-surface/80 flex items-center justify-center p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-modal-title"
            className="w-full max-w-lg border border-on-surface bg-surface-container-lowest max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="border-b border-on-surface bg-surface-container-low p-space-md flex items-center justify-between">
              <span id="admin-modal-title" className="font-label-caps-md text-label-caps-md uppercase font-bold text-on-surface">
                Add a factor
              </span>
              <button
                onClick={() => { setShowModal(false); setFormError(null); }}
                aria-label="Close dialog"
                className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center p-1 hover:bg-on-surface hover:text-surface-container-lowest transition-none border border-on-surface"
              >
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">close</span>
              </button>
            </div>

            <form onSubmit={handleAddFactor} className="p-space-lg space-y-space-md">
              {formError && <Notice tone="error">{formError}</Notice>}
              {/* Category */}
              <div className="border border-on-surface">
                <div className="border-b border-on-surface p-space-sm bg-surface-container-low">
                  <span className="font-label-caps-sm text-label-caps-sm uppercase font-bold text-on-surface-variant" id="admin-cat-label">Category</span>
                </div>
                <div className="grid grid-cols-3 gap-0" role="group" aria-labelledby="admin-cat-label">
                  {['TRANSPORTATION', 'ENERGY', 'FOOD', 'CONSUMPTION', 'WASTE'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      aria-pressed={category === cat}
                      className={`min-h-[44px] p-space-sm text-center border-r border-b border-on-surface font-label-caps-sm text-label-caps-sm uppercase font-bold transition-none ${
                        category === cat
                          ? 'bg-on-surface text-surface-container-lowest'
                          : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container-high'
                      }`}
                    >
                      {categoryShort[cat]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Activity & Subtype */}
              <div className="grid grid-cols-2 gap-space-sm">
                <div className="border border-on-surface">
                  <div className="border-b border-on-surface p-space-sm bg-surface-container-low">
                    <label htmlFor="admin-activity" className="font-label-caps-sm text-label-caps-sm uppercase font-bold text-on-surface-variant">Activity</label>
                  </div>
                  <input
                    id="admin-activity"
                    type="text"
                    required
                    autoFocus
                    value={activity}
                    onChange={(e) => setActivity(e.target.value)}
                    placeholder="e.g. motorcycle"
                    className="min-h-[44px] w-full px-space-md py-space-sm bg-surface-container-lowest text-on-surface font-body-md focus:outline-none"
                  />
                </div>
                <div className="border border-on-surface">
                  <div className="border-b border-on-surface p-space-sm bg-surface-container-low">
                    <label htmlFor="admin-subtype" className="font-label-caps-sm text-label-caps-sm uppercase font-bold text-on-surface-variant">Subtype</label>
                  </div>
                  <input
                    id="admin-subtype"
                    type="text"
                    required
                    value={subtype}
                    onChange={(e) => setSubtype(e.target.value)}
                    placeholder="e.g. electric"
                    className="min-h-[44px] w-full px-space-md py-space-sm bg-surface-container-lowest text-on-surface font-body-md focus:outline-none"
                  />
                </div>
              </div>

              {/* Unit & Factor */}
              <div className="grid grid-cols-2 gap-space-sm">
                <div className="border border-on-surface">
                  <div className="border-b border-on-surface p-space-sm bg-surface-container-low">
                    <label htmlFor="admin-unit" className="font-label-caps-sm text-label-caps-sm uppercase font-bold text-on-surface-variant">Unit</label>
                  </div>
                  <input
                    id="admin-unit"
                    type="text"
                    required
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="km"
                    className="min-h-[44px] w-full px-space-md py-space-sm bg-surface-container-lowest text-on-surface font-body-md focus:outline-none"
                  />
                </div>
                <div className="border border-on-surface">
                  <div className="border-b border-on-surface p-space-sm bg-surface-container-low">
                    <label htmlFor="admin-factor" className="font-label-caps-sm text-label-caps-sm uppercase font-bold text-on-surface-variant">Factor (kg CO₂e per unit)</label>
                  </div>
                  <input
                    id="admin-factor"
                    type="number"
                    step="0.001"
                    min="0"
                    required
                    value={factorVal}
                    onChange={(e) => setFactorVal(Number(e.target.value))}
                    className="min-h-[44px] w-full px-space-md py-space-sm bg-surface-container-lowest text-on-surface font-body-md focus:outline-none"
                  />
                </div>
              </div>

              {/* Region & Confidence */}
              <div className="grid grid-cols-2 gap-space-sm">
                <div className="border border-on-surface">
                  <div className="border-b border-on-surface p-space-sm bg-surface-container-low">
                    <label htmlFor="admin-region" className="font-label-caps-sm text-label-caps-sm uppercase font-bold text-on-surface-variant">Region</label>
                  </div>
                  <select
                    id="admin-region"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="min-h-[44px] w-full px-space-md py-space-sm bg-surface-container-lowest text-on-surface font-body-md focus:outline-none cursor-pointer"
                  >
                    {['GLOBAL', 'US', 'EU', 'UK', 'IN'].map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div className="border border-on-surface">
                  <div className="border-b border-on-surface p-space-sm bg-surface-container-low">
                    <label htmlFor="admin-confidence" className="font-label-caps-sm text-label-caps-sm uppercase font-bold text-on-surface-variant">Confidence</label>
                  </div>
                  <select
                    id="admin-confidence"
                    value={confidence}
                    onChange={(e) => setConfidence(e.target.value)}
                    className="min-h-[44px] w-full px-space-md py-space-sm bg-surface-container-lowest text-on-surface font-body-md focus:outline-none cursor-pointer"
                  >
                    {['HIGH', 'MEDIUM', 'LOW'].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Source */}
              <div className="border border-on-surface">
                <div className="border-b border-on-surface p-space-sm bg-surface-container-low">
                  <label htmlFor="admin-source" className="font-label-caps-sm text-label-caps-sm uppercase font-bold text-on-surface-variant">Source (who published this number?)</label>
                </div>
                <input
                  id="admin-source"
                  type="text"
                  required
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="e.g. DEFRA 2023 conversion factors"
                  className="min-h-[44px] w-full px-space-md py-space-sm bg-surface-container-lowest text-on-surface font-body-md focus:outline-none"
                />
              </div>

              <div className="flex gap-space-sm pt-space-xs">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setFormError(null); }}
                  className="min-h-[44px] flex-1 py-space-sm border border-on-surface bg-surface-container text-on-surface font-label-caps-md uppercase font-bold hover:bg-surface-container-high transition-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] flex-1 py-space-sm bg-on-surface text-surface-container-lowest border border-on-surface font-label-caps-md uppercase font-bold hover:bg-primary transition-none"
                >
                  Save factor →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
