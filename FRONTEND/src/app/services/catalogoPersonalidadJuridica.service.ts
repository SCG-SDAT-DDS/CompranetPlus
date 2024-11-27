import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {AppSettingsService} from "../app-settings.service";
import {HttpClient} from "@angular/common/http";

@Injectable({
    providedIn: 'root'
})
export class CatalogoPersonalidadJuridicaService {

  constructor(private _app: AppSettingsService,
              private _http: HttpClient) {

  }

  buscarCatalogoPersonalidadJuridica(): Observable<any>{
    return this._http.post(
      `${this._app.API_ENDPOINT}/api/catalogos/personalidadJuridica/listado`,
      [],
      {headers: this._app.getHeadersToken()}
    );
  }

}
