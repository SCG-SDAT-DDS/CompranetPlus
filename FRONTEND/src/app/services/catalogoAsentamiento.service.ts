
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppSettingsService } from '../app-settings.service';
import { HttpClient } from '@angular/common/http';
import { ICatalogoAsentamiento, ICatalogoAsentamientoEstatus, ICatalogoBusquedaAsentamiento } from '../interfaces/catalogos/ICatalogoAsentamientos';

@Injectable({
  providedIn: 'root'
})
export class CatalogoAsentamientoService {

  constructor(private _app: AppSettingsService,
    private _http: HttpClient) { 

  }

  getAsentamientos(params: ICatalogoBusquedaAsentamiento): Observable<any> {
    return this._http.post(
        `${this._app.API_ENDPOINT}/api/catalogos/asentamientos/buscar`,
        params,
        {headers: this._app.getHeadersToken()}
    );
  }

  guardarAsentamiento(params: ICatalogoAsentamiento): Observable<any>{
    return this._http.patch(
      `${this._app.API_ENDPOINT}/api/catalogos/asentamientos/guardar`,
      params,
      {headers: this._app.getHeadersToken()}
  );
    
  }

  cambiarEstatusAsentamiento(params: ICatalogoAsentamientoEstatus): Observable<any> {
    return this._http.patch(
        `${this._app.API_ENDPOINT}/api/catalogos/asentamientos/cambiarEstatus`, params,
        {headers: this._app.getHeadersToken()}
    );
  }

  obtenerDatosByCP(params: number):Observable<any> {
    return this._http.post(
      `${this._app.API_ENDPOINT}/api/cat/asentamiento/obtener`, {codigo_postal:params},
      {headers: this._app.getHeaders()}
  );
  }
  
  
}
