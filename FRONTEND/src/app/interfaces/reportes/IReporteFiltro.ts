export interface IReporteFiltro{
  //filtros de relacion
  id_unidad_responsable:number | null;
  id_unidad_compradora: number | null;
  id_tipo_procedimiento: number | null;
  id_tipo_caracter_licitacion: number | null;
  id_tipo_modalidad: number | null;
  id_estatus_procedimiento: number | null;
  id_estado: number | null;
  id_municipio: number | null;
  id_localidad: number | null;
  id_tipo_personeria_juridica: number | null;
  //filtros abiertos
  numero_licitacion: string | null;
  numero_oficio: string | null;
  importe: number | null;
  concepto: string | null;
  capitulo: string | null;
  proyecto: string | null;
  partida: string | null;
  fecha_publicacion: Date | null;
  fecha_limite_inscripcion: Date | null;
  fecha_visita_lugar: Date | null;
  fecha_apertura: Date | null;
  fecha_fallo: Date | null;
  fecha_junta_aclaraciones: Date | null;
  rfc: string | null;
  razon_social: string | null;
  giro: string | null;
  codigo_postal: string | null;
  //filtros condicionales
  licitacion_recortada: boolean | null;
  licitacion_tecnologia: boolean | null;
  diferendo_acto_apertura: boolean | null;
}
