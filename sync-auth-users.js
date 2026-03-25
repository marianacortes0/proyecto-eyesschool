/**
 * Script para sincronizar usuarios de la tabla `usuario` con Supabase Auth.
 * 
 * ANTES de ejecutar:
 *   1. Agrega en .env.local: SUPABASE_SERVICE_ROLE_KEY=tu_clave_aqui
 *   2. Asegúrate de tener @supabase/supabase-js instalado (ya está en el proyecto)
 * 
 * EJECUTAR CON:
 *   node sync-auth-users.js
 */

const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Leer .env.local manualmente para manejar espacios alrededor del =
const envLines = fs.readFileSync('.env.local', 'utf8').split('\n');
const env = {};
for (const line of envLines) {
  const match = line.match(/^([^=]+?)\s*=\s*(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
}

const SUPABASE_URL = env['NEXT_PUBLIC_SUPABASE_URL'];
const SERVICE_ROLE_KEY = env['SUPABASE_SERVICE_ROLE_KEY'];

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Falta NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local');
  console.error('Variables encontradas:', Object.keys(env).join(', '));
  process.exit(1);
}

// Cliente con service_role (puede crear/administrar usuarios sin restricciones)
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function syncUsers() {
  console.log('🔄 Leyendo usuarios de la tabla `usuario`...\n');

  // Leer todos los usuarios que tienen correo y password
  const { data: usuarios, error } = await supabase
    .from('usuario')
    .select('idUsuario, correo, password, primerNombre, primerApellido, idRol')
    .not('correo', 'is', null)
    .not('password', 'is', null);

  if (error) {
    console.error('❌ Error leyendo la tabla usuario:', error.message);
    process.exit(1);
  }

  console.log(`✅ Se encontraron ${usuarios.length} usuarios con correo y contraseña.\n`);

  let creados = 0;
  let omitidos = 0;
  let errores = 0;

  for (const u of usuarios) {
    if (!u.correo || !u.password) {
      console.log(`⚠️  Omitiendo idUsuario=${u.idUsuario} (sin correo o contraseña)`);
      omitidos++;
      continue;
    }

    // Intentar crear el usuario en Supabase Auth
    const { data, error: authError } = await supabase.auth.admin.createUser({
      email: u.correo.trim(),
      password: u.password.trim(),
      email_confirm: true,           // Confirmar email automáticamente (sin verificación)
      user_metadata: {
        nombre: `${u.primerNombre} ${u.primerApellido}`,
        idRol: u.idRol,
        idUsuario: u.idUsuario,
      }
    });

    if (authError) {
      if (authError.message?.includes('already been registered') || authError.message?.includes('already exists')) {
        console.log(`⏭️  ${u.correo} → ya existe en Auth, omitido.`);
        omitidos++;
      } else {
        console.error(`❌ Error creando ${u.correo}: ${authError.message}`);
        errores++;
      }
    } else {
      console.log(`✅ ${u.correo} → creado correctamente en Supabase Auth`);
      creados++;
    }
  }

  console.log('\n─────────────────────────────────────');
  console.log(`✅ Creados:  ${creados}`);
  console.log(`⏭️  Omitidos: ${omitidos}`);
  console.log(`❌ Errores:  ${errores}`);
  console.log('─────────────────────────────────────');
  console.log('\n✨ Sincronización completada. Ya puedes iniciar sesión en el sistema.');
}

syncUsers();
