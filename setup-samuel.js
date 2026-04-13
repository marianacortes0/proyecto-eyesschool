const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://odenqixjgsrgehnyllfn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kZW5xaXhqZ3NyZ2VobnlsbGZuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzQxMTY1OSwiZXhwIjoyMDg4OTg3NjU5fQ.jSpt4Yhu3WtnQ1HS63fDY3HzR6WzExtTmVyDkdm0g-o'
)

async function setup() {
  const ID_USUARIO_SAMUEL = 57

  // 1. Crear registro en la tabla profesores
  console.log('1. Creando registro en profesores...')
  const { data: profRow, error: errProf } = await supabase
    .from('profesores')
    .insert({
      idUsuario: ID_USUARIO_SAMUEL,
      especialidad: 'Matemáticas y Ciencias',
    })
    .select('idProfesor')
    .single()

  if (errProf) {
    console.error('Error creando profesor:', errProf.message)
    // Intentar buscar si ya existe
    const { data: existing } = await supabase
      .from('profesores')
      .select('idProfesor')
      .eq('idUsuario', ID_USUARIO_SAMUEL)
      .maybeSingle()
    if (existing) {
      console.log('El profesor ya existe con idProfesor:', existing.idProfesor)
      await continueSetup(existing.idProfesor)
      return
    }
    return
  }

  console.log('Profesor creado:', profRow)
  await continueSetup(profRow.idProfesor)
}

async function continueSetup(idProfesor) {
  // 2. Crear asignaciones (materias y cursos)
  // Materias: 1=Matemáticas, 2=Lengua, 3=Ciencias Naturales, 4=Ciencias Sociales, 5=Inglés
  // Cursos con notas existentes: verificar cuáles hay
  
  // Asignar Samuel a Matemáticas y Ciencias Naturales en varios cursos
  const asignaciones = [
    { idProfesor, idCurso: 1, idMateria: 1, activo: true },  // Matemáticas - Curso 1
    { idProfesor, idCurso: 2, idMateria: 1, activo: true },  // Matemáticas - Curso 2
    { idProfesor, idCurso: 3, idMateria: 1, activo: true },  // Matemáticas - Curso 3
    { idProfesor, idCurso: 1, idMateria: 3, activo: true },  // Ciencias Naturales - Curso 1
    { idProfesor, idCurso: 2, idMateria: 3, activo: true },  // Ciencias Naturales - Curso 2
  ]

  console.log('\n2. Creando asignaciones...')
  const { data: asigData, error: errAsig } = await supabase
    .from('asignaciones')
    .insert(asignaciones)
    .select()

  if (errAsig) {
    console.error('Error creando asignaciones:', errAsig.message)
  } else {
    console.log('Asignaciones creadas:', asigData.length)
  }

  // 3. Crear horarios y vincular
  console.log('\n3. Creando horarios...')
  
  // Obtener día actual
  const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  const hoy = dias[new Date().getDay()]
  
  const horarios = [
    { dia: hoy, horaInicio: '07:00:00', horaFin: '08:00:00', salon: '101', idMateria: 1, idCurso: 1 },
    { dia: hoy, horaInicio: '08:00:00', horaFin: '09:00:00', salon: '102', idMateria: 3, idCurso: 2 },
    { dia: 'Martes', horaInicio: '07:00:00', horaFin: '08:00:00', salon: '101', idMateria: 1, idCurso: 2 },
    { dia: 'Miércoles', horaInicio: '09:00:00', horaFin: '10:00:00', salon: '103', idMateria: 3, idCurso: 1 },
  ]

  const { data: horarioData, error: errHorario } = await supabase
    .from('Horario')
    .insert(horarios)
    .select('idHorario')

  if (errHorario) {
    console.error('Error creando horarios:', errHorario.message)
  } else {
    console.log('Horarios creados:', horarioData.length)

    // 4. Vincular profesor con horarios
    console.log('\n4. Vinculando profesor con horarios...')
    const profHorarios = horarioData.map(h => ({
      idProfesor,
      idHorario: h.idHorario,
      activo: true,
    }))

    const { error: errPH } = await supabase
      .from('profesores_horario')
      .insert(profHorarios)

    if (errPH) {
      console.error('Error vinculando horarios:', errPH.message)
    } else {
      console.log('Profesor vinculado a', profHorarios.length, 'horarios')
    }
  }

  // 5. Verificación final
  console.log('\n=== VERIFICACIÓN ===')
  const { data: asigCheck } = await supabase
    .from('asignaciones')
    .select('idCurso, idMateria, activo')
    .eq('idProfesor', idProfesor)
  console.log('Asignaciones del profesor:', JSON.stringify(asigCheck))

  const { data: phCheck } = await supabase
    .from('profesores_horario')
    .select('idHorario, activo')
    .eq('idProfesor', idProfesor)
  console.log('Horarios del profesor:', JSON.stringify(phCheck))

  console.log('\n✅ Setup completado para Samuel Sierra (idProfesor:', idProfesor, ')')
}

setup().catch(console.error)
