import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppSettingsService } from '../app-settings.service';
import { HttpClient } from '@angular/common/http';
import { ICatalogoBusquedaEstado } from '../interfaces/catalogos/ICatalogoEstado';

@Injectable({
  providedIn: 'root'
})
export class CatalogoEstadosService {

  constructor(private _app: AppSettingsService,
              private _http: HttpClient) { 

  }


  getEstados(params: ICatalogoBusquedaEstado): Observable<any> {
    return this._http.post(
        `${this._app.API_ENDPOINT}/api/catalogos/estados/buscar`,
        params,
        {headers: this._app.getHeadersToken()}
    );
  }

  obtenerEstados(): Observable<any> {
    return this._http.get(
        `${this._app.API_ENDPOINT}/api/cat/estados/obtener`,
        {headers: this._app.getHeaders()}
    );
  }

  getListEstados(): Observable<any> {
    return this._http.get(
        `${this._app.API_ENDPOINT}/api/catalogos/estados/obtener`,
        {headers: this._app.getHeadersToken()}
    );
  }
}
