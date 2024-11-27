import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppSettingsService } from '../app-settings.service';
import { HttpClient } from '@angular/common/http';
import { ICatalogoBusquedaMunicipio } from '../interfaces/catalogos/ICatalogoMunicipio';
import { IEstadoId } from '../interfaces/catalogos/ICatalogoEstado';


@Injectable({
  providedIn: 'root'
})
export class CatalogoMunicipiosService {

  constructor(private _app: AppSettingsService,
    private _http: HttpClient) { 

  }


  getMunicipios(params: ICatalogoBusquedaMunicipio): Observable<any> {
    return this._http.post(
        `${this._app.API_ENDPOINT}/api/catalogos/municipios/buscar`,
        params,
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

  obtenerMunicipios(params: IEstadoId): Observable<any>{
    return this._http.post(
      `${this._app.API_ENDPOINT}/api/cat/municipios/obtener`,
      params,
      {headers: this._app.getHeaders()}
    );
  }

  

}
