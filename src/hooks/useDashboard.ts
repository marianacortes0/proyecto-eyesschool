import { createClient } from "../services/supabase/client";
import { useEffect, useState } from "react";
import {
  getPromedioGeneral,
  getAprobacion,
  getEstudiantesActivos,
  getAsistenciaPromedio,
  getNotasPorPeriodo,
} from "@/services/dashboard/dashboardService";


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

useEffect(() => {
 
  const fetchData = async () => {
    try {
      const [
        promedio,
        aprobacion,
        estudiantes,
        asistencia,
        chartData,
      ] = await Promise.all([
        getPromedioGeneral(),
        getAprobacion(),
        getEstudiantesActivos(),
        getAsistenciaPromedio(),
        getNotasPorPeriodo(),
      ]);

      setStats({
        promedio,
        aprobacion,
        estudiantes: estudiantes ?? 0,
        asistencia,
      });

      setCharts(chartData);
    } catch (error) {
      console.error("ERROR DASHBOARD:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);

  return { stats, charts, loading };
};