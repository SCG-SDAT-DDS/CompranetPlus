import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppSettingsService } from 'src/app/app-settings.service';

@Injectable({
  providedIn: 'root'
})
export class VistaPublicaService {

  private param: any;
  private datosLicitacion: any;

constructor(private _http:HttpClient, private _app:AppSettingsService) { }

  obtenerUnidadesCompradoras(): Observable<any> {
    return this._http.post(
      `${this._app.API_ENDPOINT}/api/proveedores/unidadResponsable/obtener`,
      { headers: this._app.getHeaders() }
    );
  }

  obtenerProcedimientos(params: any): Observable<any> {
    return this._http.post(
      `${this._app.API_ENDPOINT}/api/proveedores/obtenerProcedimientos`,
      params,
      { headers: this._app.getHeaders() }
    );
  }

  obtenerDetalleProcedimiento(params: any): Observable<any> {
    return this._http.post(
      `${this._app.API_ENDPOINT}/api/proveedores/detalleProcedimiento`,
      params,
      { headers: this._app.getHeaders() }
    );
  }

  generarInscripcion(params: any): Observable<any> {
    return this._http.post(
      `${this._app.API_ENDPOINT}/api/proveedores/inscripcionProveedor`,
      params,
      { headers: this._app.getHeadersToken() }
    );
  }

  obtenerEstatusProveedor(params: any): Observable<any> {
    return this._http.post(
      `${this._app.API_ENDPOINT}/api/proveedor/estatusProveedor`,
      { id_proveedor: params},
      { headers: this._app.getHeadersToken() }
    );
  }

  obtenerArchivoBase64(url: any, encriptar: any): Observable<any> {

    const httpOptions = {
        params: {'url': url,'encriptar': encriptar}
    };

    return this._http.post(
        `${this._app.API_ENDPOINT}/api/proveedores/obtenerArchivoBase64`,
        httpOptions,
        {headers: this._app.getHeaders()}
    );
}

  




  /**
   * Funciones para recibir y emitir el id_procedimiento_administrativo para visualizar detalle
   */
  setProcedimiento(params: any){
    this.param = params;
  }

  getProcedimiento(){
    return this.param;
  }

  setLicitacionParticipacion(licitacion: any){
    this.datosLicitacion = licitacion;
  }

  getDatosLicitacion(){
    return this.datosLicitacion;
  }
}
