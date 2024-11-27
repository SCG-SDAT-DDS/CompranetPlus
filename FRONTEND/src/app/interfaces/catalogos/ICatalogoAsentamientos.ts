export interface ICatalogoAsentamiento {
    id_asentamiento     :   number | null;
    estado              :   string;
    municipio           :   string;
    nombre_asentamiento :   string;
    codigo_postal       :   string;
    tipo_asentamiento   :   string;
    id_estado           :   number;
    id_municipio        :   number;
    activo              :   boolean;
    fechaModificacion   :   Date | string;

  }

export interface ICatalogoBusquedaAsentamiento {
    cp              : string;
    idMunicipio     : number;
    idEstado        : number;
    idLocalidad     : number;
    activo          : boolean;
    page            : number | null
    pageSize        : number | null;
}

export interface ICatalogoAsentamientoEstatus {
  id_asentamiento: number | null;
  activo: boolean;
}
