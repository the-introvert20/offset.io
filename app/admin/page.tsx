'use client';

import { useState, useEffect } from 'react';

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
  const [source, setSource] = useState('DEFRA 2024');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

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
    try {
      const res = await fetch('/api/admin/emission-factors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          activity,
          subtype,
          unit,
          factor: Number(factorVal),
          source,
          region: 'GLOBAL',
          confidenceLevel: 'HIGH',
        }),
      });

      if (res.ok) {
        setShowModal(false);
        setActivity('');
        setSubtype('');
        fetchFactors();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-space-xl text-on-surface">
        <div className="w-12 h-12 border-2 border-on-surface border-t-primary animate-spin mb-space-md" />
        <span className="font-label-caps-md uppercase tracking-wider font-bold">
          VERIFYING ADMIN CREDENTIALS...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-space-xl text-on-surface">
        <div className="border border-coral-accent bg-coral-accent/10 p-space-xl max-w-lg w-full text-center space-y-space-md">
          <span className="material-symbols-outlined text-coral-accent text-[48px] block">shield</span>
          <h2 className="font-headline text-headline-md uppercase font-bold text-coral-accent">{error}</h2>
          <p className="font-body-md text-on-surface-variant">
            Only users with ADMIN role can access the emission factors database. Sign in as admin@offset.io.
          </p>
        </div>
      </div>
    );
  }

  const categories = ['ALL', 'TRANSPORTATION', 'ENERGY', 'FOOD', 'CONSUMPTION', 'WASTE'];
  const filteredFactors = categoryFilter === 'ALL' ? factors : factors.filter((f) => f.category === categoryFilter);

  const confidenceColor = (level: string) => {
    if (level === 'HIGH') return 'text-primary';
    if (level === 'MEDIUM') return 'text-yellow-accent';
    return 'text-coral-accent';
  };

  return (
    <div className="flex flex-col w-full text-on-surface bg-surface-container-lowest">
      {/* Ticker Header */}
      <section className="w-full bg-surface-container-low border-b border-on-surface flex flex-col md:flex-row items-stretch justify-between text-on-surface select-none">
        <div className="px-space-md py-space-xs border-b md:border-b-0 md:border-r border-on-surface flex items-center space-x-space-sm bg-surface-container-lowest">
          <span className="w-2.5 h-2.5 bg-coral-accent animate-pulse"></span>
          <span className="font-label-caps-md text-label-caps-md uppercase tracking-wider text-on-surface font-bold">
            ADMIN REGISTRY // EMISSION FACTORS DATABASE
          </span>
        </div>
        <div className="px-space-md py-space-xs border-b md:border-b-0 md:border-r border-on-surface flex items-center flex-1 justify-center bg-surface-container-lowest">
          <span className="font-label-caps-md text-label-caps-md uppercase tracking-wide text-on-surface">
            {factors.length} ACTIVE EMISSION FACTORS • PRISMA DATABASE DRIVEN
          </span>
        </div>
        <div className="px-space-md py-space-xs flex items-center justify-between md:justify-end space-x-space-md bg-coral-accent text-white">
          <span className="font-label-caps-sm text-label-caps-sm uppercase tracking-widest font-bold">
            ADMIN ACCESS
          </span>
          <span className="material-symbols-outlined text-[16px]">shield</span>
        </div>
      </section>

      {/* Main Body */}
      <div className="p-space-lg md:p-space-xl space-y-space-lg">

        {/* Header */}
        <div className="border-b border-on-surface pb-space-sm flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="font-label-caps-sm uppercase text-coral-accent font-bold tracking-widest">
              SCIENTIFIC DATA MANAGEMENT
            </span>
            <h1 className="font-headline text-headline-xl uppercase font-bold tracking-tight mt-1">
              EMISSION FACTORS DATABASE MANAGER
            </h1>
            <p className="font-body-md text-on-surface-variant max-w-3xl mt-1">
              Admin-level control for empirical emission factors, scientific source citations, and regional multipliers. All factors cascade into the carbon calculation engine in real-time.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-space-lg py-space-sm bg-on-surface text-surface-container-lowest font-label-caps-md text-label-caps-md uppercase font-bold border border-on-surface hover:bg-primary transition-none flex items-center gap-space-xs whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>ADD EMISSION FACTOR</span>
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap items-center border border-on-surface w-fit gap-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-space-md py-space-xs font-label-caps-sm text-label-caps-sm uppercase font-bold border-r border-on-surface last:border-r-0 transition-none ${
                categoryFilter === cat
                  ? 'bg-on-surface text-surface-container-lowest'
                  : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container-high'
              }`}
            >
              {cat} {cat !== 'ALL' ? `(${factors.filter((f) => f.category === cat).length})` : `(${factors.length})`}
            </button>
          ))}
        </div>

        {/* Factors Table */}
        <div className="border border-on-surface overflow-hidden">
          <div className="border-b border-on-surface bg-surface-container-low p-space-sm flex items-center justify-between">
            <span className="font-label-caps-md text-label-caps-md uppercase font-bold text-on-surface">
              FACTOR REGISTRY ({filteredFactors.length} ENTRIES)
            </span>
            <span className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant font-bold">
              SOURCE: IPCC AR6 • DEFRA 2024 • EPA eGRID
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
          <div className="w-full max-w-lg border border-on-surface bg-surface-container-lowest">
            {/* Modal Header */}
            <div className="border-b border-on-surface bg-surface-container-low p-space-md flex items-center justify-between">
              <span className="font-label-caps-md text-label-caps-md uppercase font-bold text-on-surface">
                ADD DATABASE EMISSION FACTOR
              </span>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-on-surface hover:text-surface-container-lowest transition-none border border-on-surface"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleAddFactor} className="p-space-lg space-y-space-md">
              {/* Category */}
              <div className="border border-on-surface">
                <div className="border-b border-on-surface p-space-sm bg-surface-container-low">
                  <label className="font-label-caps-sm text-label-caps-sm uppercase font-bold text-on-surface-variant">CATEGORY</label>
                </div>
                <div className="grid grid-cols-3 gap-0">
                  {['TRANSPORTATION', 'ENERGY', 'FOOD', 'CONSUMPTION', 'WASTE'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`p-space-sm text-center border-r border-b border-on-surface font-label-caps-sm text-label-caps-sm uppercase font-bold transition-none ${
                        category === cat
                          ? 'bg-on-surface text-surface-container-lowest'
                          : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container-high'
                      }`}
                    >
                      {cat.slice(0, 6)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Activity & Subtype */}
              <div className="grid grid-cols-2 gap-space-sm">
                <div className="border border-on-surface">
                  <div className="border-b border-on-surface p-space-sm bg-surface-container-low">
                    <label className="font-label-caps-sm text-label-caps-sm uppercase font-bold text-on-surface-variant">ACTIVITY TYPE</label>
                  </div>
                  <input
                    type="text"
                    required
                    value={activity}
                    onChange={(e) => setActivity(e.target.value)}
                    placeholder="e.g. motorcycle"
                    className="w-full px-space-md py-space-sm bg-surface-container-lowest text-on-surface font-body-md focus:outline-none"
                  />
                </div>
                <div className="border border-on-surface">
                  <div className="border-b border-on-surface p-space-sm bg-surface-container-low">
                    <label className="font-label-caps-sm text-label-caps-sm uppercase font-bold text-on-surface-variant">SUBTYPE</label>
                  </div>
                  <input
                    type="text"
                    required
                    value={subtype}
                    onChange={(e) => setSubtype(e.target.value)}
                    placeholder="e.g. electric_scooter"
                    className="w-full px-space-md py-space-sm bg-surface-container-lowest text-on-surface font-body-md focus:outline-none"
                  />
                </div>
              </div>

              {/* Unit & Factor */}
              <div className="grid grid-cols-2 gap-space-sm">
                <div className="border border-on-surface">
                  <div className="border-b border-on-surface p-space-sm bg-surface-container-low">
                    <label className="font-label-caps-sm text-label-caps-sm uppercase font-bold text-on-surface-variant">UNIT</label>
                  </div>
                  <input
                    type="text"
                    required
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="km"
                    className="w-full px-space-md py-space-sm bg-surface-container-lowest text-on-surface font-body-md focus:outline-none"
                  />
                </div>
                <div className="border border-on-surface">
                  <div className="border-b border-on-surface p-space-sm bg-surface-container-low">
                    <label className="font-label-caps-sm text-label-caps-sm uppercase font-bold text-on-surface-variant">FACTOR (kg CO₂e/unit)</label>
                  </div>
                  <input
                    type="number"
                    step="0.001"
                    required
                    value={factorVal}
                    onChange={(e) => setFactorVal(Number(e.target.value))}
                    className="w-full px-space-md py-space-sm bg-surface-container-lowest text-on-surface font-body-md focus:outline-none"
                  />
                </div>
              </div>

              {/* Source */}
              <div className="border border-on-surface">
                <div className="border-b border-on-surface p-space-sm bg-surface-container-low">
                  <label className="font-label-caps-sm text-label-caps-sm uppercase font-bold text-on-surface-variant">SOURCE CITATION</label>
                </div>
                <input
                  type="text"
                  required
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="e.g. DEFRA 2024 Conversion Factors"
                  className="w-full px-space-md py-space-sm bg-surface-container-lowest text-on-surface font-body-md focus:outline-none"
                />
              </div>

              <div className="flex gap-space-sm pt-space-xs">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-space-sm border border-on-surface bg-surface-container text-on-surface font-label-caps-md uppercase font-bold hover:bg-surface-container-high transition-none"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="flex-1 py-space-sm bg-on-surface text-surface-container-lowest border border-on-surface font-label-caps-md uppercase font-bold hover:bg-primary transition-none"
                >
                  SAVE FACTOR →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
