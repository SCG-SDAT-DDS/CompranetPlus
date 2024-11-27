import { ICatalogoUnidadResponsable } from "./ICatalogoUnidadResponsable"

export interface ICatalogoUnidadCompradora{
  id_unidad_compradora: number | null,
  nombre_unidad_compradora: string | null,
  clave_unidad_compradora: string | null,
  id_unidad_responsable: number | null,
  id_tipo_unidad_responsable: number | null,
  tipo_unidad_responsable: string | null,
  pagina_web: string | null,
  nombre_vialidad: string | null,
  id_estado: number | null,
  id_municipio: number | null,
  codigo_postal: string | null,
  nombre_responsable: string | null,
  puesto: string | null,
  correo: string | null,
  telefono: string | null,
  activo: boolean | null,
  cat_unidades_responsables: ICatalogoUnidadResponsable | null
}
