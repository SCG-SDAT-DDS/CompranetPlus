import { IAnexoProcedimiento } from "./IAnexoProcedimiento";
import {IDatoPartidaPresupuestal} from "./IDatoPartidaPresupuestal";

export interface IProcedimientoAdministrativo {
  id_procedimiento_administrativo: number | undefined | null;
  id_tipo_contratacion: number | null;
  id_unidad_compradora: number | null;
  id_tipo_procedimiento: number | null;
  id_tipo_caracter_licitacion: number | null;
  id_tipo_modalidad: number | null;
  id_tipo_unidad_responsable: number | null;
  
  licitacion_recortada: boolean;
  licitacion_tecnologia: boolean;
  descripcion_concepto_contratacion: string;
  numero_oficio_autorizacion: string;
  importe_autorizado: number | null;
  capitulo: string;
  proyecto: string;
  partida: string;
  id_estatus_procedimiento: number | any;
  numero_procedimiento: string;
  numero_licitanet: string;
  descripcion_normatividad: string;
  numero_cotizaciones: number | null;
  url_archivo_convocatoria: string;
  url_archivo_bases: string;
  url_archivo_oficio_autorizacion: string;
  url_archivo_partidas: string;
  activo: boolean;
  fecha_ultima_mod: Date | string;

  nombre_procedimiento: string;
  nombre_estatus_procedimiento: string;
  estilo: string;
  nombre_caracter_licitacion: string;
  nombre_modalidad: string;
  costo_inscripcion: number | null;
  costo_inscripcion_aut: number | null;

  nombre_unidad_responsable: string | null;

  archivo_convocatoria: string;
  archivo_bases: string;
  archivo_oficio_autorizacion: string;
  archivo_partidas: string;

  id_detalle_convocatoria: number | null;
  fecha_publicacion: Date | string;
  fecha_limite_inscripcion: Date | string;
  fecha_visita_lugar: Date | string;
  existen_visitas_adicionales: boolean;
  descripcion_lugar: string;
  fecha_junta_aclaraciones: Date | string;
  existen_juntas_adicionales: boolean;
  fecha_apertura: Date | string;
  fecha_fallo: Date | string;
  costo_bases: number | null;
  diferendo_acto_apertura: boolean;
  fecha_junta_aclaraciones_nueva: Date | string;
  fecha_limite_inscripcion_nueva: Date | string;
  fecha_apertura_nueva: Date | string | null;
  fecha_inicio_obra_nueva: Date | string;
  url_archivo_aviso_diferendo: string;
  url_archivo_acto_recepcion: string;
  id_junta_aclaraciones: number | null;
  fecha_prorroga: Date | string;
  url_archivo:string;

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

  archivo_contrato: string;

  id_participante_procedimiento: number | null;
  id_proveedor: number | null;

  anexos_procedimiento: IAnexoProcedimiento[];
  anexos_procedimiento_eliminar: IAnexoProcedimiento[];

  numero_participantes: number | null;

  lstDatosPartidaPresupuestal: IDatoPartidaPresupuestal[] | null | undefined;
  url_archivo_acta_fallo: string;
  id_tipo_participacion:  number | null;
  nombre_flujo_procedimiento: string;
  pase_caja: boolean;
}


