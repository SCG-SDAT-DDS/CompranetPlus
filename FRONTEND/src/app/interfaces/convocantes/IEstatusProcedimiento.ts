export interface IEstatusProcedimiento {
  id_estatus_procedimiento: number | null;
  nombre_estatus_procedimiento : string;
  estilo: string;
  activo: boolean;
  fecha_ultima_mod: Date | string;
}

export interface IEstatusProcedimientoPublic {
  id_estatus_procedimiento: number | null;
  nombre_estatus_procedimiento : string;
}
