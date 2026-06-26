import { useEffect, useState } from "react";
import { getAdminDashboardAction } from "@/services/dashboard/dashboardActions";

export type EstudiantesPorCursoPoint = { curso: string; estudiantes: number };
export type PromedioPorMateriaPoint = { materia: string; promedio: number };
export type RolPoint = { name: string; value: number };

export const useDashboard = () => {
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    promedio: 0,
    aprobacion: 0,
    estudiantes: 0,
    asistencia: 0,
    profesores: 0,
    cursos: 0,
    novedades: 0,
  });

  const [estudiantesPorCurso, setEstudiantesPorCurso] = useState<EstudiantesPorCursoPoint[]>([]);
  const [usuariosPorRol, setUsuariosPorRol] = useState<RolPoint[]>([]);
  const [promedioPorMateria, setPromedioPorMateria] = useState<PromedioPorMateriaPoint[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const d = await getAdminDashboardAction();
        setStats({
          promedio:    d?.promedioGeneral    ?? 0,
          aprobacion:  d?.tasaAprobacion     ?? 0,
          estudiantes: d?.totalEstudiantes   ?? 0,
          asistencia:  d?.porcentajeAsistencia ?? 0,
          profesores:  d?.totalProfesores    ?? 0,
          cursos:      d?.totalCursos        ?? 0,
          novedades:   d?.totalNovedadesActivas ?? 0,
        });
        setEstudiantesPorCurso(d?.estudiantesPorCurso ?? []);
        setUsuariosPorRol(d?.usuariosPorRol ?? []);
        setPromedioPorMateria(d?.promedioPorMateria ?? []);
      } catch (error) {
        console.error("ERROR DASHBOARD:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { stats, estudiantesPorCurso, usuariosPorRol, promedioPorMateria, loading };
};
