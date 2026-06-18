'use client';

import PanelHeader from './PanelHeader';

export type DashboardKpi = {
  label: string;
  value: string;
  caption?: string;
  icon: string;
  accent?: 'primary' | 'teal' | 'purple';
  /** When set (0–100), renders a radial gauge from the real percentage. */
  percent?: number;
};

export type MinimalDashboardProps = {
  greetingName: string;
  subtitle: string;
  primary: { label: string; value: string; caption: string; percent?: number };
  kpis: DashboardKpi[];
  loading?: boolean;
  error?: string | null;
};

const accentMap = {
  primary: { text: 'text-primary', bg: 'bg-primary-container', stroke: '#630ed4' },
  teal: { text: 'text-electric-teal', bg: 'bg-electric-teal/10', stroke: '#2dd4bf' },
  purple: { text: 'text-neon-purple', bg: 'bg-neon-purple/10', stroke: '#a855f7' },
};

function RadialGauge({ percent, stroke }: { percent: number; stroke: string }) {
  const p = Math.max(0, Math.min(100, percent));
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" className="shrink-0">
      <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="6" />
      <circle
        cx="32"
        cy="32"
        r={r}
        fill="none"
        stroke={stroke}
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - p / 100)}
        transform="rotate(-90 32 32)"
      />
      <text x="32" y="36" textAnchor="middle" className="fill-on-surface font-headline" fontSize="14" fontWeight="800">
        {Math.round(p)}
      </text>
    </svg>
  );
}

export default function MinimalDashboard({ greetingName, subtitle, primary, kpis, loading, error }: MinimalDashboardProps) {
  return (
    <>
      <PanelHeader light="Hola," bold={greetingName} subtitle={subtitle} />

      {error && (
        <div className="mb-8 px-4 py-3 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Primary metric */}
        <div className="lg:col-span-5 minimal-card p-8 lg:p-10 rounded-super flex flex-col justify-between min-h-[220px]">
          <div className="flex items-start justify-between">
            <p className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold max-w-[60%] leading-relaxed">
              {primary.label}
            </p>
            {primary.percent != null && <RadialGauge percent={primary.percent} stroke={accentMap.primary.stroke} />}
          </div>
          <div>
            <div className="text-6xl font-headline font-black text-primary leading-none">
              {loading ? '—' : primary.value}
            </div>
            <p className="text-sm text-on-surface-variant font-light mt-3">{primary.caption}</p>
          </div>
        </div>

        {/* KPI grid */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
          {kpis.map((kpi) => {
            const a = accentMap[kpi.accent ?? 'primary'];
            return (
              <div key={kpi.label} className="minimal-card p-7 rounded-super flex flex-col justify-between">
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${a.bg} ${a.text}`}>
                    <span className="material-symbols-outlined fill !text-xl">{kpi.icon}</span>
                  </div>
                  {kpi.percent != null && <RadialGauge percent={kpi.percent} stroke={a.stroke} />}
                </div>
                <div>
                  <div className="text-3xl font-headline font-black leading-none">
                    {loading ? '—' : kpi.value}
                  </div>
                  <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mt-2">
                    {kpi.label}
                  </p>
                  {kpi.caption && <p className="text-xs text-on-surface-variant/70 font-light mt-1">{kpi.caption}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <footer className="mt-24 lg:mt-32 py-10 text-center">
        <p className="text-[10px] font-bold text-on-surface-variant/30 uppercase tracking-[0.4em]">
          © 2026 EyeSchool
        </p>
      </footer>
    </>
  );
}
