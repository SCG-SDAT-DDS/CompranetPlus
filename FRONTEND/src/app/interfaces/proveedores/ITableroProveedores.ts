export interface ITableroProcedimientos {
    id_procedimiento_administrativo :   number;
    numero_procedimiento :              string;
    descripcion_concepto_contratacion : string;
    id_tipo_procedimiento:              number;
    id_estatus_procedimiento:           number;
    nombre_estatus_procedimiento:       string;
    estilo :                            string;
    nombre_procedimiento :              string;
    id_tipo_contratacion :              number;
  
}

export interface ITableroProcedimientosBusqueda {
    usuarioId :             string | null;
    noProcedimiento :       string;
    tipoProcedimientoId :   number;
    tipoEstatusId  :        number;
    page  :                 number | null;
    pageSize :              number | null;
}

export interface IDetalleParticipanteProcedimiento{
    id_proveedor: number;
    id_procedimiento_administrativo :   number;
}

export interface IPaseCaja{
    id_participante_procedimiento:  number;
    id_procedimiento_administrativo: number;
    rfc_proveedor: string | null;
    nombre: string | null;
    correo_electronico: string | null;
    costo_inscripcion: number | null;
    numero_procedimiento: string | null;
    direccion: string| null;
    fecha_vencimiento: string | null;
    pase_caja : boolean;
}