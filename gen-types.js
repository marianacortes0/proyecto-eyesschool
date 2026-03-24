const { execSync } = require('child_process');
const fs = require('fs');
try {
  const output = execSync('npx supabase gen types typescript --project-id odenqixjgsrgehnyllfn', { stdio: ['pipe', 'pipe', 'ignore'] }).toString('utf8');
  fs.writeFileSync('src/types/supabase.ts', output, 'utf8');
  console.log("Tipos generados con éxito.");
} catch (e) {
  console.error("Error:", e.message);
}
