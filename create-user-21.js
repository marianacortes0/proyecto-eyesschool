/**
 * Crea en Supabase Auth el usuario con idUsuario = 21
 * Ejecutar: node create-user-21.js
 */
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envLines = fs.readFileSync('.env.local', 'utf8').split('\n');
const env = {};
for (const line of envLines) {
  const match = line.match(/^([^=]+?)\s*=\s*(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
}

const SUPABASE_URL = env['NEXT_PUBLIC_SUPABASE_URL'];
const SERVICE_ROLE_KEY = env['SUPABASE_SERVICE_ROLE_KEY'];

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function main() {
  // 1. Leer datos del usuario 21
  const { data: usuario, error: dbError } = await supabase
    .from('usuario')
    .select('idUsuario, correo, numeroDocumento, primerNombre, primerApellido, idRol')
    .eq('idUsuario', 21)
    .single();

  if (dbError || !usuario) {
    console.error('❌ No se encontró el usuario 21:', dbError?.message);
    process.exit(1);
  }

  console.log(`\n📋 Usuario encontrado: ${usuario.primerNombre} ${usuario.primerApellido}`);
  console.log(`   Correo: ${usuario.correo}`);
  console.log(`   Número de documento: ${usuario.numeroDocumento}`);
  console.log(`   idRol: ${usuario.idRol}\n`);

  // Usar número de documento como contraseña (con fallback por si es muy corto)
  const password = usuario.numeroDocumento && usuario.numeroDocumento.length >= 6
    ? usuario.numeroDocumento
    : usuario.numeroDocumento + '123';

  const { data, error: authError } = await supabase.auth.admin.createUser({
    email: usuario.correo,
    password: password,
    email_confirm: true,
    user_metadata: {
      idUsuario: usuario.idUsuario,
      idRol: usuario.idRol,
      nombre: `${usuario.primerNombre} ${usuario.primerApellido}`
    }
  });

  if (authError) {
    console.error('❌ Error creando usuario en Auth:', authError.message);
  } else {
    console.log('✅ Usuario creado exitosamente en Supabase Auth!');
    console.log(`\n📧 Correo:     ${usuario.correo}`);
    console.log(`🔑 Contraseña: ${password}  (= tu número de documento)`);
  }
}

main();
