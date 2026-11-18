const COLADOR = new Intl.Collator('es', { numeric: true, sensitivity: 'base' })

/**
 * Comparador para `.sort()` de textos en español: respeta tildes y mayúsculas
 * («Álvarez» antes que «Zapata») y ordena los números de forma natural («6»
 * antes que «10»). Un `.sort()` sin comparador ordena por código de carácter
 * (SonarCloud S2871). Sin valor cuenta como texto vacío.
 */
export function porTexto(a: string | null | undefined, b: string | null | undefined): number {
  return COLADOR.compare(a ?? '', b ?? '')
}
