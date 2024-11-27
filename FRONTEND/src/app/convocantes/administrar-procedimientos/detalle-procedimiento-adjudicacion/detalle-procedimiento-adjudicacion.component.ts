import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AuthService } from 'src/app/components/login/auth.service';
import { IDetalleProcedimiento } from 'src/app/interfaces/convocantes/IDetalleProcedimiento';
import { IProcedimientoAdministrativo } from 'src/app/interfaces/convocantes/IProcedimientoAdministrativo';
import { ConvocantesService } from 'src/app/services/convocantes.service';
import swal from 'sweetalert2';
import {IDatoPartidaPresupuestal} from "../../../interfaces/convocantes/IDatoPartidaPresupuestal";


@Component({
  selector: 'app-detalle-procedimiento-adjudicacion',
  templateUrl: './detalle-procedimiento-adjudicacion.component.html',
  styleUrls: ['./detalle-procedimiento-adjudicacion.component.css']
})
export class DetalleProcedimientoAdjudicacionComponent implements OnInit{

  @Input() public _procedimientoElegido: IProcedimientoAdministrativo | null = null;
  @Output() public _cancelarDetalleProcedimiento = new EventEmitter();

  datosProcedimientoAdministrativo: IDetalleProcedimiento | null = null;
  lstDatosPartidaPresupuestal: IDatoPartidaPresupuestal[] | null | undefined = null;

  loaderBusqueda: boolean = false;

  constructor(
    private _convocantesService: ConvocantesService,
    private _authService: AuthService
  ) {



  }

  ngOnInit() {

    this.obtenerProcedimientoAdministrativo();

  }


  obtenerProcedimientoAdministrativo(){

    this.loaderBusqueda = true;
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

  canActivate(permiso:string): boolean {
    return this._authService.canActivateFunction(permiso);
  }

  descargarArchivo(base64String: any, fileName: any, id_tipo_archivo?: number, extensionArchivo?: string) {
    const source = `data:application/pdf;base64,${base64String}`;
    const link = document.createElement("a");
    link.href = source;
    link.download = id_tipo_archivo != 18 ? `${fileName}.${extensionArchivo}` : `${fileName}.xlsx`;
    link.click();
  }

  obtenerArchivoAnexo(archivo: any){
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

  obtenerArchivoCartaOficio(url: any, nombre: string){
    const extencionArchivo = this.obtenerExtensionArchivo(url);
    this._convocantesService.obtenerArchivoBase64(url, false).subscribe({
      next: (data) => {
        let base64String = data.datos;
        this.descargarArchivo(base64String, nombre, 0, extencionArchivo);
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

  visibleProveedor(){
    const rol: string | any = this._authService.rolSys;
    if (rol[0] !== 'PROVEEDOR'){
      return true;
    } else {
      return false;
    }
  }

}

