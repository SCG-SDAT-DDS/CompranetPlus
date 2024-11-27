export interface IContrato {

  id_contrato: number | null;
  numero_contrato: string;
  fecha_firma_contrato: Date | string;
  fecha_inicio_contrato: Date | string;
  fecha_fin_contrato: Date | string;
  contrato_generado: boolean;
  monto: number | null;
  monto_anticipo: number | null;
  convenio_modificatorio: boolean;
  url_archivo_convenio: string;
  url_archivo_contrato: string;

  id_procedimiento_administrativo: number | undefined | null;
  id_participante_procedimiento: number | undefined | null;
  
  rfc_proveedor: string;
  nombre_proveedor: string;
  primer_apellido_proveedor: string;
  segundo_apellido_proveedor: string;
  razon_social: string;

  archivo_contrato: string;
  archivo_convenio: string;


}


