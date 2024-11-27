export interface ICatalogoDiaFestivo {
    id_dia_festivo: number | null;
    nombre_dia_festivo: string;
    fecha_dia_festivo: Date | string;
    dias: number;
    activo: boolean | number;
    page: number;
    pageSize: number | null;
}
