import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment-timezone';
import { CriptoService } from 'src/app/admin/services/Cripto.service';
import { getBase64 } from 'src/app/enums/getBase64-util';
import { IPropuestaProveedor } from 'src/app/interfaces/proveedores/IPropuestaProveedor';
import { IDetalleParticipanteProcedimiento } from 'src/app/interfaces/proveedores/ITableroProveedores';
import { ConvocantesService } from 'src/app/services/convocantes.service';
import { TableroProveedoresService } from 'src/app/services/tableroProveedores.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-presentar-propuesta',
  templateUrl: './presentar-propuesta.component.html',
  styleUrls: ['./presentar-propuesta.component.css']
})
export class PresentarPropuestaComponent implements OnInit {
  @Output() public _cancelarPresentarPropuesta = new EventEmitter();
  @Input() public _procedimientoElegido: any;
  archivoPropuesta: any;
  _detalleParticipante: any;
  loaderGuardar: boolean = false;
  rfcProveedor: any;
  loader: boolean;

  activarMostrarPropuesta:boolean = false;
  mostrarPropuesta:boolean = false;
  busquedaPartidasPrimeraVez = true;
  blnProcedimientoObra: boolean;
  archivosPropuestas: IPropuestaProveedor[] = [];
  btnAgregarPropuesta: boolean = true;
  blnSubirPropuesta: boolean = false;


    constructor(
      private _participante:TableroProveedoresService,
      private _modalService: NgbModal,
      private _cripto: CriptoService,
      private _convocantesService: ConvocantesService,
    ) {
      this.loader = true;
      this.blnProcedimientoObra = false;
    }

  ngOnInit() {
    if(this._procedimientoElegido.tipo_procedimiento == 5 || this._procedimientoElegido.tipo_procedimiento == 6){
      console.log(this._procedimientoElegido);
      this.mostrarPropuesta = true;
      this.blnProcedimientoObra = true;
    }
    const params:IDetalleParticipanteProcedimiento =
    {
      id_proveedor: Number(localStorage.getItem('id_p')),
      id_procedimiento_administrativo: this._procedimientoElegido.id_procedimiento_administrativo
    }
    this._participante.getDetalleParticipante(params).subscribe({
      next: (data) => {
        const response = data.datos;
        if(response.length > 0){
          this._detalleParticipante = response;
          this.blnSubirPropuesta = false;
        }else{
          this._detalleParticipante = [];
          this.blnSubirPropuesta = true;
        }
      },
      error: (err) => {
        Swal.fire(err.error.mensaje,'','error');
      },
      complete: () => {
        this.loader = false;
      }
    })

    this.btnAgregarPropuesta = this.habilitarBoton();
  }

  adjuntarNuevaPropuesta(){
    Swal.fire({
      title: 'ADVERTENCIA',
      html: '¿Está seguro de adjuntar una nueva propuesta?',
      icon: 'question',
      confirmButtonText: 'Aceptar',
      showCancelButton: true,
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.blnSubirPropuesta = true;

      }
    });
  }

  subirPropuesta(event: any){
    this.archivoPropuesta = null;
    let files = event.target.files;
    let archivo = files[0];

    if (files && archivo) {
      getBase64(archivo)
        .then((data64) => {
          this.archivoPropuesta = {
            base64: String(data64),
            nombreArchivo: archivo.name,
            procedimiento: this._procedimientoElegido?.numero_procedimiento,
            tipoArchivo: 12,
            encriptar: true,
          };
          this.archivoPropuesta.base64 =
            this.archivoPropuesta.base64?.replace(/^data:.+;base64,/, '');
        })
        .catch((err) => {
          console.error(err);
        });
    } else {
      alert('No se seleccionó ningún archivo.');
    }
  }

  obtenerArchivosBase64(event: any) {
    let files = event.target.files;

    if (files && files.length > 0) {
      for (const element of files) {
        const archivo = element;

        // Verificar el tamaño del archivo
        if (archivo.size > 25 * 1024 * 1024) {
          Swal.fire(`El archivo ${archivo.name} excede el tamaño máximo permitido de 25 MB`,'','error');
          continue; // Saltar este archivo y pasar al siguiente
        }

        getBase64(archivo)
          .then((data64) => {
            const files: any = {
              base64: String(data64),
              nombreArchivo: archivo.name,
              procedimiento: this._procedimientoElegido?.numero_procedimiento,
              tipoArchivo: 12,
              encriptar: true,
            };
            files.base64 = files?.base64.replace(/^data:.+;base64,/, '');
            this.archivosPropuestas.push({
              id_propuesta_participante: this._detalleParticipante.id_propuesta_participante,
              id_participante_procedimiento: this._detalleParticipante.id_participante_procedimiento ? this._detalleParticipante.id_participante_procedimiento : this._procedimientoElegido.id_participante_procedimiento ,
              url_archivo_propuesta: files,
              id_proveedor: Number(localStorage.getItem('id_p')),
              procedimiento: this._procedimientoElegido.numero_procedimiento,
              id_tipo_procedimiento: this._procedimientoElegido.tipo_procedimiento,
              id_procedimiento_administrativo: this._procedimientoElegido.id_procedimiento_administrativo,
              estado: 1
            });
          })
          .catch((err) => {
            console.error(err);
          });
      }
    }
  }


  async guardarPropuesta() {

    let allSuccess = true;
    for (let i = 0; i < this.archivosPropuestas.length; i++) {
      const archivo = this.archivosPropuestas[i];
      const params = { propuestas: [archivo] }; // Enviar solo el archivo actual en la petición

      try {
        await this._participante.guardarPropuestaProveedor(params).toPromise();
        // Actualizar estado en la tabla
        this.archivosPropuestas[i].estado = 2;
      } catch (error) {
        // Manejar errores
        allSuccess = false;
        Swal.fire(String(error), '', 'error'); // Casting a string
        console.error("Error al subir archivo:", error);
        this.archivosPropuestas[i].estado = 3;
      }

    }

    if(allSuccess){
      let params = {
        procedimiento: this._procedimientoElegido.numero_procedimiento,
        id_proveedor: Number(localStorage.getItem('id_p'))
      }
      // Llamar al servicio de notificación
      this._participante.enviarNotificacion(params).subscribe({
        next: (data) => {
          if(data.datos === 1){
            Swal.fire({
              title: "Archivos guardados y notificación enviada con éxito",
              text: "",
              icon: "success",
            });
          }

          if(data.datos === 0){
            Swal.fire({
              title: "Por el momento el servicio de envio de correos no se encuentra disponible pero los archivos han sido guardados con exito",
              text: "",
              icon: "warning",
            });
          }
          
        },
        error: (error) => {
          Swal.fire({
            title: "No ha sido posible notificar al proveedor",
            text: error.mensaje,
            icon: "error",
          });
          setTimeout(() => {
            this.loaderGuardar = false;
            this.cancelarPresentarPropuesta();
          }, 2000); 
        },
        complete: () => {
          setTimeout(() => {
            this.loaderGuardar = false;
            this.cancelarPresentarPropuesta();
          }, 2000);
        }
      });

    }else {
      // Si algunos archivos fallaron
      Swal.fire({
          title: "Algunos archivos no se pudieron guardar",
          text: "Por favor, revise los errores e intente nuevamente.",
          icon: "error",
      });
      this.loaderGuardar = false;
      this.cancelarPresentarPropuesta();
    }
  }



  validarEFirma(content: any) {

    const continueProcess = this.habilitarBoton()
    if(!continueProcess){
      Swal.fire('No se puede subir la propuesta puesto que ya se ha llegado a la fecha y hora limite','','error');
      return;
    }

    if(this.archivosPropuestas.length == 0){
       Swal.fire('No ha subido su propuesta, favor de adjuntarla','','error');
       return;
    }
    this.rfcProveedor = this._cripto.decrypt(localStorage.getItem('rp_'));
    this._modalService.open(content);
  }

  efirmaResponse(event:boolean){
    if (event){
      this._modalService.dismissAll();
      this.loaderGuardar = true;
      this.guardarPropuesta();
    }
  }

  onClickDescargarPdf(url: any, nombre: any) {
    this._convocantesService.obtenerArchivoBase64(url, true).subscribe({
      next: (data) => {
        let base64String = data.datos;
        this.descargarPdf(base64String, nombre);
      },
      error: (err) => {
        console.info(err);
        Swal.fire(err.error.mensaje, '', 'error');
      },
      complete: () => {},
    });
  }

  descargarPdf(base64String: any, fileName: any) {
    const source = `data:application/zip;base64,${base64String}`;
    const link = document.createElement('a');
    link.href = source;
    link.download = `${fileName}.zip`;
    link.click();
  }

  cancelarPresentarPropuesta() {
    this._cancelarPresentarPropuesta.emit();
  }

  continuarCargaPropuesta() {
      this.activarMostrarPropuesta = true;
      this.mostrarPropuesta = true;
  }

  eliminarArchivo(index: number){
    this.archivosPropuestas.splice(index, 1);
  }

  habilitarBoton(){
    const fechaSonora = moment.tz('America/Hermosillo').format('YYYY-MM-DD HH:mm:ss');
    const fechaActual = moment(fechaSonora);
    const fechaApertura = this._procedimientoElegido.fecha_apertura_nueva ? moment(this._procedimientoElegido.fecha_apertura_nueva) : moment(this._procedimientoElegido.fecha_apertura);

    console.log(fechaActual);

    return fechaActual < fechaApertura;
  }

}
