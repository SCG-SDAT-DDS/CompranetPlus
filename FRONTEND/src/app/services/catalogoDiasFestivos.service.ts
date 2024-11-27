import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppSettingsService } from '../app-settings.service';
import { ICatalogoDiaFestivo } from '../interfaces/catalogos/ICatalogoDiaFestivo';

@Injectable({
  providedIn: 'root'
})
export class CatalogoDiasFestivosService {
  constructor(private _app: AppSettingsService, private _http: HttpClient) { }

  obtenerDiasFestivos(params: ICatalogoDiaFestivo): Observable<any> {
    return this._http.post(
      `${this._app.API_ENDPOINT}/api/catalogos/diasFestivos/obtener`,
      params,
      {headers: this._app.getHeadersToken()}
    );
  }

  obtenerDiasFestivosList(): Observable<any> {
    return this._http.get(
      `${this._app.API_ENDPOINT}/api/catalogos/diasFestivos/list`,
      {headers: this._app.getHeadersToken()}
    );
  }

  guardarDia(params: ICatalogoDiaFestivo): Observable<any> {
    return this._http.post(
      `${this._app.API_ENDPOINT}/api/catalogos/diasFestivos/guardar`,
      params,
      { headers: this._app.getHeadersToken() }
    );
  }

  cambiarEstatusDiaFestivo(params: ICatalogoDiaFestivo): Observable<any> {
    return this._http.patch(
        `${this._app.API_ENDPOINT}/api/catalogos/diasFestivos/cambiarEstatus`,
        params,
        {headers: this._app.getHeadersToken()}
    );
  }

}
