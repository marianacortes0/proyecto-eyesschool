export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      administrador: {
        Row: {
          cargo: string
          estado: string
          fechaAsignacion: string
          fechaFin: string | null
          idAdministrador: number
          idUsuario: number
          nivelAcceso: string
        }
        Insert: {
          cargo: string
          estado?: string
          fechaAsignacion?: string
          fechaFin?: string | null
          idAdministrador?: number
          idUsuario: number
          nivelAcceso?: string
        }
        Update: {
          cargo?: string
          estado?: string
          fechaAsignacion?: string
          fechaFin?: string | null
          idAdministrador?: number
          idUsuario?: number
          nivelAcceso?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_administrador_usuario"
            columns: ["idUsuario"]
            isOneToOne: true
            referencedRelation: "usuario"
            referencedColumns: ["idUsuario"]
          },
        ]
      }
      asignaciones: {
        Row: {
          activo: boolean
          fechaAsignacion: string
          fechaFinalizacion: string | null
          idAsignacion: number
          idCurso: number
          idMateria: number
          idProfesor: number
        }
        Insert: {
          activo?: boolean
          fechaAsignacion?: string
          fechaFinalizacion?: string | null
          idAsignacion?: number
          idCurso: number
          idMateria: number
          idProfesor: number
        }
        Update: {
          activo?: boolean
          fechaAsignacion?: string
          fechaFinalizacion?: string | null
          idAsignacion?: number
          idCurso?: number
          idMateria?: number
          idProfesor?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_asignaciones_curso"
            columns: ["idCurso"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["idCurso"]
          },
          {
            foreignKeyName: "fk_asignaciones_materia"
            columns: ["idMateria"]
            isOneToOne: false
            referencedRelation: "materias"
            referencedColumns: ["idMateria"]
          },
          {
            foreignKeyName: "fk_asignaciones_profesor"
            columns: ["idProfesor"]
            isOneToOne: false
            referencedRelation: "profesores"
            referencedColumns: ["idProfesor"]
          },
        ]
      }
      Asistencia: {
        Row: {
          estado: string
          fecha: string
          fechaRegistro: string
          idAsistencia: number
          idEstudiante: number
          observacion: string | null
          registradoPor: number
        }
        Insert: {
          estado: string
          fecha: string
          fechaRegistro?: string
          idAsistencia?: number
          idEstudiante: number
          observacion?: string | null
          registradoPor: number
        }
        Update: {
          estado?: string
          fecha?: string
          fechaRegistro?: string
          idAsistencia?: number
          idEstudiante?: number
          observacion?: string | null
          registradoPor?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_asistencia_estudiante"
            columns: ["idEstudiante"]
            isOneToOne: false
            referencedRelation: "estudiantes"
            referencedColumns: ["idEstudiante"]
          },
          {
            foreignKeyName: "fk_asistencia_registradopor"
            columns: ["registradoPor"]
            isOneToOne: false
            referencedRelation: "usuario"
            referencedColumns: ["idUsuario"]
          },
        ]
      }
      Asistencia_Aula: {
        Row: {
          estado: string
          fecha: string
          fechaRegistro: string
          idAsistenciaAula: number
          idEstudiante: number
          idHorario: number
          observacion: string
          registradoPor: number
        }
        Insert: {
          estado: string
          fecha: string
          fechaRegistro?: string
          idAsistenciaAula?: number
          idEstudiante: number
          idHorario: number
          observacion: string
          registradoPor: number
        }
        Update: {
          estado?: string
          fecha?: string
          fechaRegistro?: string
          idAsistenciaAula?: number
          idEstudiante?: number
          idHorario?: number
          observacion?: string
          registradoPor?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_asistenciaaula_estudiante"
            columns: ["idEstudiante"]
            isOneToOne: false
            referencedRelation: "estudiantes"
            referencedColumns: ["idEstudiante"]
          },
          {
            foreignKeyName: "fk_asistenciaaula_horario"
            columns: ["idHorario"]
            isOneToOne: false
            referencedRelation: "Horario"
            referencedColumns: ["idHorario"]
          },
          {
            foreignKeyName: "fk_asistenciaaula_registradopor"
            columns: ["registradoPor"]
            isOneToOne: false
            referencedRelation: "usuario"
            referencedColumns: ["idUsuario"]
          },
        ]
      }
      cursos: {
        Row: {
          activo: boolean
          ano: number
          area: string | null
          descripcion: string | null
          fechaCreacion: string
          grado: string
          idCurso: number
          intensidadHoraria: number | null
          jornada: string
          nombreCurso: string
        }
        Insert: {
          activo?: boolean
          ano: number
          area?: string | null
          descripcion?: string | null
          fechaCreacion?: string
          grado: string
          idCurso?: number
          intensidadHoraria?: number | null
          jornada: string
          nombreCurso: string
        }
        Update: {
          activo?: boolean
          ano?: number
          area?: string | null
          descripcion?: string | null
          fechaCreacion?: string
          grado?: string
          idCurso?: number
          intensidadHoraria?: number | null
          jornada?: string
          nombreCurso?: string
        }
        Relationships: []
      }
      especializaciones: {
        Row: {
          activo: boolean
          descripcion: string | null
          idEspecializacion: number
          nombreEspecializacion: string
        }
        Insert: {
          activo?: boolean
          descripcion?: string | null
          idEspecializacion?: number
          nombreEspecializacion: string
        }
        Update: {
          activo?: boolean
          descripcion?: string | null
          idEspecializacion?: number
          nombreEspecializacion?: string
        }
        Relationships: []
      }
      estudianteips: {
        Row: {
          activo: boolean
          fechaAfiliacion: string
          fechaVencimiento: string | null
          idEstudiante: number
          idIPS: number
          nombreIPS: string
          tipoAfiliacion: string
        }
        Insert: {
          activo?: boolean
          fechaAfiliacion: string
          fechaVencimiento?: string | null
          idEstudiante: number
          idIPS: number
          nombreIPS: string
          tipoAfiliacion: string
        }
        Update: {
          activo?: boolean
          fechaAfiliacion?: string
          fechaVencimiento?: string | null
          idEstudiante?: number
          idIPS?: number
          nombreIPS?: string
          tipoAfiliacion?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_estudianteips_estudiante"
            columns: ["idEstudiante"]
            isOneToOne: false
            referencedRelation: "estudiantes"
            referencedColumns: ["idEstudiante"]
          },
        ]
      }
      estudiantes: {
        Row: {
          codigoEstudiante: string
          estado: string
          fechaEgreso: string | null
          fechaIngreso: string
          fechaRegistro: string
          Horario_idHorario: number | null
          idCursoActual: number | null
          idEstudiante: number
          idUsuario: number
        }
        Insert: {
          codigoEstudiante: string
          estado?: string
          fechaEgreso?: string | null
          fechaIngreso: string
          fechaRegistro?: string
          Horario_idHorario?: number | null
          idCursoActual?: number | null
          idEstudiante?: number
          idUsuario: number
        }
        Update: {
          codigoEstudiante?: string
          estado?: string
          fechaEgreso?: string | null
          fechaIngreso?: string
          fechaRegistro?: string
          Horario_idHorario?: number | null
          idCursoActual?: number | null
          idEstudiante?: number
          idUsuario?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_estudiantes_curso"
            columns: ["idCursoActual"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["idCurso"]
          },
          {
            foreignKeyName: "fk_estudiantes_usuario"
            columns: ["idUsuario"]
            isOneToOne: true
            referencedRelation: "usuario"
            referencedColumns: ["idUsuario"]
          },
        ]
      }
      Horario: {
        Row: {
          activo: boolean
          dia: string
          horaFin: string
          horaInicio: string
          idCurso: number
          idHorario: number
          idMateria: number
          salon: string
        }
        Insert: {
          activo?: boolean
          dia: string
          horaFin: string
          horaInicio: string
          idCurso: number
          idHorario?: number
          idMateria: number
          salon: string
        }
        Update: {
          activo?: boolean
          dia?: string
          horaFin?: string
          horaInicio?: string
          idCurso?: number
          idHorario?: number
          idMateria?: number
          salon?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_horario_curso"
            columns: ["idCurso"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["idCurso"]
          },
          {
            foreignKeyName: "fk_horario_materia"
            columns: ["idMateria"]
            isOneToOne: false
            referencedRelation: "materias"
            referencedColumns: ["idMateria"]
          },
        ]
      }
      materias: {
        Row: {
          activa: boolean
          codigoMateria: string
          idMateria: number
          nombreMateria: string
        }
        Insert: {
          activa?: boolean
          codigoMateria: string
          idMateria?: number
          nombreMateria: string
        }
        Update: {
          activa?: boolean
          codigoMateria?: string
          idMateria?: number
          nombreMateria?: string
        }
        Relationships: []
      }
      notas: {
        Row: {
          fechaRegistro: string
          idEstudiante: number
          idMateria: number
          idNota: number
          idPeriodo: number
          nota: number
          observacion: string | null
          registradoPor: number
        }
        Insert: {
          fechaRegistro?: string
          idEstudiante: number
          idMateria: number
          idNota?: number
          idPeriodo: number
          nota: number
          observacion?: string | null
          registradoPor: number
        }
        Update: {
          fechaRegistro?: string
          idEstudiante?: number
          idMateria?: number
          idNota?: number
          idPeriodo?: number
          nota?: number
          observacion?: string | null
          registradoPor?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_notas_estudiante"
            columns: ["idEstudiante"]
            isOneToOne: false
            referencedRelation: "estudiantes"
            referencedColumns: ["idEstudiante"]
          },
          {
            foreignKeyName: "fk_notas_materia"
            columns: ["idMateria"]
            isOneToOne: false
            referencedRelation: "materias"
            referencedColumns: ["idMateria"]
          },
          {
            foreignKeyName: "fk_notas_registradopor"
            columns: ["registradoPor"]
            isOneToOne: false
            referencedRelation: "usuario"
            referencedColumns: ["idUsuario"]
          },
        ]
      }
      novedades: {
        Row: {
          accionTomada: string | null
          descripcion: string
          estado: string
          fecha: string
          fechaResolucion: string | null
          idEstudiante: number
          idNovedad: number
          idTipoNovedad: number
          registradoPor: number
        }
        Insert: {
          accionTomada?: string | null
          descripcion: string
          estado?: string
          fecha?: string
          fechaResolucion?: string | null
          idEstudiante: number
          idNovedad?: number
          idTipoNovedad: number
          registradoPor: number
        }
        Update: {
          accionTomada?: string | null
          descripcion?: string
          estado?: string
          fecha?: string
          fechaResolucion?: string | null
          idEstudiante?: number
          idNovedad?: number
          idTipoNovedad?: number
          registradoPor?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_novedades_estudiante"
            columns: ["idEstudiante"]
            isOneToOne: false
            referencedRelation: "estudiantes"
            referencedColumns: ["idEstudiante"]
          },
          {
            foreignKeyName: "fk_novedades_registradopor"
            columns: ["registradoPor"]
            isOneToOne: false
            referencedRelation: "usuario"
            referencedColumns: ["idUsuario"]
          },
          {
            foreignKeyName: "fk_novedades_tipo"
            columns: ["idTipoNovedad"]
            isOneToOne: false
            referencedRelation: "tiposnovedad"
            referencedColumns: ["idTipoNovedad"]
          },
        ]
      }
      padres: {
        Row: {
          idEstudiante: number
          idPadre: number
          idUsuario: number
          ocupacion: string | null
          parentesco: string
        }
        Insert: {
          idEstudiante: number
          idPadre?: number
          idUsuario: number
          ocupacion?: string | null
          parentesco: string
        }
        Update: {
          idEstudiante?: number
          idPadre?: number
          idUsuario?: number
          ocupacion?: string | null
          parentesco?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_padres_estudiante"
            columns: ["idEstudiante"]
            isOneToOne: false
            referencedRelation: "estudiantes"
            referencedColumns: ["idEstudiante"]
          },
          {
            foreignKeyName: "fk_padres_usuario"
            columns: ["idUsuario"]
            isOneToOne: false
            referencedRelation: "usuario"
            referencedColumns: ["idUsuario"]
          },
        ]
      }
      profesores: {
        Row: {
          codigoProfesor: string
          estado: string
          fechaRegistro: string
          fechaVinculacion: string
          idProfesor: number
          idUsuario: number
          nivelEstudios: string
          titulo: string
        }
        Insert: {
          codigoProfesor: string
          estado?: string
          fechaRegistro?: string
          fechaVinculacion: string
          idProfesor?: number
          idUsuario: number
          nivelEstudios: string
          titulo: string
        }
        Update: {
          codigoProfesor?: string
          estado?: string
          fechaRegistro?: string
          fechaVinculacion?: string
          idProfesor?: number
          idUsuario?: number
          nivelEstudios?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_profesores_usuario"
            columns: ["idUsuario"]
            isOneToOne: true
            referencedRelation: "usuario"
            referencedColumns: ["idUsuario"]
          },
        ]
      }
      profesores_horario: {
        Row: {
          activo: boolean
          fechaAsignacion: string
          idHorario: number
          idProfesor: number
        }
        Insert: {
          activo?: boolean
          fechaAsignacion?: string
          idHorario: number
          idProfesor: number
        }
        Update: {
          activo?: boolean
          fechaAsignacion?: string
          idHorario?: number
          idProfesor?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_profesores_horario_horario"
            columns: ["idHorario"]
            isOneToOne: false
            referencedRelation: "Horario"
            referencedColumns: ["idHorario"]
          },
          {
            foreignKeyName: "fk_profesores_horario_profesor"
            columns: ["idProfesor"]
            isOneToOne: false
            referencedRelation: "profesores"
            referencedColumns: ["idProfesor"]
          },
        ]
      }
      profesorespecializacion: {
        Row: {
          idEspecializacion: number
          idProfesor: number
          institucion: string
        }
        Insert: {
          idEspecializacion: number
          idProfesor: number
          institucion: string
        }
        Update: {
          idEspecializacion?: number
          idProfesor?: number
          institucion?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_profesoresp_especializacion"
            columns: ["idEspecializacion"]
            isOneToOne: false
            referencedRelation: "especializaciones"
            referencedColumns: ["idEspecializacion"]
          },
          {
            foreignKeyName: "fk_profesoresp_profesor"
            columns: ["idProfesor"]
            isOneToOne: false
            referencedRelation: "profesores"
            referencedColumns: ["idProfesor"]
          },
        ]
      }
      Reportes: {
        Row: {
          archivoGenerado: string | null
          estado: string
          fechaFin: string
          fechaGeneracion: string
          fechaInicio: string
          idAdministrador: number
          idReporte: number
          nombreReporte: string
          parametros: string
          tipoReporte: string
        }
        Insert: {
          archivoGenerado?: string | null
          estado?: string
          fechaFin: string
          fechaGeneracion?: string
          fechaInicio: string
          idAdministrador: number
          idReporte?: number
          nombreReporte: string
          parametros: string
          tipoReporte: string
        }
        Update: {
          archivoGenerado?: string | null
          estado?: string
          fechaFin?: string
          fechaGeneracion?: string
          fechaInicio?: string
          idAdministrador?: number
          idReporte?: number
          nombreReporte?: string
          parametros?: string
          tipoReporte?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_reportes_administrador"
            columns: ["idAdministrador"]
            isOneToOne: false
            referencedRelation: "administrador"
            referencedColumns: ["idAdministrador"]
          },
        ]
      }
      roles: {
        Row: {
          idRol: number
          nombreRol: string
        }
        Insert: {
          idRol?: number
          nombreRol: string
        }
        Update: {
          idRol?: number
          nombreRol?: string
        }
        Relationships: []
      }
      tiposnovedad: {
        Row: {
          activo: boolean
          descripcion: string | null
          idTipoNovedad: number
          nivelGravedad: string
          nombreTipo: string
          requiereAccion: boolean
        }
        Insert: {
          activo?: boolean
          descripcion?: string | null
          idTipoNovedad?: number
          nivelGravedad?: string
          nombreTipo: string
          requiereAccion?: boolean
        }
        Update: {
          activo?: boolean
          descripcion?: string | null
          idTipoNovedad?: number
          nivelGravedad?: string
          nombreTipo?: string
          requiereAccion?: boolean
        }
        Relationships: []
      }
      usuario: {
        Row: {
          auth_id: string | null
          correo: string | null
          direccion: string | null
          estado: boolean
          fechaRegistro: string
          genero: string | null
          idRol: number
          idUsuario: number
          idUsuario_uuid: string | null
          numeroDocumento: string
          password: string | null
          primerApellido: string
          primerNombre: string
          segundoApellido: string | null
          segundoNombre: string | null
          telefono: string | null
          tipoDocumento: string
          ultimoAcceso: string | null
        }
        Insert: {
          auth_id?: string | null
          correo?: string | null
          direccion?: string | null
          estado?: boolean
          fechaRegistro?: string
          genero?: string | null
          idRol: number
          idUsuario?: number
          idUsuario_uuid?: string | null
          numeroDocumento: string
          password?: string | null
          primerApellido: string
          primerNombre: string
          segundoApellido?: string | null
          segundoNombre?: string | null
          telefono?: string | null
          tipoDocumento: string
          ultimoAcceso?: string | null
        }
        Update: {
          auth_id?: string | null
          correo?: string | null
          direccion?: string | null
          estado?: boolean
          fechaRegistro?: string
          genero?: string | null
          idRol?: number
          idUsuario?: number
          idUsuario_uuid?: string | null
          numeroDocumento?: string
          password?: string | null
          primerApellido?: string
          primerNombre?: string
          segundoApellido?: string | null
          segundoNombre?: string | null
          telefono?: string | null
          tipoDocumento?: string
          ultimoAcceso?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_usuario_rol"
            columns: ["idRol"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["idRol"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      custom_access_token_hook: { Args: { event: Json }; Returns: Json }
      get_current_user_id: { Args: never; Returns: number }
      get_current_user_rol: { Args: never; Returns: number }
      get_my_idusuario: { Args: never; Returns: number }
      get_my_rol: { Args: never; Returns: string }
      get_my_role: { Args: never; Returns: string }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
