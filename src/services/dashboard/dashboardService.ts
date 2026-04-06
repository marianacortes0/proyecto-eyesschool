import { createClient } from "../supabase/client";

// PROMEDIO
export const getPromedioGeneral = async () => {
  const supabase = createClient(); // 👈 CLAVE

  const { data, error } = await supabase
    .from("notas")
    .select("nota");

  if (error) throw error;
  if (!data) return 0;

  const promedio =
    data.reduce((acc: number, curr: any) => acc + curr.nota, 0) / data.length;

  return Number(promedio.toFixed(2));
};

// APROBACIÓN
export const getAprobacion = async () => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("notas")
    .select("nota");

  if (error) throw error;
  if (!data) return 0;

  const aprobados = data.filter((n: any) => n.nota >= 3);

  return Math.round((aprobados.length / data.length) * 100);
};

// ESTUDIANTES
export const getEstudiantesActivos = async () => {
  const supabase = createClient();

  const { count, error } = await supabase
    .from("estudiantes")
    .select("*", { count: "exact", head: true });

  if (error) throw error;

  return count;
};

// ASISTENCIA
export const getAsistenciaPromedio = async () => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("Asistencia")
    .select("estado");

  if (error) throw error;
  if (!data) return 0;

  const asistencias = data.filter((a: any) => a.asistio === true);

  return Math.round((asistencias.length / data.length) * 100);
};

// GRÁFICA
export const getNotasPorPeriodo = async () => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("notas")
    .select("periodo, nota");

  if (error) throw error;
  if (!data) return [];

  const grouped: any = {};

  data.forEach((item: any) => {
    if (!grouped[item.periodo]) {
      grouped[item.periodo] = [];
    }
    grouped[item.periodo].push(item.nota);
  });

  return Object.keys(grouped).map(periodo => {
    const notas = grouped[periodo];
    const promedio =
      notas.reduce((a: number, b: number) => a + b, 0) / notas.length;

    return {
      periodo,
      promedio: Number(promedio.toFixed(2)),
    };
  });
};