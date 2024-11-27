export interface IAnexoProcedimiento {

  id_anexo_procedimiento: number | undefined | null;
  id_tipo_archivo: number | null;
  id_procedimiento_administrativo: number | null;
  url_archivo_anexo: string; 
  comentarios: string;
  activo: boolean;
  fecha_ultima_mod: Date | string;
  archivo_anexo: string;

  nombre_tipo_archivo: string;


}


