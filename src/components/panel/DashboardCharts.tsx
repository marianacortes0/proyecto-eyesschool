'use client';

import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import type {
  EstudiantesPorCursoPoint,
  PromedioPorMateriaPoint,
  RolPoint,
} from '@/hooks/useDashboard';

const PALETTE = ['#630ed4', '#2dd4bf', '#a855f7', '#f59e0b', '#ef4444', '#3b82f6', '#10b981', '#ec4899'];
const AXIS = 'rgba(120,130,150,.65)';
const GRID = 'rgba(120,130,150,.16)';

const tooltipStyle = {
  background: 'rgba(20,22,34,.92)',
  border: '1px solid rgba(120,130,150,.25)',
  borderRadius: 12,
  color: '#fff',
  fontSize: 12,
} as const;

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="minimal-card rounded-super p-6 lg:p-7">
      <div className="mb-4">
        <h3 className="text-sm font-black text-on-surface tracking-tight">{title}</h3>
        <p className="text-[11px] text-on-surface-variant/70 font-light">{subtitle}</p>
      </div>
      <div className="h-64 w-full">{children}</div>
    </div>
  );
}

function Vacio({ msg }: { msg: string }) {
  return (
    <div className="h-full w-full flex items-center justify-center text-xs text-on-surface-variant/60">
      {msg}
    </div>
  );
}

type Props = {
  estudiantesPorCurso: EstudiantesPorCursoPoint[];
  usuariosPorRol: RolPoint[];
  promedioPorMateria: PromedioPorMateriaPoint[];
};

export default function DashboardCharts({ estudiantesPorCurso, usuariosPorRol, promedioPorMateria }: Props) {
  return (
    <div className="mt-8 lg:mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">

      {/* Estudiantes por curso */}
      <ChartCard title="Estudiantes por curso" subtitle="Matrícula por grupo">
        {estudiantesPorCurso.length === 0 ? (
          <Vacio msg="Sin estudiantes registrados" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={estudiantesPorCurso} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
              <XAxis dataKey="curso" tick={{ fill: AXIS, fontSize: 11 }} tickLine={false} axisLine={{ stroke: GRID }} />
              <YAxis allowDecimals={false} tick={{ fill: AXIS, fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: 'rgba(120,130,150,.08)' }} contentStyle={tooltipStyle} />
              <Bar dataKey="estudiantes" name="Estudiantes" radius={[6, 6, 0, 0]}>
                {estudiantesPorCurso.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      {/* Usuarios por rol */}
      <ChartCard title="Usuarios por rol" subtitle="Distribución de la comunidad">
        {usuariosPorRol.length === 0 ? (
          <Vacio msg="Sin usuarios" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={usuariosPorRol}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={84}
                paddingAngle={2}
                label={(e: { name?: string; value?: number }) => `${e.name}: ${e.value}`}
                labelLine={false}
              >
                {usuariosPorRol.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      {/* Promedio por materia */}
      <div className="lg:col-span-2">
        <ChartCard title="Promedio por materia" subtitle="Nota media de 0 a 5">
          {promedioPorMateria.length === 0 ? (
            <Vacio msg="Sin notas registradas" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={promedioPorMateria} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
                <XAxis dataKey="materia" tick={{ fill: AXIS, fontSize: 11 }} tickLine={false} axisLine={{ stroke: GRID }} interval={0} angle={-12} textAnchor="end" height={50} />
                <YAxis domain={[0, 5]} tick={{ fill: AXIS, fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'rgba(120,130,150,.08)' }} contentStyle={tooltipStyle} />
                <Bar dataKey="promedio" name="Promedio" radius={[6, 6, 0, 0]} fill="#630ed4" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

    </div>
  );
}
