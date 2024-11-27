import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {AppSettingsService} from "../app-settings.service";
import {HttpClient} from "@angular/common/http";
import {IDatoPartidaPresupuestal} from "../interfaces/convocantes/IDatoPartidaPresupuestal";

@Injectable({
    providedIn: 'root'
})
export class PartidasPresupuestalesService {

  constructor(private _app: AppSettingsService,
              private _http: HttpClient) {

  }

  obtenerPartidas(idProcedimiento: number): Observable<any>{
      return this._http.get(
          `${this._app.API_ENDPOINT}/api/partidas/obtenerPartidasProcedimiento?idProcedimiento=${idProcedimiento}`,
          {headers: this._app.getHeadersToken()}
      );
  }

  obtenerArchivoPartidaOriginal(idProcedimiento: number): Observable<any> {
      return this._http.get(
          `${this._app.API_ENDPOINT}/api/partidas/obtenerAnexoPartidasProcedimiento?idProcedimiento=${idProcedimiento}`,
          {headers: this._app.getHeadersToken()}
      );
  }

  obtenerPartidasProveedor(idProveedor: number, idProcedimiento: number): Observable<any>{
    return this._http.get(
      `${this._app.API_ENDPOINT}/api/partidas/obtenerPartidasProveedor?idProveedor=${idProveedor}&idProcedimiento=${idProcedimiento}`,
      {headers: this._app.getHeadersToken()}
    );
  }

  almacenarPartidasProveedor(idProveedor: number, idProcedimiento: number, partidas:Array<IDatoPartidaPresupuestal>, anexo:{ nombreArchivo: any; base64: string; encriptar: boolean; tipoArchivo: number }): Observable<any>{
      return this._http.post(
      `${this._app.API_ENDPOINT}/api/partidas/almacenarPartidasProveedor`,
      {
          idProveedor: idProveedor,
          idProcedimiento: idProcedimiento,
          lstDatosPartidaPresupuestal: partidas,
          anexo: anexo
      },
      {headers: this._app.getHeadersToken()}
    );
  }

}
