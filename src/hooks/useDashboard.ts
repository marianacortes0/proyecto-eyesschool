import { useEffect, useState } from "react";
import { getAdminDashboardAction } from "@/services/dashboard/dashboardActions";

type ChartData = {
  periodo: string;
  promedio: number;
};

export const useDashboard = () => {
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    promedio: 0,
    aprobacion: 0,
    estudiantes: 0,
    asistencia: 0,
  });

  const [charts, setCharts] = useState<ChartData[]>([]);
  const [distribucionUsuarios, setDistribucionUsuarios] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const d = await getAdminDashboardAction();
        setStats({
          promedio:    d?.promedioGeneral    ?? 0,
          aprobacion:  d?.tasaAprobacion     ?? 0,
          estudiantes: d?.totalEstudiantes   ?? 0,
          asistencia:  d?.porcentajeAsistencia ?? 0,
        });
        setCharts([]);
        setDistribucionUsuarios([]);
      } catch (error) {
        console.error("ERROR DASHBOARD:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { stats, charts, distribucionUsuarios, loading };
};