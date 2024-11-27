import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {AppSettingsService} from "../app-settings.service";
import {HttpClient, HttpParams} from "@angular/common/http";
import {ICatalogoRolesSistemaBusqueda} from "../interfaces/catalogos/ICatalogoRolesSistemaBusqueda";
import {ICatalogoRolesSistema} from "../interfaces/catalogos/ICatalogoRolesSistema";
import {ICatalogoRolesSistemaEstatus} from "../interfaces/catalogos/ICatalogoRolesSistemaEstatus";
import {IActivarFuncionRoplSistema} from "../interfaces/catalogos/IActivarFuncionRoplSistema";

@Injectable({
    providedIn: 'root'
})
export class CatalogoRolesSistemaService {

    constructor(private _app: AppSettingsService,
                private _http: HttpClient) {

    }

    buscarRolesSis(params: ICatalogoRolesSistemaBusqueda): Observable<any> {
        return this._http.post(
            `${this._app.API_ENDPOINT}/api/rolesSistema/buscarRolesSistema`,
            params,
            {headers: this._app.getHeadersToken()}
        );
    }

    guardarRolesSis(params: ICatalogoRolesSistema): Observable<any> {
        return this._http.patch(
            `${this._app.API_ENDPOINT}/api/rolesSistema/guardarRolesSistema`,
            params,
            {headers: this._app.getHeadersToken()}
        );
    }

    cambiarEstatusRolesSis(params: ICatalogoRolesSistemaEstatus): Observable<any> {
        return this._http.patch(
            `${this._app.API_ENDPOINT}/api/rolesSistema/cambiarEstatusRolesSistema`, params,
            {headers: this._app.getHeadersToken()}
        );
    }

    obtenerFuncionesRolesSistema(idRol: number): Observable<any> {

      let queryParams = new HttpParams();
      queryParams = queryParams.append("idRol", String(idRol));

      return this._http.get(
        `${this._app.API_ENDPOINT}/api/rolesSistema/obtenerFuncionesRolesSistema`,
        {headers: this._app.getHeadersToken(), params:queryParams}
      );
    }

    activarRolSistema(params: IActivarFuncionRoplSistema): Observable<any> {

      return this._http.patch(
        `${this._app.API_ENDPOINT}/api/rolesSistema/activarRolSistema`, params,
        {headers: this._app.getHeadersToken()}
      );
    }

}
