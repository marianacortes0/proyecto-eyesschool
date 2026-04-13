"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export const DashboardCharts = ({ data }: any) => {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-md">
      <h2 className="mb-4 font-semibold">Rendimiento por periodo</h2>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <XAxis dataKey="periodo" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="promedio" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};