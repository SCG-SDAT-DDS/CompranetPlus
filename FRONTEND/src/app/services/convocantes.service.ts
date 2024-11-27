import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {AppSettingsService} from "../app-settings.service";
import {HttpClient, HttpParams} from "@angular/common/http";
import { IBusquedaProcedimiento } from '../interfaces/convocantes/IBusquedaProcedimiento';
import { IProcedimientoAdministrativo } from '../interfaces/convocantes/IProcedimientoAdministrativo';
import { IBusquedaProveedor } from '../interfaces/proveedores/IBusquedaProveedor';
import { IBusquedaParticipante, IGanadorFallo, IParticipanteInvitado } from '../interfaces/convocantes/IBusquedaParticipantes';
import { IContrato } from '../interfaces/convocantes/IContrato';


@Injectable({
    providedIn: 'root'
})
export class ConvocantesService {

    constructor(private _app: AppSettingsService,
                private _http: HttpClient) {

    }

    obtenerTiposProcedimientos(tipo: any): Observable<any> {

        const httpOptions = {
      
            params: {'tipo': tipo}
        };

        return this._http.post(
            `${this._app.API_ENDPOINT}/api/procedimientos/obtenerTiposProcedimientos`,
            httpOptions,
            {headers: this._app.getHeadersToken()}
        );
    }


    obtenerCaracteres(tipo: any): Observable<any> {

        const httpOptions = {
            params: {'tipo': tipo}
        };

        return this._http.post(
            `${this._app.API_ENDPOINT}/api/procedimientos/obtenerTiposCaracteres`,
            httpOptions,
            {headers: this._app.getHeadersToken()}
        );
    }

    obtenerModalidades(tipo: any): Observable<any> {

        const httpOptions = {
            params: {'tipo': tipo}
        };

        return this._http.post(
            `${this._app.API_ENDPOINT}/api/procedimientos/obtenerTiposModalidades`,
            httpOptions,
            {headers: this._app.getHeadersToken()}
        );
    }

    obtenerTiposArchivos(tipo: any): Observable<any> {

        const httpOptions = {
            params: {'tipo': tipo}
        };

        return this._http.post(
            `${this._app.API_ENDPOINT}/api/procedimientos/obtenerTiposArchivos`,
            httpOptions,
            {headers: this._app.getHeadersToken()}
        );
    }
   

    buscarProcedimientosAdministrativos(params: IBusquedaProcedimiento): Observable<any> {
        return this._http.post(
            `${this._app.API_ENDPOINT}/api/procedimientos/buscarProcedimientosAdministrativos`,
            params,
            {headers: this._app.getHeadersToken()}
        );
    }


    guardarProcedimientoAdministrativo(params: IProcedimientoAdministrativo): Observable<any> {
        return this._http.patch(
            `${this._app.API_ENDPOINT}/api/procedimientos/guardarProcedimientoAdministrativo`,
            params,
            {headers: this._app.getHeadersToken()}
        );
    }

    obtenerProcedimientoAdministrativo(idProcedimientoAdministrativo: any): Observable<any> {
        const httpOptions = {
            params: {'id_procedimiento_administrativo': idProcedimientoAdministrativo}
        };


        return this._http.post(
            `${this._app.API_ENDPOINT}/api/procedimientos/obtenerProcedimientoAdministrativo`,
            httpOptions,
            {headers: this._app.getHeadersToken()}
        );
    }


    obtenerAnexosProcedimientoAdministrativo(idProcedimientoAdministrativo: any): Observable<any> {
        const httpOptions = {
            params: {'id_procedimiento_administrativo': idProcedimientoAdministrativo}
        };


        return this._http.post(
            `${this._app.API_ENDPOINT}/api/procedimientos/obtenerAnexosProcedimientoAdministrativo`,
            httpOptions,
            {headers: this._app.getHeadersToken()}
        );
    }

    guardarAnexosProcedimientoAdministrativo(params: IProcedimientoAdministrativo): Observable<any> {
        return this._http.patch(
            `${this._app.API_ENDPOINT}/api/procedimientos/guardarAnexosProcedimientoAdministrativo`,
            params,
            {headers: this._app.getHeadersToken()}
        );
    }


    obtenerEstatusProcedimientos(id_estatus_procedimiento: any): Observable<any> {

        const httpOptions = {
            params: {'id_estatus_procedimiento': id_estatus_procedimiento}
        };

        return this._http.post(
            `${this._app.API_ENDPOINT}/api/procedimientos/obtenerEstatusProcedimiento`,
            httpOptions,
            {headers: this._app.getHeadersToken()}
        );
    }

    guardarEstatusProcedimientoAdministrativo(params: IProcedimientoAdministrativo): Observable<any> {
        return this._http.patch(
            `${this._app.API_ENDPOINT}/api/procedimientos/guardarEstatusProcedimientoAdministrativo`,
            params,
            {headers: this._app.getHeadersToken()}
        );
    }


    obtenerCostosInscripcionActuales(id_tipo_procedimiento: any): Observable<any> {

        const httpOptions = {
            params: {'id_tipo_procedimiento': id_tipo_procedimiento}
        };

        return this._http.post(
            `${this._app.API_ENDPOINT}/api/catalogos/costosInscripciones/buscarActuales`,
            httpOptions,
            {headers: this._app.getHeadersToken()}
        );
    }


    buscarProveedores(params: IBusquedaProveedor): Observable<any> {
        return this._http.post(
            `${this._app.API_ENDPOINT}/api/proveedores/buscarProveedores`,
            params,
            {headers: this._app.getHeadersToken()}
        );
    }


    obtenerArchivoBase64(url: any, encriptar: any): Observable<any> {

        const httpOptions = {
            params: {'url': url,'encriptar': encriptar}
        };

        return this._http.post(
            `${this._app.API_ENDPOINT}/api/procedimientos/obtenerArchivoBase64`,
            httpOptions,
            {headers: this._app.getHeadersToken()}
        );
    }


    obtenerContratosProcedimientoAdministrativo(idProcedimientoAdministrativo: any): Observable<any> {
        const httpOptions = {
            params: {'id_procedimiento_administrativo': idProcedimientoAdministrativo}
        };


        return this._http.post(
            `${this._app.API_ENDPOINT}/api/procedimientos/obtenerContratosProcedimientoAdministrativo`,
            httpOptions,
            {headers: this._app.getHeadersToken()}
        );
    }

    buscarParticipantesGanadores(params: IBusquedaParticipante): Observable<any> {
        return this._http.post(
            `${this._app.API_ENDPOINT}/api/procedimientos/obtenerParticipantesGanadoresProcedimiento`,
            params,
            {headers: this._app.getHeadersToken()}
        );
    }

    guardarContratoProcedimientoAdministrativo(params: IContrato): Observable<any> {
        return this._http.patch(
            `${this._app.API_ENDPOINT}/api/procedimientos/guardarContratoProcedimientoAdministrativo`,
            params,
            {headers: this._app.getHeadersToken()}
        );
    }


    obtenerUnidadesCompradorasUsuario(tipo: any): Observable<any> {

        const httpOptions = {
      
            params: {'tipo': tipo}
        };

        return this._http.post(
            `${this._app.API_ENDPOINT}/api/procedimientos/obtenerUnidadesCompradorasUsuario`,
            httpOptions,
            {headers: this._app.getHeadersToken()}
        );
    }


    obtenerSiguienteNumeroProcedimiento(idTipoLicitacion:number, idTipoProcedimiento: number, idUnidadCompradora: number, id_procedimiento_administrativo: number): Observable<any> {

        let queryParams = new HttpParams();
        queryParams = queryParams.append("idTipoLicitacion", String(idTipoLicitacion));
        queryParams = queryParams.append("idTipoProcedimiento", String(idTipoProcedimiento));
        queryParams = queryParams.append("idUnidadCompradora", String(idUnidadCompradora));
        queryParams = queryParams.append("id_procedimiento_administrativo", String(id_procedimiento_administrativo));
        
  
        return this._http.get(
          `${this._app.API_ENDPOINT}/api/procedimientos/proximoNumeroProcedimiento`,
          {headers: this._app.getHeadersToken(), params:queryParams}
        );
    }


    fijarSiguienteNumeroProcedimiento(idTipoLicitacion:number, idTipoProcedimiento: number, idUnidadCompradora: number, id_procedimiento_administrativo: number): Observable<any> {

         let queryParams = new HttpParams();
        queryParams = queryParams.append("idTipoLicitacion", String(idTipoLicitacion));
        queryParams = queryParams.append("idTipoProcedimiento", String(idTipoProcedimiento));
        queryParams = queryParams.append("idUnidadCompradora", String(idUnidadCompradora));
        queryParams = queryParams.append("id_procedimiento_administrativo", String(id_procedimiento_administrativo));
        
  
        return this._http.put(
          `${this._app.API_ENDPOINT}/api/procedimientos/proximoNumeroProcedimiento`,
          {},
          {headers: this._app.getHeadersToken(), params:queryParams}
        );
    }

    buscarParticipanteInvitado(params: IBusquedaParticipante): Observable<any> {
        return this._http.post(
            `${this._app.API_ENDPOINT}/api/procedimientos/obtenerParticipanteInvitado`,
            params,
            {headers: this._app.getHeadersToken()}
        );
    }
    
    buscarParticipanteInvitadoFallo(params: IBusquedaParticipante): Observable<any> {
        return this._http.post(
            `${this._app.API_ENDPOINT}/api/procedimientos/obtenerParticipanteInvitadoFallo`,
            params,
            {headers: this._app.getHeadersToken()}
        );
    }

    
      
    cambiarEstatusParticipante(params: IParticipanteInvitado): Observable<any> {
        return this._http.patch(
            `${this._app.API_ENDPOINT}/api/procedimientos/cambiarEstatusParticipanteInvitado`, params,
            {headers: this._app.getHeadersToken()}
        );
    }

    agregarParticipante(params: IParticipanteInvitado): Observable<any> {
        return this._http.post(
            `${this._app.API_ENDPOINT}/api/procedimientos/guardarParticipanteInvitado`, params,
            {headers: this._app.getHeadersToken()}
        );
    }

    guardarFallo(params: IGanadorFallo): Observable<any> {
        return this._http.post(
            `${this._app.API_ENDPOINT}/api/procedimientos/guardarFallo`,
            params,
            {headers: this._app.getHeadersToken()}
        );
    }

    obtenerAutorizacionApertura(params: any): Observable<any>{
        return this._http.post(
            `${this._app.API_ENDPOINT}/api/procedimientos/obtenerPermisosApetura`,
            { id_procedimiento_administrativo: params },
            {headers: this._app.getHeadersToken()}
        );
    }

    generarAutorizacionApertura(params: any): Observable<any>{
        return this._http.post(
            `${this._app.API_ENDPOINT}/api/procedimientos/autorizarApertura`,
            { params },
            {headers: this._app.getHeadersToken()}
        );
    }

    notificarDescargaPropuestas(params:any): Observable<any>{
        return this._http.post(
            `${this._app.API_ENDPOINT}/api/procedimientos/enviarAvisoPropuesta`,
            { params },
            {headers: this._app.getHeadersToken()}
        );
    }

    buscarAdExtemporaneasUsuario(): Observable<any> {
        return this._http.get(
            `${this._app.API_ENDPOINT}/api/procedimientos/obtenerADExtemporaneasUsuario`,
            {headers: this._app.getHeadersToken()}
        );
    }

    buscarAniosAnteriores(): Observable<any> {
        return this._http.get(
            `${this._app.API_ENDPOINT}/api/procedimientos/obtenerAniosPrevios`,
            {headers: this._app.getHeadersToken()}
        );
    }

    actualizarEstatusCron(): Observable<any> {
        return this._http.get(
            `${this._app.API_ENDPOINT}/api/procedimientos/actualizarEstatusCron`,
            {headers: this._app.getHeadersToken()}
        );
    }
}
