export interface IBusquedaProcedimiento {
  id_tipo_contratacion: number | null;
  id_tipo_procedimiento: number | null;
  numero_procedimiento : string;
  concepto_contratacion : string;
  id_unidad_compradora: number | null;

  page: number | null;
  pageSize: number | null;
}
