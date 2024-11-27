import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/components/login/auth.service';
import { IFilesUpload } from 'src/app/interfaces/comun/IFilesUpload';
import { IAnexoProcedimiento } from 'src/app/interfaces/convocantes/IAnexoProcedimiento';
import { IProcedimientoAdministrativo } from 'src/app/interfaces/convocantes/IProcedimientoAdministrativo';
import { ItipoArchivo } from 'src/app/interfaces/convocantes/ITipoArchivo';
import { ConvocantesService } from 'src/app/services/convocantes.service';
import swal from 'sweetalert2';
import { getBase64 } from '../../../enums/getBase64-util';
import { IDetalleProcedimiento } from 'src/app/interfaces/convocantes/IDetalleProcedimiento';


@Component({
  selector: 'app-anexos-procedimientos',
  templateUrl: './anexos-procedimientos.component.html',
  styleUrls: ['./anexos-procedimientos.component.css']
})
export class AnexosProcedimientosComponent implements OnInit{

  @Input() public _procedimientoElegido: IProcedimientoAdministrativo | null = null;

  @Output() public _cancelarAnexosProcedimiento = new EventEmitter();


  datosAnexosProcedimientoAdministrativo: IDetalleProcedimiento | null = null;

  lstAnexosProcedimientos: IAnexoProcedimiento[] = [];
  lstAnexosProcedimientosEliminar: IAnexoProcedimiento[] = [];

  lstTablaTiposArchivos: ItipoArchivo[] | null = null;

  formRegistro: FormGroup;
  formAnexos: FormGroup;

  archivoAnexo!: IFilesUpload | any;

  loaderGuardar: boolean = false;

  loaderBusqueda: boolean = false;

  modalRefCancelarAnexos:NgbModalRef|undefined;
  modalRefConfirmarGuardar:NgbModalRef|undefined;
  modalRefEliminarAnexo: NgbModalRef | undefined;

  anexoElegido: IAnexoProcedimiento | undefined;

  constructor(
    private _convocantesService: ConvocantesService,
    private _authService: AuthService,
    private modalService: NgbModal
  ) {

    this.formRegistro = this.iniciarFormularioRegistro();
    this.formAnexos = this.iniciarFormularioAnexos();

  }

  ngOnInit() {

    this.obtenerAnexosProcedimientoAdministrativo();
    this.llenarCatalogos();

  }

  iniciarFormularioRegistro(data: IProcedimientoAdministrativo | null = null) {
    const formTmp: FormGroup | null = new FormGroup({
        id_procedimiento_administrativo: new FormControl(null, {
            nonNullable: true,
            validators: [],
        }),


        id_tipo_archivo: new FormControl('', [

        ]),
        archivo_anexo: new FormControl('', [

        ]),
        comentarios: new FormControl('', [

        ]),
        nombre_tipo_archivo: new FormControl('', [

        ])

    });


    return formTmp;
  }

  iniciarFormularioAnexos(data: IAnexoProcedimiento | null = null) {
    const formTmp: FormGroup | null = new FormGroup({
        id_anexo_procedimiento: new FormControl(null, {
            nonNullable: true,
            validators: [],
        }),


        id_tipo_archivo: new FormControl('', [

        ]),
        archivo_anexo: new FormControl('', [

        ]),
        comentarios: new FormControl('', [

        ]),
        nombre_tipo_archivo: new FormControl('', [

        ]),
        id_tipo_procedimiento: new FormControl('', [

        ]),
        licitacion_tecnologia: new FormControl('', [

        ])

    });

    return formTmp;
  }


  llenarCatalogos(){

    this.loaderBusqueda = true;
    this._convocantesService.obtenerTiposArchivos(this._procedimientoElegido?.id_tipo_contratacion).subscribe({
      next: (data) => {
          this.lstTablaTiposArchivos = data.datos;
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

  obtenerAnexosProcedimientoAdministrativo(){

    this.loaderBusqueda = true;
    this._convocantesService.obtenerAnexosProcedimientoAdministrativo(this._procedimientoElegido?.id_procedimiento_administrativo).subscribe({
        next: (data) => {
            this.datosAnexosProcedimientoAdministrativo = data.datos;

            this.lstAnexosProcedimientos = this.datosAnexosProcedimientoAdministrativo?.anexos!;

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

  cancelarAnexosProcedimientoModal(content: any) {
    this.modalRefCancelarAnexos = this.modalService.open(content);
  }

  cancelarAnexosProcedimiento() {
    this.cancelarCancelarAnexosProcedimientoModal();
    this._cancelarAnexosProcedimiento.emit();

  }

  cancelarCancelarAnexosProcedimientoModal() {
    this.modalRefCancelarAnexos?.close();
  }

  guardarAnexosSubmit() {

    // Asegúrate de que la lista no sea null antes de utilizar push
    if (this.lstAnexosProcedimientos === null) {
      this.lstAnexosProcedimientos = [];
    }

    this.formAnexos.patchValue({id_tipo_archivo: this.formRegistro.value.id_tipo_archivo});
    this.formAnexos.patchValue({archivo_anexo: this.formRegistro.value.archivo_anexo});
    this.formAnexos.patchValue({comentarios: this.formRegistro.value.comentarios});
    this.formAnexos.patchValue({nombre_tipo_archivo: this.lstTablaTiposArchivos?.find((element) => element.id_tipo_archivo == this.formRegistro.value.id_tipo_archivo)?.nombre_tipo_archivo});

    const datosAnexoGuardar: IAnexoProcedimiento = this.formAnexos?.value as IAnexoProcedimiento;
    datosAnexoGuardar.archivo_anexo = this.archivoAnexo;

    this.lstAnexosProcedimientos.push(datosAnexoGuardar);

    this.formRegistro.patchValue({nombre_tipo_archivo: null});
    this.formRegistro.patchValue({comentarios: null});
    this.formRegistro.patchValue({archivo_anexo: null});
    this.formRegistro.patchValue({id_tipo_archivo: null});

  }


  guardarSubmit() {

      const datosGuardar: IProcedimientoAdministrativo = this.formRegistro?.value as IProcedimientoAdministrativo;

      datosGuardar.id_procedimiento_administrativo = this._procedimientoElegido?.id_procedimiento_administrativo;
      datosGuardar.id_tipo_procedimiento = this._procedimientoElegido?.id_tipo_procedimiento!;
      datosGuardar.licitacion_tecnologia = this._procedimientoElegido?.licitacion_tecnologia!;
      datosGuardar.anexos_procedimiento = this.lstAnexosProcedimientos;
      datosGuardar.anexos_procedimiento_eliminar = this.lstAnexosProcedimientosEliminar;

      this._convocantesService.guardarAnexosProcedimientoAdministrativo(datosGuardar).subscribe({
          next: (data) => {
              swal.fire(data.mensaje, "", 'success');
              this.cancelarAnexosProcedimiento();
          },
          error: (err) => {
              console.info(err)
              swal.fire(err.error.mensaje, "", 'error');
          },
          complete: () => {
          }
      });

      this.cancelarConfirmarGuardarSubmitModal();
    }

    cancelarConfirmarGuardarSubmitModal() {
      this.modalRefConfirmarGuardar?.close();
    }




    eliminarAnexosModal(modal: any, datos: IAnexoProcedimiento) {
      this.modalRefEliminarAnexo = this.modalService.open(modal, { size: 'lg' });

      this.anexoElegido = datos;
    }

    cerrarModalEliminar() {
      this.modalRefEliminarAnexo?.close();
    }

    validarArchivoPDF(archivo: any, event: any, mensaje? : boolean) {
      let extension = archivo.name.split('.').pop();

      if (extension !== "pdf" ) {
        event.target.value = '';
        swal.fire(
          '¡Archivo incorrecto!',
          mensaje ? "El tipo de archivo solo permite 'PDF'" : "Solo permite archivos 'PDF'",
          "error"
        );
        return false;
      }
      return true;
    }

    validarArchivoPdfExcel(archivo: any, event: any) {
      let extension = archivo.name.split('.').pop();

      if (this.formRegistro.value.id_tipo_archivo != 18) {

        // let isPDF = this.validarArchivoPDF(archivo, event, true);

        // if (!isPDF) return false;

      } else {

        if (extension !== "xlsx") {
          event.target.value = '';
          swal.fire('¡Archivo incorrecto!', "El tipo de archivo de partidas tiene que ser 'EXCEL'", "error")
          return false;
        }
      }

      return true;
    }

    obtenerArchivoAnexoBase64(event: any) {
      this.archivoAnexo = null;
      let idTypeFile = this.formRegistro.value.id_tipo_archivo;

      if (idTypeFile == '' || idTypeFile == null) {
        event.target.value = '';
        swal.fire('¡Debe seleccionar primero el tipo de archivo!', "", "info")
        this.resetArchivoAnexo();
        return;
      }

      let files = event.target.files;
      let archivo = files[0];

      if (files && archivo) {

        let isPDFOrExcel = this.validarArchivoPdfExcel(archivo, event);

        if (!isPDFOrExcel) {
          this.resetArchivoAnexo();
          return;
        }

        getBase64(archivo)
          .then((data64) => {
            this.archivoAnexo = {
              base64: String(data64),
              nombreArchivo: archivo.name,
              procedimiento:"1",
              tipoArchivo: 5,
              encriptar: false
            }
            this.archivoAnexo.base64 = this.archivoAnexo.base64?.replace(
              /^data:.+;base64,/,
              ''
            );
          })
          .catch((err) => {
            console.error(err);
          });
      }
    }

    resetArchivoAnexo() {
      this.formRegistro.controls['archivo_anexo'].setValue('');
    }

    confirmarGuardarSubmitModal(content: any) {
      this.modalRefConfirmarGuardar = this.modalService.open(content);
    }

    eliminarAnexoConfirm() {
      const indice = this.lstAnexosProcedimientos.indexOf(this.anexoElegido!);

      this.lstAnexosProcedimientos.splice(indice,1);

      if(this.anexoElegido?.id_anexo_procedimiento !== null && this.anexoElegido?.id_anexo_procedimiento !== undefined){
        this.lstAnexosProcedimientosEliminar.push(this.anexoElegido);
      }

      this.modalRefEliminarAnexo?.close();
    }

    descargarAnexoProcedimiento(archivo: any){
      if (archivo.id_anexo_procedimiento == null){
        const extensionArchivo = this.obtenerExtensionArchivo(archivo?.archivo_anexo?.nombreArchivo);
        let nombreArchivoSinExtension =  archivo.archivo_anexo.nombreArchivo.replace(/\.[^/.]+$/, "");
        this.descargarArchivo(archivo.archivo_anexo.base64,nombreArchivoSinExtension,  archivo.archivo_anexo.tipoArchivo, extensionArchivo );
        return;
      }
      let { url_archivo_anexo, nombre_tipo_archivo, id_tipo_archivo } = archivo;
      const extensionArchivo = this.obtenerExtensionArchivo(url_archivo_anexo);
      this._convocantesService.obtenerArchivoBase64(url_archivo_anexo, false).subscribe({
        next: (data) => {
          let base64String = data.datos;
          this.descargarArchivo(base64String, nombre_tipo_archivo, id_tipo_archivo, extensionArchivo);
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

    descargarArchivo(base64String: any, fileName: any, id_tipo_archivo?: number, extensionArchivo?: string) {
      const source = `data:application/pdf;base64,${base64String}`;
      const link = document.createElement("a");
      link.href = source;
      link.download = id_tipo_archivo != 18 ? `${fileName}.${extensionArchivo}` : `${fileName}.xlsx`;
      link.click();
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
}
