import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {AppSettingsService} from "../app-settings.service";
import {HttpClient} from "@angular/common/http";
import { ICatalogoUnidadCompradora } from '../interfaces/catalogos/ICatalogoUnidadCompradora';
import { ICatalogoUCADExtemporanea } from '../interfaces/catalogos/ICatalogoUCADExtemporanea';
import { ICatalogoUnidadesCompradorasUsuario } from '../interfaces/catalogos/ICatalogoUnidadesCompradorasUsuario';


@Injectable({
    providedIn: 'root'
})
export class CatalogoUnidadCompradoraService {

  constructor(private _app: AppSettingsService,
              private _http: HttpClient) {

  }

  buscarCatalogo(params: ICatalogoUnidadCompradora): Observable<any>{
    return this._http.post(
      `${this._app.API_ENDPOINT}/api/catalogos/unidadCompradora/buscar`,
      params,
      {headers: this._app.getHeadersToken()}
    );
  }

  buscarUnidadCompradora(params: ICatalogoUnidadCompradora): Observable<any>{
    return this._http.post(
      `${this._app.API_ENDPOINT}/api/catalogos/unidadCompradora/registroByID`,
      params,
      {headers: this._app.getHeadersToken()}
    );
  }

  guardarCatalogo(params: ICatalogoUnidadCompradora): Observable<any> {
      return this._http.patch(
          `${this._app.API_ENDPOINT}/api/catalogos/unidadCompradora/guardar`,
          params,
          {headers: this._app.getHeadersToken()}
      );
  }

  cambiarEstatus(params: ICatalogoUnidadCompradora): Observable<any> {
    return this._http.patch(
        `${this._app.API_ENDPOINT}/api/catalogos/unidadCompradora/cambiarEstatus`,
        params,
        {headers: this._app.getHeadersToken()}
    );
  }

  buscarUnidadCompradoraADExtemporaneas(params: ICatalogoUnidadCompradora): Observable<any>{
    return this._http.post(
      `${this._app.API_ENDPOINT}/api/catalogos/unidadCompradoraADExt/buscar`,
      params,
      {headers: this._app.getHeadersToken()}
    );
  }

  guardarCatalogoUCADExtemporanea(params: ICatalogoUCADExtemporanea): Observable<any> {
    return this._http.patch(
        `${this._app.API_ENDPOINT}/api/catalogos/unidadCompradoraADExt/guardar`,
        params,
        {headers: this._app.getHeadersToken()}
    );
  }

  cambiarEstatusUCADExtemporanea(params: ICatalogoUCADExtemporanea): Observable<any> {
    return this._http.patch(
        `${this._app.API_ENDPOINT}/api/catalogos/unidadCompradoraADExt/cambiarEstatus`,
        params,
        {headers: this._app.getHeadersToken()}
    );
  }

  buscarUsuarios(params: ICatalogoUnidadCompradora): Observable<any>{
    return this._http.post(
      `${this._app.API_ENDPOINT}/api/catalogos/unidadCompradora/buscarUsuarios`,
      params,
      {headers: this._app.getHeadersToken()}
    );
  }

  buscarUsuariosDisponibles(params: ICatalogoUnidadCompradora): Observable<any>{
    return this._http.post(
      `${this._app.API_ENDPOINT}/api/catalogos/unidadCompradora/buscarUsuariosDisponibles`,
      params,
      {headers: this._app.getHeadersToken()}
    );
  }

  guardarUsuario(params: ICatalogoUnidadesCompradorasUsuario): Observable<any>{
    return this._http.patch(
      `${this._app.API_ENDPOINT}/api/catalogos/unidadCompradora/agregarUsuario`,
      params,
      {headers: this._app.getHeadersToken()}
    );
  }

  eliminarUsuario(params: ICatalogoUnidadesCompradorasUsuario): Observable<any>{
    return this._http.patch(
      `${this._app.API_ENDPOINT}/api/catalogos/unidadCompradora/eliminarUsuario`,
      params,
      {headers: this._app.getHeadersToken()}
    );
  }

}
