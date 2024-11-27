import {
  Component,
  Input,
  Output,
  EventEmitter,
  Injectable,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  NgbCalendar,
  NgbDate,
  NgbDateAdapter,
  NgbDateParserFormatter,
  NgbDateStruct,
} from '@ng-bootstrap/ng-bootstrap';
import { getBase64 } from 'src/app/enums/getBase64-util';
import { IDiferimientoApertura } from 'src/app/interfaces/convocantes/IDiferimientoApertura';
import { CatalogoDiasFestivosService } from 'src/app/services/catalogoDiasFestivos.service';
import { DiferimientoAperturaService } from 'src/app/services/diferimientoApertura.service';
import Swal from 'sweetalert2';

//* Dependencia para adaptar la fecha *//

@Injectable()
export class CustomAdapter extends NgbDateAdapter<string> {
  readonly DELIMITER = '-';

  fromModel(value: string | null): NgbDateStruct | null {
    if (value) {
      const date = value.split(this.DELIMITER);
      return {
        year: parseInt(date[0], 10),
        month: parseInt(date[1], 10),
        day: parseInt(date[2], 10),
      };
    }
    return null;
  }

  toModel(date: NgbDateStruct | null): string | null {
    return date
      ? date.year + this.DELIMITER + date.month + this.DELIMITER + date.day
      : null;
  }
}

//* Dependencia para formatear la fecha *//

@Injectable()
export class CustomDateParserFormatter extends NgbDateParserFormatter {
  readonly DELIMITER = '/';

  parse(value: string): NgbDateStruct | null {
    if (value) {
      const date = value.split(this.DELIMITER);
      return {
        day: parseInt(date[0], 10),
        month: parseInt(date[1], 10),
        year: parseInt(date[2], 10),
      };
    }
    return null;
  }

  format(date: NgbDateStruct | null): string {
    return date
      ? date.day + this.DELIMITER + date.month + this.DELIMITER + date.year
      : '';
  }
}

@Component({
  selector: 'app-diferendo-apertura',
  templateUrl: './diferendo-apertura.component.html',
  styleUrls: ['./diferendo-apertura.component.css'],
  providers: [
    { provide: NgbDateAdapter, useClass: CustomAdapter },
    { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter },
  ],
})
export class DiferendoAperturaComponent {
  @Input() public _procedimientoElegido: any;
  @Output() public _cancelarDiferendoProcedimiento = new EventEmitter();
  datosFechasPrevias: any;
  blnFechasNuevas: any;
  formDiferendo: FormGroup;
  loaderGuardar: boolean = false;
  blnDesabilitarBtn: boolean = true;
  procedimientosAdquisicionesServicios = ['LPA', 'LSA', 'LPS', 'LSS'];
  procedimientosObra = ['LPO', 'LSO'];
  blnDifJuntaApertura: boolean = false;
  blnDifInscripcionApertura: boolean = false;
  archivoAvisoDiferendo: any;
  listDiasFestivos: any;
  isDisabled: any;

  datePickerJson = {};
  json = {
    disable: [6, 7],
    disabledDates: [{ year: 1900, month: 10, day: 19 }],
  };

  minPickerFechaInscripcion = {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    day: new Date().getDate(),
  };

  minPickerFechaJuntaAclaraciones = {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    day: new Date().getDate(),
  };

  minPickerFechaAperturaPropuestas = {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    day: new Date().getDate(),
  };

  minPickerFechaFallo = {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    day: new Date().getDate(),
  };

  minPickerFechaInicioObra = {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    day: new Date().getDate(),
  };

  fechaInscripcionElegido: Date;
  fechaJuntaAclaracionesElegido: Date;
  fechaAperturaPropuestasElegido: Date;
  fechaInicioObraElegido: Date;

  maxPickerFechaApertura: any = {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    day: new Date().getDate(),
  };

  constructor(
    private _diferimientoApertura: DiferimientoAperturaService,
    private _diasFestivosService: CatalogoDiasFestivosService,
    private calendar: NgbCalendar
  ) {
    this.blnFechasNuevas = false;
    this.formDiferendo = this.iniciarFormularioDiferendo();

    this.isDisabled = (date: NgbDateStruct) => {
      return this.json.disabledDates.find(
        (x) =>
          new NgbDate(x.year, x.month, x.day).equals(date) ||
          this.json.disable.includes(
            calendar.getWeekday(new NgbDate(date.year, date.month, date.day))
          )
      )
        ? true
        : false;
    };

    this.fechaInscripcionElegido = new Date();
    this.fechaJuntaAclaracionesElegido = new Date();
    this.fechaAperturaPropuestasElegido = new Date();
    this.fechaInicioObraElegido = new Date();
  }

  get fechaJuntaForm() {
    return this.formDiferendo.get('fecha_junta_aclaraciones_nueva');
  }

  get horaJuntaForm() {
    return this.formDiferendo.get('hora_junta_aclaraciones_nueva');
  }

  get fechaLimiteForm() {
    return this.formDiferendo.get('fecha_limite_inscripcion_nueva');
  }

  get fechaAperturaForm() {
    return this.formDiferendo.get('fecha_apertura_nueva');
  }

  get horaAperturaForm() {
    return this.formDiferendo.get('hora_apertura_nueva');
  }

  get fechaObraForm() {
    return this.formDiferendo.get('fecha_inicio_obra_nueva');
  }

  get urlDiferendoForm() {
    return this.formDiferendo.get('url_archivo_aviso_diferendo');
  }

  iniciarFormularioDiferendo(data: IDiferimientoApertura | null = null) {
    const formTmp: FormGroup | null = new FormGroup({
      id_detalle_convocatoria: new FormControl(null, {
        nonNullable: true,
        validators: [],
      }),
      fecha_junta_aclaraciones_nueva: new FormControl('', [
        Validators.required,
      ]),
      hora_junta_aclaraciones_nueva: new FormControl('', [Validators.required]),
      fecha_limite_inscripcion_nueva: new FormControl('', [
        Validators.required,
      ]),
      fecha_apertura_nueva: new FormControl('', [Validators.required]),
      hora_apertura_nueva: new FormControl('', [Validators.required]),
      fecha_inicio_obra_nueva: new FormControl(null),
      url_archivo_aviso_diferendo: new FormControl('', [Validators.required]),
    });

    if (data != null) {
      if (data.id_detalle_convocatoria != null) {
        formTmp.patchValue({
          id_detalle_convocatoria: data.id_detalle_convocatoria,
        });
      }

      if (data.fecha_junta_aclaraciones_nueva != null) {
        formTmp.patchValue({
          fecha_junta_aclaraciones_nueva: data.fecha_junta_aclaraciones_nueva,
        });
      }

      if (data.hora_junta_aclaraciones_nueva != null) {
        formTmp.patchValue({
          hora_junta_aclaraciones_nueva: data.hora_junta_aclaraciones_nueva,
        });
      }

      if (data.fecha_limite_inscripcion_nueva != null) {
        formTmp.patchValue({
          fecha_limite_inscripcion_nueva: data.fecha_limite_inscripcion_nueva,
        });
      }

      if (data.fecha_apertura_nueva != null) {
        formTmp.patchValue({ fecha_apertura_nueva: data.fecha_apertura_nueva });
      }

      if (data.hora_apertura_nueva != null) {
        formTmp.patchValue({ hora_apertura_nueva: data.hora_apertura_nueva });
      }

      if (data.fecha_inicio_obra_nueva != null) {
        formTmp.patchValue({
          fecha_inicio_obra_nueva: data.fecha_inicio_obra_nueva,
        });
      }

      if (data.url_archivo_aviso_diferendo != null) {
        formTmp.patchValue({
          url_archivo_aviso_diferendo: data.url_archivo_aviso_diferendo,
        });
      }
    }

    return formTmp;
  }

  ngOnInit(): void {
    this._diferimientoApertura
      .obtenerDetalleApertura(
        this._procedimientoElegido.id_procedimiento_administrativo
      )
      .subscribe({
        next: (data) => {
          this.datosFechasPrevias = data.datos;
          const fechaApertura = new Date(data.datos.fecha_apertura);
          const fechaHoraActual = new Date();
          if (fechaApertura < fechaHoraActual) {
            this.blnDesabilitarBtn = true;
          } else {
            this.blnDesabilitarBtn = false;
          }
        },
        error: (err) => {
          Swal.fire(err.error.mensaje, '', 'error');
        },
      });

    this._diasFestivosService.obtenerDiasFestivosList().subscribe({
      next: (data) => {
        this.listDiasFestivos = data.datos;

        this.listDiasFestivos.forEach((fecha: any) => {
          this.json.disabledDates.push({
            year: new Date(fecha.fecha_dia_festivo).getFullYear(),
            month: new Date(fecha.fecha_dia_festivo).getMonth() + 1,
            day: new Date(fecha.fecha_dia_festivo).getDate(),
          });
        });
      },
      error: (err) => {
        Swal.fire(err.error.mensaje, '', 'error');
      },
    });
  }

  /**
   * Funcion para validar en caso de que sea LPO o LSO se cumpla las reglas correspondientes
   * Y también de forma general valida si la fecha en la que se hace el procedimiento se esta haciendo cuando la fecha limite de inscripcion
   * original ya caduco y que en dado caso se ingrese una fecha limite de inscripcion mayor para reponer los días
   */
  validarInscripcionAperturaFechas() {
    const numero_procedimiento =
      this._procedimientoElegido.numero_procedimiento.slice(0, 3);
    if (this.procedimientosObra.includes(numero_procedimiento.toUpperCase())) {
      const fechaApertura = this.fechaAperturaForm?.value;
      const fechaInscripcion = this.fechaLimiteForm?.value;

      if (fechaInscripcion && fechaApertura) {
        const fechaInscripcionDate = new Date(fechaInscripcion);
        const fechaAperturaDate = new Date(fechaApertura);
        const diferenciaAux =
          fechaAperturaDate.getTime() - fechaInscripcionDate.getTime();
        const diferenciaDias = diferenciaAux / (1000 * 60 * 60 * 24);
        if (diferenciaDias >= 6) {
          this.blnDifInscripcionApertura = true;
          this.formDiferendo
            ?.get('fecha_limite_inscripcion_nueva')
            ?.setErrors(null);
        } else {
          this.formDiferendo
            ?.get('fecha_limite_inscripcion_nueva')
            ?.setErrors({ difInscripcionApertura: true });
          this.blnDifInscripcionApertura = false;
          return;
        }
      }
    }
  }

  alertGuardar() {
    if (this.formDiferendo == undefined || this.formDiferendo.invalid) {
      for (const control of Object.keys(this.formDiferendo?.controls)) {
        this.formDiferendo.controls[control].markAsTouched();
      }
      return;
    }

    const numero_procedimiento =
      this._procedimientoElegido.numero_procedimiento.slice(0, 3);
    let msjAviso = '';
    if (this.procedimientosObra.includes(numero_procedimiento.toUpperCase())) {
      msjAviso = `<i>“La información de los datos originales de la convocatoria se guardaran como históricos,
      la fecha y hora de fallo quedaran en blanco para que sean capturados posteriormente en la opción <Recepción de Propuestas>,
      así mismo se enviaran correos a los proveedores que han manifestado interés para que, en caso, de que no hayan pagado
      sus bases de licitación, generen un Pase a Caja con la nueva fecha límite de venta de bases y no se limite su participación”.</i>`;
    }

    if (
      this.procedimientosAdquisicionesServicios.includes(
        numero_procedimiento.toUpperCase()
      )
    ) {
      msjAviso = `<i>“Una vez guardada la información los datos originales de la convocatoria se guardarán como históricos,
      así mismo el sistema enviará un correo a los proveedores que han manifestado interés para que, en caso, de que no
      hayan pagado sus bases de licitación, generen un Pase a Caja con la nueva fecha límite de inscripción y no se limite su participación”.</i>`;
    }

    Swal.fire({
      title: 'ADVERTENCIA',
      html: msjAviso,
      icon: 'warning',
      confirmButtonText: 'Aceptar',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.guardarSubmit();
      }
    });
  }

  establecerNuevas() {
    this.blnFechasNuevas = true;
  }

  guardarSubmit() {
    const datosGuardar: IDiferimientoApertura = this.formDiferendo
      ?.value as IDiferimientoApertura;

    datosGuardar.id_detalle_convocatoria =
      this.datosFechasPrevias.id_detalle_convocatoria;
    datosGuardar.url_archivo_aviso_diferendo = this.archivoAvisoDiferendo;
    datosGuardar.procedimiento =
      this._procedimientoElegido.numero_procedimiento;
    this.loaderGuardar = true;
    this._diferimientoApertura.guardarDiferendoActo(datosGuardar).subscribe({
      next: (data) => {
        Swal.fire(data.mensaje, '', 'success');
      },
      error: (err) => {
        Swal.fire(err.error.mensaje, '', 'error');
        this.loaderGuardar = false;
      },
      complete: () => {
        this.cancelarDiferendoProcedimiento();
        this.formDiferendo?.reset();
        this.loaderGuardar = false;
      },
    });
  }

  cancelarDiferendoProcedimiento() {
    this._cancelarDiferendoProcedimiento.emit();
  }

  obtenerAvisoDiferendoBase64(event: any) {
    this.archivoAvisoDiferendo = null;
    let files = event.target.files;
    let archivo = files[0];

    if (files && archivo) {
      getBase64(archivo)
        .then((data64) => {
          this.archivoAvisoDiferendo = {
            base64: String(data64),
            nombreArchivo: archivo.name,
            procedimiento: this._procedimientoElegido?.numero_procedimiento,
            tipoArchivo: 10,
            encriptar: false,
          };
          this.archivoAvisoDiferendo.base64 =
            this.archivoAvisoDiferendo.base64?.replace(/^data:.+;base64,/, '');
        })
        .catch((err) => {
          console.error(err);
        });
    } else {
      alert('No se seleccionó ningún archivo.');
    }
  }

  cambiarFechaJuntaAclaraciones() {
    this.fechaJuntaAclaracionesElegido = new Date(
      this.formDiferendo.value.fecha_junta_aclaraciones_nueva
    );

    const numero_procedimiento =
      this._procedimientoElegido.numero_procedimiento.slice(0, 3);
    if (
      this.procedimientosAdquisicionesServicios.includes(
        numero_procedimiento.toUpperCase()
      )
    ) {
      const fechaMinimaApertura = new Date(this.fechaJuntaAclaracionesElegido);
      fechaMinimaApertura.setDate(fechaMinimaApertura.getDate() + 1); // Ajusta la fecha mínima a un día después

      this.minPickerFechaAperturaPropuestas = {
        year: fechaMinimaApertura.getFullYear(),
        month: fechaMinimaApertura.getMonth() + 1,
        day: fechaMinimaApertura.getDate(),
      };

      // Calcula la fecha máxima para la fecha de apertura (7 días después de la fecha de junta de aclaraciones)
      const fechaMaximaApertura = new Date(this.fechaJuntaAclaracionesElegido);
      fechaMaximaApertura.setDate(fechaMaximaApertura.getDate() + 7);

      // Actualiza la variable maxPickerFechaApertura para restringir la fecha de apertura
      this.maxPickerFechaApertura = {
        year: fechaMaximaApertura.getFullYear(),
        month: fechaMaximaApertura.getMonth() + 1,
        day: fechaMaximaApertura.getDate(),
      };
    } else {
      this.maxPickerFechaApertura = null; // O establece la fecha máxima a null para no aplicar restricción
    }
  }

  cambiarFechaInscripcion() {
    const numero_procedimiento =
      this._procedimientoElegido.numero_procedimiento.slice(0, 3);
    if (
      this.procedimientosObra.includes(
        numero_procedimiento.toUpperCase()
      )
    ) {
      this.fechaInscripcionElegido = new Date(
        this.formDiferendo.value.fecha_limite_inscripcion_nueva
      );
      this.fechaInscripcionElegido.setDate(
        this.fechaInscripcionElegido.getDate() + 2
      );

      this.minPickerFechaAperturaPropuestas = {
        year: new Date(this.fechaInscripcionElegido).getFullYear(),
        month: new Date(this.fechaInscripcionElegido).getMonth() + 1,
        day: new Date(this.fechaInscripcionElegido).getDate(),
      };
    }
  }

  cambiarFechaApertura() {
    this.fechaAperturaPropuestasElegido = new Date(
      this.formDiferendo.value.fecha_apertura_nueva
    );
    this.fechaAperturaPropuestasElegido.setDate(
      this.fechaAperturaPropuestasElegido.getDate() + 2
    );

    this.minPickerFechaFallo = {
      year: new Date(this.fechaAperturaPropuestasElegido).getFullYear(),
      month: new Date(this.fechaAperturaPropuestasElegido).getMonth() + 1,
      day: new Date(this.fechaAperturaPropuestasElegido).getDate(),
    };
  }
}
