import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppSettingsService } from 'src/app/app-settings.service';
import { IDetDocumentosProveedores } from 'src/app/interfaces/proveedores/IDetDocumentosProveedores';

@Injectable({
  providedIn: 'root',
})
export class DocumentoProveedorService {
  constructor(private _http: HttpClient, private _app: AppSettingsService) {}

  obtenerDocumentosProveedor(id_proveedor: number): Observable<any> {
    let params = {id_proveedor};

    return this._http.post(
      `${this._app.API_ENDPOINT}/api/admin-proveedores/obtenerDocumentosProveedor`,
      params,
      {headers: this._app.getHeadersToken()}
    );
  }

  guardarDocumentosProveedor(params: IDetDocumentosProveedores[]): Observable<any> {
    return this._http.post(
      `${this._app.API_ENDPOINT}/api/proveedores/guardarDocumentosProveedor`,
      params,
      { headers: this._app.getHeaders() }
    );
  }
}
