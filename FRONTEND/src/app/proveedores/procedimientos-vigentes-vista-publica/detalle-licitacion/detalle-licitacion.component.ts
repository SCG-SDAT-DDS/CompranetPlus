import { Component } from '@angular/core';
import { VistaPublicaService } from '../../services/vistaPublica.service';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-detalle-licitacion',
  templateUrl: './detalle-licitacion.component.html',
  styleUrls: ['./detalle-licitacion.component.css']
})
export class DetalleLicitacionComponent {
  parametro: any;
  detProcedimiento: any;
  lst_anexos: any;
  loader: boolean;
  estatusProveedor: any;

  constructor(private detalleProcedimiento: VistaPublicaService , private _router: Router , private modalService: NgbModal){
    this.loader = true;
  }

  ngOnInit(): void {
    const params = this.detalleProcedimiento.getProcedimiento();
    if(params !== undefined){
      this.obtenerDetalleProcedimiento(params.id);
      this.estatusProveedor = params?.estatusProveedor
    }else{
      this._router.navigateByUrl('inicio/portal-licitaciones');
    }
  }

  obtenerDetalleProcedimiento(id: number){
    this.parametro = { id_procedimiento_administrativo: id};
    this.detalleProcedimiento.obtenerDetalleProcedimiento(this.parametro).subscribe({
      next: (data) =>{
        this.detProcedimiento = data.datos.procedimiento;
        const lst_anexos_aux = data.datos.anexos;
        this.lst_anexos = lst_anexos_aux.filter((x: { caracter: number; }) => x.caracter == 1);
        this.loader = false;
      },
      error: (error) => {
      },
      complete: () => {
      }
    })
  }

  open(content: any) {
    this.modalService.open(content);
  }

  redireccionarInscripcion(){
    this.modalService.dismissAll();
    this.detProcedimiento.id_procedimiento_administrativo = this.parametro.id_procedimiento_administrativo;
    this.detalleProcedimiento.setLicitacionParticipacion(this.detProcedimiento);
    this._router.navigateByUrl('inicio/inscripcion');
  }

  descargarArchivo(base64String: any, fileName: any, id_tipo_archivo?: number, extensionArchivo?: string) {
    const source = `data:application/pdf;base64,${base64String}`;
    const link = document.createElement("a");
    link.href = source;
    link.download = id_tipo_archivo != 18 ? `${fileName}.${extensionArchivo}` : `${fileName}.xlsx`;
    link.click();
  }

  descargarConvocatoriaPdf(){
    let base64String = this.detProcedimiento.archivo_convocatoria;
    const extensionArchivo = this.obtenerExtensionArchivo(this.detProcedimiento.url_archivo_convocatoria);
    this.descargarArchivo(base64String,"convocatoria",0,extensionArchivo);
  }

  descargarBasesPdf(){
    let base64String = this.detProcedimiento.archivo_bases;
    const extensionArchivo = this.obtenerExtensionArchivo(this.detProcedimiento.url_archivo_bases);
    this.descargarArchivo(base64String,"bases",0,extensionArchivo);
  }

  descargarAnexoProcedimiento(archivo: any) {
    let { url_archivo_anexo, nombre_tipo_archivo, id_tipo_archivo } = archivo;
    const extensionArchivo = this.obtenerExtensionArchivo(url_archivo_anexo);
    this.detalleProcedimiento.obtenerArchivoBase64(url_archivo_anexo, false).subscribe({
      next: (data) => {
        let base64String = data.datos;
        this.descargarArchivo(base64String, nombre_tipo_archivo, id_tipo_archivo, extensionArchivo);
      },
      error: (err) => {
          Swal.fire(err.error.mensaje, "", 'error');
      },
      complete: () => {
      }
    });
  }

  descargarActaProcedimiento(url_acta:any, nombre_acta:any, tipo_archivo: any) {
    const extensionArchivo = this.obtenerExtensionArchivo(url_acta);
    this.detalleProcedimiento.obtenerArchivoBase64(url_acta, false).subscribe({
      next: (data) => {
        let base64String = data.datos;
        this.descargarArchivo(base64String, nombre_acta, tipo_archivo, extensionArchivo);
      },
      error: (err) => {
          Swal.fire(err.error.mensaje, "", 'error');
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
    return this.lst_anexos.length === 0 &&
      !this.detProcedimiento.url_archivo_acta_fallo &&
      !this.detProcedimiento.url_archivo_acto_recepcion &&
      !this.detProcedimiento.url_archivo_aviso_diferendo;
  }

  fechasNuevasExist(): boolean {
      return (
        this.detProcedimiento.fecha_limite_inscripcion_nueva !== null ||
        this.detProcedimiento.fecha_visita_lugar !== null ||
        this.detProcedimiento.fecha_junta_aclaraciones_nueva !== null ||
        this.detProcedimiento.fecha_apertura_nueva !== null ||
        this.detProcedimiento.fecha_fallo !== null ||
        this.detProcedimiento.fecha_inicio_obra_nueva !== null
      );

  }

}
