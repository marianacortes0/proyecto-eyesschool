'use client'

import { useState, useEffect, useRef } from 'react'
import { type Role } from '@/lib/utils/permissions'
import {
  getMiPerfil,
  updateMiPerfil,
  getMiPerfilProfesor,
  updateMiPerfilProfesor,
  getMiEPS,
  updateMiPerfilAdmin,
  insertAdminPerfil,
  uploadAvatar,
  EPS_OPTIONS,
  TIPO_AFILIACION_OPTIONS,
  type PerfilUsuario,
  type ProfesorPerfil,
  type EPSPerfil,
  type AdminPerfil,
  type CursoPerfil,
} from '@/services/usuario/usuarioService'
import {
  serverUpdateEstudianteCurso, serverUpsertEPS, serverEnsureEstudiante,
  serverEnsureProfesor, serverUpdateProfesor, serverAddEspecializacion, serverRemoveEspecializacion,
  serverUpdateUsuario, serverUpdateAdministrador, serverInsertAdministrador,
  serverBuscarEstudiantePorDocumento, serverUpsertPadre,
} from './actions'
import { useMemo } from 'react'
import { createClient } from '@/services/supabase/client'

const TIPOS_DOC = ['CC', 'TI', 'CE', 'PA', 'RC', 'NIT'] as const
const GENEROS   = ['M', 'F'] as const
const CARGOS_ADMIN = ['Rector', 'Coordinador', 'Secretario', 'Tesorero', 'Orientador', 'Otro'] as const
const PARENTESCOS  = ['Padre', 'Madre', 'Tutor', 'Abuelo', 'Abuela', 'Tío', 'Tía', 'Hermano', 'Hermana', 'Otro'] as const

const inputCls = "w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
const labelCls = "block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1"

type PadreData = { idPadre: number; idEstudiante: number; parentesco: string; ocupacion: string | null } | null
type EstudianteAsociado = { idEstudiante: number; nombre: string; documento: string } | null

type Props = {
  role: Role
  adminDataServer?: AdminPerfil | null
  cursosServer?: CursoPerfil[]
  idEstudianteServer?: number | null
  idCursoActualServer?: number | null
  profesorServer?: ProfesorPerfil | null
  especializacionesEnum?: { idEspecializacion: number; nombreEspecializacion: string }[]
  padreServer?: PadreData
  estudianteAsociadoServer?: EstudianteAsociado
}

export default function PerfilClient({ role, adminDataServer, cursosServer = [], idEstudianteServer = null, idCursoActualServer = null, profesorServer = null, especializacionesEnum = [], padreServer = null, estudianteAsociadoServer = null }: Props) {
  const [perfil,   setPerfil]   = useState<PerfilUsuario | null>(null)
  const [profesor, setProfesor] = useState<ProfesorPerfil | null>(null)
  const [admin,    setAdmin]    = useState<AdminPerfil | null>(adminDataServer ?? null)
  const [eps,      setEPS]      = useState<EPSPerfil[]>([])
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [savingProf, setSavingProf] = useState(false)
  const [savingAdmin, setSavingAdmin] = useState(false)
  const [success,  setSuccess]  = useState(false)
  const [successProf, setSuccessProf] = useState(false)
  const [successAdmin, setSuccessAdmin] = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  // Campos admin
  const [cargo,       setCargo]       = useState(adminDataServer?.cargo ?? '')
  const [nivelAcceso, setNivelAcceso] = useState(adminDataServer?.nivelAcceso ?? '')

  // Profesor
  const [idProfesor,       setIdProfesor]       = useState<number | null>(profesorServer?.idProfesor ?? null)
  const [especializaciones, setEspecializaciones] = useState(profesorServer?.especializaciones ?? [])
  const [espSeleccionada,  setEspSeleccionada]  = useState('')
  const [institucionEsp,   setInstitucionEsp]   = useState('')
  const [savingEsp,        setSavingEsp]        = useState(false)
  const [errorEsp,         setErrorEsp]         = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Estudiante: EPS y curso
  const [idEstudiante,    setIdEstudiante]    = useState<number | null>(idEstudianteServer)
  const [cursosLista,     setCursosLista]     = useState<CursoPerfil[]>(cursosServer)
  const [idCursoActual,   setIdCursoActual]   = useState<string>(() => {
    if (idCursoActualServer && cursosServer.find(c => c.idCurso === idCursoActualServer)) {
      return String(idCursoActualServer)
    }
    return ''
  })
  const [jornadaEst,      setJornadaEst]      = useState<string>(() => {
    if (idCursoActualServer) {
      return cursosServer.find(c => c.idCurso === idCursoActualServer)?.jornada ?? ''
    }
    return ''
  })
  const [epsSeleccionada, setEpsSeleccionada] = useState<string>('')
  const [tipoAfiliacion,  setTipoAfiliacion]  = useState<string>('')
  // Se pre-llena cuando lleguen los datos de EPS
  const [savingEPS,       setSavingEPS]       = useState(false)
  const [successEPS,      setSuccessEPS]      = useState(false)
  const [errorEPS,        setErrorEPS]        = useState<string | null>(null)
  const [savingCurso,     setSavingCurso]     = useState(false)
  const [successCurso,    setSuccessCurso]    = useState(false)
  const [errorCurso,      setErrorCurso]      = useState<string | null>(null)

  // Padre
  const [padreData,          setPadreData]          = useState<PadreData>(padreServer)
  const [estudianteAsociado, setEstudianteAsociado] = useState<EstudianteAsociado>(estudianteAsociadoServer)
  const [docBusqueda,        setDocBusqueda]        = useState(estudianteAsociadoServer?.documento ?? '')
  const [parentesco,         setParentesco]         = useState(padreServer?.parentesco ?? '')
  const [ocupacion,          setOcupacion]          = useState(padreServer?.ocupacion ?? '')
  const [buscandoEst,        setBuscandoEst]        = useState(false)
  const [errorBusqueda,      setErrorBusqueda]      = useState<string | null>(null)
  const [savingPadre,        setSavingPadre]        = useState(false)
  const [successPadre,       setSuccessPadre]       = useState(false)
  const [errorPadre,         setErrorPadre]         = useState<string | null>(null)

  const jornadasEst = useMemo(() => [...new Set(cursosLista.map(c => c.jornada))].sort(), [cursosLista])
  const cursosDeJornada = useMemo(
    () => jornadaEst ? cursosLista.filter(c => c.jornada === jornadaEst) : [],
    [cursosLista, jornadaEst]
  )

  // Campos usuario
  const [primerNombre,    setPrimerNombre]    = useState('')
  const [segundoNombre,   setSegundoNombre]   = useState('')
  const [primerApellido,  setPrimerApellido]  = useState('')
  const [segundoApellido, setSegundoApellido] = useState('')
  const [tipoDocumento,   setTipoDocumento]   = useState('')
  const [numeroDocumento, setNumeroDocumento] = useState('')
  const [telefono,        setTelefono]        = useState('')
  const [direccion,       setDireccion]       = useState('')
  const [genero,          setGenero]          = useState('')

  // Campos profesor
  const [titulo,        setTitulo]        = useState('')
  const [nivelEstudios, setNivelEstudios] = useState('')

  useEffect(() => {
    const load = async () => {
      // Cargar avatar desde metadata auth
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setAvatarUrl(user?.user_metadata?.avatarUrl ?? null)

      const p = await getMiPerfil()
      if (p) {
        setPerfil(p)
        setPrimerNombre(p.primerNombre ?? '')
        setSegundoNombre(p.segundoNombre ?? '')
        setPrimerApellido(p.primerApellido ?? '')
        setSegundoApellido(p.segundoApellido ?? '')
        setTipoDocumento(p.tipoDocumento ?? '')
        setNumeroDocumento(p.numeroDocumento ?? '')
        setTelefono(p.telefono ?? '')
        setDireccion(p.direccion ?? '')
        setGenero(p.genero ?? '')

        if (role === 'docente') {
          const prof = await getMiPerfilProfesor(p.idUsuario)
          if (prof) {
            setProfesor(prof)
            setTitulo(prof.titulo ?? '')
            setNivelEstudios(prof.nivelEstudios ?? '')
          }
        }

        if (role === 'estudiante') {
          const epsData = await getMiEPS(p.idUsuario)
          setEPS(epsData)
          if (epsData.length > 0) {
            const primera = epsData[0]
            const match = EPS_OPTIONS.find(o => o.nombre === primera.nombreIPS)
            if (match) setEpsSeleccionada(String(match.idIPS))
            setTipoAfiliacion(primera.tipoAfiliacion ?? '')
          }
        }
      }
      setLoading(false)
    }
    load()
  }, [role])

  const handleSaveEPS = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!epsSeleccionada || !tipoAfiliacion) { setErrorEPS('Selecciona EPS y tipo de afiliación'); return }
    setSavingEPS(true); setSuccessEPS(false); setErrorEPS(null)
    try {
      let estId = idEstudiante
      if (!estId && perfil) {
        estId = await serverEnsureEstudiante(perfil.idUsuario)
        setIdEstudiante(estId)
      }
      if (!estId) throw new Error('No se pudo obtener el estudiante')
      const eps = EPS_OPTIONS.find(o => String(o.idIPS) === epsSeleccionada)!
      await serverUpsertEPS(estId, { idIPS: eps.idIPS, nombreIPS: eps.nombre, tipoAfiliacion })
      setSuccessEPS(true)
      setEPS(await getMiEPS(perfil!.idUsuario))
    } catch (err: any) {
      setErrorEPS(err.message ?? 'Error al guardar EPS')
    } finally {
      setSavingEPS(false)
    }
  }

  const handleSaveCurso = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!idCursoActual) { setErrorCurso('Selecciona un curso'); return }
    setSavingCurso(true); setSuccessCurso(false); setErrorCurso(null)
    try {
      let estId = idEstudiante
      if (!estId && perfil) {
        estId = await serverEnsureEstudiante(perfil.idUsuario)
        setIdEstudiante(estId)
      }
      if (!estId) throw new Error('No se pudo obtener el estudiante')
      await serverUpdateEstudianteCurso(estId, Number(idCursoActual))
      setSuccessCurso(true)
    } catch (err: any) {
      setErrorCurso(err.message ?? 'Error al guardar curso')
    } finally {
      setSavingCurso(false)
    }
  }

  const handleAddEspecializacion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!espSeleccionada) { setErrorEsp('Selecciona una especialización'); return }
    setSavingEsp(true); setErrorEsp(null)
    try {
      let profId = idProfesor
      if (!profId && perfil) {
        profId = await serverEnsureProfesor(perfil.idUsuario)
        setIdProfesor(profId)
      }
      if (!profId) throw new Error('No se pudo obtener el profesor')
      await serverAddEspecializacion(profId, Number(espSeleccionada), institucionEsp)
      const nombre = especializacionesEnum.find(e => String(e.idEspecializacion) === espSeleccionada)?.nombreEspecializacion ?? ''
      setEspecializaciones(prev => {
        const filtered = prev.filter(e => e.idEspecializacion !== Number(espSeleccionada))
        return [...filtered, { idEspecializacion: Number(espSeleccionada), nombreEspecializacion: nombre, institucion: institucionEsp }]
      })
      setEspSeleccionada(''); setInstitucionEsp('')
    } catch (err: any) {
      setErrorEsp(err.message ?? 'Error al guardar')
    } finally {
      setSavingEsp(false)
    }
  }

  const handleRemoveEspecializacion = async (idEspecializacion: number) => {
    if (!idProfesor) return
    try {
      await serverRemoveEspecializacion(idProfesor, idEspecializacion)
      setEspecializaciones(prev => prev.filter(e => e.idEspecializacion !== idEspecializacion))
    } catch (err: any) {
      setErrorEsp(err.message ?? 'Error al eliminar')
    }
  }

  const handleSaveAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingAdmin(true); setSuccessAdmin(false); setError(null)
    try {
      if (admin) {
        await serverUpdateAdministrador(admin.idAdministrador, { cargo, nivelAcceso })
        setAdmin({ ...admin, cargo, nivelAcceso })
      } else if (perfil) {
        const nuevo = await serverInsertAdministrador(perfil.idUsuario, { cargo, nivelAcceso })
        setAdmin(nuevo as any)
      }
      setSuccessAdmin(true)
    } catch (err: any) {
      setError(err.message ?? 'Error al guardar')
    } finally {
      setSavingAdmin(false)
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAvatar(true)
    setError(null)
    try {
      const url = await uploadAvatar(file)
      setAvatarUrl(url)
    } catch (err: any) {
      setError(err.message ?? 'Error al subir imagen')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleSaveUsuario = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!perfil) return
    setSaving(true); setError(null); setSuccess(false)
    try {
      await serverUpdateUsuario(perfil.idUsuario, {
        primerNombre,
        segundoNombre:   segundoNombre   || null,
        primerApellido,
        segundoApellido: segundoApellido || null,
        tipoDocumento:   tipoDocumento   || null,
        numeroDocumento: numeroDocumento || null,
        telefono:        telefono        || null,
        direccion:       direccion       || null,
        genero:          genero          || null,
      })
      setSuccess(true)
    } catch (err: any) {
      setError(err.message ?? 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveProfesor = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingProf(true); setSuccessProf(false)
    try {
      let profId = idProfesor
      if (!profId && perfil) {
        profId = await serverEnsureProfesor(perfil.idUsuario)
        setIdProfesor(profId)
      }
      if (!profId) throw new Error('No se pudo obtener el profesor')
      await serverUpdateProfesor(profId, { titulo, nivelEstudios })
      setSuccessProf(true)
    } catch (err: any) {
      setError(err.message ?? 'Error al guardar')
    } finally {
      setSavingProf(false)
    }
  }

  const handleBuscarEstudiante = async () => {
    if (!docBusqueda.trim()) { setErrorBusqueda('Ingresa un número de documento'); return }
    setBuscandoEst(true); setErrorBusqueda(null)
    try {
      const result = await serverBuscarEstudiantePorDocumento(docBusqueda.trim())
      if (!result) { setErrorBusqueda('No se encontró ningún estudiante con ese documento'); return }
      setEstudianteAsociado(result)
    } catch (err: any) {
      setErrorBusqueda(err.message ?? 'Error al buscar')
    } finally {
      setBuscandoEst(false)
    }
  }

  const handleSavePadre = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!estudianteAsociado) { setErrorPadre('Busca y selecciona un estudiante primero'); return }
    if (!parentesco) { setErrorPadre('Selecciona el parentesco'); return }
    if (!perfil) return
    setSavingPadre(true); setSuccessPadre(false); setErrorPadre(null)
    try {
      await serverUpsertPadre(perfil.idUsuario, estudianteAsociado.idEstudiante, parentesco, ocupacion || null)
      setPadreData(prev => ({
        idPadre:     prev?.idPadre ?? 0,
        idEstudiante: estudianteAsociado.idEstudiante,
        parentesco,
        ocupacion: ocupacion || null,
      }))
      setSuccessPadre(true)
    } catch (err: any) {
      setErrorPadre(err.message ?? 'Error al guardar')
    } finally {
      setSavingPadre(false)
    }
  }

  const TIPO_EPS: Record<string, string> = {
    Contributivo: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
    Subsidiado:   'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300',
    Especial:     'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300',
  }

  if (loading) {
    return (
      <div className="space-y-4 max-w-2xl">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-white/5 animate-pulse" />
        ))}
      </div>
    )
  }

  if (!perfil) {
    return (
      <div className="text-center py-16 text-slate-500 dark:text-slate-400">
        No se pudo cargar el perfil.
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-2xl">

      {/* Avatar */}
      <div className="flex items-center gap-6">
        <div className="relative group">
          <div className="w-24 h-24 rounded-full border-4 border-blue-500 overflow-hidden bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shadow-lg">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {primerNombre.charAt(0).toUpperCase() || perfil?.primerNombre.charAt(0).toUpperCase() || 'U'}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingAvatar}
            className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center disabled:cursor-not-allowed"
          >
            {uploadingAvatar ? (
              <svg className="w-6 h-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Mi Perfil</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Actualiza tu información personal</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Pasa el cursor sobre la foto para cambiarla</p>
        </div>
      </div>

      {/* ── Información personal ──────────────────────────────────────────── */}
      <form onSubmit={handleSaveUsuario} className="bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 p-6 space-y-5">
        <h2 className="text-base font-bold text-slate-800 dark:text-white">Información personal</h2>

        {perfil.correo && (
          <div>
            <label className={labelCls}>Correo electrónico</label>
            <input type="email" value={perfil.correo} disabled className={`${inputCls} opacity-60 cursor-not-allowed`} />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Primer nombre <span className="text-red-500">*</span></label>
            <input required value={primerNombre} onChange={e => setPrimerNombre(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Segundo nombre</label>
            <input value={segundoNombre} onChange={e => setSegundoNombre(e.target.value)} className={inputCls} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Primer apellido <span className="text-red-500">*</span></label>
            <input required value={primerApellido} onChange={e => setPrimerApellido(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Segundo apellido</label>
            <input value={segundoApellido} onChange={e => setSegundoApellido(e.target.value)} className={inputCls} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Tipo documento</label>
            <select value={tipoDocumento} onChange={e => setTipoDocumento(e.target.value)} className={inputCls}>
              <option value="">Seleccionar...</option>
              {TIPOS_DOC.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>N° documento</label>
            <input value={numeroDocumento} onChange={e => setNumeroDocumento(e.target.value)} className={inputCls} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Teléfono</label>
            <input type="tel" value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="Ej: 3001234567" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Género</label>
            <select value={genero} onChange={e => setGenero(e.target.value)} className={inputCls}>
              <option value="">Seleccionar...</option>
              {GENEROS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className={labelCls}>Dirección</label>
          <input value={direccion} onChange={e => setDireccion(e.target.value)} placeholder="Ej: Calle 123 # 45-67, Bogotá" className={inputCls} />
        </div>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>
        )}
        {success && (
          <p className="text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-2 rounded-lg">Perfil actualizado correctamente.</p>
        )}

        <div className="flex justify-end">
          <button type="submit" disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors">
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>

      {/* ── Docente: datos profesionales ─────────────────────────────────── */}
      {role === 'docente' && (
        <>
          <form onSubmit={handleSaveProfesor} className="bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-800 dark:text-white">Datos profesionales</h2>
              {profesor && <span className="text-xs font-mono text-slate-400 dark:text-slate-500">{profesor.codigoProfesor}</span>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Título</label>
                <select value={titulo} onChange={e => setTitulo(e.target.value)} className={inputCls}>
                  <option value="">Seleccionar...</option>
                  {['Licenciado', 'Magister', 'Ingeniero', 'Doctor', 'Especialista', 'Otro'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Nivel de estudios</label>
                <select value={nivelEstudios} onChange={e => setNivelEstudios(e.target.value)} className={inputCls}>
                  <option value="">Seleccionar...</option>
                  {['Universitario', 'Maestria', 'Doctorado', 'Especialización', 'Técnico'].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>

            {profesor && (
              <div>
                <label className={labelCls}>Fecha de vinculación</label>
                <input type="date" value={profesor.fechaVinculacion?.slice(0, 10) ?? ''} disabled className={`${inputCls} opacity-60 cursor-not-allowed`} />
              </div>
            )}

            {successProf && <p className="text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-2 rounded-lg">Datos profesionales actualizados.</p>}

            <div className="flex justify-end">
              <button type="submit" disabled={savingProf}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors">
                {savingProf ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>

          {/* ── Especializaciones ── */}
          <div className="bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-800 dark:text-white">Especializaciones</h2>

            {/* Lista actual */}
            {especializaciones.length > 0 && (
              <div className="space-y-2">
                {especializaciones.map(esp => (
                  <div key={esp.idEspecializacion}
                    className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-white">{esp.nombreEspecializacion}</p>
                      {esp.institucion && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{esp.institucion}</p>}
                    </div>
                    <button type="button" onClick={() => handleRemoveEspecializacion(esp.idEspecializacion)}
                      className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 font-semibold px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                      Quitar
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Agregar */}
            <form onSubmit={handleAddEspecializacion} className="space-y-3 pt-2 border-t border-slate-100 dark:border-white/10">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Agregar especialización</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Especialización</label>
                  <select value={espSeleccionada} onChange={e => setEspSeleccionada(e.target.value)} className={inputCls}>
                    <option value="">Seleccionar...</option>
                    {especializacionesEnum.map(e => (
                      <option key={e.idEspecializacion} value={String(e.idEspecializacion)}>{e.nombreEspecializacion}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Institución</label>
                  <input value={institucionEsp} onChange={e => setInstitucionEsp(e.target.value)} placeholder="Ej: Universidad Nacional" className={inputCls} />
                </div>
              </div>
              {errorEsp && <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-3 py-2 rounded-lg">{errorEsp}</p>}
              <div className="flex justify-end">
                <button type="submit" disabled={savingEsp || !espSeleccionada}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors">
                  {savingEsp ? 'Guardando...' : '+ Agregar'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* ── Admin: datos administrativos ─────────────────────────────────── */}
      {role === 'admin' && (
        <form onSubmit={handleSaveAdmin} className="bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800 dark:text-white">Datos administrativos</h2>
            {admin && (
              <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${
                admin.estado === 'Activo'
                  ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300'
                  : 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300'
              }`}>{admin.estado}</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Cargo</label>
              <select value={cargo} onChange={e => setCargo(e.target.value)} className={inputCls}>
                <option value="">Seleccionar...</option>
                {CARGOS_ADMIN.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Nivel de acceso</label>
              <select value={nivelAcceso} onChange={e => setNivelAcceso(e.target.value)} className={inputCls}>
                <option value="">Seleccionar...</option>
                <option value="Alto">Alto</option>
                <option value="Medio">Medio</option>
                <option value="Bajo">Bajo</option>
              </select>
            </div>
          </div>

          {admin && (
            <div>
              <label className={labelCls}>Fecha de asignación</label>
              <input type="date" value={admin.fechaAsignacion?.slice(0, 10) ?? ''} disabled className={`${inputCls} opacity-60 cursor-not-allowed`} />
            </div>
          )}

          {successAdmin && (
            <p className="text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-2 rounded-lg">Datos administrativos actualizados.</p>
          )}

          <div className="flex justify-end">
            <button type="submit" disabled={savingAdmin}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors">
              {savingAdmin ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      )}

      {/* ── Estudiante: Jornada y Curso ───────────────────────────────────── */}
      {role === 'estudiante' && (
        <form onSubmit={handleSaveCurso} className="bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 p-6 space-y-5">
          <h2 className="text-base font-bold text-slate-800 dark:text-white">Jornada y curso</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Jornada</label>
              <select value={jornadaEst} onChange={e => { setJornadaEst(e.target.value); setIdCursoActual('') }} className={inputCls}>
                <option value="">Seleccionar...</option>
                {jornadasEst.map(j => <option key={j} value={j}>{j}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Curso</label>
              <select value={idCursoActual} onChange={e => setIdCursoActual(e.target.value)} className={inputCls} disabled={!jornadaEst}>
                <option value="">Seleccionar...</option>
                {cursosDeJornada.map(c => (
                  <option key={c.idCurso} value={String(c.idCurso)}>{c.nombreCurso}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Grado</label>
              <input
                value={cursosLista.find(c => String(c.idCurso) === idCursoActual)?.grado ?? ''}
                disabled
                className={`${inputCls} opacity-60 cursor-not-allowed`}
              />
            </div>
          </div>
          {errorCurso  && <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-3 py-2 rounded-lg">{errorCurso}</p>}
          {successCurso && <p className="text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-2 rounded-lg">Curso actualizado.</p>}
          <div className="flex justify-end">
            <button type="submit" disabled={savingCurso || !idCursoActual}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors">
              {savingCurso ? 'Guardando...' : 'Guardar curso'}
            </button>
          </div>
        </form>
      )}

      {/* ── Estudiante: EPS ───────────────────────────────────────────────── */}
      {role === 'estudiante' && (
        <form onSubmit={handleSaveEPS} className="bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 p-6 space-y-5">
          <h2 className="text-base font-bold text-slate-800 dark:text-white">Información de salud (EPS)</h2>

          {/* EPS actual */}
          {eps.length > 0 && (
            <div className="space-y-2">
              {eps.map(e => (
                <div key={e.idIPS} className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
                  <p className="text-sm font-bold text-slate-800 dark:text-white">{e.nombreIPS}</p>
                  <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${TIPO_EPS[e.tipoAfiliacion] ?? 'bg-slate-100 text-slate-600'}`}>
                    {e.tipoAfiliacion}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>EPS</label>
              <select value={epsSeleccionada} onChange={e => setEpsSeleccionada(e.target.value)} className={inputCls}>
                <option value="">Seleccionar...</option>
                {EPS_OPTIONS.map(o => <option key={o.idIPS} value={String(o.idIPS)}>{o.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Tipo de afiliación</label>
              <select value={tipoAfiliacion} onChange={e => setTipoAfiliacion(e.target.value)} className={inputCls}>
                <option value="">Seleccionar...</option>
                {TIPO_AFILIACION_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {errorEPS   && <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-3 py-2 rounded-lg">{errorEPS}</p>}
          {successEPS && <p className="text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-2 rounded-lg">EPS actualizada correctamente.</p>}
          <div className="flex justify-end">
            <button type="submit" disabled={savingEPS || !epsSeleccionada || !tipoAfiliacion}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors">
              {savingEPS ? 'Guardando...' : 'Guardar EPS'}
            </button>
          </div>
        </form>
      )}

      {/* ── Padre: estudiante asociado ──────────────────────────────────────── */}
      {role === 'padre' && (
        <form onSubmit={handleSavePadre} className="bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 p-6 space-y-5">
          <h2 className="text-base font-bold text-slate-800 dark:text-white">Información familiar</h2>

          {/* Buscar estudiante */}
          <div>
            <label className={labelCls}>Documento del estudiante</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={docBusqueda}
                onChange={e => { setDocBusqueda(e.target.value); setEstudianteAsociado(null) }}
                placeholder="Número de documento..."
                className={inputCls}
              />
              <button
                type="button"
                onClick={handleBuscarEstudiante}
                disabled={buscandoEst}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-white text-sm font-semibold transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                {buscandoEst ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
            {errorBusqueda && <p className="text-xs text-red-500 mt-1">{errorBusqueda}</p>}
            {estudianteAsociado && (
              <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
                <span className="text-emerald-600 dark:text-emerald-400 text-sm font-semibold">✓</span>
                <span className="text-sm text-emerald-700 dark:text-emerald-300">{estudianteAsociado.nombre}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 ml-auto">Doc: {estudianteAsociado.documento}</span>
              </div>
            )}
          </div>

          {/* Parentesco */}
          <div>
            <label className={labelCls}>Parentesco</label>
            <select value={parentesco} onChange={e => setParentesco(e.target.value)} required className={inputCls}>
              <option value="">Seleccionar...</option>
              {PARENTESCOS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          {/* Ocupación */}
          <div>
            <label className={labelCls}>Ocupación</label>
            <input
              type="text"
              value={ocupacion}
              onChange={e => setOcupacion(e.target.value)}
              placeholder="Ej: Ingeniero, Comerciante..."
              className={inputCls}
            />
          </div>

          {errorPadre  && <p className="text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-3 py-2 rounded-lg">{errorPadre}</p>}
          {successPadre && <p className="text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-2 rounded-lg">Datos guardados correctamente.</p>}
          <div className="flex justify-end">
            <button type="submit" disabled={savingPadre || !estudianteAsociado || !parentesco}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors">
              {savingPadre ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      )}

    </div>
  )
}
