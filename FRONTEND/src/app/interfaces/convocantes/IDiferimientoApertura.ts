export interface IDiferimientoApertura {
    id_detalle_convocatoria: number,
    fecha_junta_aclaraciones_nueva: Date | string, 
    hora_junta_aclaraciones_nueva: string,
    fecha_limite_inscripcion_nueva: Date | string,  
    fecha_apertura_nueva: Date | string,  
    hora_apertura_nueva: string,
    fecha_inicio_obra_nueva: Date | string,
    url_archivo_aviso_diferendo: string,
    procedimiento: string
}