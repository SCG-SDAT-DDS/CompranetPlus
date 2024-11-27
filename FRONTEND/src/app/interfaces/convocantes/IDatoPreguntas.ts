import {IFilesUpload} from "../comun/IFilesUpload";

export interface IDatoPreguntas {
  id_pregunta_participante: number | undefined | null;
  id_participante_procedimiento: number | undefined | null;
  url_archivo: string | null;
  fecha_descarga_conv: string | null;
  activo: boolean;
  fecha_ultima_mod: Date | string | null;
  usuario_ultima_mod: string | null;

  archivoCargaTmp: IFilesUpload|null;
  visibleFiltro: boolean;
  id_proveedor: number|null;
}
