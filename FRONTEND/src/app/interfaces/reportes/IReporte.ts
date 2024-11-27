import { IReporteFiltro } from "./IReporteFiltro";

export interface IReporte{
  filtro: IReporteFiltro | null;
  columnas: string[] | null;
  formato: string | null;
}
