const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

const supabase = createClient(
  'https://odenqixjgsrgehnyllfn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kZW5xaXhqZ3NyZ2VobnlsbGZuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzQxMTY1OSwiZXhwIjoyMDg4OTg3NjU5fQ.jSpt4Yhu3WtnQ1HS63fDY3HzR6WzExtTmVyDkdm0g-o'
)

async function explore() {
  const result = {}

  // Cursos activos
  const { data: cursos } = await supabase
    .from('cursos')
    .select('idCurso, nombreCurso, grado, jornada, activo')
    .eq('activo', true)
    .order('nombreCurso')
  result.cursos = cursos

  // Materias activas
  const { data: materias } = await supabase
    .from('materias')
    .select('idMateria, nombreMateria, activa')
    .eq('activa', true)
    .order('nombreMateria')
  result.materias = materias

  // Horarios existentes
  const { data: horarios } = await supabase
    .from('Horario')
    .select('idHorario, dia, horaInicio, horaFin, salon, idMateria, idCurso')
    .limit(20)
  result.horarios = horarios

  // Notas - verificar que existen y para qué materias/estudiantes
  const { data: notasSample } = await supabase
    .from('notas')
    .select('idNota, idEstudiante, idMateria, nota')
    .limit(10)
  result.notas_sample = notasSample

  // Notas agrupadas por materia
  const { data: allNotas } = await supabase
    .from('notas')
    .select('idMateria')
  const materiaCount = {}
  ;(allNotas || []).forEach(n => {
    materiaCount[n.idMateria] = (materiaCount[n.idMateria] || 0) + 1
  })
  result.notas_por_materia = materiaCount

  // Estudiantes - verificar cursos asignados
  const { data: estudiantes } = await supabase
    .from('estudiantes')
    .select('idEstudiante, idCursoActual, estado')
    .eq('estado', 'Activo')
    .limit(20)
  result.estudiantes_sample = estudiantes

  // Profesor Samuel Sierra
  const { data: prof } = await supabase
    .from('profesores')
    .select('idProfesor, idUsuario, especialidad')
    .eq('idUsuario', 57)
  result.profesor = prof

  // Asignaciones existentes de OTROS profesores (para ver el patrón)
  const { data: otrasAsig } = await supabase
    .from('asignaciones')
    .select('*')
    .limit(10)
  result.otras_asignaciones = otrasAsig

  // Estructura de la tabla asignaciones
  const { data: asigCols } = await supabase
    .from('asignaciones')
    .select('*')
    .limit(1)
  result.asignaciones_columns = asigCols ? Object.keys(asigCols[0] || {}) : 'empty'

  fs.writeFileSync('explore.json', JSON.stringify(result, null, 2), 'utf8')
  console.log('Done - check explore.json')
}

explore().catch(console.error)
