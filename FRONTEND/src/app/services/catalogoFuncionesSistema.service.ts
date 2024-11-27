import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {AppSettingsService} from "../app-settings.service";
import {HttpClient} from "@angular/common/http";
import {ICatalogoFuncionSistema} from "../interfaces/catalogos/ICatalogoFuncionSistema";
import {ICatalogoFuncionSistemaBusqueda} from "../interfaces/catalogos/ICatalogoFuncionSistemaBusqueda";
import {ICatalogoFuncionSistemaEstatus} from "../interfaces/catalogos/ICatalogoFuncionSistemaEstatus";

@Injectable({
    providedIn: 'root'
})
export class CatalogoFuncionesSistemaService {

    constructor(private _app: AppSettingsService,
                private _http: HttpClient) {

    }

    buscarFuncionesSis(params: ICatalogoFuncionSistemaBusqueda): Observable<any> {
        return this._http.post(
            `${this._app.API_ENDPOINT}/api/funcionesSistema/buscarFuncionSistema`,
            params,
            {headers: this._app.getHeadersToken()}
        );
    }

    guardarFuncionesSis(params: ICatalogoFuncionSistema): Observable<any> {
        return this._http.patch(
            `${this._app.API_ENDPOINT}/api/funcionesSistema/guardarFuncionSistema`,
            params,
            {headers: this._app.getHeadersToken()}
        );
    }

    cambiarEstatusFuncionesSis(params: ICatalogoFuncionSistemaEstatus): Observable<any> {
        return this._http.patch(
            `${this._app.API_ENDPOINT}/api/funcionesSistema/cambiarEstatusFuncionSistema`, params,
            {headers: this._app.getHeadersToken()}
        );
    }

}
