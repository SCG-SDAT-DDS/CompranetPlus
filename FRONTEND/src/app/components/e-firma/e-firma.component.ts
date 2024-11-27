import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { Router } from '@angular/router';
import { ICertificadoFiel, IValidacionFiel } from '../../interfaces/proveedores/IEFirma';
import { EFirmaService } from '../../services/eFirma.service';
import swal from 'sweetalert2';

@Component({
  selector: 'app-e-firma',
  templateUrl: './e-firma.component.html',
  styleUrls: ['./e-firma.component.css']
})
export class EFirmaComponent implements OnInit {
  @Input() rfc_proveedor : any;
  @Output() efirmaValidacion = new EventEmitter<boolean>();

  archivoCerBase64: any;
  archivoKeyBase64: any;

  rfcFirmante: string = '';
  clavePrivada: string = '';
  blnButtonFinalizar: boolean = false;
  loaderFirma: boolean = false;
  rfcEncontrado: string = '';

  constructor(private _router: Router, private _eFirmaService: EFirmaService) { }

  ngOnInit() {
  }

  obtenerArchivoCer(event: any) {
    let files = event.target.files;
    let archivo = files[0];

    if (files && archivo) {
      let extension = archivo.name.split('.').pop();

      if (extension !== "cer" ) {
        event.target.value = '';
        swal.fire('¡Archivo incorrecto!', "Solo permite archivos '.cer'", "error")
        return;
      }

      this.getBase64(archivo)
      .then((data64) => {
          this.archivoCerBase64 = data64;
          this.archivoCerBase64 = this.archivoCerBase64.replace('data:application/x-x509-ca-cert;base64,','');
      })
      .catch((err) => {
        console.error("eroror", err);
      })
      .finally(() => {
        let archivoCer: ICertificadoFiel = { certificado_b64: this.archivoCerBase64 };

        this._eFirmaService.obtenerDatosCertificado(archivoCer).subscribe({
          next: (data) => {
            this.rfcFirmante = data.datos.rfc;
            if (this.rfc_proveedor !== undefined){
              if (this.rfcFirmante.toUpperCase().indexOf(this.rfc_proveedor.toUpperCase()) !== -1) {
                this.rfcEncontrado = this.rfc_proveedor;
                this.blnButtonFinalizar = true;
              } else {
                swal.fire('El RFC no coincide con el que dio de alta en su registro','','error');
                this.blnButtonFinalizar = false;
              }
            }else{
              this.blnButtonFinalizar = true;
            }
          },
          error: (err) => {
            console.info(err);
            swal.fire(err.error.mensaje, "", 'error');
          }
        });
      });
    }
  }

  obtenerArchivoKey(event: any) {
    let files = event.target.files;
    let archivo = files[0];

    if (files && archivo) {
      let extension = archivo.name.split('.').pop()

      if (extension !== "key" ) {
        event.target.value = '';
        swal.fire('¡Archivo incorrecto!', "Solo permite archivos '.key'", "error")
        return;
      }

      this.getBase64(archivo)
      .then((data64) => {
          this.archivoKeyBase64 = data64;
          this.archivoKeyBase64 = this.archivoKeyBase64.replace('data:application/octet-stream;base64,','');
          //Para pruebas en MAC
          this.archivoKeyBase64 = this.archivoKeyBase64.replace('data:application/x-iwork-keynote-sffkey;base64,','');
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {

      });
    }
  }

  getBase64(file: any) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
  }

  validarFirma() {
    this.loaderFirma = true;
    let datos: IValidacionFiel = {
      certificado_b64: this.archivoCerBase64,
      key_b64: this.archivoKeyBase64,
      password: this.clavePrivada,
      rfc_firmante: this.rfcEncontrado ? this.rfcEncontrado : this.rfcFirmante
    }
    this._eFirmaService.validacionFirma(datos).subscribe({
      next: (data) => {

        if (!data.datos.fiel.valida) {
          let msj = '';
          for (const datos of data.datos.fiel.msg_failed) {
            msj += '<li>'+datos+'</li>';
          }
          swal.fire("", msj, 'error');
          this.efirmaValidacion.emit(false);
          this.loaderFirma = false;
        } else {
          swal.fire("La firma es correcta", '', 'success');
          this.efirmaValidacion.emit(true);
          this.loaderFirma = false;
        }

      },
      error: (err) => {
        swal.fire(err.error.mensaje, "", 'error');
        this.efirmaValidacion.emit(false);
        this.loaderFirma = false;
      }
    });

  }

  redireccionarInicio(){
    this._router.navigateByUrl('inicio/portal-licitaciones');
  }

}
