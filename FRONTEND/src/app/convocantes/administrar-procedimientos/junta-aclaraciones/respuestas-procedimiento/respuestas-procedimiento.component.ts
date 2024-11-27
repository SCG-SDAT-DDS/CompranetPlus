import {Component, ElementRef, EventEmitter, Injectable, Input, Output, ViewChild} from '@angular/core';
import {NgbCalendar, NgbDate, NgbDateAdapter, NgbDateParserFormatter, NgbDateStruct, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {IProcedimientoAdministrativo} from 'src/app/interfaces/convocantes/IProcedimientoAdministrativo';
import {getBase64} from "../../../../enums/getBase64-util";
import {IDatoPartidaPresupuestal} from "../../../../interfaces/convocantes/IDatoPartidaPresupuestal";
import Swal from "sweetalert2";
import {PreguntasProcedimientosService} from "../../../../services/preguntasProcedimientos.service";
import {IParticipanteInvitado} from "../../../../interfaces/convocantes/IBusquedaParticipantes";
import {ConvocantesService} from "../../../../services/convocantes.service";
import {IFilesUpload} from "../../../../interfaces/comun/IFilesUpload";
import {IDatoPreguntas} from "../../../../interfaces/convocantes/IDatoPreguntas";
import {RespuestasProcedimientosService} from "../../../../services/respuestasProcedimientos.service";
import {AppSettingsService} from "../../../../app-settings.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {IDatosJuntaAclaraciones} from "../../../../interfaces/convocantes/IDatosJuntaAclaraciones";
import * as moment from "moment";

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
		return date ? date.year + this.DELIMITER + date.month + this.DELIMITER + date.day : null;
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
		return date ? date.day + this.DELIMITER + date.month + this.DELIMITER + date.year : '';
	}
}

@Component({
    selector: 'app-respuestas-procedimiento',
    templateUrl: './respuestas-procedimiento.component.html',
    styleUrls: ['./respuestas-procedimiento.component.css'],
    providers: [
      { provide: NgbDateAdapter, useClass: CustomAdapter },
      { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter}
    ]
})
export class RespuestasProcedimientoComponent {

    @Input() public _procedimientoElegido: IProcedimientoAdministrativo | null = null;
    @Output() public _cancelar = new EventEmitter();

    @ViewChild('subirArchivoInput')
    inputRef: ElementRef | undefined;

    @ViewChild('subirArchivoProrrogaInput')
    inputProrrogaRef: ElementRef | undefined;


    @ViewChild('modalCancelar') modalCancelar: ElementRef | undefined;
    modalCancelarRef: any;

    @ViewChild('modalProrroga') modalProrroga: ElementRef | undefined;
    modalProrrogaRef: any;

    loaderCargaRespuesta: boolean = false;
    loaderObtenerUltimaJunta: boolean = false;
    loaderParticipantes: boolean = false;
    loaderDescargarPregunta: boolean = false;
    loaderPreguntas: boolean = false;
    loaderGuardar: boolean = false;

    lstPreguntas: Array<IDatoPreguntas> | null = null;
    achivoCargaActaJunta: IFilesUpload | null = null;
    achivoCargaProrroga: IFilesUpload | null = null;
    lstParticipantes: Array<IParticipanteInvitado> | null = null;

    id_procedimiento_administrativo: undefined | null | number = null;
    id_proveedor: undefined | null | number = null;
    editar: boolean = true;

    formRegistroProrroga: FormGroup | null = null;

    json = {
        disable: [6, 7],
        disabledDates: [
            { year: 1900, month: 10, day: 19 }
        ]
    };
    dateIsDisabled:any;

    datosUlimtaJuntaAclaraciones:IDatosJuntaAclaraciones | null = null;
    permitirResponder: boolean = true;

    constructor(private _modalService: NgbModal,
                private _preguntasProcedimientosService: PreguntasProcedimientosService,
                private _respuestasProcedimientosService: RespuestasProcedimientosService,
                private _convocantesService: ConvocantesService,
                private _appSettings: AppSettingsService,
                private _calendar: NgbCalendar) {

    }

    async ngOnInit() {
        this.id_procedimiento_administrativo = this._procedimientoElegido?.id_procedimiento_administrativo;
        await this.obtenerUltimaJunta();
        await this.obtenerParticipantes();
        await this.obtenerPreguntas();

        const fechaActual = moment(this.datosUlimtaJuntaAclaraciones?.horaServidor);
        const fechaActualNgb = new NgbDate(fechaActual.year(), fechaActual.month()+1, fechaActual.date());

        const fechaApertura = moment(this._procedimientoElegido?.fecha_apertura);
        const fechaAperturaNgb = new NgbDate(fechaApertura.year(), fechaApertura.month()+1, fechaApertura.date());
        this.dateIsDisabled = (
            date: NgbDateStruct

        ) => {
            const fechaCalendario = new NgbDate(date.year, date.month, date.day);
            if (fechaCalendario.before(fechaActualNgb)) {
                return true;
            }
            if (fechaCalendario.equals(fechaAperturaNgb)
                || fechaCalendario.after(fechaAperturaNgb)) {
                return true;
            }

            return  this.json.disabledDates.find(x =>
                (new NgbDate(x.year, x.month, x.day).equals(date))
                || (this.json.disable.includes(this._calendar.getWeekday(fechaCalendario)) )
            )
                ? true
                : false;
        };

    }

    async actualizarPantalla() {
      await this.obtenerUltimaJunta();
      await this.obtenerPreguntas();
    }

    async obtenerUltimaJunta() {
        if (this.id_procedimiento_administrativo != undefined) {
            this.loaderObtenerUltimaJunta = true;
            await this._preguntasProcedimientosService.obtenerUltimaJunta(this.id_procedimiento_administrativo).subscribe({
                next: (data) => {
                    this.datosUlimtaJuntaAclaraciones = data.datos;

                    this.validarFechas();
                },
                error: (err) => {
                    Swal.fire(err.error.mensaje, "", 'error');
                    this.loaderObtenerUltimaJunta = false;
                },
                complete: () => {
                    this.loaderObtenerUltimaJunta = false;
                }
            });
        }
    }

    validarFechas() {
        this.permitirResponder = false;
        const fechas:{
            fechaActual: any,
            fechaJunta: any,
            fechaActaJunta: any,
            fechaActaJuntaDespues24Hrs: any,
        } = {
            fechaActual: moment(this.datosUlimtaJuntaAclaraciones?.horaServidor),
            fechaJunta: moment(this.datosUlimtaJuntaAclaraciones?.fecha_junta_aclaraciones),
            fechaActaJunta: null,
            fechaActaJuntaDespues24Hrs: null,
        }

        const enJunta = fechas.fechaActual >= fechas.fechaJunta;

        let fechaDespuesActa24Hrs = false;
        if (this.datosUlimtaJuntaAclaraciones?.fecha_carga_acta != null) {
            fechas.fechaActaJunta = moment(this.datosUlimtaJuntaAclaraciones?.fecha_carga_acta);
            fechas.fechaActaJuntaDespues24Hrs = moment(this.datosUlimtaJuntaAclaraciones?.fecha_carga_acta).add(24, 'hours');

            fechaDespuesActa24Hrs = fechas.fechaActual >= fechas.fechaActaJunta && fechas.fechaActual <= fechas.fechaActaJuntaDespues24Hrs;
        }

        console.info("Fechas", {
            fechaActual: fechas.fechaActual?.format("DD/MM/yyyy hh:mm a"),
            fechaJunta: fechas.fechaJunta?.format("DD/MM/yyyy hh:mm a"),
            fechaActaJunta: fechas.fechaActaJunta?.format("DD/MM/yyyy hh:mm a"),
            fechaActaJuntaDespues24Hrs: fechas.fechaActaJuntaDespues24Hrs?.format("DD/MM/yyyy hh:mm a"),
            enJunta,
            fechaDespuesActa24Hrs
        });

        this.permitirResponder = (fechas.fechaActaJunta==null && enJunta) || (enJunta && fechaDespuesActa24Hrs);
    }

    async obtenerParticipantes() {
        this.loaderParticipantes = true;
        await this._convocantesService.buscarParticipanteInvitado({id_procedimiento_administrativo: this.id_procedimiento_administrativo} as IDatoPartidaPresupuestal).subscribe({
            next: (data) => {
                this.lstParticipantes = data.datos;

                if (this.lstParticipantes != undefined && this.lstParticipantes?.length > 0) {
                    this.lstParticipantes[0].seleccionadoLista = true;
                    this.cambiarProveedor(this.lstParticipantes[0]);
                }
            },
            error: (err) => {
                Swal.fire(err.error.mensaje, "", 'error');
                this.loaderParticipantes = false;
            },
            complete: () => {
                this.loaderParticipantes = false;
            }
        });
    }

    async cambiarProveedor(participante: IParticipanteInvitado) {
        this.id_proveedor = participante?.id_proveedor;
        this.lstParticipantes?.forEach(it=>{
            if (it.id_proveedor == this.id_proveedor) {
                it.seleccionadoLista = true;
            } else {
                it.seleccionadoLista = false;
            }
        });
        if (this.lstPreguntas != null ) {
            this.lstPreguntas.forEach(it=> it.visibleFiltro =  it.id_proveedor == this.id_proveedor)
        }
    }

    async obtenerPreguntas() {
        if (this.id_procedimiento_administrativo != undefined) {
            this.loaderPreguntas = true;
            await this._preguntasProcedimientosService.obtenerPreguntasProcedimiento(this.id_procedimiento_administrativo).subscribe({
                next: (data) => {
                    this.lstPreguntas = data.datos as Array<IDatoPreguntas>;

                    if (this.lstParticipantes != null && this.id_proveedor == undefined) {
                        this.cambiarProveedor(this.lstParticipantes[0]);
                    } else {
                        this.lstPreguntas.forEach(it=> it.visibleFiltro =  it.id_proveedor == this.id_proveedor)
                    }
                },
                error: (err) => {
                    Swal.fire(err.error.mensaje, '', 'error');
                    this.loaderPreguntas = false;
                },
                complete: () => {
                    this.loaderPreguntas = false;
                }
            })
        }
    }

    async descargar(pregunta: IDatoPreguntas) {

        if (this.id_proveedor != undefined && !isNaN(this.id_proveedor)
            && this.id_procedimiento_administrativo != undefined
            && pregunta.id_pregunta_participante != undefined) {
            this.loaderDescargarPregunta = true;
            this._preguntasProcedimientosService.obtenerArchivoPregunta(this.id_proveedor,
                this.id_procedimiento_administrativo, pregunta.id_pregunta_participante, 1).subscribe({
                next: (data) => {
                    let base64String = data.datos.archivo;
                    const source = this._appSettings.detectMimeType(base64String) + base64String;
                    const link = document.createElement("a");
                    link.href = source;
                    link.download = `${data.datos.nombreArchivo}`
                    link.click();
                    this.obtenerPreguntas();

                },
                error: (err) => {
                    Swal.fire(err.error.mensaje, '', 'error');
                    this.loaderDescargarPregunta = false;
                },
                complete: () => {
                    this.loaderDescargarPregunta = false;
                }
            })
        }
    }

    openSelect() {
        if (this.inputRef !== undefined)
            this.inputRef.nativeElement.click();
    }

    cargarActaJunta(event: any) {
        this.loaderCargaRespuesta = true;

        let files = event.target.files;
        let archivo = files[0];

        if (files && archivo) {
            getBase64(archivo)
                .then((data64) => {
                    const archivoCargaTmp = {
                        archivoBase64: String(data64),
                        nombreArchivo: archivo.name,
                        tipoArchivo: 18,
                        encriptar: false
                    } as IFilesUpload
                    archivoCargaTmp.archivoBase64 = archivoCargaTmp.archivoBase64?.replace(
                        /^data:.+;base64,/,
                        ''
                    );

                    this.achivoCargaActaJunta = archivoCargaTmp;
                    this.loaderCargaRespuesta = false;

                })
                .catch((err) => {
                    console.error(err);
                    this.loaderCargaRespuesta = false;
                });
        } else {
            Swal.fire('No se seleccionó ningún archivo.', '', 'error');
            this.loaderCargaRespuesta = false;
        }
    }

    get esValidoAgregarActaJunta() {
        if (this.lstPreguntas == undefined) {
            return false;
        }

        return  this.lstPreguntas.filter(it =>
            it.fecha_descarga_conv == undefined || it.fecha_descarga_conv == null).length <= 0;
    }

    async guardarRespuesta() {

        if (this.achivoCargaActaJunta == undefined) {
            Swal.fire('No tienes ninguna respuesta para guardar.', '', 'error');
            return;
        }

        if (this.id_procedimiento_administrativo != undefined) {
            this.loaderGuardar = true;
            await this._respuestasProcedimientosService.guardarActaJunta(
                
                this.id_procedimiento_administrativo,
                this.achivoCargaActaJunta)
                .subscribe({
                    next: () => {
                        this.achivoCargaActaJunta = null;

                        this.actualizarPantalla();

                        Swal.fire('El acta de la junta se almacenó con éxito.', '', 'success');
                    },
                    error: (err) => {
                        Swal.fire(err.error.mensaje, '', 'error');
                        this.loaderGuardar = false;
                    },
                    complete: () => {
                        this.loaderGuardar = false;
                    }
                });
        }
    }

    preguntarCancelar() {
        if (this.achivoCargaActaJunta != undefined) {
            this.abrirCerrarModal(true);
        } else {
            this.cancelar();
        }
    }

    cancelar() {
        this._cancelar.emit();
        this.abrirCerrarModal();
    }

    abrirCerrarModal(abrir: boolean = false) {
        if (abrir) {
            this.modalCancelarRef = this._modalService.open(this.modalCancelar);
        } else if (this.modalCancelarRef != undefined) {
            this.modalCancelarRef?.close();
        }
    }

    solicitarProrroga() {
        this.achivoCargaProrroga = null;
        this.formRegistroProrroga = new FormGroup({
            fecha_junta_aclaraciones: new FormControl('', [
                Validators.required
            ]),
            hora_junta_aclaraciones: new FormControl('', [
                Validators.required
            ])
        });
        this.abrirCerrarModalProrroga(true);
    }

    openSelectProrroga() {
        if (this.inputProrrogaRef !== undefined)
            this.inputProrrogaRef.nativeElement.click();
    }

    cargarActaDiferimiento(event: any) {
        this.loaderCargaRespuesta = true;

        let files = event.target.files;
        let archivo = files[0];

        if (files && archivo) {
            getBase64(archivo)
                .then((data64) => {
                    const archivoCargaTmp = {
                        archivoBase64: String(data64),
                        nombreArchivo: archivo.name,
                        tipoArchivo: 16,
                        encriptar: false
                    } as IFilesUpload
                    archivoCargaTmp.archivoBase64 = archivoCargaTmp.archivoBase64?.replace(
                        /^data:.+;base64,/,
                        ''
                    );

                    this.achivoCargaProrroga = archivoCargaTmp;
                    this.loaderCargaRespuesta = false;

                })
                .catch((err) => {
                    console.error(err);
                    this.loaderCargaRespuesta = false;
                });
        } else {
            Swal.fire('No se seleccionó ningún archivo.', '', 'error');
            this.loaderCargaRespuesta = false;
        }
    }

    async guardarProrroga() {

        if (this.achivoCargaProrroga == undefined) {
            Swal.fire('No tienes ninguna prorroga para guardar.', '', 'error');
            return;
        }

        if (this.formRegistroProrroga == null) {
            Swal.fire('No tienes formulario de prorroga.', '', 'error');
            return;
        }

        const fechaJunta = this.formRegistroProrroga.get('fecha_junta_aclaraciones')?.value;
        const horaJunta = this.formRegistroProrroga.get('hora_junta_aclaraciones')?.value;

        const fechaCadena = `${fechaJunta} ${horaJunta}`;

        if (this.id_proveedor != undefined && !isNaN(this.id_proveedor) && this.id_procedimiento_administrativo != undefined) {
            this.loaderGuardar = true;
            await this._respuestasProcedimientosService.guardarProrrogaJunta(
                this.id_proveedor,
                this.id_procedimiento_administrativo,
                fechaCadena,
                this.achivoCargaProrroga)
                .subscribe({
                    next: () => {
                        this.achivoCargaProrroga = null;
                        this.cancelarProrroga();
                    },
                    error: (err) => {
                        Swal.fire(err.error.mensaje, '', 'error');
                        this.loaderGuardar = false;
                    },
                    complete: () => {
                        this.loaderGuardar = false;
                    }
                });
        }
    }

    cancelarProrroga() {
        this.abrirCerrarModalProrroga(false);
        this.actualizarPantalla();
    }

    abrirCerrarModalProrroga(abrir: boolean = false) {
        if (abrir) {
            this.modalProrrogaRef = this._modalService.open(this.modalProrroga);
        } else if (this.modalProrrogaRef != undefined) {
            this.modalProrrogaRef?.close();
        }
    }

    protected readonly JSON = JSON;
}

