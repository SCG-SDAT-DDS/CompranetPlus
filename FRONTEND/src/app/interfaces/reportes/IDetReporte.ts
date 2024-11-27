export interface IDetReporte{
  id_det_reportes: number;
  nombre_reporte:string | null;
  fecha: Date | null;
  filtro: string;
  columnas: string;
  activo: boolean | null;
  id_usuario: number | null;
}
