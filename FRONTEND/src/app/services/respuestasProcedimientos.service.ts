import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {AppSettingsService} from "../app-settings.service";
import {HttpClient} from "@angular/common/http";
import {IFilesUpload} from "../interfaces/comun/IFilesUpload";


@Injectable({
    providedIn: 'root'
})
export class RespuestasProcedimientosService {

    constructor(private _app: AppSettingsService,
                private _http: HttpClient) {

    }

    obtenerUltimaJunta(idProveedor: number, idProcedimiento: number): Observable<any> {
        return this._http.get(
            `${this._app.API_ENDPOINT}/api/juntas/obtenerUltimaJunta?idProveedor=${idProveedor}&idProcedimiento=${idProcedimiento}`,
            {headers: this._app.getHeadersToken()}
        );
    }

    guardarActaJunta(idProcedimiento: number, anexosActaJunta: IFilesUpload): Observable<any> {
        return this._http.post(
            `${this._app.API_ENDPOINT}/api/juntas/guardarActaJunta`,
            {
                idProcedimiento: idProcedimiento,
                anexosActaJunta: anexosActaJunta
            },
            {headers: this._app.getHeadersToken()}
        );
    }

    guardarProrrogaJunta(idProveedor: number, idProcedimiento: number,
                         fechaJuntaAlaraciones: any,
                         anexosActaDiferimiento: IFilesUpload): Observable<any> {
        return this._http.post(
            `${this._app.API_ENDPOINT}/api/juntas/crearProrrogaJunta`,
            {
                idProveedor: idProveedor,
                idProcedimiento: idProcedimiento,
                fechaJuntaAlaraciones: fechaJuntaAlaraciones,
                anexosActaDiferimiento: anexosActaDiferimiento
            },
            {headers: this._app.getHeadersToken()}
        );
    }

}
