export interface INotificaciones {

    id_notificacion_usuario :   number;
    id_usuario_recibe :         number,
    titulo_notificacion :       string;
    descripcion_notificacion :  string;
    fecha_notificacion :        Date;
    estatus_leido :             boolean;
    fecha_leido :               Date;
    activo :                    boolean;
    fecha_ultima_mod :          boolean;
    usuario_ultima_mod:         boolean;
}

export interface INotificacionesUsuario {
    id_usuario :           string;
}

export interface INotificacionLeida {
    id_notificacion :           number;
    
}