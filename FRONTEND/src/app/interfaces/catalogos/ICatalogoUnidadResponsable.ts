import { ICatalogoTipoUnidadResponsable } from './ICatalogoTipoUnidadResponsable';
export interface ICatalogoUnidadResponsable{
  id_unidad_responsable: number | null;
  nombre_unidad_responsable: string | null;
  siglas: string | null;
  activo: boolean | null;
  id_tipo_unidad_responsable : number | null;
  cat_tipo_unidades_responsables : ICatalogoTipoUnidadResponsable | null;
}
