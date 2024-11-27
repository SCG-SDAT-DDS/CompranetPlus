export interface IBitacora {
  id_rol: number | null;
  id_usuario: number | null;
  seccion_accion : string;
  fecha_accion : Date | null,
  descripcion_accion : string,
  valor_nuevo : string,
  valor_anterior : string,

  nombre_rol: string;
  nombre_usuario: string;
  primer_apellido_usuario: string;
  segundo_apellido_usuario: string;
  
}


