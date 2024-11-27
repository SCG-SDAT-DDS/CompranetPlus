export interface IRecepcionApertura {
    id_detalle_convocatoria: number;
    id_procedimiento_administrativo: number;
    fecha_fallo: Date | string;
    hora_fallo: string;
    url_acta_recepcion: any;
    propuestas: any;
    participantes_propuesta: any;
}