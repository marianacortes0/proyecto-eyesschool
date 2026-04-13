const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://odenqixjgsrgehnyllfn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kZW5xaXhqZ3NyZ2VobnlsbGZuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzQxMTY1OSwiZXhwIjoyMDg4OTg3NjU5fQ.jSpt4Yhu3WtnQ1HS63fDY3HzR6WzExtTmVyDkdm0g-o'
)

async function checkProfesores() {
  const { data: profs, error: pErr } = await supabase
    .from('profesores')
    .select('*, usuario(*)')
  
  if (pErr) {
    console.error('Error fetching profesores:', pErr)
    return
  }

  console.log('Total profesores in table:', profs.length)
  profs.forEach(p => {
    console.log(`- ID: ${p.idProfesor}, ID Usuario: ${p.idUsuario}, Nombre: ${p.usuario ? p.usuario.primerNombre + ' ' + p.usuario.primerApellido : 'NO USUARIO'}`)
  })
}

checkProfesores().catch(console.error)
