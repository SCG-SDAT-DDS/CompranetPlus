import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppSettingsService } from '../app-settings.service';
import { HttpClient } from '@angular/common/http';
import { INotificacionLeida, INotificacionesUsuario } from '../interfaces/INotificaciones';


@Injectable({
  providedIn: 'root'
})
export class NoticicacionesService {

  constructor(private _app: AppSettingsService,
              private _http: HttpClient) { 
  }

  getNotificaciones(params: INotificacionesUsuario): Observable<any> {
    return this._http.post(
        `${this._app.API_ENDPOINT}/api/tablero/notificaciones/proveedor`,
        params,
        {headers: this._app.getHeadersToken()}
    );
  }

  notificacionLeida(params: INotificacionLeida): Observable<any> {
    return this._http.post(
        `${this._app.API_ENDPOINT}/api/tablero/notificaciones/leida`,
        params,
        {headers: this._app.getHeadersToken()}
    );
  }


}
