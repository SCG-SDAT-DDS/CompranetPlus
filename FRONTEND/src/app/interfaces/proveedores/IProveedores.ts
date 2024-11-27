export interface IProveedor {
    id_proveedor: number;
    rfc_proveedor: string;
    password: string;
    id_tipo_personeria_juridica: number;
    nombre_proveedor: string;
    primer_apellido_proveedor: string;
    segundo_apellido_proveedor: string;
    curp: string;
    razon_social: string;
    nombre_representante: string;
    primer_apellido_representante: string;
    segundo_apellido_representante: string;
    url_identificacion_representante: {};
    url_identificacion_reverso_representante: {};
    numero_registro_imss : string;
    url_cedula_profesional: any;
    numero_cedula_profesional: string;
    descripcion_giro_empresa: string;
    nombre_vialidad: string;
    numero_exterior: string;
    numero_interior: string;
    codigo_postal: string;
    nombre_colonia: string;
    id_localidad: number;
    id_municipio: number;
    id_estado: number;
    referencia: string;
    correo_electronico: string;
    telefono: string;
    url_constancia_situacion: {};
    id_estatus_proveedor: number;
    id_usuario: number;
    activo: boolean;
    fecha_ultima_mod: Date | null;
}

export interface IProveedorBusqueda {
    rfc_proveedor: string | null;
    razon_social: string | null;
    page: number | null;
    pageSize: number | null;
    id_personalidad_juridica: number | null;
}
