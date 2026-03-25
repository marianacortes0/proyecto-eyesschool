/**
 * Prueba de creación con email nuevo para diagnosticar error de base de datos.
 */
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envLines = fs.readFileSync('.env.local', 'utf8').split('\n');
const env = {};
for (const line of envLines) {
  const match = line.match(/^([^=]+?)\s*=\s*(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
}

const supabase = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['SUPABASE_SERVICE_ROLE_KEY']);

async function test() {
  const testEmail = `test_${Date.now()}@example.com`;
  console.log(`\n🧪 Probando creación con: ${testEmail}`);

  const { data, error } = await supabase.auth.admin.createUser({
    email: testEmail,
    password: 'password123',
    email_confirm: true
  });

  if (error) {
    console.error('❌ Falló de nuevo:', error.message);
  } else {
    console.log('✅ ¡ÉXITO! El problema era el conflicto con el email o ID existente.');
    // Borrar usuario de prueba
    await supabase.auth.admin.deleteUser(data.user.id);
  }
}

test();
