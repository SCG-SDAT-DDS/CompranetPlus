import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {AppSettingsService} from "../app-settings.service";
import {HttpClient} from "@angular/common/http";
import { IReporte } from '../interfaces/reportes/IReporte';
import { IDetReporte } from '../interfaces/reportes/IDetReporte';
import { IDetReportesPublico } from '../interfaces/reportes/IDetReportesPublico';

@Injectable({
  providedIn: 'root'
})
export class ReporteService {

  constructor(private _app: AppSettingsService,
              private _http: HttpClient) {

  }

  //consultar catalogos faltantes para el reporte
  obtenerCatEstatusProcedimiento(): Observable<any>{
    return this._http.post(
      `${this._app.API_ENDPOINT}/api/catalogos/estatusProcedimiento/listado`,
      [],
      {headers: this._app.getHeadersToken()}
    );
  }

  obtenerCatEstatusParticipacion(): Observable<any>{
    return this._http.post(
      `${this._app.API_ENDPOINT}/api/catalogos/estatusParticipaciones/listado`,
      [],
      {headers: this._app.getHeadersToken()}
    );
  }

  obtenerColumnasDisponiblesReporte(): Observable<any>{
    return this._http.post(
      `${this._app.API_ENDPOINT}/api/reportes/columnas/listado`,
      [],
      {headers: this._app.getHeadersToken()}
    );
  }

  obtenerUltimoReporte(): Observable<any>{
    return this._http.post(
      `${this._app.API_ENDPOINT}/api/reportes/ultimoReporte`,
      [],
      {headers: this._app.getHeadersToken()}
    );
  }

  actualizarReporteSistema(): Observable<any>{
    return this._http.post(
      `${this._app.API_ENDPOINT}/api/reportes/actualizar`,
      {
        origen : 'sistema',
      },
      {headers: this._app.getHeadersToken()}
    );
  }

  generar(params: IReporte): Observable<any>{
    return this._http.post(
      `${this._app.API_ENDPOINT}/api/reportes/obtener`,
      params,
      {headers: this._app.getHeadersToken()}
    );
  }

  generarReporte(params: IReporte){
    let paramsURL = '?filtro=';
    let filtros = btoa(JSON.stringify(params.filtro));
    let columnas = btoa(JSON.stringify(params.columnas));
    window.open(`${this._app.API_ENDPOINT}/api/reportes/obtener${paramsURL}${filtros}&columnas=${columnas}&formato=${params.formato}`,'_blank');
  }

  misReportesListado(): Observable<any> {
    return this._http.post(
        `${this._app.API_ENDPOINT}/api/reportes/miReporte/listado`,
        [],
        {headers: this._app.getHeadersToken()}
    );
  }

  guardarReporte(params: IDetReporte): Observable<any> {
    return this._http.post(
        `${this._app.API_ENDPOINT}/api/reportes/miReporte/guardar`,
        params,
        {headers: this._app.getHeadersToken()}
    );
  }

  cambiarEstatus(params: IDetReporte): Observable<any> {
    return this._http.post(
        `${this._app.API_ENDPOINT}/api/reportes/miReporte/eliminar`,
        params,
        {headers: this._app.getHeadersToken()}
    );
  }

/**
   * apartado de funciones para lo del reporte publico
   */
  reportePublicoListado(idDetReporte: number): Observable<any> {
    let params: IDetReporte = {
      id_det_reportes : idDetReporte,
      nombre_reporte: null,
      fecha: null,
      filtro: "",
      columnas: "",
      activo: null,
      id_usuario: null
    }
    return this._http.post(
        `${this._app.API_ENDPOINT}/api/reportes/publicoAdmin/listado`,
        params,
        {headers: this._app.getHeadersToken()}
    );
  }

  guardarReportePublico(params: IDetReportesPublico): Observable<any> {
    return this._http.post(
        `${this._app.API_ENDPOINT}/api/reportes/publicoAdmin/agregar`,
        params,
        {headers: this._app.getHeadersToken()}
    );
  }

  cambiarEstatusReportePublico(params: IDetReportesPublico): Observable<any> {
    return this._http.post(
        `${this._app.API_ENDPOINT}/api/reportes/publicoAdmin/eliminar`,
        params,
        {headers: this._app.getHeadersToken()}
    );
  }

  enviarCorreoReportePublico(params: IDetReportesPublico): Observable<any> {
    return this._http.post(
      `${this._app.API_ENDPOINT}/api/reportes/publicoAdmin/enviarCorreo`,
      params,
      {headers: this._app.getHeadersToken()}
  );
  }

}
