export interface ISociosProveedor{
  id_proveedor_socio: number | null;
  id_proveedor : number;
  nombre_socio : string;
  primer_apellido_socio: string;
  segundo_apellido_socio: string;
  rfc_socio: string;
  curp_socio: string;
  domicilio: string;
  vigente: boolean | number;
  fecha_ultima_mod: Date | null;
}
