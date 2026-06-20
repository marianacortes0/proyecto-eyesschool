'use client';

import { useActionState, useEffect, useMemo, useState, type CSSProperties } from 'react';
import { register, getCursos, getEspecializaciones } from '@/auth/actions';

type Curso = { idCurso: number; nombreCurso: string; grado: string; jornada: string };
type Especializacion = { idEspecializacion: number; nombreEspecializacion: string };

// ── Estilos portados 1:1 del card de login synthwave (eyeschoolMarkup) ──
const NEON = '#4df0c8';
const label: CSSProperties = {
  display: 'block', fontSize: 10, letterSpacing: 1.5,
  fontFamily: "'Orbitron',sans-serif", color: '#8f7fc0', margin: '0 0 6px',
};
const field: CSSProperties = {
  width: '100%', boxSizing: 'border-box', padding: '10px 13px', borderRadius: 10,
  border: '1.5px solid rgba(130,100,220,.35)', background: 'rgba(12,7,30,.6)',
  color: '#fff', fontSize: 13, fontFamily: "'Space Grotesk',sans-serif", outline: 'none',
};

/** Registro en la propia landing, con el mismo diseño que el login. */
export default function SignupModal({
  open,
  onClose,
  onSwitchToLogin,
}: {
  open: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}) {
  const [state, formAction, pending] = useActionState(register, null);
  const [roleId, setRoleId] = useState('');
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [especializaciones, setEspecializaciones] = useState<Especializacion[]>([]);
  const [loadingOpts, setLoadingOpts] = useState(false);
  const [jornada, setJornada] = useState('');
  const [grado, setGrado] = useState('');

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Cargar opciones al elegir rol (evento del usuario, no efecto de render).
  const handleRole = (val: string) => {
    setRoleId(val);
    setJornada('');
    setGrado('');
    setCursos([]);
    setEspecializaciones([]);
    if (val === '2') {
      setLoadingOpts(true);
      getCursos().then(setCursos).finally(() => setLoadingOpts(false));
    } else if (val === '1') {
      setLoadingOpts(true);
      getEspecializaciones().then(setEspecializaciones).finally(() => setLoadingOpts(false));
    }
  };

  const jornadas = useMemo(() => [...new Set(cursos.map(c => c.jornada))].sort(), [cursos]);
  const grados = useMemo(
    () => (jornada ? [...new Set(cursos.filter(c => c.jornada === jornada).map(c => c.grado))].sort() : []),
    [jornada, cursos],
  );
  const cursosFiltrados = useMemo(
    () => (jornada && grado ? cursos.filter(c => c.jornada === jornada && c.grado === grado) : []),
    [jornada, grado, cursos],
  );

  return (
    <div
      aria-hidden={!open}
      style={{
        position: 'fixed', inset: 0, zIndex: 60, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Space Grotesk',sans-serif",
        opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none',
        transition: 'opacity .35s ease',
      }}
    >
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(8,5,22,.72)', backdropFilter: 'blur(9px)', cursor: 'pointer' }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Crear cuenta"
        style={{
          position: 'relative', zIndex: 1, width: 'min(360px,92%)', maxHeight: '88vh', overflowY: 'auto',
          borderRadius: 20, padding: '28px 28px 26px',
          background: 'linear-gradient(165deg, rgba(40,28,80,.96), rgba(20,13,46,.97))',
          border: '1.5px solid rgba(130,100,220,.4)',
          boxShadow: '0 26px 80px rgba(0,0,0,.55),0 0 46px rgba(120,90,220,.22)',
          transform: open ? 'scale(1) translateY(0)' : 'scale(.92) translateY(10px)',
          transition: 'transform .35s cubic-bezier(.4,0,.2,1)',
        }}
      >
        <button
          onClick={onClose}
          aria-label="Cerrar"
          style={{
            position: 'absolute', top: 13, right: 14, width: 27, height: 27, borderRadius: '50%',
            border: '1px solid rgba(255,255,255,.22)', background: 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#cbb8f0', cursor: 'pointer', fontSize: 12,
          }}
        >✕</button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 16 }}>
          <span style={{ fontFamily: "'Orbitron',sans-serif", fontWeight: 700, fontSize: 16, letterSpacing: 1, color: '#fff', textShadow: `0 0 12px ${NEON}` }}>
            EYESCHOOL
          </span>
        </div>

        <h2 style={{ margin: '0 0 3px', fontFamily: "'Orbitron',sans-serif", fontWeight: 600, fontSize: 17, color: '#fff', letterSpacing: .5 }}>
          Crea tu cuenta
        </h2>
        <p style={{ margin: '0 0 18px', fontSize: 12, color: '#a99bd0' }}>Únete a EyeSchool en un minuto.</p>

        <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={label}>NOMBRE</label>
              <input name="firstName" required placeholder="Tu nombre" style={field} />
            </div>
            <div>
              <label style={label}>APELLIDO</label>
              <input name="lastName" required placeholder="Tu apellido" style={field} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 10 }}>
            <div>
              <label style={label}>DOC.</label>
              <select name="docType" required defaultValue="CC" style={{ ...field, cursor: 'pointer' }}>
                <option value="CC">CC</option>
                <option value="TI">TI</option>
                <option value="CE">CE</option>
                <option value="PP">PP</option>
              </select>
            </div>
            <div>
              <label style={label}>N° DOCUMENTO</label>
              <input name="docNumber" required placeholder="Número" style={field} />
            </div>
          </div>

          <div>
            <label style={label}>¿QUIÉN ERES?</label>
            <select
              name="roleId" required value={roleId}
              onChange={e => handleRole(e.target.value)}
              style={{ ...field, cursor: 'pointer' }}
            >
              <option value="" disabled>Selecciona tu rol</option>
              <option value="2">Estudiante</option>
              <option value="4">Padre / Acudiente</option>
              <option value="1">Profesor / Administrativo</option>
            </select>
          </div>

          {roleId === '2' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <select required disabled={loadingOpts} value={jornada}
                  onChange={e => { setJornada(e.target.value); setGrado(''); }}
                  style={{ ...field, cursor: 'pointer' }}>
                  <option value="" disabled>{loadingOpts ? 'Cargando…' : 'Jornada'}</option>
                  {jornadas.map(j => <option key={j} value={j}>{j}</option>)}
                </select>
                <select required disabled={!jornada} value={grado}
                  onChange={e => setGrado(e.target.value)}
                  style={{ ...field, cursor: 'pointer', opacity: jornada ? 1 : .4 }}>
                  <option value="" disabled>Grado</option>
                  {grados.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <select name="courseId" required disabled={!grado} defaultValue=""
                style={{ ...field, cursor: 'pointer', opacity: grado ? 1 : .4 }}>
                <option value="" disabled>{!grado ? 'Selecciona jornada y grado' : 'Selecciona tu curso'}</option>
                {cursosFiltrados.map(c => <option key={c.idCurso} value={c.idCurso}>{c.nombreCurso}</option>)}
              </select>
            </>
          )}

          {roleId === '1' && (
            <select name="especializacionId" required disabled={loadingOpts} defaultValue=""
              style={{ ...field, cursor: 'pointer' }}>
              <option value="" disabled>{loadingOpts ? 'Cargando…' : 'Selecciona tu especialización'}</option>
              {especializaciones.map(e => <option key={e.idEspecializacion} value={e.idEspecializacion}>{e.nombreEspecializacion}</option>)}
            </select>
          )}

          <div>
            <label style={label}>CORREO</label>
            <input name="email" type="email" required placeholder="tu@institucion.edu" style={field} />
          </div>
          <div>
            <label style={label}>CONTRASEÑA</label>
            <input name="password" type="password" required placeholder="••••••••" style={field} />
          </div>

          {state?.error && (
            <p style={{ margin: 0, fontSize: 12, color: '#ff9b9b', textAlign: 'center' }}>{state.error}</p>
          )}

          <button
            type="submit" disabled={pending}
            style={{
              width: '100%', marginTop: 4, padding: 12, border: 'none', borderRadius: 10,
              fontFamily: "'Orbitron',sans-serif", fontWeight: 600, fontSize: 13, letterSpacing: 1,
              color: '#0c2a22', cursor: pending ? 'wait' : 'pointer',
              background: `linear-gradient(92deg,${NEON},#38e8ff)`,
              boxShadow: `0 0 24px color-mix(in srgb,${NEON} 55%, transparent)`,
              opacity: pending ? .7 : 1,
            }}
          >
            {pending ? 'CREANDO…' : 'CREAR CUENTA'}
          </button>
        </form>

        <p style={{ margin: '16px 0 0', textAlign: 'center', fontSize: 12, color: '#a99bd0' }}>
          ¿Ya tienes cuenta?{' '}
          <span onClick={onSwitchToLogin} style={{ color: NEON, cursor: 'pointer', fontWeight: 600 }}>
            Inicia sesión
          </span>
        </p>
      </div>
    </div>
  );
}
