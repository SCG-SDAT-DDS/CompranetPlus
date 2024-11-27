export interface ICatalogoMunicipio {
  id  :               number | null;
  estado :            string;
  nombre :            string;
  totalPage:          number;
  fechaModificacion:  Date | string;
}

export interface ICatalogoBusquedaMunicipio {
    nombreMunicicpio :  string;
    idEstado :          number;
    page:               number | null;
    pageSize :          number | null;
}

export interface IMunicipio {
  id: number
  municipio : string;
}

export interface IMunicipioId{
  id:number
}
