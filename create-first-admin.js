/**
 * Script para crear el primer administrador después de limpiar la base de datos.
 *
 * PASOS PREVIOS:
 *   1. Asegúrate de tener .env.local con NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY
 *   2. Edita la sección "CONFIGURA TU ADMIN AQUÍ" con tus datos
 *
 * EJECUTAR CON:
 *   node create-first-admin.js
 */

const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

// ─── Leer .env.local ────────────────────────────────────────────────────────
const envLines = fs.readFileSync('.env.local', 'utf8').split('\n');
const env = {};
for (const line of envLines) {
  const match = line.match(/^([^=]+?)\s*=\s*(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
}

const SUPABASE_URL      = env['NEXT_PUBLIC_SUPABASE_URL'];
const SERVICE_ROLE_KEY  = env['SUPABASE_SERVICE_ROLE_KEY'];

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Falta NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ─── CONFIGURA TU ADMIN AQUÍ ────────────────────────────────────────────────
const ADMIN = {
  primerNombre:    'Admin',
  primerApellido:  'Principal',
  segundoNombre:   null,
  segundoApellido: null,
  correo:          'admin@eyesschool.com',   // <-- cambia esto
  password:        'Admin1234!',             // <-- cambia esto (mín. 6 caracteres)
  numeroDocumento: '1234567890',
  tipoDocumento:   'CC',
  genero:          'M',
  telefono:        null,
  direccion:       null,
  // Datos del administrador
  cargo:           'Administrador General',
  nivelAcceso:     'total',
};
// ────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n== Creando primer administrador ==\n');

  // 1. Insertar roles base (idRol fijo según la app: 1=Docente, 2=Estudiante, 3=Admin, 4=Padre)
  console.log('1/4  Insertando roles base...');
  const roles = [
    { idRol: 1, nombreRol: 'Docente' },
    { idRol: 2, nombreRol: 'Estudiante' },
    { idRol: 3, nombreRol: 'Admin' },
    { idRol: 4, nombreRol: 'Padre' },
  ];
  const { error: rolesError } = await supabase
    .from('roles')
    .upsert(roles, { onConflict: 'idRol' });

  if (rolesError) {
    console.error('   Error insertando roles:', rolesError.message);
    process.exit(1);
  }
  console.log('   Roles insertados correctamente.');

  // 2. Crear usuario en Supabase Auth
  console.log('\n2/4  Creando usuario en Supabase Auth...');
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email:         ADMIN.correo,
    password:      ADMIN.password,
    email_confirm: true,
    user_metadata: {
      nombre:  `${ADMIN.primerNombre} ${ADMIN.primerApellido}`,
      idRol:   3,
    },
  });

  if (authError) {
    console.error('   Error creando usuario en Auth:', authError.message);
    process.exit(1);
  }

  const authId = authData.user.id;
  console.log(`   Usuario Auth creado. UUID: ${authId}`);

  // Hashing password for public.usuario
  const hashedPassword = await bcrypt.hash(ADMIN.password, 10);

  // 3. Insertar en tabla usuario
  console.log('\n3/4  Insertando en tabla usuario...');
  const { data: usuarioData, error: usuarioError } = await supabase
    .from('usuario')
    .insert({
      primerNombre:    ADMIN.primerNombre,
      primerApellido:  ADMIN.primerApellido,
      segundoNombre:   ADMIN.segundoNombre,
      segundoApellido: ADMIN.segundoApellido,
      correo:          ADMIN.correo,
      password:        hashedPassword,
      numeroDocumento: ADMIN.numeroDocumento,
      tipoDocumento:   ADMIN.tipoDocumento,
      genero:          ADMIN.genero,
      telefono:        ADMIN.telefono,
      direccion:       ADMIN.direccion,
      idRol:           3,
      estado:          true,
      auth_id:         authId,
      idUsuario_uuid:  authId,
    })
    .select('idUsuario')
    .single();

  if (usuarioError) {
    console.error('   Error insertando en tabla usuario:', usuarioError.message);
    // Limpiar usuario auth creado para no dejar huérfanos
    await supabase.auth.admin.deleteUser(authId);
    console.log('   Usuario Auth eliminado (rollback).');
    process.exit(1);
  }

  const idUsuario = usuarioData.idUsuario;
  console.log(`   Usuario insertado. idUsuario: ${idUsuario}`);

  // 4. Insertar en tabla administrador
  console.log('\n4/4  Insertando en tabla administrador...');
  const { error: adminError } = await supabase
    .from('administrador')
    .insert({
      idUsuario:       idUsuario,
      cargo:           ADMIN.cargo,
      nivelAcceso:     ADMIN.nivelAcceso,
      estado:          'activo',
      fechaAsignacion: new Date().toISOString().split('T')[0],
    });

  if (adminError) {
    console.error('   Error insertando en tabla administrador:', adminError.message);
    process.exit(1);
  }
  console.log('   Registro de administrador creado.');

  // Resultado final
  console.log('\n========================================');
  console.log('Administrador creado exitosamente!');
  console.log('========================================');
  console.log(`  Correo:      ${ADMIN.correo}`);
  console.log(`  Contrasena:  ${ADMIN.password}`);
  console.log(`  idUsuario:   ${idUsuario}`);
  console.log(`  Auth UUID:   ${authId}`);
  console.log('========================================\n');
  console.log('Ahora puedes iniciar sesion en /login con esas credenciales.\n');
}

main().catch((err) => {
  console.error('Error inesperado:', err);
  process.exit(1);
});
