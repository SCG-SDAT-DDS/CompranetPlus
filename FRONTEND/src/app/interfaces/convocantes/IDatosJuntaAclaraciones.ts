export interface IDatosJuntaAclaraciones{
  id_junta_aclaraciones: number | null;
  id_procedimiento_administrativo: number | null;
  url_archivo: string | null;
  activo: boolean | null;
  fecha_junta_aclaraciones: Date | null;
  fecha_ultima_mod: Date | null;
  fecha_carga_acta: Date | null;
  horaServidor: Date | null;
}
