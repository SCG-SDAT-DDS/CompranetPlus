export interface IDatoPartidaPresupuestal {
  id_partida_procedimiento: number | undefined | null;
  id_procedimiento_administrativo: number | null;
  numero_partida: string | null;
  nombre_partida: string | null;
  codigo_partida: string | null;
  descripcion_partida: string | null;
  cantidad_partida: string | null;
  precio_unitario: string | null;
  importe: string | null;
  activo: boolean;
  fecha_ultima_mod: Date | string | null;
  usuario_ultima_mod: string | null;
  style: string|null;
  id_proveedor: number | null;
}
