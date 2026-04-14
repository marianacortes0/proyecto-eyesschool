import { useEffect, useState } from "react";
import {
  getPromedioGeneralAction,
  getAprobacionAction,
  getEstudiantesActivosAction,
  getAsistenciaPromedioAction,
  getNotasPorPeriodoAction,
  getDistribucionUsuariosAction,
} from "@/services/dashboard/dashboardActions";


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
      const [
        promedio,
        aprobacion,
        estudiantes,
        asistencia,
        chartData,
        distribucion,
      ] = await Promise.all([
        getPromedioGeneralAction(),
        getAprobacionAction(),
        getEstudiantesActivosAction(),
        getAsistenciaPromedioAction(),
        getNotasPorPeriodoAction(),
        getDistribucionUsuariosAction(),
      ]);

      setStats({
        promedio,
        aprobacion,
        estudiantes: estudiantes ?? 0,
        asistencia,
      });

      setCharts(chartData);
      setDistribucionUsuarios(distribucion);
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