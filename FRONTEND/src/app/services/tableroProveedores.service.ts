import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppSettingsService } from '../app-settings.service';
import { HttpClient } from '@angular/common/http';
import { IDetalleParticipanteProcedimiento, IPaseCaja, ITableroProcedimientosBusqueda } from '../interfaces/proveedores/ITableroProveedores';


@Injectable({
  providedIn: 'root'
})
export class TableroProveedoresService {

  constructor(private _app: AppSettingsService,
              private _http: HttpClient) {

  }


  getProcedimientos(params: ITableroProcedimientosBusqueda): Observable<any> {
    return this._http.post(
        `${this._app.API_ENDPOINT}/api/tablero/tableroProcedimientos`,
        params,
        {headers: this._app.getHeadersToken()}
    );
  }

  getDetalleParticipante(params: IDetalleParticipanteProcedimiento): Observable<any> {
    return this._http.post(
        `${this._app.API_ENDPOINT}/api/tablero/detalleParticipante/obtener`,
        params,
        {headers: this._app.getHeadersToken()}
    );
  }

  getDetalleParticipantePaseCaja(params: IDetalleParticipanteProcedimiento): Observable<any> {
    return this._http.post(
        `${this._app.API_ENDPOINT}/api/tablero/detalleParticipantePaseCaja/obtener`,
        params,
        {headers: this._app.getHeadersToken()}
    );
  }

  guardarPropuestaProveedor(params: any): Observable<any> {
    return this._http.post(
        `${this._app.API_ENDPOINT}/api/tablero/propuestaProveedor/guardar`,
        params,
        {headers: this._app.getHeadersToken()}
    );
  }

  generarPaseCaja(params: IPaseCaja): Observable<any> {
    return this._http.post(
        `${this._app.API_ENDPOINT}/api/paseCaja/generarPaseCaja`, params,
        {headers: this._app.getHeadersToken()}
    );
  }

  obtenerPaseCaja(params: any): Observable<any> {
    return this._http.post(
      `${this._app.API_ENDPOINT}/api/paseCaja/obtenerB64PaseCaja`, params,
      {headers: this._app.getHeadersToken()}
  );
  }

  consultarRecibo(params: any): Observable<any> {
    return this._http.post(
      `${this._app.API_ENDPOINT}/api/paseCaja/consultarRecibo`, params,
      {headers: this._app.getHeadersToken()}
  );
  }

  enviarNotificacion(params: any): Observable<any> {
    return this._http.post(
      `${this._app.API_ENDPOINT}/api/tablero/notificaciones/acusePropuesta`, params,
      {headers: this._app.getHeadersToken()}
    );
  }

}
