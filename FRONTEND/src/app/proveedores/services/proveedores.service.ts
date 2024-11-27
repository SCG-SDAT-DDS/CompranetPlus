import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppSettingsService } from 'src/app/app-settings.service';
import { IProveedor, IProveedorBusqueda } from '../../interfaces/proveedores/IProveedores';

@Injectable({
  providedIn: 'root',
})
export class ProveedoresService {
  constructor(private _app: AppSettingsService, private _http: HttpClient) {}

  guardarProveedor(params: any): Observable<any> {
    return this._http.post(
      `${this._app.API_ENDPOINT}/api/proveedores/guardarProveedor`,
      params,
      { headers: this._app.getHeaders() }
    );
  }

  guardarProveedorAdmin(params: any): Observable<any> {
    return this._http.post(
      `${this._app.API_ENDPOINT}/api/admin-proveedores/guardarProveedor`,
      params,
      { headers: this._app.getHeadersToken() }
    );
  }


  finalizarRegistroProveedor(params: number): Observable<any> {
    return this._http.post(
      `${this._app.API_ENDPOINT}/api/proveedor/completarRegistro`,
      {id_proveedor : params},
      { headers: this._app.getHeadersToken() }
    )
  }

  obtenerProveedores(params: IProveedorBusqueda): Observable<any> {
    return this._http.post(
      `${this._app.API_ENDPOINT}/api/admin-proveedores/obtener`,
      params,
      {headers: this._app.getHeadersToken()}
    );
  }

  cambiarEstatusProveedor(params: IProveedor): Observable<any> {
    return this._http.patch(
        `${this._app.API_ENDPOINT}/api/admin-proveedores/cambiarEstatusProveedor`,
        params,
        {headers: this._app.getHeadersToken()}
    );
  }

  eliminarProveedor(params: IProveedor): Observable<any> {
    return this._http.patch(
        `${this._app.API_ENDPOINT}/api/admin-proveedores/eliminarProveedor`,
        params,
        {headers: this._app.getHeadersToken()}
    );
  }

}
