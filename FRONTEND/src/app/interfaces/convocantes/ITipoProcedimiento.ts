export interface ITipoProcedimiento {
  id_tipo_procedimiento: number | null;
  nombre_procedimiento : string;
  activo: boolean;
  fecha_ultima_mod: Date | string;
}
