import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { AuthService } from 'src/app/components/login/auth.service';
import { IDetalleProcedimiento } from 'src/app/interfaces/convocantes/IDetalleProcedimiento';
import { IProcedimientoAdministrativo } from 'src/app/interfaces/convocantes/IProcedimientoAdministrativo';
import { ConvocantesService } from 'src/app/services/convocantes.service';
import swal from 'sweetalert2';
import {IDatoPartidaPresupuestal} from "../../../interfaces/convocantes/IDatoPartidaPresupuestal";


@Component({
  selector: 'app-detalle-procedimiento',
  templateUrl: './detalle-procedimiento.component.html',
  styleUrls: ['./detalle-procedimiento.component.css']
})

export class DetalleProcedimientoComponent implements OnInit{

  @Input() public _procedimientoElegido: IProcedimientoAdministrativo | null = null;
  @Output() public _cancelarDetalleProcedimiento = new EventEmitter();

  public blnActivarEstatus: boolean;

  datosProcedimientoAdministrativo: IDetalleProcedimiento | null = null;
  lstDatosPartidaPresupuestal: IDatoPartidaPresupuestal[] | null | undefined = null;

  loaderBusqueda: boolean = false;

  constructor(
    private _convocantesService: ConvocantesService,
    private _authService: AuthService
  ) {

    this.blnActivarEstatus = false;

  }

  ngOnInit() {
    this.obtenerProcedimientoAdministrativo();
    this.blnActivarEstatus = false;
  }

  visibleProveedor(){
    const rol: string | any = this._authService.rolSys;
    if (rol[0] !== 'PROVEEDOR'){
      return true;
    } else {
      return false;
    }
  }

  visibleAdmin(){
    const rol: string | any = this._authService.rolSys;
    if (rol[0] !== 'ADMINISTRADOR'){
      return true;
    } else {
      return false;
    }
  }

  caracter(anexo: any){
    const rol: string | any = this._authService.rolSys;
    if(anexo.caracter == 0 && rol[0] == 'PROVEEDOR'){
      return false;
    }else{
      return true;
    }
  }

  obtenerProcedimientoAdministrativo(){

    this.loaderBusqueda= true;
    this._convocantesService.obtenerProcedimientoAdministrativo(this._procedimientoElegido?.id_procedimiento_administrativo).subscribe({
        next: (data) => {
            this.datosProcedimientoAdministrativo = data.datos;
            this.lstDatosPartidaPresupuestal = this.datosProcedimientoAdministrativo?.procedimiento?.lstDatosPartidaPresupuestal;
        },
        error: (err) => {
            console.info(err)
            swal.fire(err.error.mensaje, "", 'error');
            this.loaderBusqueda = false;
        },
        complete: () => {
            this.loaderBusqueda = false;
        }
    });

  }

  cancelarDetalleProcedimiento() {
    this._cancelarDetalleProcedimiento.emit();
  }

  estatusProcedimiento(){
    this.blnActivarEstatus = true;
  }

  public cancelarEstatusProcedimiento() {
    this.blnActivarEstatus = false;
    this.obtenerProcedimientoAdministrativo();
  }

  descargarArchivo(base64String: any, fileName: any, id_tipo_archivo?: number, extensionArchivo?:string) {
    const source = `data:application/pdf;base64,${base64String}`;
    const link = document.createElement("a");
    link.href = source;
    link.download = id_tipo_archivo != 18 ? `${fileName}.${extensionArchivo}` : `${fileName}.xlsx`;
    link.click();
  }

  descargarConvocatoriaPdf(){
    let base64String = this.datosProcedimientoAdministrativo?.procedimiento.archivo_convocatoria;
    let urlConvocatoria = this.datosProcedimientoAdministrativo?.procedimiento.url_archivo_convocatoria;
    const extensionArchivo = this.obtenerExtensionArchivo(urlConvocatoria);
    this.descargarArchivo(base64String,"convocatoria",0,extensionArchivo);
  }

  descargarBasesPdf(){
    let base64String = this.datosProcedimientoAdministrativo?.procedimiento.archivo_bases;
    let urlBases = this.datosProcedimientoAdministrativo?.procedimiento.url_archivo_bases;
    const extensionArchivo = this.obtenerExtensionArchivo(urlBases);
    this.descargarArchivo(base64String,"bases",0,extensionArchivo);
  }

  descargarOficioAutorizacionPdf(){
    let base64String = this.datosProcedimientoAdministrativo?.procedimiento.archivo_oficio_autorizacion;
    let urlOficio = this.datosProcedimientoAdministrativo?.procedimiento.url_archivo_oficio_autorizacion;
    const extensionArchivo = this.obtenerExtensionArchivo(urlOficio);
    this.descargarArchivo(base64String,"autorizacion",0,extensionArchivo);
  }

  descargarPartidasExcel(){
    let base64String = this.datosProcedimientoAdministrativo?.procedimiento.archivo_partidas;
    let fileName =  this.datosProcedimientoAdministrativo?.procedimiento.url_archivo_partidas.split('/').pop();
    const source = `data:application/vnd.ms-excel;base64,${base64String}`;
    const link = document.createElement("a");
    link.href = source;
    link.download = `${fileName}.xlsx`;
    link.click();
  }

  canActivate(permiso:string): boolean {
    return this._authService.canActivateFunction(permiso);
  }

  descargarAnexoProcedimiento(archivo: any){
    let { url_archivo_anexo, nombre_tipo_archivo, id_tipo_archivo } = archivo;
    const extencionArchivo = this.obtenerExtensionArchivo(url_archivo_anexo);
    this._convocantesService.obtenerArchivoBase64(url_archivo_anexo, false).subscribe({
      next: (data) => {
        let base64String = data.datos;
        this.descargarArchivo(base64String, nombre_tipo_archivo, id_tipo_archivo, extencionArchivo);
      },
      error: (err) => {
          console.info(err)
          swal.fire(err.error.mensaje, "", 'error');
          this.loaderBusqueda = false;
      },
      complete: () => {
          this.loaderBusqueda = false;
      }
    });
  }

  descargarActaProcedimiento(url_acta:any, nombre_acta:any, tipo_archivo: any) {
    const extensionArchivo = this.obtenerExtensionArchivo(url_acta);
    this._convocantesService.obtenerArchivoBase64(url_acta, false).subscribe({
      next: (data) => {
        let base64String = data.datos;
        this.descargarArchivo(base64String, nombre_acta, tipo_archivo, extensionArchivo);
      },
      error: (err) => {
          swal.fire(err.error.mensaje, "", 'error');
      },
      complete: () => {
      }
    });
  }

  obtenerExtensionArchivo(urlArchivo: any) {
    // Divide la URL usando '/' para obtener las partes
    const partesUrl = urlArchivo.split('/');

    // Obtiene el nombre del archivo de la última parte de la URL
    const nombreArchivo = partesUrl[partesUrl.length - 1];

    // Divide el nombre del archivo usando '.' para obtener las partes
    const partesNombreArchivo = nombreArchivo.split('.');

    // Obtiene la extensión del archivo (la última parte después del último punto)
    const extensionArchivo = partesNombreArchivo[partesNombreArchivo.length - 1];

    return extensionArchivo;
  }

  get datosParaMostrar(): boolean {
    return this.datosProcedimientoAdministrativo?.anexos.length === 0 &&
      !this.datosProcedimientoAdministrativo?.procedimiento?.url_archivo_acta_fallo &&
      !this.datosProcedimientoAdministrativo?.procedimiento?.url_archivo_acto_recepcion &&
      !this.datosProcedimientoAdministrativo?.procedimiento?.url_archivo_aviso_diferendo;
  }

  fechasNuevasExist(): boolean {
    return (
      this.datosProcedimientoAdministrativo?.procedimiento?.fecha_limite_inscripcion_nueva !== null ||
      this.datosProcedimientoAdministrativo?.procedimiento?.fecha_junta_aclaraciones_nueva !== null ||
      this.datosProcedimientoAdministrativo?.procedimiento?.fecha_apertura_nueva !== null ||
      this.datosProcedimientoAdministrativo?.procedimiento?.fecha_inicio_obra_nueva !== null
    );

}
}
