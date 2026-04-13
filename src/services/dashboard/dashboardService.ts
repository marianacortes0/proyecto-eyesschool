import { createClient } from "../supabase/client";

// PROMEDIO
export const getPromedioGeneral = async () => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("notas")
    .select("nota");

  console.log("[notas]", { data, error });

  if (error) throw error;
  if (!data || data.length === 0) return 0;

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
  if (!data || data.length === 0) return 0;

  const aprobados = data.filter((n: any) => n.nota >= 3);

  return Math.round((aprobados.length / data.length) * 100);
};

// ESTUDIANTES
export const getEstudiantesActivos = async () => {
  const supabase = createClient();

  // El RLS o la falta de un campo count a veces causa problemas si no está soportado así,
  // pero mantendremos este query porque parece válido para supabase.
  const { count, error } = await supabase
    .from("estudiantes")
    .select("*", { count: "exact", head: true });

  console.log("[estudiantes]", { count, error })

  if (error) throw error;

  return count ?? 0; //
};

// ASISTENCIA
export const getAsistenciaPromedio = async () => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("Asistencia") //
    .select("estado"); //

  if (error) throw error;
  if (!data || data.length === 0) return 0;

  // 🔴 CAMBIO: lógica según tus valores reales
  const asistencias = data.filter(
    (a: any) => a.estado === "Presente" || a.estado === "Tarde"
  );

  return Math.round((asistencias.length / data.length) * 100);
};

// GRÁFICA
export const getNotasPorPeriodo = async () => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("notas")
    .select("idPeriodo, nota"); //

  if (error) throw error;
  if (!data || data.length === 0) return [];

  const grouped: Record<number, number[]> = {}; //

  data.forEach((item: any) => {
    if (!grouped[item.idPeriodo]) {
      grouped[item.idPeriodo] = [];
    }
    grouped[item.idPeriodo].push(item.nota);
  });

  return Object.keys(grouped).map((periodo) => {
    const notas = grouped[Number(periodo)];

    const promedio =
      notas.reduce((a: number, b: number) => a + Number(b), 0) / notas.length;

    return {
      periodo, // puedes luego mostrar "Periodo 1", etc.
      promedio: Number(promedio.toFixed(2)),
    };
  });
};