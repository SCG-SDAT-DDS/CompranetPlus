import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppSettingsService } from '../app-settings.service';
import { HttpClient } from '@angular/common/http';
import { ICatalogoBusquedaLocalidad } from '../interfaces/catalogos/ICatalogoLocalidad';
import { IEstadoId } from '../interfaces/catalogos/ICatalogoEstado';
import { IMunicipioId } from '../interfaces/catalogos/ICatalogoMunicipio';

@Injectable({
  providedIn: 'root'
})
export class CatalogoLocalidadesService {

  constructor(private _app: AppSettingsService,
    private _http: HttpClient) { 

  }

  getLocalidades(params: ICatalogoBusquedaLocalidad): Observable<any> {
    return this._http.post(
        `${this._app.API_ENDPOINT}/api/catalogos/localidades/buscar`,
        params,
        {headers: this._app.getHeadersToken()}
    );
  }

  getEstados(): Observable<any> {
    return this._http.get(
        `${this._app.API_ENDPOINT}/api/catalogos/estados/obtener`,
        {headers: this._app.getHeadersToken()}
    );
  }

  getMunicipiosIdEstado(params: IEstadoId): Observable<any> {
    return this._http.post(
        `${this._app.API_ENDPOINT}/api/catalogos/municipios/obtener`,
        params,
        {headers: this._app.getHeadersToken()}
    );
  }

  obtenerLocalidadesByMunicipio(params: IMunicipioId): Observable<any> {
    return this._http.post(
        `${this._app.API_ENDPOINT}/api/cat/localidades/obtener`,
        params,
        {headers: this._app.getHeaders()}
    );
  }
}
