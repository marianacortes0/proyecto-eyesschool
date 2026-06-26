⚠️ REQUISITO OBLIGATORIO PARA TODOS LOS MÓDULOS:

Implementa un sistema uniforme de mensajes de confirmación y notificaciones en toda la aplicación:

1. Mensajes de éxito (color verde):
   - "✅ [Acción] exitosamente"
   - "✅ Registro guardado correctamente"
   - "✅ Cambios aplicados con éxito"

2. Mensajes de error (color rojo):
   - "❌ Error al [acción], intente nuevamente"
   - "❌ No se pudo completar la operación"

3. Mensajes de advertencia (color amarillo):
   - "⚠️ Complete todos los campos requeridos"
   - "⚠️ ¿Está seguro de eliminar este registro?"

4. Implementación técnica:
   - Usar un sistema de toast/notificaciones (ej. React Toastify, Angular Material Snackbar, etc.)
   - Todas las operaciones CRUD deben tener mensaje de confirmación
   - Los mensajes deben desaparecer automáticamente después de 3-5 segundos
   - Debe haber consistencia en el diseño y colores de los mensajes

   Corrige el módulo de Historial de Asistencia:

1. Filtro de "Presente":
   - Revisa la lógica del filtro y asegura que filtre correctamente solo los registros con estado "Presente".
   - Verifica que el estado "Presente" coincida exactamente con el valor almacenado en la base de datos (puede ser 'presente', 'asistio', o 1).
   - Agrega mensaje cuando no haya resultados: "⚠️ No hay registros con estado 'Presente'"

2. Tipos "Entrada" y "Salida":
   - Ajusta el componente para que muestre correctamente "Entrada" y "Salida" en lugar de valores nulos o incorrectos.
   - Asigna los valores correctos desde el backend (ej. tipo_marcacion = 'entrada' o 'salida').
   - Si el valor no coincide, mapea correctamente los valores.

3. Mensajes de confirmación y éxito:
   - ✅ "Registro de asistencia editado correctamente"
   - ✅ "Registro de asistencia eliminado correctamente"
   - ✅ "Filtro aplicado correctamente"
   - ❌ "Error al editar el registro de asistencia"
   - ❌ "Error al eliminar el registro de asistencia"

4. Pruebas:
   - Realiza pruebas de edición, eliminación, filtrado y creación.
   - Verifica que los mensajes aparezcan en todas las operaciones.


   Corrige el módulo de Usuarios:

1. Mensajes de confirmación para todas las operaciones CRUD:
   - ✅ "Usuario creado exitosamente"
   - ✅ "Usuario editado exitosamente"
   - ✅ "Usuario eliminado exitosamente"
   - ✅ "Cambios guardados correctamente"
   - ❌ "Error al crear el usuario"
   - ❌ "Error al editar el usuario"
   - ❌ "Error al eliminar el usuario"
   - ⚠️ "Complete todos los campos obligatorios"

2. Mensaje de confirmación antes de eliminar:
   - "⚠️ ¿Está seguro de eliminar al usuario [nombre]? Esta acción no se puede deshacer."


4. Pruebas:
   - Realiza pruebas completas de creación, edición y eliminación.
   - Verifica que todos los mensajes se muestren correctamente.

   Corrige el módulo de Notas:

1. Filtros:
   - Ajusta el filtro por "Jornada" (mañana, tarde).
   - En el filtro ID_Curso, muestra el nombre del curso en lugar del ID.
   - Muestra el nombre completo del estudiante en los resultados.
   - Agrega mensaje: "✅ Filtros aplicados correctamente"
   - Agrega mensaje cuando no hay resultados: "⚠️ No se encontraron notas con los filtros seleccionados"

2. Visualización mejorada:
   - Muestra claramente en el orden:  Jornada-->Nombre del Curso--> Nombre del Estudiante-->Nota.
   - Agrega un indicador visual del estado (aprobado/reprobado).

3. Mensajes de confirmación para CRUD:
   - ✅ "Nota creada exitosamente"
   - ✅ "Nota editada exitosamente"
   - ✅ "Nota eliminada exitosamente"
   - ❌ "Error al guardar la nota"
   - ⚠️ "La nota debe estar entre 0 y 100"

4. Pruebas:
   - Prueba los filtros combinados.
   - Verifica que la información se muestre correctamente.

   Corrige el módulo de Horarios:

1. Mensajes de confirmación para CRUD:
   - ✅ "Horario creado exitosamente"
   - ✅ "Horario editado exitosamente"
   - ✅ "Horario eliminado exitosamente"
   - ✅ "Horario asignado correctamente"
   - ❌ "Error al crear el horario"
   - ❌ "Error al editar el horario"
   - ❌ "Error al eliminar el horario"
   - ⚠️ "Seleccione todos los campos requeridos"

2. Visualización de datos:
   - Asegura que se muestren correctamente:
     - Materia (nombre completo)
     - Curso (nombre y código)
     - Profesor (nombre completo)
   - Verifica que los datos lleguen correctamente desde el backend (revisa relaciones y joins).

3. Bloques gráficos:
   - Corrige la visualización de bloques horarios para que sea gráfica y organizada.
   - Usa tarjetas o celdas con colores diferenciados por materia o profesor.
   - Cada bloque debe mostrar: Hora de inicio, Hora de fin, Materia, Curso, Profesor, Día de la semana.

4. Edición de profesor:
   - Habilita la edición del campo "Profesor" en el formulario de edición.
   - Debe ser un selector (combobox) con todos los profesores disponibles.
   - Guarda correctamente el cambio en el backend.

5. Pruebas:
   - Prueba creación, edición y eliminación.
   - Verifica visualización gráfica.
   - Confirma que la edición del profesor funcione.

   El módulo de Novedades ya está al 100%, solo realiza:

1. Verificación de mensajes existentes:
   - Confirma que todas las operaciones tengan mensajes de confirmación.
   - Agrega mensajes faltantes si los hubiera.

2. Pruebas de regresión:
   - Prueba todas las funcionalidades para asegurar que no se vean afectadas por otras correcciones.
   - Verifica que los mensajes sean consistentes con el resto de la aplicación.

   Corrige el módulo de Códigos QR:

1. Eliminar sección (recomendado):
   - Elimina completamente la sección "Asistencia" del menú lateral ya que ya hay historial de asistencia  y "por asignar" ya que automaticamente ya se asigna el codigo qr al estudiante  

2. Mensajes:
   - ✅ "Código QR generado(descargado) exitosamente"
   - ✅ "Código QR renovado exitosamente"
   - ❌ "Error al generar el código QR"

3. Pruebas:
   - Verifica que la sección ya no aparezca en el sistema.
   - O verifica que los datos se vean correctamente.

Corrige el módulo de Escanear QR:

1. Mensajes de confirmación de registro:
   - ✅ "¡Asistencia registrada correctamente!"
   - ✅ "Bienvenido [nombre del usuario]"
   - ✅ "Entrada registrada: [hora]"
   - ✅ "Salida registrada: [hora]"
   - ❌ "Error al registrar la asistencia, intente nuevamente"
   - ❌ "Código QR inválido"
   - ❌ "El estudiante ya tiene registro de entrada hoy"
   - ⚠️ "Escaneando... mantenga el código QR frente a la cámara"
   - ⚠️ "No se pudo leer el código QR, intente nuevamente"

2. Feedback visual:
   - confirmación al escanear exitosamente.
   - Cambio de color (verde para éxito, rojo para error).
   - Animación de carga mientras procesa.

3. Pruebas:
   - Prueba con códigos QR válidos e inválidos.
   - Verifica mensajes en todos los casos.
   - Confirma que los registros se guarden correctamente.

   Corrige el módulo de Reportes:

1. Subida de archivos:
   - Habilita la funcionalidad de subir archivos con <input type="file">.
   - Acepta formatos: .pdf, .xlsx, .xls, .doc, .docx.
   - Limita el tamaño máximo a 10MB.

2. Mensajes de confirmación:
   - ✅ "Archivo subido exitosamente"
   - ✅ "Reporte generado correctamente"
   - ✅ "Archivo procesado con éxito"
   - ❌ "Error al subir el archivo"
   - ❌ "Formato de archivo no válido"
   - ❌ "El archivo excede el tamaño máximo permitido"
   - ⚠️ "Seleccione un archivo para subir"
   - ⚠️ "¿Está seguro de eliminar este reporte?"

3. Barra de progreso:
   - Muestra una barra de progreso durante la subida.
   - Muestra el porcentaje de carga.

4. Pruebas:
   - Prueba subida de archivos válidos e inválidos.
   - Verifica mensajes en todos los casos.
   - Confirma que los archivos se guarden correctamente.

   Corrige el módulo de Mi Perfil:

1. Visualización completa:
   - Muestra todos los campos: Nombre, Apellido, Correo, Teléfono, Rol, Departamento, Fecha de registro, Último acceso.
   - La foto de perfil debe ser editable.

2. Edición funcional:
   - Todos los campos deben ser editables (excepto el ID y fecha de registro).
   - Los cambios deben guardarse en el backend.
   - Actualizar la vista después de guardar.

3. Mensajes de confirmación:
   - ✅ "Perfil actualizado exitosamente"
   - ✅ "Foto de perfil actualizada correctamente"
   - ✅ "Contraseña cambiada exitosamente"
   - ❌ "Error al actualizar el perfil"
   - ❌ "Error al cambiar la contraseña"
   - ⚠️ "Complete todos los campos requeridos"
   - ⚠️ "Las contraseñas no coinciden"
   - ⚠️ "¿Está seguro de cerrar sesión?"

4. Validaciones:
   - Correo electrónico válido.
   - Teléfono con formato correcto.
   - Contraseña mínima de 6 caracteres.
   - Confirmación de contraseña.

5. Pruebas:
   - Prueba edición de cada campo.
   - Prueba cambio de contraseña.
   - Verifica mensajes en cada operación.

   REALIZA PRUEBAS INTEGRALES EN TODOS LOS MÓDULOS:

1. Pruebas de mensajes:
   - Verifica que todas las operaciones CRUD tengan mensaje de confirmación.
   - Verifica que los mensajes sean consistentes en diseño y contenido.
   - Verifica que los mensajes de éxito sean verdes y error rojos.
   - Verifica que los mensajes de advertencia sean amarillos.

2. Pruebas funcionales:
   - Crear, editar, eliminar y listar en cada módulo.
   - Verificar filtros y búsquedas.
   - Verificar validaciones de formularios.

3. Pruebas de visualización:
   - Verificar que todos los datos se muestren correctamente.
   - Verificar que no haya datos nulos o indefinidos.
   - Verificar que las tablas, tarjetas y gráficos se vean bien.

4. Pruebas de experiencia de usuario:
   - Navegación fluida entre módulos.
   - Tiempo de respuesta aceptable.
   - Mensajes claros y útiles para el usuario.

5. Pruebas de integración:
   - Los datos deben reflejarse correctamente entre módulos (ej. horarios → asistencia).
   - Las relaciones entre tablas deben funcionar (ej. curso → profesor → materia).

6. Reporte final:
   - Generar un reporte con los resultados de las pruebas.
   - Listar los errores encontrados y soluciones aplicadas.
   - Confirmar que todos los módulos están al 100% funcionales.

   ### Módulos y su estado esperado después de las correcciones:

- [ ] Historial de Asistencia (80% → 100%)
- [ ] Usuarios (95% → 100%)
- [ ] Notas (99% → 100%)
- [ ] Horarios (70% → 100%)
- [ ] Novedades (100% → 100%)
- [ ] Códigos QR (50% → 0% o 100% según decisión)
- [ ] Escanear QR (100% → 100%)
- [ ] Reportes (95% → 100%)
- [ ] Mi Perfil (80% → 100%)

### Requisitos transversales:
- [ ] Todos los módulos tienen mensajes de confirmación.
- [ ] Todos los mensajes son consistentes en diseño.
- [ ] Todas las operaciones CRUD funcionan correctamente.
- [ ] Todas las validaciones de formularios están implementadas.
- [ ] La experiencia de usuario es fluida y sin errores.




#2

Implementa un sistema de registro de usuarios con los siguientes roles:

1. **Admin** - Administrador del sistema
2. **Estudiante** - Alumno de la institución
3. **Padre/Acudiente** - Representante del estudiante
4. **Profesor** - Docente de la institución

Requisitos generales:
- Todos los registros deben tener mensajes de confirmación.
- Validaciones en tiempo real para cada campo.
- Contraseña con requisitos mínimos de seguridad (mínimo 8 caracteres, mayúscula, minúscula, número y carácter especial).
- Correo electrónico único en el sistema.
- Número de documento único por cada tipo de documento.
- Mensaje de éxito: "✅ Usuario registrado exitosamente como [Rol]"
- Mensaje de error: "❌ Error al registrar el usuario: [motivo]"

### 📧 FLUJO DE CONFIRMACIÓN PARA ADMIN Y PROFESOR:
El registro de Administradores y Profesores requiere un flujo de aprobación:

1. **Registro inicial**: El usuario se registra con todos sus datos.
2. **Estado "Pendiente"**: La cuenta se crea con estado "pendiente_aprobacion".
3. **Notificación**: Se envía notificación al administrador principal.
4. **Aprobación/Rechazo**: El administrador revisa y aprueba o rechaza la solicitud.
5. **Activación**: Solo después de la aprobación, el usuario puede iniciar sesión.
6. **Correo de confirmación**: Se envía correo al usuario con el resultado.

### 🔐 FLUJO DE RECUPERACIÓN DE CONTRASEÑA (Todos los roles):
1. **Solicitud**: El usuario hace clic en "¿Olvidaste tu contraseña?".
2. **Ingreso de correo**: Ingresa su correo electrónico registrado.
3. **Envío de enlace**: Se envía un enlace temporal al correo.
4. **Restablecimiento**: El usuario ingresa una nueva contraseña.
5. **Confirmación**: Se confirma el cambio exitoso.

Implementa la funcionalidad de recuperación de contraseña para todos los roles:

### Flujo completo de "¿Olvidaste tu contraseña?":

1. **Pantalla de recuperación:**
   - Botón "¿Olvidaste tu contraseña?" en el login.
   - Campo: Correo electrónico registrado.
   - Mensaje: "📧 Ingresa tu correo para restablecer tu contraseña."

2. **Validación:**
   - Verificar que el correo exista en el sistema.
   - Si el correo no existe: "❌ No se encontró un usuario con este correo"
   - Si el correo existe: "✅ Se ha enviado un enlace a tu correo"

3. **Generación de token:**
   - Crear un token seguro (JWT con expiración).
   - Guardar token en la base de datos con fecha de expiración (15 minutos).
   - Enviar enlace: https://tuapp.com/restablecer-password?token=xxxx


---

## 📋 6. MAPEO DE ROLES 

```markdown
Mapea los campos del endpoint auth/register de la siguiente manera según el rol:

### Campos comunes para todos los roles:
```json
{
  "tipo_documento": "CC|CE|TI|NIT|PASAPORTE",
  "numero_documento": "string",
  "primer_nombre": "string",
  "segundo_nombre": "string (opcional)",
  "primer_apellido": "string",
  "segundo_apellido": "string (opcional)",
  "genero": "M|F|Otro",
  "direccion": "string",
  "correo": "email",
  "password": "string (con validaciones)",
  "telefono": "string",
  "id_rol": "1|2|3|4"
}
Campo especifico para rol de admin:
{
  "cargo": "string (Coordinador|Director|Administrador)"
}
1. **Registro:**
   - El usuario completa el formulario de registro.
   - La cuenta se crea con estado "pendiente_aprobacion".
   - Mensaje: "✅ Solicitud de registro enviada. Espere la aprobación del administrador principal."

2. **Notificación al administrador principal:**
   - Se envía una notificación al administrador principal.
   - Mensaje: "📧 Se ha enviado una solicitud de aprobación al administrador principal."
   - Detalle de la notificación: "El usuario [nombre] ha solicitado ser administrador."

3. **Panel de aprobación para administradores:**
   - Lista de solicitudes pendientes.--> panel de usuarios
   - Botones: Aprobar ✅ | Rechazar ❌

4. **Aprobación:**
   - Cambiar estado a "activo".
   - Mensaje al usuario: "✅ Su cuenta ha sido aprobada. Ya puede iniciar sesión."
   - Correo: "Su cuenta como administrador ha sido aprobada exitosamente."

5. **Rechazo:**
   - Cambiar estado a "rechazado"-->Inactivo
   - Mensaje al usuario: "❌ Su solicitud ha sido rechazada.


Estudiante:
{
  "id_curso_actual": "number (ID del curso)",
}
-->SIN APROBACION
Padre:
{
  "id_estudiante_vinculado": "number (ID del estudiante)",
  "parentesco": "string (Padre|Madre|Acudiente|Hermano|Abuelo|Tío|Otro)",
}
--->SIN APROBACION
Profesor
{
  "id_especializacion": "number (ID de especialización)(Nombre de la especializacion en vez de id)",
  "institucion": "string",
}

1. **Registro:**
   - El usuario completa el formulario de registro.
   - La cuenta se crea con estado "pendiente_aprobacion".
   - Mensaje: "✅ Solicitud de registro enviada. Un administrador revisará su solicitud."

2. **Notificación a administradores:**
   - Se envía notificación a todos los administradores activos.
   - Mensaje: "📧 Se ha enviado una solicitud de aprobación a los administradores."

3. **Panel de aprobación para administradores:**
   - Lista de solicitudes de profesores pendientes.
   - Información mostrada: Nombre, correo, especializacion
   - Botones: Aprobar ✅ | Rechazar ❌

4. **Aprobación:**
   - Cambiar estado a "activo".
   - Mensaje al usuario: "✅ Su cuenta como profesor ha sido aprobada. Ya puede iniciar sesión."
   - Correo: "Su cuenta como profesor ha sido aprobada exitosamente. Bienvenido a la institución."

5. **Rechazo:**
   - Cambiar estado a "rechazado"--->Inactivo
   - Mensaje al usuario: "❌ Su solicitud ha sido rechazada. 

Realiza pruebas completas para el registro de cada rol:

### Pruebas por rol:
- [ ] Admin: Registro exitoso
- [ ] Admin: Registro con campos faltantes
- [ ] Admin: Registro con correo duplicado
- [ ] Admin: Registro con documento duplicado
- [ ] Estudiante: Registro exitoso
- [ ] Padre: Registro exitoso
- [ ] Padre: Registro con estudiante inválido
- [ ] Padre: Registro con parentesco inválido
- [ ] Profesor: Registro exitoso

### Pruebas generales:
- [ ] Verificar que cada rol tenga los campos correctos
- [ ] Verificar que el JSON se envíe correctamente al backend
- [ ] Verificar mensajes de éxito en todos los casos
- [ ] Verificar mensajes de error en todos los casos
- [ ] Verificar validaciones de contraseña
- [ ] Verificar validaciones de correo
- [ ] Verificar que se envíe correo de confirmación
- [ ] Verificar que el usuario se cree correctamente en la base de datos
- [ ] Verificar que el usuario pueda iniciar sesión después del registro


