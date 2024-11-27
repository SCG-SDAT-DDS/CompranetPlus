import { IAnexoProcedimiento } from "./IAnexoProcedimiento";
import { IContrato } from "./IContrato";
import { IParticipanteProcedimiento } from "./IParticipanteProcedimiento";
import { IProcedimientoAdministrativo } from "./IProcedimientoAdministrativo";

export interface IDetalleProcedimiento {
  
  procedimiento: IProcedimientoAdministrativo;
  anexos: IAnexoProcedimiento[];
  participantes: IParticipanteProcedimiento[];
  contratos: IContrato[];
  
}

export interface IDetalleProcedimientoID {
  id_procedimiento_administrativo: number;
}
