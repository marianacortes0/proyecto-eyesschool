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
  /** Contenido extra (p. ej. gráficas) que se muestra debajo de los KPIs. */
  extra?: React.ReactNode;
};

const accentMap = {
  primary: { text: 'text-primary', bg: 'bg-primary-container', bar: 'bg-primary', stroke: '#630ed4' },
  teal: { text: 'text-electric-teal', bg: 'bg-electric-teal/10', bar: 'bg-electric-teal', stroke: '#2dd4bf' },
  purple: { text: 'text-neon-purple', bg: 'bg-neon-purple/10', bar: 'bg-neon-purple', stroke: '#a855f7' },
};

// Pista del gauge: neutra y legible tanto en claro como en oscuro.
const GAUGE_TRACK = 'rgba(120,130,150,.18)';

function RadialGauge({ percent, stroke, size = 64 }: { percent: number; stroke: string; size?: number }) {
  const p = Math.max(0, Math.min(100, percent));
  const r = size === 64 ? 26 : 22;
  const c = 2 * Math.PI * r;
  const mid = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <circle cx={mid} cy={mid} r={r} fill="none" stroke={GAUGE_TRACK} strokeWidth="6" />
      <circle
        cx={mid}
        cy={mid}
        r={r}
        fill="none"
        stroke={stroke}
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - p / 100)}
        transform={`rotate(-90 ${mid} ${mid})`}
        style={{ transition: 'stroke-dashoffset .9s cubic-bezier(.4,0,.2,1)' }}
      />
      <text x={mid} y={mid + 4} textAnchor="middle" className="fill-on-surface font-headline" fontSize="14" fontWeight="800">
        {Math.round(p)}
      </text>
    </svg>
  );
}

export default function MinimalDashboard({ greetingName, subtitle, primary, kpis, loading, error, extra }: MinimalDashboardProps) {
  return (
    <>
      <PanelHeader light="Hola," bold={greetingName} subtitle={subtitle} />

      {error && (
        <div className="mb-8 px-4 py-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* ── Métrica principal — firma "cuaderno escolar": rejilla rayada + glow ── */}
        <div className="lg:col-span-5 relative overflow-hidden minimal-card p-8 lg:p-10 rounded-super flex flex-col justify-between min-h-[240px]">
          {/* Textura de cuaderno (dark-aware vía .bg-graph-paper) */}
          <div className="bg-graph-paper absolute inset-0 opacity-60 pointer-events-none" aria-hidden />
          {/* Halo de acento */}
          <div
            className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-primary/15 blur-3xl pointer-events-none"
            aria-hidden
          />

          <div className="relative flex items-start justify-between">
            <p className="text-[10px] uppercase tracking-[0.22em] text-on-surface-variant font-bold max-w-[58%] leading-relaxed">
              {primary.label}
            </p>
            {primary.percent != null && <RadialGauge percent={primary.percent} stroke={accentMap.primary.stroke} />}
          </div>

          <div className="relative">
            <div className="text-6xl lg:text-7xl font-headline font-black text-primary leading-none tracking-tight">
              {loading ? '—' : primary.value}
            </div>
            {/* Medidor de periodo horizontal cuando hay porcentaje */}
            {primary.percent != null && (
              <div className="mt-5 h-1.5 w-full rounded-full bg-on-surface/5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out"
                  style={{ width: `${loading ? 0 : Math.max(0, Math.min(100, primary.percent))}%` }}
                />
              </div>
            )}
            <p className="text-sm text-on-surface-variant font-light mt-3">{primary.caption}</p>
          </div>
        </div>

        {/* ── Rejilla de KPIs ── */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
          {kpis.map((kpi) => {
            const a = accentMap[kpi.accent ?? 'primary'];
            return (
              <div
                key={kpi.label}
                className="group relative overflow-hidden minimal-card p-7 rounded-super flex flex-col justify-between"
              >
                {/* Barra de acento lateral — codifica la categoría del dato */}
                <span className={`absolute left-0 top-7 bottom-7 w-1 rounded-full ${a.bar} opacity-70`} aria-hidden />

                <div className="flex items-center justify-between mb-6 pl-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${a.bg} ${a.text}`}>
                    <span className="material-symbols-outlined fill !text-xl">{kpi.icon}</span>
                  </div>
                  {kpi.percent != null && <RadialGauge percent={kpi.percent} stroke={a.stroke} size={52} />}
                </div>
                <div className="pl-2">
                  <div className="text-3xl font-headline font-black leading-none text-on-surface">
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

      {!loading && extra}

      <footer className="mt-24 lg:mt-32 py-10 text-center">
        <p className="text-[10px] font-bold text-on-surface-variant/30 uppercase tracking-[0.4em]">
          © 2026 EyeSchool
        </p>
      </footer>
    </>
  );
}
