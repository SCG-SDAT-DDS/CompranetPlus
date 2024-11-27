export interface ICatalogoTipoArchivo{
    id_tipo_archivo: number | '';
    nombre_tipo_archivo : string;
    caracter : boolean | '';
    activo: boolean | '';
}

export interface ICatalogoTipoArchivoBusqueda{
    nombre_tipo_archivo : string | null;
    caracter: boolean | null;
    activo: boolean | null;
}

export interface ICatalogoTipoArchivoDelete{
    id_tipo_archivo: number;
    enUso: boolean | null;
}