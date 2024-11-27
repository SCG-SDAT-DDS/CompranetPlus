export interface IProveedorInscripcion{
    "id_participante_procedimiento" : number | null,
	"id_procedimiento_administrativo" : number,
	"id_proveedor" : number,
	"id_tipo_participacion" : number,
	"id_estatus_participacion" : number | null,
	"fecha_inscripcion" : Date | string,
	"certificado_proveedor" : string | null,
	"numero_certificado" : string | null,
	"fecha_fallo" : Date | null,
	"url_archivo_acto_fallo" : string | null,
	"procedimiento" : string
}