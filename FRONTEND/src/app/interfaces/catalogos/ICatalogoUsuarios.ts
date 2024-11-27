export interface ICatalogoUsuarios {
  id: number | null;
  nombre : string;
  aPaterno: string;
  aMaterno: string;
  nombreCompleto: string;
  usuario: string;
  email: string;
  idRol: number;
  rol: string;
  contrasena: string;
  estatus: boolean;
  fechaModificacion: Date | string;
  fechaRegistro: Date | string;
  fechaUltimoIngreso: Date | string;
}
