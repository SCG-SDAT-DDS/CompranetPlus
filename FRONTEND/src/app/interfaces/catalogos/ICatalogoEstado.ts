export interface ICatalogoBusquedaEstado {
    nombre : string;
    abreviatura : string;
}

export interface ICatalogoEstado {
    id  :               number | null;
    abrEstado :         string;
    nombre :            string;
    fechaModificacion:  Date | string;
}

export interface IEstado {
  id: number
  estado : string;
}

export interface IEstadoId {
  id: number | null
}