import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {AppSettingsService} from "../app-settings.service";
import {HttpClient} from "@angular/common/http";
import { ICatalogoCostoParticipacion } from '../interfaces/catalogos/ICatalogoCostoParticipacion';


@Injectable({
    providedIn: 'root'
})
export class CatalogoCostoParticipacionService {

    constructor(private _app: AppSettingsService,
                private _http: HttpClient) {

    }

    buscarCatalogoTipoProcedimiento(): Observable<any>{
      return this._http.post(
        `${this._app.API_ENDPOINT}/api/catalogos/tipoProcedimiento/buscar`,
        [],
        {headers: this._app.getHeadersToken()}
      );
    }

    buscarCatalogoUnidadResponsable(params: ICatalogoCostoParticipacion): Observable<any> {
        return this._http.post(
            `${this._app.API_ENDPOINT}/api/catalogos/costosInscripciones/buscar`,
            params,
            {headers: this._app.getHeadersToken()}
        );
    }

    guardarCatalogo(params: ICatalogoCostoParticipacion): Observable<any> {
        return this._http.patch(
            `${this._app.API_ENDPOINT}/api/catalogos/costosInscripciones/guardar`,
            params,
            {headers: this._app.getHeadersToken()}
        );
    }

    cambiarEstatus(params: ICatalogoCostoParticipacion): Observable<any> {
      return this._http.patch(
          `${this._app.API_ENDPOINT}/api/catalogos/costosInscripciones/cambiarEstatus`,
          params,
          {headers: this._app.getHeadersToken()}
      );
  }
}
