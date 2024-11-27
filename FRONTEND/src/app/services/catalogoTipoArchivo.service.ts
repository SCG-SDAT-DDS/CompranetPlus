import { Injectable } from '@angular/core';
import { AppSettingsService } from '../app-settings.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ICatalogoTipoArchivo, ICatalogoTipoArchivoBusqueda, ICatalogoTipoArchivoDelete } from '../interfaces/catalogos/ICatalogoTipoArchivo';

@Injectable({
  providedIn: 'root'
})
export class CatalogoTipoArchivoService {

constructor(private _app: AppSettingsService, private _http: HttpClient) { }

  getTipoArchivos(params?: ICatalogoTipoArchivoBusqueda): Observable<any> {
    return this._http.post(
        `${this._app.API_ENDPOINT}/api/catalogos/tipoArchivo/buscar`,
        params,
        {headers: this._app.getHeadersToken()}
    );
  }

  guardarTipoArchivo(params: ICatalogoTipoArchivo): Observable<any> {
    return this._http.post(
        `${this._app.API_ENDPOINT}/api/catalogos/tipoArchivo/guardar`,
        params,
        {headers: this._app.getHeadersToken()}
    );
  }

  cambiarEstatus(params: ICatalogoTipoArchivoDelete): Observable<any> {
    return this._http.post(
        `${this._app.API_ENDPOINT}/api/catalogos/tipoArchivo/cambiarEstatus`,
        params,
        {headers: this._app.getHeadersToken()}
    );
  }
}
