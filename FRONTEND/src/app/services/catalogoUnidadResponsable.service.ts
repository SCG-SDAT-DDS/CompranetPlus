import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {AppSettingsService} from "../app-settings.service";
import {HttpClient} from "@angular/common/http";
import { ICatalogoUnidadResponsable } from '../interfaces/catalogos/ICatalogoUnidadResponsable';
import { CatalogoUsuarios } from '../interfaces/catalogos/CatalogoUsuarios';
import { ICatalogoUnidadesResponsablesUsuario } from '../interfaces/catalogos/ICatalogoUnidadesResponsablesUsuario';


@Injectable({
    providedIn: 'root'
})
export class CatalogoUnidadResponsableService {

  constructor(private _app: AppSettingsService,
              private _http: HttpClient) {

  }

  buscarCatalogoTipoUnidadResponsable(): Observable<any>{
    return this._http.post(
      `${this._app.API_ENDPOINT}/api/catalogos/tipoUnidadResponsable/buscar`,
      [],
      {headers: this._app.getHeadersToken()}
    );
  }

  buscarCatalogoUnidadResponsable(params: ICatalogoUnidadResponsable): Observable<any> {
    return this._http.post(
        `${this._app.API_ENDPOINT}/api/catalogos/unidadResponsable/buscar`,
        params,
        {headers: this._app.getHeadersToken()}
    );
  }

  guardarCatalogo(params: ICatalogoUnidadResponsable): Observable<any> {
    return this._http.patch(
        `${this._app.API_ENDPOINT}/api/catalogos/unidadResponsable/guardar`,
        params,
        {headers: this._app.getHeadersToken()}
    );
  }

  cambiarEstatus(params: ICatalogoUnidadResponsable): Observable<any> {
    return this._http.patch(
        `${this._app.API_ENDPOINT}/api/catalogos/unidadResponsable/cambiarEstatus`,
        params,
        {headers: this._app.getHeadersToken()}
    );
  }

  buscarUsuariosSupervisores(params: ICatalogoUnidadResponsable): Observable<any>{
    return this._http.post(
      `${this._app.API_ENDPOINT}/api/catalogos/unidadResponsable/buscarSupervisor`,
      params,
      {headers: this._app.getHeadersToken()}
    );
  }

  buscarUsuariosSupervisoresDisponibles(params: ICatalogoUnidadResponsable): Observable<any>{
    return this._http.post(
      `${this._app.API_ENDPOINT}/api/catalogos/unidadResponsable/buscarSupervisorDisponibles`,
      params,
      {headers: this._app.getHeadersToken()}
    );
  }

  guardarSupervisor(params: ICatalogoUnidadesResponsablesUsuario): Observable<any>{
    return this._http.patch(
      `${this._app.API_ENDPOINT}/api/catalogos/unidadResponsable/agregarSupervisor`,
      params,
      {headers: this._app.getHeadersToken()}
    );
  }

  eliminarSupervisor(params: ICatalogoUnidadesResponsablesUsuario): Observable<any>{
    return this._http.patch(
      `${this._app.API_ENDPOINT}/api/catalogos/unidadResponsable/eliminarSupervisor`,
      params,
      {headers: this._app.getHeadersToken()}
    );
  }

}
