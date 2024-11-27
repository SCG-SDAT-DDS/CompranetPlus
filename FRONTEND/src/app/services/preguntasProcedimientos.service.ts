import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {AppSettingsService} from "../app-settings.service";
import {HttpClient} from "@angular/common/http";
import {IFilesUpload} from "../interfaces/comun/IFilesUpload";


@Injectable({
    providedIn: 'root'
})
export class PreguntasProcedimientosService {

    constructor(private _app: AppSettingsService,
                private _http: HttpClient) {

    }

    obtenerPreguntasProveedor(idProveedor: number | null, idProcedimiento: number): Observable<any> {
        return this._http.get(
            `${this._app.API_ENDPOINT}/api/juntas/obtenerPreguntasProcedimiento?idProveedor=${idProveedor}&idProcedimiento=${idProcedimiento}`,
            {headers: this._app.getHeadersToken()}
        );
    }

    obtenerPreguntasProcedimiento(idProcedimiento: number): Observable<any> {
        return this._http.get(
            `${this._app.API_ENDPOINT}/api/juntas/obtenerPreguntasProcedimiento?idProveedor=&idProcedimiento=${idProcedimiento}`,
            {headers: this._app.getHeadersToken()}
        );
    }

    obtenerArchivoPregunta(idProveedor: number, idProcedimiento: number, id: number, notificar: number=0): Observable<any> {
        return this._http.get(
            `${this._app.API_ENDPOINT}/api/juntas/obtenerArchivosPreguntasProcedimiento?idProveedor=${idProveedor}&idProcedimiento=${idProcedimiento}&id=${id}&enviarNotificaciones=${notificar}`,
            {headers: this._app.getHeadersToken()}
        );
    }

    guardarPreguntas(idProveedor: number, idProcedimiento: number, anexosPreguntaAgregar:Array<IFilesUpload>, anexosPreguntaEliminar:Array<number>|null): Observable<any>{
        return this._http.post(
        `${this._app.API_ENDPOINT}/api/juntas/guardarPreguntasProcedimiento`,
        {
            idProveedor: idProveedor,
            idProcedimiento: idProcedimiento,
            anexosPreguntaAgregar: anexosPreguntaAgregar,
            anexosPreguntaEliminar: anexosPreguntaEliminar
        },
        {headers: this._app.getHeadersToken()}
      );
    }

    obtenerUltimaJunta(idProcedimiento: number): Observable<any> {
        return this._http.get(
            `${this._app.API_ENDPOINT}/api/juntas/obtenerUltimaJunta?idProcedimiento=${idProcedimiento}`,
            {headers: this._app.getHeadersToken()}
        );
    }

}
