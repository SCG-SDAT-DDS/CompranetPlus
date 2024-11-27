import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {IProcedimientoAdministrativo} from 'src/app/interfaces/convocantes/IProcedimientoAdministrativo';
import {IAnexoProcedimiento} from "../../../interfaces/convocantes/IAnexoProcedimiento";
import {FormControl, FormGroup} from "@angular/forms";
import {base64ToArrayBuffer, getBase64} from "../../../enums/getBase64-util";
import {IDatoPartidaPresupuestal} from "../../../interfaces/convocantes/IDatoPartidaPresupuestal";
import {read, utils} from "xlsx";
import {PartidasPresupuestalesService} from "../../../services/partidasPresupuestales.service";
import Swal from "sweetalert2";
import { IParticipanteInvitado } from "../../../interfaces/convocantes/IBusquedaParticipantes";
import {ConvocantesService} from "../../../services/convocantes.service";
import * as moment from 'moment-timezone';


@Component({
    selector: 'app-partidas-presupuestales',
    templateUrl: './partidas-presupuestales.component.html',
    styleUrls: ['./partidas-presupuestales.component.css']
})
export class PartidasPresupuestalesComponent {

    @Input() public _procedimientoElegido: IProcedimientoAdministrativo | null = null;
    @Input() public _ocultarEncabezados: boolean = false;
    @Input() public _busquedaPrimeraVez: boolean = false;
    @Output() public _cancelarPartidasPresupuestales = new EventEmitter();
    @Output() public _continuarCargaPropuesta = new EventEmitter();

    @ViewChild('modalCancelarCargaPartidas') modalCancelarCargaPartidas: ElementRef | undefined;
    modalCancelarCargaPartidasRef: any;

    @ViewChild('subirArchivoInput')
    inputRef: ElementRef | undefined;

    loaderCargaPartidasProcedimiento = false;
    loaderCargaPartidasProveedor = false;
    loaderDescargarArchivoOriginal = false;
    loaderGuardar = false;
    loaderParticipantes = false;

    editar = false;
    datosValidos = false;

    lstDatosPartidasProcedimiento: Array<IDatoPartidaPresupuestal> | null = null;
    lstDatosPartidasProveedor: Array<IDatoPartidaPresupuestal> | null = null;
    lstParticipantes: Array<IParticipanteInvitado> | null = null;

    formAnexos: FormGroup;

    archivoCarga: { nombreArchivo: any; base64: string; encriptar: boolean; tipoArchivo: number } | null = null;

    id_procedimiento_administrativo: undefined | null | number = null;
    id_proveedor: undefined | null | number = null;
    usuarioLoginEsProveedor = true;

    constructor(private modalService: NgbModal,
                private _partidasPresupuestalesService: PartidasPresupuestalesService,
                private _convocantesService: ConvocantesService,) {
        this.formAnexos = this.iniciarFormularioAnexos();
    }

    async ngOnInit() {
        this.id_proveedor = Number(localStorage.getItem('id_p'))
        this.id_procedimiento_administrativo = this._procedimientoElegido?.id_procedimiento_administrativo;

        if (this.id_proveedor == undefined || isNaN(this.id_proveedor)) {
            this.usuarioLoginEsProveedor = false;
            await this.obtenerParticipantes();
        }

        await this.obtenerPartidasProcedimiento();
        await this.obtenerPartidasProveedor();


        this.procesarColor();
    }


    iniciarFormularioAnexos(data: IAnexoProcedimiento | null = null) {
        const formTmp: FormGroup | null = new FormGroup({
            archivo_anexo: new FormControl(null, []),
        });
        return formTmp;
    }


    async obtenerPartidasProcedimiento() {
        if (this.id_proveedor != undefined && this.id_procedimiento_administrativo != undefined) {
            this.loaderCargaPartidasProcedimiento = true;
            await this._partidasPresupuestalesService.obtenerPartidas(this.id_procedimiento_administrativo).subscribe({
                next: (data) => {
                    this.lstDatosPartidasProcedimiento = data.datos;

                    if (this._procedimientoElegido != null &&
                        this._procedimientoElegido.id_estatus_procedimiento != null &&
                        this._procedimientoElegido.id_estatus_procedimiento <= 3
                        && this.lstDatosPartidasProcedimiento != null
                        && this.lstDatosPartidasProcedimiento.length > 0
                        && this.id_proveedor != undefined && !isNaN(this.id_proveedor)
                        && this.usuarioLoginEsProveedor && this.habilitarBoton()) {
                        this.editar = true;
                    }
                },
                error: (err) => {
                    Swal.fire(err.error.mensaje, '', 'error');
                    this.loaderCargaPartidasProcedimiento = false;
                },
                complete: () => {
                    this.loaderCargaPartidasProcedimiento = false;
                }
            })
        }
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
                console.info(err)
                Swal.fire(err.error.mensaje, "", 'error');
                this.loaderParticipantes = false;
            },
            complete: () => {
                this.loaderParticipantes = false;
            }
        });

    }

    async cambiarProveedor(participante: IParticipanteInvitado) {
        this.id_proveedor = participante.id_proveedor;
        this.lstParticipantes?.forEach(it=>{
           it.seleccionadoLista = it.id_proveedor==this.id_proveedor;
        });
        await this.obtenerPartidasProveedor();
    }

    async obtenerPartidasProveedor() {
        if (this.id_proveedor != undefined && !isNaN(this.id_proveedor) && this.id_procedimiento_administrativo != undefined) {
            this.loaderCargaPartidasProveedor = true;
            await this._partidasPresupuestalesService.obtenerPartidasProveedor(this.id_proveedor, this.id_procedimiento_administrativo).subscribe({
                next: (data) => {
                    this.lstDatosPartidasProveedor = data.datos;

                    if (this._ocultarEncabezados && this._busquedaPrimeraVez && this.lstDatosPartidasProveedor != null && this.lstDatosPartidasProveedor?.length>0) {
                        this._continuarCargaPropuesta.emit();
                    }
                },
                error: (err) => {
                    Swal.fire(err.error.mensaje, '', 'error');
                    this.loaderCargaPartidasProveedor = false;
                },
                complete: () => {
                    this.loaderCargaPartidasProveedor = false;
                    this.procesarColor();
                }
            })
        }
    }

    procesarColor() {
        this.datosValidos = false;
        if (this.lstDatosPartidasProcedimiento !== undefined && this.lstDatosPartidasProcedimiento != null
            && this.lstDatosPartidasProveedor !== undefined && this.lstDatosPartidasProveedor != null
        ) {

            this.lstDatosPartidasProveedor.forEach(prov => {
                const valEncontrado = this.lstDatosPartidasProcedimiento?.find(it =>
                    it.codigo_partida == prov.codigo_partida
                    && it.nombre_partida == prov.nombre_partida);

                if (valEncontrado != undefined) {
                    prov.style = 'background-color: green !important;color:white;';
                    this.datosValidos = true;
                } else {
                    prov.style = 'background-color: red !important;color:white;';
                }
            });

        }
    }

    descargarOriginal() {
        if (this.id_procedimiento_administrativo != undefined) {
            this.loaderDescargarArchivoOriginal = true;
            this._partidasPresupuestalesService.obtenerArchivoPartidaOriginal(this.id_procedimiento_administrativo).subscribe({
                next: (data) => {
                    console.info(data.datos);
                    let base64String = data.datos.archivo.datos;
                    const source = `data:application/vnd.ms-excel;base64,${base64String}`;
                    console.info(source);
                    const link = document.createElement("a");
                    link.href = source;
                    link.download = `${data.datos.nombreArchivo}`
                    link.click();
                },
                error: (err) => {
                    Swal.fire(err.error.mensaje, '', 'error');
                    this.loaderDescargarArchivoOriginal = false;
                },
                complete: () => {
                    this.loaderDescargarArchivoOriginal = false;
                }
            })
        }
    }

    openSelect() {
        if (this.inputRef !== undefined)
            this.inputRef.nativeElement.click();
    }

    cargarAnexo(event: any) {
        this.loaderCargaPartidasProveedor = true;
        this.archivoCarga = null;
        this.datosValidos = false;

        let files = event.target.files;
        let archivo = files[0];

        if (files && archivo) {
            getBase64(archivo)
                .then((data64) => {
                    const archivoCargaTmp = {
                        base64: String(data64),
                        nombreArchivo: archivo.name,
                        tipoArchivo: 18,
                        encriptar: true
                    }
                    archivoCargaTmp.base64 = archivoCargaTmp.base64?.replace(
                        /^data:.+;base64,/,
                        ''
                    );

                    const workbook = read(base64ToArrayBuffer(archivoCargaTmp.base64), {raw: false});
                    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                    let json = utils.sheet_to_json(worksheet, {header: 1});

                    if (json != null) {
                        json.shift();

                        if (json?.length == 0) {
                            Swal.fire("El archivo de partidas no contienen datos ", "", 'error');
                            return;
                        }

                        this.lstDatosPartidasProveedor = [];
                        json?.forEach(it => {
                            const val = it as any;
                            const objTmp = {
                                id_procedimiento_administrativo: this._procedimientoElegido?.id_procedimiento_administrativo,
                                numero_partida: val[0],
                                nombre_partida: val[1],
                                codigo_partida: val[2],
                                descripcion_partida: val[3],
                                cantidad_partida: val[4],
                                precio_unitario: val[5],
                                importe: val[6],
                                id_proveedor: this.id_proveedor,
                            } as IDatoPartidaPresupuestal;

                            if (objTmp.numero_partida != null && objTmp.nombre_partida != null
                                && objTmp.codigo_partida != null && objTmp.descripcion_partida != null && objTmp.cantidad_partida != null
                                && objTmp.precio_unitario != null && objTmp.importe != null) {
                                this.lstDatosPartidasProveedor?.push(objTmp);
                            }
                        });
                        this.procesarColor();
                        this.loaderCargaPartidasProveedor = false;
                        this.archivoCarga = archivoCargaTmp;

                    } else {
                        Swal.fire("El archivo de partidas no contienen datos ", "", 'error');
                        this.loaderCargaPartidasProveedor = false;
                        return;
                    }

                })
                .catch((err) => {
                    console.error(err);
                    this.loaderCargaPartidasProveedor = false;
                });
        } else {
            alert('No se seleccionó ningún archivo.');
            this.loaderCargaPartidasProveedor = false;
        }
    }

    guardarCarga() {

        const continueProcess = this.habilitarBoton()
        if(!continueProcess){
        Swal.fire('No se puede subir la propuesta puesto que ya se ha llegado a la fecha y hora limite','','error');
        return;
        }

        if (this.lstDatosPartidasProveedor == null || this.archivoCarga == null || !this.datosValidos) {
            Swal.fire("Debes de cargar un archivo de partidas con al menos una coincidencia válida", '', 'error');
            return;
        }

        if (this.id_proveedor == undefined || isNaN(this.id_proveedor)) {
            Swal.fire("Debes de ser un proveedor para subir las partidas", '', 'error');
            return;
        }

        if (this.id_procedimiento_administrativo == undefined) {
            Swal.fire("Debes tener un procedimiento administrativo", '', 'error');
            return;
        }

        this.loaderGuardar = true;
        this._partidasPresupuestalesService.almacenarPartidasProveedor(
            this.id_proveedor,
            this.id_procedimiento_administrativo,
            this.lstDatosPartidasProveedor,
            this.archivoCarga
        ).subscribe({
            next: (data) => {
                Swal.fire(data.mensaje, "", 'success');

                if (this._ocultarEncabezados) {
                    this.abrirCerrarModalCancelarPartidas(false);
                    this._continuarCargaPropuesta.emit();
                } else {
                    this.cancelarCargarPartidas();
                }
            },
            error: (err) => {
                Swal.fire(err.error.mensaje, '', 'error');
                this.loaderGuardar = false;
            },
            complete: () => {
                this.loaderDescargarArchivoOriginal = false;
                this.loaderGuardar = false;
            }
        });

    }

    cancelarCargarPartidas() {
        this._cancelarPartidasPresupuestales.emit();
        this.abrirCerrarModalCancelarPartidas();
    }

    abrirCerrarModalCancelarPartidas(abrir: boolean = false) {
        if (abrir) {
            this.modalCancelarCargaPartidasRef = this.modalService.open(this.modalCancelarCargaPartidas);
        } else if (this.modalCancelarCargaPartidasRef != undefined) {
            this.modalCancelarCargaPartidasRef?.close();
        }
    }

    habilitarBoton(){
        const fechaSonora = moment.tz('America/Hermosillo').format('YYYY-MM-DD HH:mm:ss');
        const fechaActual = moment(fechaSonora);
        const fechaApertura = this._procedimientoElegido?.fecha_apertura_nueva ? moment(this._procedimientoElegido?.fecha_apertura_nueva) : moment(this._procedimientoElegido?.fecha_apertura);
    
    
        return fechaActual < fechaApertura;
    }

}

