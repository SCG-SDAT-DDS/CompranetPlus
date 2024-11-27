import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppSettingsService } from '../app-settings.service';
import { ICertificadoFiel, IValidacionFiel } from '../interfaces/proveedores/IEFirma';

@Injectable({
  providedIn: 'root',
})
export class EFirmaService {
  constructor(private _app: AppSettingsService, private _http: HttpClient) {}

  obtenerDatosCertificado(params: ICertificadoFiel): Observable<any> {

    return this._http.post(
      `${this._app.API_ENDPOINT}/api/fiel/datos-certificado`,
      params,
      {headers: this._app.getHeadersToken()}
    );
  }

  validacionFirma(params: IValidacionFiel): Observable<any> {

    return this._http.post(
      `${this._app.API_ENDPOINT}/api/fiel/validacion`,
      params,
      {headers: this._app.getHeadersToken()}
    );
  }
}
