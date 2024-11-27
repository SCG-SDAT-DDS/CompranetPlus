import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { getBase64 } from 'src/app/enums/getBase64-util';
import { IRecepcionApertura } from 'src/app/interfaces/convocantes/IRecepcionApertura';
import { ConvocantesService } from 'src/app/services/convocantes.service';
import { DiferimientoAperturaService } from 'src/app/services/diferimientoApertura.service';
import { RecepcionPropuestasService } from 'src/app/services/recepcionPropuestas.service';
import Swal from 'sweetalert2';
// @ts-ignore
import * as JSZip from 'jszip';
import { AuthService } from 'src/app/components/login/auth.service';
@Component({
  selector: 'app-recepcion-apertura-proposiciones',
  templateUrl: './recepcion-apertura-proposiciones.component.html',
  styleUrls: ['./recepcion-apertura-proposiciones.component.css'],
})
export class RecepcionAperturaProposicionesComponent implements OnInit {
  @Output() public _cancelarRecepcionProcedimiento = new EventEmitter();
  @Input() public _procedimientoElegido: any;

  procedimientosAdquisicionesServicios = ['LPA', 'LSA', 'LPS', 'LSS'];
  procedimientosObra = ['LPO', 'LSO'];

  formRecepcion: FormGroup;

  numeroProcedimiento: any;
  proposiciones: any;
  fechaFalloData: any;
  loaderGuardar: boolean = false;
  archivoActaRecepcion: any;
  _idDetalleConvocatoria: any;
  lstPropuestas: any[] = [];
  loaderDescargar: boolean = false;

  checkboxesActivos: number = 0;
  checkboxesActivosIds: any;
  loaderIndex: number | null = null;
  loaderDescargarTodos: boolean = false;
  porcentajeCarga: number = 0;
  porcentajeCargaTodos: number = 0;
  progresoDescarga: number = 0;
  progresoDescargaTodos: number = 0;
  
  constructor(
    private _recepcionPropuestas: RecepcionPropuestasService,
    private _diferendoApertura: DiferimientoAperturaService,
    private _convocantesService: ConvocantesService,
    private _authService: AuthService,
    public datepipe: DatePipe
  ) {
    this.formRecepcion = this.iniciarFormularioRecepcion();
  }

  get fechaFalloForm() {
    return this.formRecepcion.get('fecha_fallo');
  }

  get horaFalloForm() {
    return this.formRecepcion.get('hora_fallo');
  }

  get urlActaForm() {
    return this.formRecepcion.get('url_acta_recepcion');
  }



  ngOnInit() {
    const param = this._procedimientoElegido.id_procedimiento_administrativo;
    this.numeroProcedimiento = this._procedimientoElegido.numero_procedimiento
      .slice(0, 3)
      .toUpperCase();
    this._recepcionPropuestas.obtenerPropuestasProveedores(param).subscribe({
      next: (data) => {
        this.proposiciones = data.datos;
        // Inicializar los checkboxes basados en si la propiedad archivos_propuesta tiene al menos un elemento definido
        this.proposiciones.forEach((propuesta: {
          propuesta_recibida: number;
          archivos_propuesta: any; checkboxActivo: any;}) => {
          propuesta.checkboxActivo = propuesta.archivos_propuesta !== null || propuesta.propuesta_recibida === 1;;
        });
        // Actualizar el número de checkboxes activados
        this.actualizarCheckboxesActivos();
        // Filtra los objetos con "archivo_propuesta" !== null y luego crea un nuevo array con los atributos deseados
        this.lstPropuestas = this.proposiciones
          .filter(
            (dato: any) =>
              dato.archivos_propuesta !== null
          )
          .map((dato: any) => ({
            archivos_propuesta: [
              dato.archivos_propuesta.archivos_propuesta,
              dato.archivos_propuesta.archivo_partida
            ],
            rfc_proveedor: dato.rfc_proveedor,
            correo: dato.correo_electronico,
            razon_social: dato.razon_social,
            nombre_proveedor: dato.nombre_proveedor,
            primer_apellido_proveedor: dato.primer_apellido_proveedor,
            segundo_apellido_proveedor: dato.segundo_apellido_proveedor,
            id_usuario: dato.id_usuario
          }));
      },
      error: (err) => {
        Swal.fire(err.error.mensaje, '', 'error');
      },
    });

    this._diferendoApertura.obtenerDetalleApertura(param).subscribe({
      next: (data) => {
        this.fechaFalloData = data.datos?.fecha_fallo.slice(0, 10);
        this._idDetalleConvocatoria = data.datos.id_detalle_convocatoria;
        this.llenarFormularioDatos(data.datos);
      },
    });
  }

  iniciarFormularioRecepcion(data: IRecepcionApertura | null = null) {
    const formTmp: FormGroup | null = new FormGroup({
      id_detalle_convocatoria: new FormControl(null, {
        nonNullable: true,
        validators: [],
      }),
      fecha_fallo: new FormControl('', [Validators.required]),
      hora_fallo: new FormControl('', [Validators.required]),
      url_acta_recepcion: new FormControl('', [Validators.required]),
    });

    return formTmp;
  }

  llenarFormularioDatos(data: any){
    this.formRecepcion.patchValue({id_detalle_convocatoria: data?.id_detalle_convocatoria});
    this.formRecepcion.patchValue({ fecha_fallo: this.datepipe.transform(data?.fecha_fallo,'yyyy-MM-dd') });
    this.formRecepcion.patchValue({ hora_fallo: this.datepipe.transform(data?.fecha_fallo,'HH:mm:ss') });
  }


  validarFecha(event: any) {
    if (
      this.procedimientosAdquisicionesServicios.includes(
        this.numeroProcedimiento
      )
    ) {
      this.validarFecha20Days();
    }

    if (this.procedimientosObra.includes(this.numeroProcedimiento)) {
      this.validarFecha30Days();
    }
  }

  validarFecha20Days() {
    const fechaFallo = new Date(this.fechaFalloForm?.value);
    const fechaFalloOriginal = new Date(this.fechaFalloData);
    if (fechaFallo && fechaFalloOriginal) {
      const fechaFalloDate = new Date(fechaFallo);
      const fechaOriginalDate = new Date(fechaFalloOriginal);
      const diferenciaAux =
        fechaFalloDate.getTime() - fechaOriginalDate.getTime();
      const diferenciaDias = diferenciaAux / (1000 * 60 * 60 * 24);
      if (diferenciaDias > 20) {
        this.formRecepcion?.get('fecha_fallo')?.setErrors({ dif20dias: true });
      } else {
        this.formRecepcion?.get('fecha_fallo')?.setErrors(null);
      }
    }
  }

  validarFecha30Days() {
    const fechaFallo = new Date(this.fechaFalloForm?.value);
    const fechaFalloOriginal = new Date(this.fechaFalloData);
    if (fechaFallo && fechaFalloOriginal) {
      const fechaFalloDate = new Date(fechaFallo);
      const fechaOriginalDate = new Date(fechaFalloOriginal);
      const diferenciaAux =
        fechaFalloDate.getTime() - fechaOriginalDate.getTime();
      const diferenciaDias = diferenciaAux / (1000 * 60 * 60 * 24);
      if (diferenciaDias > 30) {
        this.formRecepcion?.get('fecha_fallo')?.setErrors({ dif30dias: true });
      } else {
        this.formRecepcion?.get('fecha_fallo')?.setErrors(null);
      }
    }
  }

  guardar() {
    if (this.formRecepcion == undefined || this.formRecepcion.invalid) {
      for (const control of Object.keys(this.formRecepcion?.controls)) {
        this.formRecepcion.controls[control].markAsTouched();
      }
      return;
    }

    const datosGuardar: IRecepcionApertura = this.formRecepcion
      ?.value as IRecepcionApertura;

    datosGuardar.id_detalle_convocatoria = this._idDetalleConvocatoria;
    datosGuardar.url_acta_recepcion = this.archivoActaRecepcion;
    datosGuardar.id_procedimiento_administrativo = this._procedimientoElegido.id_procedimiento_administrativo;
    if (this.checkboxesActivos == 0){
      datosGuardar.propuestas = 0;
    }

    datosGuardar.participantes_propuesta = this.checkboxesActivosIds;
    this.loaderGuardar = true;
    this._recepcionPropuestas.guardarRecepcionActo(datosGuardar).subscribe({
      next: (data) => {
        Swal.fire(data.mensaje, '', 'success');
      },
      error: (err) => {
        Swal.fire(err.error.mensaje, '', 'error');
      },
      complete: () => {
        this.cancelarRecepcionProcedimiento();
        this.formRecepcion?.reset();
        this.loaderGuardar = false;
      },
    });
  }

  obtenerActaRecepcionBase64(event: any) {
    this.archivoActaRecepcion = null;
    let files = event.target.files;
    let archivo = files[0];

    if (files && archivo) {
      getBase64(archivo)
        .then((data64) => {
          this.archivoActaRecepcion = {
            base64: String(data64),
            nombreArchivo: archivo.name,
            procedimiento: this._procedimientoElegido?.numero_procedimiento,
            tipoArchivo: 11,
            encriptar: false,
          };
          this.archivoActaRecepcion.base64 =
            this.archivoActaRecepcion.base64?.replace(/^data:.+;base64,/, '');
        })
        .catch((err) => {
          console.error(err);
        });
    } else {
      alert('No se seleccionó ningún archivo.');
    }
  }


  async descargarTodasNew() {
    this.loaderDescargarTodos = true;
    this.porcentajeCargaTodos = 0;
    this.progresoDescargaTodos = 0; // Inicializamos el progreso de la generación del ZIP
    const zip = new JSZip();
    const listCorreos: any[] = [];

    const totalArchivos = this.lstPropuestas.reduce((sum, propuesta) => 
        sum + (propuesta.archivos_propuesta[0] ? propuesta.archivos_propuesta[0].length : 0) + (propuesta.archivos_propuesta[1] ? 1 : 0), 0);
    let archivosProcesados = 0;

    const actualizarPorcentaje = () => {
        archivosProcesados++;
        this.porcentajeCargaTodos = Math.round((archivosProcesados / totalArchivos) * 100);
    };

    const descargarArchivo = (archivo: string): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            this._convocantesService.obtenerArchivoBase64(archivo, true).subscribe({
                next: (data) => {
                    let base64String = data.datos;
                    const blob = this.base64toBlob(base64String);
                    actualizarPorcentaje();
                    resolve(blob);
                },
                error: (error) => {
                    this.loaderDescargarTodos = false;
                    this.porcentajeCargaTodos = 0;
                    Swal.fire('Hubo un error al descargar el archivo', '', 'error');
                    reject(error);
                    return;
                }
            });
        });
    };

    const agregarArchivosAlZip = async (archivos: string[], nombreArchivoBase: string, extension: string, limite: number) => {
        for (let i = 0; i < archivos.length; i += limite) {
            const batch = archivos.slice(i, i + limite);
            const promesas = batch.map((archivo, index) =>
                descargarArchivo(archivo).then(blob => {
                    zip.file(`${nombreArchivoBase}_archivo_propuesta_${i + index + 1}.${extension}`, blob);
                })
            );
            await Promise.all(promesas);
            // Pausa entre lotes de descargas para evitar la saturación
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    };

    const promesasDescarga = this.lstPropuestas.map(async (propuesta: any) => {
        const rfcProveedor = propuesta.rfc_proveedor;

        if (propuesta.archivos_propuesta[0] !== null) {
            await agregarArchivosAlZip(propuesta.archivos_propuesta[0], `${rfcProveedor}_archivo_propuesta`, 'zip', 3); // Limitar a 3 descargas concurrentes
        }

        if (propuesta.archivos_propuesta[1] !== null) {
            await agregarArchivosAlZip([propuesta.archivos_propuesta[1]], `${rfcProveedor}_archivo_partida`, 'xlsx', 1); // Una descarga a la vez para el archivo de partida
        }

        listCorreos.push({
            correo: propuesta.correo,
            usuario: propuesta.id_usuario,
            razon_social: propuesta.razon_social,
            nombre_proveedor: propuesta.nombre_proveedor,
            primer_apellido_proveedor: propuesta.primer_apellido_proveedor,
            segundo_apellido_proveedor: propuesta.segundo_apellido_proveedor,
            procedimiento: this._procedimientoElegido.numero_procedimiento
        });
    });

    try {
        await Promise.all(promesasDescarga);

        const content = await zip.generateAsync({ 
            type: 'blob',
            compression: "DEFLATE",
            compressionOptions: { level: 6 }
        }, (metadata) => {
            this.progresoDescargaTodos = Number(Math.round(metadata.percent)); // Actualiza el progreso
            console.log("Progreso: " + this.progresoDescargaTodos + " %");
            if (metadata.currentFile) {
                console.log("Archivo actual = " + metadata.currentFile);
            }
        });

        // Descargar como Blob
        const url = window.URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this._procedimientoElegido.numero_procedimiento}_propuestas.zip`;
        a.click();
        window.URL.revokeObjectURL(url);

        // Notifica a los proveedores
        this._convocantesService.notificarDescargaPropuestas(listCorreos).subscribe({
            next: () => {
                Swal.fire('Se ha notificado a los proveedores', '', 'success');
            },
            error: (err) => {
                Swal.fire(err.error.mensaje, '', 'error');
            },
            complete: () => {
                this.loaderDescargarTodos = false;
                this.porcentajeCargaTodos = 0;
                this.progresoDescargaTodos = 0; // Restablece el progreso después de completar
            }
        });
    } catch (error) {
        console.error('Error al descargar los archivos: ', error);
        this.loaderDescargarTodos = false;
    }
}

  // Función para convertir base64 en Blob
  base64toBlob(base64Data: string) {
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: 'application/zip' }); // Ajusta el tipo MIME según el tipo de archivo
  }

  async descargarArchivosEnZip(archivos_propuesta: string[], archivo_partida: string, fileName: string, propuesta?: any, index?: any) {
    const zip = new JSZip();
    this.loaderDescargar = true;
    this.loaderIndex = index;
    this.loaderDescargarTodos = false;

    this.porcentajeCarga = 0; // Inicializamos el porcentaje de carga
    this.progresoDescarga = 0;

    const totalArchivos = archivos_propuesta.length + (archivo_partida ? 1 : 0);
    let archivosProcesados = 0;

    const actualizarPorcentaje = () => {
        archivosProcesados++;
        this.porcentajeCarga = Math.round((archivosProcesados / totalArchivos) * 100);
    };

    const descargarArchivo = (archivo: string): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            this._convocantesService.obtenerArchivoBase64(archivo, true).subscribe({
                next: (data) => {
                    let base64String = data.datos;
                    const blob = this.base64toBlob(base64String);
                    actualizarPorcentaje();
                    resolve(blob);
                },
                error: (error) => {
                    this.loaderDescargar = false;
                    Swal.fire('Hubo un error al descargar el archivo', '', 'error');
                    reject(error);
                    return;
                }
            });
        });
    };

    const agregarArchivoAlZip = async (archivo: string, nombreArchivo: string) => {
        const blob = await descargarArchivo(archivo);
        zip.file(nombreArchivo, blob);
    };

    const agregarArchivosConControlDeFlujo = async (archivos: string[], nombreArchivoBase: string, limite: number) => {
        for (let i = 0; i < archivos.length; i += limite) {
            const batch = archivos.slice(i, i + limite);
            const promesas = batch.map((archivo, index) => 
                agregarArchivoAlZip(archivo, `${nombreArchivoBase}_archivo_propuesta_${i + index + 1}.zip`)
            );
            await Promise.all(promesas);
            // Pausa entre lotes de descargas para evitar la saturación
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    };

    try {
        await agregarArchivosConControlDeFlujo(archivos_propuesta, fileName, 3); // Limitar a 3 descargas concurrentes

        if (archivo_partida) {
            await agregarArchivoAlZip(archivo_partida, `${fileName}_archivo_partida.xlsx`);
        }

        const content = await zip.generateAsync({ 
          type: 'blob',
          compression: "DEFLATE",
          compressionOptions: { level: 6 }
      }, (metadata) => {
          this.progresoDescarga = Number(Math.round(metadata.percent)); // Actualiza el progreso
          console.log("Progreso: " + this.progresoDescarga + " %");
          if (metadata.currentFile) {
              console.log("Archivo actual = " + metadata.currentFile);
          }
      });

      // Descargar como Blob
      const url = window.URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}_propuestas.zip`;
      a.click();

        if (propuesta) {
            const listCorreos: any[] = [{
                correo: propuesta.correo_electronico,
                usuario: propuesta.id_usuario,
                razon_social: propuesta.razon_social,
                nombre_proveedor: propuesta.nombre_proveedor,
                primer_apellido_proveedor: propuesta.primer_apellido_proveedor,
                segundo_apellido_proveedor: propuesta.segundo_apellido_proveedor,
                procedimiento: this._procedimientoElegido.numero_procedimiento
            }];
            this._convocantesService.notificarDescargaPropuestas(listCorreos).subscribe({
                next: () => {
                    Swal.fire('Se ha notificado al proveedor', '', 'success');
                    setTimeout(() => {
                        this.loaderDescargar = false;
                        this.loaderIndex = null;
                        this.porcentajeCarga = 0;
                    }, 3000);
                },
                error: (err) => {
                    Swal.fire(err.error.mensaje, '', 'error');
                    setTimeout(() => {
                        this.loaderDescargar = false;
                        this.loaderIndex = null;
                        this.porcentajeCarga = 0;
                    }, 3000);
                }
            });
        }
    } catch (error) {
        console.error('Error al descargar los archivos: ', error);
    }
}


  cancelarRecepcionProcedimiento() {
    this._cancelarRecepcionProcedimiento.emit();
  }


  //Para descargar el acta de recepcion y apertura
  onClickDescargarPdf(url: any, nombre: any){

    this._convocantesService.obtenerArchivoBase64(url, false).subscribe({
      next: (data) => {
        let base64String = data.datos;
        this.descargarPdf(base64String, nombre);
      },
      error: (err) => {
          console.info(err)
          Swal.fire(err.error.mensaje, "", 'error');
      },
      complete: () => {
      }
    });

  }

  descargarPdf(base64String: any, fileName: any) {
    const source = `data:application/pdf;base64,${base64String}`;
    const link = document.createElement("a");
    link.href = source;
    link.download = `ACTA_RECEPCION_APERTURA_${fileName}.pdf`
    link.click();
  }

  // Función para actualizar el número de checkboxes activados
  actualizarCheckboxesActivos() {
    this.checkboxesActivos = this.proposiciones.filter((propuesta: { checkboxActivo: any; }) => propuesta.checkboxActivo).length;
  
    this.checkboxesActivosIds = this.proposiciones
      .filter((propuesta: { checkboxActivo: boolean; }) => propuesta.checkboxActivo)
      .map((propuesta: { id_participante_procedimiento: number; }) => propuesta.id_participante_procedimiento);
  
  }

  // Función para manejar el cambio de estado del checkbox
  manejarCambioCheckbox(propuesta: any) {
    // Cambia el estado del checkbox de la propuesta
    propuesta.checkboxActivo = !propuesta.checkboxActivo;
    // Actualiza el número total de checkboxes activos
    this.actualizarCheckboxesActivos();
  }

  isAdmin(){
    const rol: string | any = this._authService.rolSys;
    return rol[0] === "ADMINISTRADOR";
  }
}
