// DEF-WEB-17: la fuente Material Symbols completa pesa ~3,9 MB y retrasaba el
// primer pintado (Lighthouse 33–96). Google Fonts sirve solo los iconos pedidos
// con `icon_names=` (~173 KB con estos).
//
// La lista sale de cruzar todas las palabras de `src` con los nombres oficiales
// de Material Symbols, así que incluye de más (p. ej. «css», «html»): sobrar
// cuesta unos KB; faltar uno muestra su nombre como texto. Dos guardas:
// tests/iconos.test.ts (iconos escritos en el código) y e2e/iconos.spec.ts
// (iconos que de verdad pinta cada pantalla de cada rol).
//
// Al usar un icono nuevo, agrégalo aquí en orden alfabético (Google lo exige).

export const ICONOS = [
  '10k', '123', '2d', '360', 'add', 'analytics', 'animation', 'api', 'atr', 'autorenew', 'badge',
  'bar_chart', 'block', 'box', 'build', 'calendar_month', 'call', 'camera', 'campaign', 'cancel',
  'capture', 'cards', 'chat', 'check', 'check_circle', 'chevron_left', 'chevron_right', 'chips',
  'circle', 'class', 'clear', 'close', 'code', 'colors', 'compare', 'cookie', 'create', 'css',
  'cycle', 'dark_mode', 'dashboard', 'dataset', 'delete', 'description', 'desk', 'details',
  'domain', 'done', 'download', 'downloading', 'draw', 'dropdown', 'edit', 'edit_note', 'eject',
  'email', 'encrypted', 'error', 'event', 'face', 'fact_check', 'files', 'filter', 'function',
  'functions', 'gif', 'gradient', 'grid_view', 'group', 'groups', 'height', 'hide', 'history',
  'home', 'host', 'hourglass_empty', 'html', 'http', 'https', 'iframe', 'image', 'info', 'input',
  'iso', 'join', 'key', 'label', 'language', 'light', 'light_mode', 'link', 'list',
  'local_hospital', 'lock', 'lock_open', 'login', 'logout', 'loop', 'mail', 'map', 'margin',
  'menu_book', 'message', 'metro', 'mode', 'navigation', 'notifications_active', 'opacity', 'orbit',
  'output', 'pace', 'padding', 'pages', 'palette', 'password', 'pattern', 'pause', 'pending',
  'percent', 'person', 'photo_camera', 'place', 'polyline', 'preview', 'privacy', 'public',
  'qr_code_2', 'qr_code_scanner', 'refresh', 'remove', 'repeat', 'resize', 'route', 'router',
  'scale', 'scan', 'scene', 'schema', 'school', 'script', 'search', 'select', 'send', 'serif',
  'settings', 'shadow', 'share', 'shift', 'skeleton', 'sort', 'source', 'speed', 'start', 'step',
  'stop', 'store', 'strategy', 'stream', 'style', 'subject', 'support', 'swap_vert', 'sync', 'tab',
  'table', 'target', 'title', 'toast', 'today', 'token', 'tooltip', 'topic', 'transform',
  'translate', 'try', 'update', 'upload', 'uppercase', 'verified', 'visibility', 'warning', 'web',
  'weight', 'width', 'window',
] as const

const EJES = 'opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200'

export const URL_ICONOS =
  `https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:${EJES}&icon_names=${ICONOS.join(',')}&display=swap`
