export interface IParticipanteProcedimiento {

  id_participante_procedimiento: number | undefined | null;
  id_procedimiento_administrativo: number | null;
  id_proveedor: number | null;
  id_tipo_participacion: number | null;
  id_estatus_participacion: number | null;
  fecha_inscripcion: Date | string;
  certificado_proveedor: string;
  numero_certificado: string;
  fecha_fallo: Date | string;
  url_archivo_acto_fallo: string;

  activo: boolean;
  fecha_ultima_mod: Date | string;

  rfc_proveedor: string;
  nombre_proveedor: string;
  primer_apellido_proveedor: string;
  segundo_apellido_proveedor: string;
  razon_social: string;
  descripcion_giro_empresa: string;
  nombre_estatus_participacion: string;
  estilo: string;

}


export interface IParticipanteInvitadoElegido {
  id_procedimiento_administrativo:  number | null | undefined;
  id_tipo_participacion:            number | null;
}