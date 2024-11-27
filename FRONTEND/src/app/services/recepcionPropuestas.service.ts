import { Injectable } from '@angular/core';
import { AppSettingsService } from '../app-settings.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RecepcionPropuestasService {

constructor(private _app: AppSettingsService, private _http:HttpClient) { }

  obtenerPropuestasProveedores(params:any):Observable<any>{
    return this._http.post(
      `${this._app.API_ENDPOINT}/api/procedimientos/obtenerPropuestas`,
      { id_procedimiento_administrativo: params },
      { headers: this._app.getHeadersToken() }
    );
  }

  guardarRecepcionActo(params: any): Observable<any> {
    return this._http.post(
      `${this._app.API_ENDPOINT}/api/procedimientos/recepcionActo`, params ,
      { headers: this._app.getHeadersToken() }
    );
  }
}
