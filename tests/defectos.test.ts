import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

import {
  CAMPOS,
  COLUMNAS_CSV,
  ETIQUETAS,
  OPCIONES_DEL_FORMULARIO,
  cambiosDeEtiquetas,
  estadoDe,
  etiquetasDelFormulario,
  etiquetasTrasEvento,
  cuerpoDeRegistro,
  filaCsv,
  idsRegistrados,
  issuesReferidos,
  leerFormulario,
  planDeRegistro,
} from '../scripts/defectos/reglas.mjs'

// PR-07 · D-WEB-15: gestión de defectos en GitHub Issues.

/** Cuerpo tal como GitHub lo escribe al enviar la plantilla `defecto.yml`. */
function cuerpo(campos: Record<string, string>) {
  return Object.entries(campos)
    .map(([titulo, valor]) => `### ${titulo}\n\n${valor}`)
    .join('\n\n')
}

const FICHA = cuerpo({
  [CAMPOS.id]: 'DEF-WEB-02',
  [CAMPOS.componente]: 'Web',
  [CAMPOS.origen]: 'Pruebas de sistema',
  [CAMPOS.severidad]: 'Alta',
  [CAMPOS.prioridad]: 'P2',
  [CAMPOS.caso]: 'CP-SIS-060',
  [CAMPOS.correccion]: 'WEB-03',
  'Pasos para reproducir': '1. Entrar como padre\n2. Abrir notas',
  'Navegador y versión': '_No response_',
})

describe('Defectos · plantilla del issue', () => {
  const plantilla = readFileSync('.github/ISSUE_TEMPLATE/defecto.yml', 'utf8').replace(/\r\n/g, '\n')

  it('tiene un campo por cada título que lee el workflow', () => {
    for (const titulo of Object.values(CAMPOS)) expect(plantilla).toContain(`label: ${titulo}\n`)
  })

  it('ofrece exactamente las opciones que el workflow sabe convertir en etiquetas', () => {
    for (const [grupo, opciones] of Object.entries(OPCIONES_DEL_FORMULARIO)) {
      const titulo = CAMPOS[grupo as keyof typeof CAMPOS]
      const bloque = plantilla.slice(plantilla.indexOf(`label: ${titulo}\n`))
      expect(bloque, grupo).toMatch(new RegExp(`options: \\[${opciones.join(', ')}\\]`))
    }
  })

  it('pone la etiqueta «defecto», que es la que activa el ciclo de vida', () => {
    expect(plantilla).toContain('labels: ["defecto"]')
  })

  it('cada etiqueta del formulario existe en la lista que crea el workflow', () => {
    const nombres = ETIQUETAS.map((e) => e.name)
    expect(new Set(nombres).size).toBe(nombres.length)
    const todas = { componente: 'Web', origen: 'UAT', severidad: 'Baja', prioridad: 'P4' } as const
    for (const [grupo, opciones] of Object.entries(OPCIONES_DEL_FORMULARIO)) {
      for (const opcion of opciones) {
        const campos = Object.fromEntries(
          Object.entries(todas).map(([g, v]) => [CAMPOS[g as keyof typeof todas], g === grupo ? opcion : v])
        )
        for (const etiqueta of etiquetasDelFormulario(campos)) expect(nombres, `${grupo}: ${opcion}`).toContain(etiqueta)
      }
    }
  })
})

describe('Defectos · lectura del formulario', () => {
  it('separa cada campo por su título y trata «_No response_» como vacío', () => {
    const campos = leerFormulario(FICHA)
    expect(campos[CAMPOS.id]).toBe('DEF-WEB-02')
    expect(campos[CAMPOS.caso]).toBe('CP-SIS-060')
    expect(campos['Pasos para reproducir']).toBe('1. Entrar como padre\n2. Abrir notas')
    expect(campos['Navegador y versión']).toBe('')
  })

  it('acepta saltos de línea de Windows y cuerpos vacíos', () => {
    expect(leerFormulario(FICHA.replace(/\n/g, '\r\n'))[CAMPOS.severidad]).toBe('Alta')
    expect(leerFormulario(null)).toEqual({})
    expect(leerFormulario('texto libre sin plantilla')).toEqual({})
  })

  it('convierte componente, origen, severidad y prioridad en etiquetas', () => {
    expect(etiquetasDelFormulario(leerFormulario(FICHA))).toEqual(['web', 'pruebas-sistema', 'severidad:alta', 'P2'])
  })

  it('sin prioridad, propone la que corresponde a la severidad (Crítica → P1)', () => {
    const campos = leerFormulario(cuerpo({ [CAMPOS.severidad]: 'Crítica', [CAMPOS.prioridad]: '_No response_' }))
    expect(etiquetasDelFormulario(campos)).toEqual(['severidad:critica', 'P1'])
  })

  it('al editar no toca la prioridad: después de abrir la decide el PO', () => {
    expect(etiquetasDelFormulario(leerFormulario(FICHA), { conPrioridad: false })).toEqual([
      'web',
      'pruebas-sistema',
      'severidad:alta',
    ])
  })

  it('ignora valores que no son opciones de la plantilla', () => {
    expect(etiquetasDelFormulario(leerFormulario(cuerpo({ [CAMPOS.severidad]: 'Gravísima' })))).toEqual([])
  })
})

describe('Defectos · etiquetas excluyentes', () => {
  it('cambiar la severidad quita la anterior y no toca los otros grupos', () => {
    expect(cambiosDeEtiquetas(['defecto', 'web', 'severidad:media', 'P3'], ['severidad:alta'])).toEqual({
      agregar: ['severidad:alta'],
      quitar: ['severidad:media'],
    })
  })

  it('no repite etiquetas que el issue ya tiene', () => {
    expect(cambiosDeEtiquetas(['estado:nuevo', 'web'], ['estado:nuevo', 'web'])).toEqual({ agregar: [], quitar: [] })
  })

  it('un solo estado a la vez', () => {
    expect(cambiosDeEtiquetas(['estado:nuevo', 'estado:aprobado'], ['estado:en-curso']).quitar).toEqual([
      'estado:nuevo',
      'estado:aprobado',
    ])
  })
})

describe('Defectos · ciclo de vida (planeación §2)', () => {
  it('al abrirse queda Nuevo y clasificado', () => {
    expect(etiquetasTrasEvento('abierto', { etiquetas: ['defecto'], cuerpo: FICHA })).toEqual([
      'estado:nuevo',
      'web',
      'pruebas-sistema',
      'severidad:alta',
      'P2',
    ])
  })

  it('un PR abierto lo pasa a En curso, pero no lo saca de En verificación', () => {
    expect(etiquetasTrasEvento('pr-abierto', { etiquetas: ['estado:aprobado'] })).toEqual(['estado:en-curso'])
    expect(etiquetasTrasEvento('pr-abierto', { etiquetas: ['estado:en-verificacion'] })).toBeNull()
    expect(etiquetasTrasEvento('pr-abierto', { etiquetas: ['estado:en-curso'] })).toBeNull()
  })

  it('al fusionarse la corrección pasa a En verificación, no a cerrado', () => {
    expect(etiquetasTrasEvento('pr-fusionado', { etiquetas: ['estado:en-curso'] })).toEqual(['estado:en-verificacion'])
  })

  it('reabrir lo devuelve a En curso y lo cuenta como reabierto', () => {
    expect(etiquetasTrasEvento('reabierto', { etiquetas: ['estado:en-verificacion'] })).toEqual([
      'estado:en-curso',
      'reabierto',
    ])
  })

  it('editar un issue sin plantilla no cambia nada', () => {
    expect(etiquetasTrasEvento('editado', { etiquetas: ['defecto'], cuerpo: 'sin campos' })).toBeNull()
  })
})

describe('Defectos · referencias desde un PR', () => {
  it('reconoce «Corrige #N» y variantes, sin repetir', () => {
    expect(issuesReferidos('Corrige #12\nCorrige: #3\ndefecto #12\nRefs #40')).toEqual([3, 12, 40])
  })

  it('reconoce las palabras de cierre de GitHub para poder reabrir el defecto', () => {
    expect(issuesReferidos('Closes #7, fixes #8 y resolved #9')).toEqual([7, 8, 9])
  })

  it('no confunde menciones sueltas ni el «Corrige #» vacío de la plantilla del PR', () => {
    expect(issuesReferidos('Ver #5 y el PR #34. Corrige #')).toEqual([])
    expect(issuesReferidos(undefined)).toEqual([])
  })
})

describe('Defectos · registro para el PR-07', () => {
  const base = {
    number: 41,
    title: 'El padre con dos hijos solo ve uno, en notas',
    body: FICHA,
    created_at: '2026-11-10T10:00:00Z',
    labels: [{ name: 'defecto' }, { name: 'web' }, { name: 'severidad:alta' }, { name: 'P2' }, { name: 'pruebas-sistema' }],
  }

  it('el estado sale del issue: abierto por etiqueta, cerrado según el motivo', () => {
    expect(estadoDe({ state: 'open', etiquetas: ['estado:en-verificacion'] })).toBe('En verificación')
    expect(estadoDe({ state: 'open', etiquetas: [] })).toBe('Nuevo')
    expect(estadoDe({ state: 'closed', state_reason: 'completed', etiquetas: [] })).toBe('Cerrado')
    expect(estadoDe({ state: 'closed', state_reason: 'not_planned', etiquetas: [] })).toBe('Descartado')
  })

  it('una fila por defecto, con tantas celdas como columnas', () => {
    const fila = filaCsv({
      ...base,
      state: 'closed',
      state_reason: 'completed',
      closed_at: '2026-11-13T09:00:00Z',
      labels: [...base.labels, { name: 'reabierto' }],
    })
    expect(fila).toBe(
      '#41,DEF-WEB-02,"El padre con dos hijos solo ve uno, en notas",alta,P2,web,pruebas-sistema,Cerrado,sí,CP-SIS-060,WEB-03,2026-11-10,2026-11-13,3'
    )
    expect(COLUMNAS_CSV).toHaveLength(14)
  })

  it('un defecto abierto no tiene fecha de cierre ni días', () => {
    const fila = filaCsv({ ...base, state: 'open', labels: [...base.labels, 'estado:nuevo'] })
    expect(fila.endsWith(',Nuevo,no,CP-SIS-060,WEB-03,2026-11-10,,')).toBe(true)
  })

  it('escapa comillas y comas en el título', () => {
    expect(filaCsv({ ...base, title: 'Dice "hola", y falla', state: 'open' })).toContain('"Dice ""hola"", y falla"')
  })
})

describe('Defectos · registro inicial (docs/defectos/registro.json)', () => {
  const base = {
    id: 'DEF-WEB-99',
    titulo: 'Algo falla en algún lado',
    componente: 'Web',
    origen: 'Pruebas de sistema',
    severidad: 'Media',
    prioridad: 'P3',
    caso: 'CP-SIS-001',
    correccion: 'WEB-01',
    pasos: '1. Abrir\n2. Mirar',
    esperado: 'Bien',
    obtenido: 'Mal',
    identificado: '11/11/2026',
    estado: 'en-verificacion',
  }

  it('el cuerpo se lee igual que uno escrito con la plantilla', () => {
    const campos = leerFormulario(cuerpoDeRegistro(base))
    expect(campos[CAMPOS.id]).toBe('DEF-WEB-99')
    expect(campos[CAMPOS.caso]).toBe('CP-SIS-001')
    expect(campos['Pasos para reproducir']).toBe('1. Abrir\n2. Mirar')
    expect(campos['Evidencia']).toBe('')
  })

  it('un defecto abierto lleva sus etiquetas y el estado, y no se cierra', () => {
    const plan = planDeRegistro(base)
    expect(plan.titulo).toBe('[DEF-WEB-99] Algo falla en algún lado')
    expect(plan.etiquetas).toEqual(['defecto', 'web', 'pruebas-sistema', 'severidad:media', 'P3', 'estado:en-verificacion'])
    expect(plan.cerrar).toBe(false)
    expect(plan.comentarioDeCierre).toBeNull()
  })

  it('un defecto verificado se cierra con causa raíz, commit y verificación', () => {
    const plan = planDeRegistro({ ...base, estado: 'cerrado', cierre: { causa: 'Codificación', commit: '`abc1234`', verificacion: 'E7' } })
    expect(plan.cerrar).toBe(true)
    expect(plan.etiquetas).not.toContain('estado:en-verificacion')
    expect(plan.comentarioDeCierre).toContain('Causa raíz: **Codificación**')
  })

  it('rechaza registros que crearían un issue sin clasificar o un cierre sin evidencia', () => {
    expect(() => planDeRegistro({ ...base, severidad: 'Gravísima' })).toThrow(/severidad/)
    expect(() => planDeRegistro({ ...base, estado: 'perdido' })).toThrow(/estado/)
    expect(() => planDeRegistro({ ...base, estado: 'cerrado' })).toThrow(/causa raíz/)
  })

  it('reconoce los ya registrados por su «ID del registro»', () => {
    const ids = idsRegistrados([{ body: cuerpoDeRegistro(base) }, { body: 'sin plantilla' }, { body: null }])
    expect([...ids]).toEqual(['DEF-WEB-99'])
  })

  it('el registro del repositorio es válido completo y no repite IDs', () => {
    const registro = JSON.parse(readFileSync('docs/defectos/registro.json', 'utf8')) as Parameters<typeof planDeRegistro>[0][]
    expect(registro.length).toBeGreaterThan(0)
    expect(new Set(registro.map((r) => r.id)).size).toBe(registro.length)
    for (const r of registro) expect(() => planDeRegistro(r), r.id).not.toThrow()
  })
})
