export interface IDetReportesPublico{
  id_det_reportes_public: number | null;
  nombre_cliente: string | null;
  correo: string | null;
  pin_descarga: string | null;
  fecha: Date | null;
  activo: boolean | null;
  id_det_reportes: number;
}
