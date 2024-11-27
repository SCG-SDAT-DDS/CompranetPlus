import {ICatalogoTipoProcedimiento } from "./ICatalogoTipoProcedimiento";

export interface ICatalogoCostoParticipacion {
  id_costo_inscripcion: number | null;
  anio: number | null;
  presupuesto_autorizado: string | null;
  costo_inscripcion: number | null;
  activo: boolean | null;
  id_tipo_procedimiento: number | null;
  cat_tipos_procedimientos: ICatalogoTipoProcedimiento | null
}
