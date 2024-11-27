import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {IProcedimientoAdministrativo} from 'src/app/interfaces/convocantes/IProcedimientoAdministrativo';
import {getBase64} from "../../../../enums/getBase64-util";
import {IDatoPartidaPresupuestal} from "../../../../interfaces/convocantes/IDatoPartidaPresupuestal";
import {PreguntasProcedimientosService} from "../../../../services/preguntasProcedimientos.service";
import Swal from "sweetalert2";
import {IParticipanteInvitado} from "../../../../interfaces/convocantes/IBusquedaParticipantes";
import {ConvocantesService} from "../../../../services/convocantes.service";
import {IFilesUpload} from "../../../../interfaces/comun/IFilesUpload";
import {IDatoPreguntas} from "../../../../interfaces/convocantes/IDatoPreguntas";
import {CriptoService} from "../../../../admin/services/Cripto.service";
import {AppSettingsService} from "../../../../app-settings.service";
import {IDatosJuntaAclaraciones} from "../../../../interfaces/convocantes/IDatosJuntaAclaraciones";
import * as moment from "moment";

@Component({
    selector: 'app-preguntas-procedimiento',
    templateUrl: './preguntas-procedimiento.component.html',
    styleUrls: ['./preguntas-procedimiento.component.css']
})
export class PreguntasProcedimientoComponent {

    @Input() public _procedimientoElegido: IProcedimientoAdministrativo | null = null;
    @Output() public _cancelar = new EventEmitter();

    @ViewChild('subirArchivoInput')
    inputRef: ElementRef | undefined;

    @ViewChild('modalCancelar') modalCancelar: ElementRef | undefined;
    modalCancelarRef: any;

    @ViewChild('modalValidarRFC') modalValidarRFC: ElementRef | undefined;
    modalValidarRFCRef: any;

    loaderObtenerUltimaJunta: boolean = false;
    loaderCargaPreguntas:boolean = false;
    loaderDescargarPregunta:boolean = false;
    loaderPreguntas:boolean = false;
    loaderGuardar:boolean = false;

    lstPreguntas: Array<IDatoPreguntas> | null = null;
    lstPreguntasEliminar: Array<number> = [];
    lstArchivoCarga: Array<IFilesUpload> = [];
    lstParticipantes: Array<IParticipanteInvitado> | null = null;

    id_procedimiento_administrativo: undefined | null | number = null;
    id_proveedor: undefined | null | number = null;
    rfcProveedor: undefined | null | number = null;
    editar:boolean = true;

    datosUlimtaJuntaAclaraciones:IDatosJuntaAclaraciones | null = null;
    permitirCargarPreguntasValFechas: boolean = false;

    constructor(private _cripto: CriptoService,
                private _modalService: NgbModal,
                private _preguntasProcedimientosService: PreguntasProcedimientosService,
                private _convocantesService: ConvocantesService,
                private _appSettings: AppSettingsService) {
    }

    async ngOnInit() {
        this.id_proveedor = Number(localStorage.getItem('id_p'))
        this.rfcProveedor = this._cripto.decrypt(localStorage.getItem('rp_'));
        this.id_procedimiento_administrativo = this._procedimientoElegido?.id_procedimiento_administrativo;

        await this.obtenerUltimaJunta();

        if (this.id_proveedor == undefined || isNaN(this.id_proveedor)) {
            this.editar=false;
            await this.obtenerParticipantes();
        }
        await this.obtenerPreguntas();

    }

    async obtenerUltimaJunta() {
        if (this.id_procedimiento_administrativo != undefined) {
            this.loaderObtenerUltimaJunta = true;
            await this._preguntasProcedimientosService.obtenerUltimaJunta(this.id_procedimiento_administrativo).subscribe({
                next: (data) => {
                    this.datosUlimtaJuntaAclaraciones = data.datos as IDatosJuntaAclaraciones;

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
        this.permitirCargarPreguntasValFechas = false;
        const fechas:{
            fechaActual: any,
            fechaJunta: any,
            fechaJuntaMenos24Horas: any,
            fechaActaJunta: any,
            fechaActaJuntaMas2Horas: any,
        } = {
            fechaActual: moment(this.datosUlimtaJuntaAclaraciones?.horaServidor),
            fechaJunta: moment(this.datosUlimtaJuntaAclaraciones?.fecha_junta_aclaraciones),
            fechaJuntaMenos24Horas: moment(this.datosUlimtaJuntaAclaraciones?.fecha_junta_aclaraciones).add(-24, 'hours'),
            fechaActaJunta: null,
            fechaActaJuntaMas2Horas: null,
        }

        const fechasMenos24Hrs = fechas.fechaActual <= fechas.fechaJuntaMenos24Horas;

        let fechaDespues2Hrs = false;
        if (this.datosUlimtaJuntaAclaraciones?.fecha_carga_acta != null) {
            fechas.fechaActaJunta = moment(this.datosUlimtaJuntaAclaraciones?.fecha_carga_acta);
            fechas.fechaActaJuntaMas2Horas = moment(this.datosUlimtaJuntaAclaraciones?.fecha_carga_acta).add(2, 'hours');
            fechaDespues2Hrs = fechas.fechaActual >= fechas.fechaJunta && fechas.fechaActual <= fechas.fechaActaJuntaMas2Horas;
        }

        // console.info("Fechas", {
        //     fechaActual: fechas.fechaActual?.format("DD/MM/yyyy hh:mm a"),
        //     fechaJunta: fechas.fechaJunta?.format("DD/MM/yyyy hh:mm a"),
        //     fechaJuntaMenos24Horas: fechas.fechaJuntaMenos24Horas?.format("DD/MM/yyyy hh:mm a"),
        //     fechaActaJunta: fechas.fechaActaJunta?.format("DD/MM/yyyy hh:mm a"),
        //     fechaActaJuntaMas2Horas: fechas.fechaActaJuntaMas2Horas?.format("DD/MM/yyyy hh:mm a"),
        //     fechasMenos24Hrs: fechasMenos24Hrs,
        //     fechaDespues2Hrs: fechaDespues2Hrs
        // });

        if (fechasMenos24Hrs || fechaDespues2Hrs && this._procedimientoElegido?.id_estatus_procedimiento == 2 || this._procedimientoElegido?.id_estatus_procedimiento == 3 ) {
            this.permitirCargarPreguntasValFechas = true;
        }

    }

    async obtenerParticipantes() {
        this.loaderPreguntas = true;
        await this._convocantesService.buscarParticipanteInvitado({id_procedimiento_administrativo: this.id_procedimiento_administrativo} as IDatoPartidaPresupuestal).subscribe({
            next: (data) => {
                this.lstParticipantes = data.datos;

                if (this.lstParticipantes != undefined && this.lstParticipantes?.length > 0) {
                    this.lstParticipantes[0].seleccionadoLista = true;
                    this.cambiarProveedor(this.lstParticipantes[0]);
                }
            },
            error: (err) => {
                console.info(err)
                Swal.fire(err.error.mensaje, "", 'error');
                this.loaderPreguntas = false;
            },
            complete: () => {
                this.loaderPreguntas = false;
            }
        });
    }

    async cambiarProveedor(participante: IParticipanteInvitado) {
        this.id_proveedor = participante.id_proveedor;
        await this.obtenerPreguntas();
    }

    async obtenerPreguntas() {
        if (this.id_proveedor != undefined && !isNaN(this.id_proveedor) && this.id_procedimiento_administrativo != undefined) {
            this.loaderPreguntas = true;
            await this._preguntasProcedimientosService.obtenerPreguntasProveedor(this.id_proveedor, this.id_procedimiento_administrativo).subscribe({
                next: (data) => {
                    this.lstPreguntas = data.datos as Array<IDatoPreguntas>;
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

    descargar(pregunta: IDatoPreguntas) {

        if (pregunta.id_pregunta_participante==null) {
            const source = `${pregunta.archivoCargaTmp?.archivoBase64}`;
            const link = document.createElement("a");
            link.href = this._appSettings.detectMimeType(source)+source;
            link.download = `${pregunta.archivoCargaTmp?.nombreArchivo}`
            link.click();
            return;
        }

        if (this.id_proveedor != undefined && !isNaN(this.id_proveedor) && this.id_procedimiento_administrativo != undefined) {
            this.loaderDescargarPregunta = true;
            this._preguntasProcedimientosService.obtenerArchivoPregunta(this.id_proveedor,
                this.id_procedimiento_administrativo, pregunta.id_pregunta_participante).subscribe({
                next: (data) => {
                    let base64String = data.datos.archivo;
                    const source = this._appSettings.detectMimeType(base64String)+base64String;
                    const link = document.createElement("a");
                    link.href = source;
                    link.download = `${data.datos.nombreArchivo}`
                    link.click();
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

    cargarPreguntas(event: any) {
        this.loaderCargaPreguntas = true;

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

                    this.lstArchivoCarga?.push(archivoCargaTmp);
                    this.lstPreguntas?.push({
                        id_participante_procedimiento: null,
                        url_archivo: archivoCargaTmp.nombreArchivo,
                        fecha_descarga_conv: null,
                        fecha_ultima_mod: new Date(),
                        archivoCargaTmp: archivoCargaTmp,
                    } as IDatoPreguntas)
                    this.loaderCargaPreguntas = false;

                })
                .catch((err) => {
                    console.error(err);
                    this.loaderCargaPreguntas = false;
                });
        } else {
            Swal.fire('No se seleccionó ningún archivo.', '', 'error');
            this.loaderCargaPreguntas = false;
        }
    }

    eliminar(pregunta: IDatoPreguntas) {

        if (pregunta.archivoCargaTmp != null) {
            const indiceArchivosCarga: number | undefined = this.lstArchivoCarga?.indexOf(pregunta.archivoCargaTmp);
            if (indiceArchivosCarga != undefined && indiceArchivosCarga >= 0) {
                this.lstArchivoCarga?.splice(indiceArchivosCarga, 1);
            }
        }

        if (pregunta.id_participante_procedimiento != undefined) {
            this.lstPreguntasEliminar.push(Number(pregunta.id_pregunta_participante));
        }

        const indice:number|undefined = this.lstPreguntas?.indexOf(pregunta);
        if (indice != undefined && indice >= 0 ) {
            this.lstPreguntas?.splice(indice, 1);
        }
    }

    async validarGuardar() {
        if ((this.lstArchivoCarga == undefined || this.lstArchivoCarga?.length==0)
          && (this.lstPreguntasEliminar == undefined || this.lstPreguntasEliminar?.length==0)) {
            Swal.fire('No tienes ninguna pregunta para guardar.', '', 'error');
            return;
        }
        this.abrirCerrarModalRFC(true);
    }

    async guardarPreguntas(event:boolean) {

        if (!event){
            return;
        }

        this.abrirCerrarModalRFC(false);

        if (this.id_proveedor != undefined && !isNaN(this.id_proveedor) && this.id_procedimiento_administrativo != undefined) {
            this.loaderGuardar = true;
            await this._preguntasProcedimientosService.guardarPreguntas(
                this.id_proveedor,
                this.id_procedimiento_administrativo,
                this.lstArchivoCarga,
                this.lstPreguntasEliminar)
                .subscribe({
                next: () => {
                    this.lstArchivoCarga = [];
                    this.lstPreguntasEliminar = [];
                    this.obtenerPreguntas();
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
        if (this.lstArchivoCarga != undefined && this.lstArchivoCarga?.length > 0) {
            this.abrirCerrarModal(true);
        } else {
            this.cancelar();
        }
    }

    cancelar(){
        this._cancelar.emit();
        this.abrirCerrarModal();
    }

    abrirCerrarModal(abrir: boolean= false) {
        if (abrir) {
            this.modalCancelarRef = this._modalService.open(this.modalCancelar);
        } else if (this.modalCancelarRef != undefined) {
            this.modalCancelarRef?.close();
        }
    }

    abrirCerrarModalRFC(abrir: boolean= false) {
        if (abrir) {
            this.modalValidarRFCRef = this._modalService.open(this.modalValidarRFC, { size: 'lg'});
        } else if (this.modalValidarRFCRef != undefined) {
            this.modalValidarRFCRef?.close();
        }
    }

    protected readonly JSON = JSON;
}

