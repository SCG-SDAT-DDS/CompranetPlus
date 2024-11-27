import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {AppSettingsService} from "../app-settings.service";
import {HttpClient} from "@angular/common/http";
import {ICatalogoUsuariosEstatus} from "../interfaces/catalogos/ICatalogoUsuariosEstatus";
import {ICatalogoUsuarios} from "../interfaces/catalogos/ICatalogoUsuarios";
import {ICatalogoUsuariosContrasena} from "../interfaces/catalogos/ICatalogoUsuariosContrasena";
import {ICatalogoUsuariosBuscar} from "../interfaces/catalogos/ICatalogoUsuariosBuscar";

@Injectable({
    providedIn: 'root'
})
export class CatalogoUsuariosService {

    constructor(private _app: AppSettingsService,
                private _http: HttpClient) {

    }

    buscarUsuarios(params: ICatalogoUsuariosBuscar): Observable<any> {
        return this._http.post(
            `${this._app.API_ENDPOINT}/api/usuarios/buscarUsuarios`,
            params,
            {headers: this._app.getHeadersToken()}
        );
    }

    guardarUsuario(params: ICatalogoUsuarios): Observable<any> {
        return this._http.patch(
            `${this._app.API_ENDPOINT}/api/usuarios/guardarUsuario`,
            params,
            {headers: this._app.getHeadersToken()}
        );
    }

    cambiarEstatusUsuario(params: ICatalogoUsuariosEstatus): Observable<any> {
        return this._http.patch(
            `${this._app.API_ENDPOINT}/api/usuarios/cambiarEstatusUsuario`, params,
            {headers: this._app.getHeadersToken()}
        );
    }

    cambiarContrasena(params: ICatalogoUsuariosContrasena): Observable<any> {
        return this._http.patch(
            `${this._app.API_ENDPOINT}/api/usuarios/cambiarContrasena`, params,
            {headers: this._app.getHeadersToken()}
        );
    }

}
