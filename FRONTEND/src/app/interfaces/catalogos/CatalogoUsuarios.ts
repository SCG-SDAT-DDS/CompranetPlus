import { CatalogoRol } from "./CatalogoRol";

export interface CatalogoUsuarios {
  id: number | '';
  nombre: string;
  paterno: string;
  materno: string;
  usuario: string;
  estatus: boolean | '';
  rol: CatalogoRol[];
  fechaRegistro: Date | string;
  fechaModificacion: Date | string;
  fechaUltimoIngreso: Date | string;
}
