export interface ICatalogoUCADExtemporanea{
  id_cat_unidades_compradoras_ad_extemporanea: number | null,
  fecha_otorgado: Date | string | null,
  fecha_inicio_periodo: Date | string | null,
  fecha_fin_periodo: Date | string | null,
  activo: boolean | null,
  id_unidad_compradora: number | null,
  estatus_periodo: boolean | null,
}
