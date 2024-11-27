export interface ICatalogoLocalidad {
    id  :               number | null;
    estado :         string;
    municipio :         string;
    nombre :            string;
    fechaModificacion:  Date | string;
  }

export interface ICatalogoBusquedaLocalidad {
    nombreMunicipio : string;
    idMunicipio :     number;
    idEstado  :       number;
    page  :           number | null;
    pageSize :        number | null;
}

export interface ILocalidad {
  id: number,
  localidad: string
}
