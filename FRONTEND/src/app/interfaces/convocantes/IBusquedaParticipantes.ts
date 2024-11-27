export interface IBusquedaParticipante {

  id_procedimiento_administrativo: number | null;

}


export interface IParticipanteInvitado{
  activo:                           boolean;
  descripcion_giro_empresa:         string
  estilo:                           string
  fecha_fallo:                      Date | string;
  fecha_inscripcion:                string;
  fecha_ultima_mod:                 string;
  id_estatus_participacion:         number;
  id_participante_procedimiento:    number;
  id_procedimiento_administrativo:  number;
  id_proveedor:                     number;
  id_tipo_participacion:            number;
  nombre_estatus_participacion:     string;
  nombre_proveedor:                 string;
  primer_apellido_proveedor:        string;
  segundo_apellido_proveedor:       string;
  numero_certificado:               number;
  razon_social:                     string;
  rfc_proveedor:                    string;
  numero_procedimiento:             string | undefined;
  ganador:                          false;
  id_usuario:                       number;     
  seleccionadoLista:                boolean;
}

interface IArchivoFallo {
  base64:         string;
  nombreArchivo:  string;
  procedimiento:  number;
  tipoArchivo:    number;
  encriptar:      boolean;
}

export interface IGanadorFallo {
  archivo_fallo:                    IArchivoFallo;
  id_participante_procedimiento:    number | null;
  id_procedimiento_administrativo:  number;
  numero_procedimiento:             string | undefined;
  ganadores:                        number[];
  participantes:                    number[];
}
