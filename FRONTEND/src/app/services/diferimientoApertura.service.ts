import { Injectable } from '@angular/core';
import { AppSettingsService } from '../app-settings.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IDetalleProcedimientoID } from '../interfaces/convocantes/IDetalleProcedimiento';

@Injectable({
  providedIn: 'root',
})
export class DiferimientoAperturaService {
  constructor(private _app: AppSettingsService, private _http: HttpClient) {}

  obtenerDetalleApertura(params: IDetalleProcedimientoID): Observable<any> {
    return this._http.post(
      `${this._app.API_ENDPOINT}/api/procedimientos/obtenerFechasProcedimiento`,
      { id_procedimiento_administrativo: params },
      { headers: this._app.getHeadersToken() }
    );
  }

  guardarDiferendoActo(params: any): Observable<any> {
    return this._http.post(
      `${this._app.API_ENDPOINT}/api/procedimientos/diferendoActo`, params ,
      { headers: this._app.getHeadersToken() }
    );
  }

  
}
