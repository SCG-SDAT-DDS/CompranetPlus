import {Component, Input, Output, EventEmitter, OnInit, ViewChild, ElementRef, Injectable} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import { AuthService } from 'src/app/components/login/auth.service';
import { IFilesUpload } from 'src/app/interfaces/comun/IFilesUpload';
import { IProcedimientoAdministrativo } from 'src/app/interfaces/convocantes/IProcedimientoAdministrativo';
import { ItipoArchivo } from 'src/app/interfaces/convocantes/ITipoArchivo';
import { ITipoCaracter } from 'src/app/interfaces/convocantes/ITipoCaracter';
import { ItipoModalidad } from 'src/app/interfaces/convocantes/ITipoModalidad';
import { ITipoProcedimiento } from 'src/app/interfaces/convocantes/ITipoProcedimiento';
import { ConvocantesService } from 'src/app/services/convocantes.service';
import swal from 'sweetalert2';
import { getBase64, base64ToArrayBuffer } from '../../../enums/getBase64-util';
import { IAnexoProcedimiento } from 'src/app/interfaces/convocantes/IAnexoProcedimiento';
import { NgbCalendar, NgbDate, NgbDateAdapter, NgbDateParserFormatter, NgbDateStruct, NgbDatepickerConfig, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ICatalogoCostoParticipacion } from 'src/app/interfaces/catalogos/ICatalogoCostoParticipacion';
import { IDetalleProcedimiento } from 'src/app/interfaces/convocantes/IDetalleProcedimiento';
import { DatePipe } from '@angular/common'
import { ICatalogoUnidadCompradora } from 'src/app/interfaces/catalogos/ICatalogoUnidadCompradora';

import { read, utils } from "xlsx";
import {IDatoPartidaPresupuestal} from "../../../interfaces/convocantes/IDatoPartidaPresupuestal";
import { CatalogoDiasFestivosService } from 'src/app/services/catalogoDiasFestivos.service';
import { IBusquedaParticipante, IParticipanteInvitado } from 'src/app/interfaces/convocantes/IBusquedaParticipantes';



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
  selector: 'app-agregar-procedimiento',
  templateUrl: './agregar-procedimiento.component.html',
  styleUrls: ['./agregar-procedimiento.component.css'],
  providers: [
    { provide: NgbDateAdapter, useClass: CustomAdapter },
    { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter}
  ]


})
export class AgregarProcedimientoComponent implements OnInit{

  @Input() public _procedimientoElegido: IProcedimientoAdministrativo | null = null;
  @Input() public _tipo: any;
  @Input() public _idTipo: any;
  @Input() public _tituloSingular: any;
  @Output() public _cancelarAgregarProcedimiento = new EventEmitter();

  @Input() public _blnActivarEditar: any;
  @Input() public _messageTitle: any;
  @Input() public _messageSubTitle: any;
  @Input() public _messageButton: any;

  @Input() public _lstTablaUnidadesCompradoras: ICatalogoUnidadCompradora[] | null = null;


  formRegistro: FormGroup;

  formAnexos: FormGroup;

  agregarDatosGenerales: boolean = true;
  agregarDetalleProcedimiento: boolean = false;
  agregarAnexosConvocatoria: boolean = false;
  agregarAnexosProcedimiento: boolean = false;

  lstTablaTiposProcedimientos: ITipoProcedimiento[] | null = null;
  lstTablaCaracteres: ITipoCaracter[] | null = null;
  lstTablaModalidades: ItipoModalidad[] | null = null;
  lstTablaCostos: ICatalogoCostoParticipacion[] | null = null;
  lstTablaTiposArchivos: ItipoArchivo[] | null = null;

  lstAnexosProcedimientos: IAnexoProcedimiento[] = [];
  lstAnexosProcedimientosEliminar: IAnexoProcedimiento[] = [];

  archivoConvocatoria!: IFilesUpload | any;
  archivoBases!: IFilesUpload | any;
  archivoAutorizacion!: IFilesUpload | any;
  archivoPartidas!: IFilesUpload | any;
  archivoAnexo!: IFilesUpload | any;

  modalRefEliminarAnexo: NgbModalRef | undefined;
  modalRefCancelarAgregar:NgbModalRef|undefined;
  modalRefConfirmarGuardar:NgbModalRef|undefined;
  modalRefNumeroProcedimiento:NgbModalRef|undefined;
  modalRefConfirmarFijar:NgbModalRef|undefined;

  @ViewChild('modalMostrarPartidasPresupuestales') modalMostrarPartidasPresupuestales : ElementRef | undefined;
  modalMostrarPartidasPresupuestalesRef: any;
  consultarDatosPartida = false;
  lstDatosPartidaPresupuestal: IDatoPartidaPresupuestal[] | null | undefined = null;

  loaderGuardar: boolean = false;
  loaderBusqueda: boolean = false;

  datosProcedimientoAdministrativo: IDetalleProcedimiento | null = null;
  anexoElegido: IAnexoProcedimiento | undefined;

  idUnidadCompradoraElegida: number = 0;
  siguienteNumeroProcedimiento: string | null = "";
  archivoConvocatoriaAux = null;
  archivoBasesAux = null;
  archivoAutorizacionAux = null;
  archivoPartidasAux=null;

  participantes:  IParticipanteInvitado[]=[];
  busquedaParticipante: IBusquedaParticipante = {
    id_procedimiento_administrativo: null
  };


  listDiasFestivos: any;

  datePickerJson = {};
  json = {
    disable: [6, 7],
    disabledDates: [
      { year: 1900, month: 10, day: 19 }
    ]
  };
  isDisabled;

  minPickerFechaPublicacion = {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    day: new Date().getDate()
  };

  minPickerFechaInscripcion = {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    day: new Date().getDate()
  };

  minPickerFechaVisita = {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    day: new Date().getDate()
  };

  minPickerFechaJuntaAclaraciones = {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    day: new Date().getDate()
  };

  minPickerFechaAperturaPropuestas = {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    day: new Date().getDate()
  };

  minPickerFechaFallo = {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    day: new Date().getDate()
  };

  fechaPublicacionElegido: Date;
  fechaInscripcionElegido: Date;
  fechaJuntaAclaracionesElegido: Date;
  fechaAperturaPropuestasElegido: Date;

  fechaInscripcionCalculado: Date;
  fechaJuntaAclaracionesCalculado: Date;
  fechaAperturaPropuestasCalculado: Date;

  pickerFechaAperturaPropuestas = {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    day: new Date().getDate()
  };
  _blnAdjuntarPartidas: boolean = false;

  constructor(
    private fb: FormBuilder,
    private _convocantesService: ConvocantesService,
    private _authService: AuthService,
    private modalService: NgbModal,
    public datepipe: DatePipe,
    private config: NgbDatepickerConfig,
    private calendar: NgbCalendar,
    private _diasFestivosService: CatalogoDiasFestivosService
  ) {

    this.formRegistro = this.iniciarFormularioRegistro();
    this.formAnexos = this.iniciarFormularioAnexos();


    this.isDisabled = (
      date: NgbDateStruct

    ) => {
      return this.json.disabledDates.find(x =>
        (new NgbDate(x.year, x.month, x.day).equals(date))
        || (this.json.disable.includes(calendar.getWeekday(new NgbDate(date.year,date.month,date.day))) )
      )
        ? true
        : false;
    };

    this.fechaPublicacionElegido = new Date();
    this.fechaInscripcionElegido = new Date();
    this.fechaJuntaAclaracionesElegido = new Date();
    this.fechaAperturaPropuestasElegido = new Date();


    this.fechaInscripcionCalculado = new Date();
    this.fechaJuntaAclaracionesCalculado = new Date();
    this.fechaAperturaPropuestasCalculado = new Date();


  }


  ngOnInit() {

    if(this._idTipo == 2){
      this.formRegistro.get('costo_bases')?.clearValidators();
      this.formRegistro.get('costo_bases')?.setErrors(null);
      this.formRegistro.get('costo_bases')?.updateValueAndValidity();

      this.formRegistro.get('costo_inscripcion_aut')?.clearValidators();
      this.formRegistro.get('costo_inscripcion_aut')?.setErrors(null);
      this.formRegistro.get('costo_inscripcion_aut')?.updateValueAndValidity();
    }

    this.llenarCatalogos();

    if(this._blnActivarEditar){
      this.obtenerProcedimientoAdministrativo();
    }

    let unidadSeleccionada;
    if (this._lstTablaUnidadesCompradoras !== null) {
      for (let item of this._lstTablaUnidadesCompradoras) {
        this.idUnidadCompradoraElegida = (JSON.parse(JSON.stringify(item))).id_unidad_compradora;
        unidadSeleccionada = this._lstTablaUnidadesCompradoras?.find(uc => uc.id_unidad_compradora == this.idUnidadCompradoraElegida);
      }
    }
    if (unidadSeleccionada && (unidadSeleccionada.id_tipo_unidad_responsable === 3 || unidadSeleccionada.id_tipo_unidad_responsable === 4)) {
      this.formRegistro.get('costo_bases')?.clearValidators();
      this.formRegistro.get('costo_bases')?.setErrors(null);
      this.formRegistro.get('costo_bases')?.updateValueAndValidity();
      this.formRegistro.get('costo_inscripcion_aut')?.setValidators([Validators.required]);
      this.formRegistro.get('costo_inscripcion_aut')?.updateValueAndValidity();
     } else {
      this.formRegistro.get('costo_inscripcion_aut')?.clearValidators();
      this.formRegistro.get('costo_inscripcion_aut')?.setErrors(null);
      this.formRegistro.get('costo_inscripcion_aut')?.updateValueAndValidity();
      this.formRegistro.get('costo_bases')?.setValidators([Validators.required]);
      this.formRegistro.get('costo_bases')?.updateValueAndValidity();
     }

    this.formRegistro.patchValue({id_unidad_compradora: this.idUnidadCompradoraElegida});

  }

  onChangeUnidadCompradora(selectedValue: any) {
    const unidadSeleccionada = this._lstTablaUnidadesCompradoras?.find(uc => uc.id_unidad_compradora == selectedValue.value);
    // Ajusta dinámicamente el formulario según la opción seleccionada
    if (unidadSeleccionada && (unidadSeleccionada.id_tipo_unidad_responsable === 3 || unidadSeleccionada.id_tipo_unidad_responsable === 4)) {
      this.formRegistro.get('costo_bases')?.clearValidators();
      this.formRegistro.get('costo_bases')?.setErrors(null);
      this.formRegistro.get('costo_bases')?.updateValueAndValidity();
      this.formRegistro.get('costo_inscripcion_aut')?.setValidators([Validators.required]);
      this.formRegistro.get('costo_inscripcion_aut')?.updateValueAndValidity();
     } else {
      this.formRegistro.get('costo_inscripcion_aut')?.clearValidators();
      this.formRegistro.get('costo_inscripcion_aut')?.setErrors(null);
      this.formRegistro.get('costo_inscripcion_aut')?.updateValueAndValidity();
      this.formRegistro.get('costo_bases')?.setValidators([Validators.required]);
      this.formRegistro.get('costo_bases')?.updateValueAndValidity();
     }
  }

  mostrarInputCostoInscripcion(): any {
    const unidadSeleccionadaId = this.formRegistro.get('id_unidad_compradora')?.value;
    const unidadSeleccionada = this._lstTablaUnidadesCompradoras?.find(uc => uc.id_unidad_compradora == unidadSeleccionadaId);

    return unidadSeleccionada && (unidadSeleccionada.id_tipo_unidad_responsable === 3 || unidadSeleccionada.id_tipo_unidad_responsable === 4);
  }

  inputCosto() {
    if (this.formRegistro.get('costo_inscripcion_aut')?.value >= 0) {
      this.formRegistro.get('costo_inscripcion_aut')?.setErrors(null);
    } else {
      this.formRegistro.get('costo_inscripcion_aut')?.setErrors({ valorNegativo: true });
    }
}

  llenarCatalogos(){

    this.loaderBusqueda = true;
    this._convocantesService.obtenerTiposProcedimientos(1).subscribe({
        next: (data) => {
            this.lstTablaTiposProcedimientos = data.datos;
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


    this.loaderBusqueda = true;
    this._convocantesService.obtenerCaracteres(1).subscribe({
      next: (data) => {
          this.lstTablaCaracteres = data.datos;
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

    this.loaderBusqueda = true;
    this._convocantesService.obtenerModalidades(1).subscribe({
      next: (data) => {
          this.lstTablaModalidades = data.datos;
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

    this.loaderBusqueda = true;
    this._convocantesService.obtenerTiposArchivos(1).subscribe({
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

    this.loaderBusqueda = false;
    this._diasFestivosService.obtenerDiasFestivosList().subscribe({
      next: (data) =>{
        this.listDiasFestivos = data.datos;

        this.listDiasFestivos.forEach((fecha: any) => {
          this.json.disabledDates.push({ year: new Date(fecha.fecha_dia_festivo).getFullYear(), month: new Date(fecha.fecha_dia_festivo).getMonth() + 1, day: new Date(fecha.fecha_dia_festivo).getDate() });
        });

      },
      error: (err) =>{
        swal.fire(err.error.mensaje,'','error');
        this.loaderBusqueda = false;
      },
      complete: () => {
          this.loaderBusqueda = false;
      }
    })

  }


  llenarCatalogoCostos(valor: any){

    this.adjuntarPartidas(valor);
    if(this._idTipo == 1){
      this._convocantesService.obtenerCostosInscripcionActuales(valor).subscribe({
        next: (data) => {
            this.lstTablaCostos = data.datos;
        },
        error: (err) => {
            console.info(err)
            swal.fire(err.error.mensaje, "", 'error');
        },
        complete: () => {
          
        }
      });

      this.formRegistro.patchValue({costo_bases: null});
    }


  }


  obtenerProcedimientoAdministrativo(){

    this.loaderBusqueda = true;
    this._convocantesService.obtenerProcedimientoAdministrativo(this._procedimientoElegido?.id_procedimiento_administrativo).subscribe({
        next: (data) => {
            this.datosProcedimientoAdministrativo = data.datos;

            this.llenarFormularioEditar();
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

  iniciarFormularioRegistro(data: IProcedimientoAdministrativo | null = null) {
    const formTmp: FormGroup | null = new FormGroup({
        id_procedimiento_administrativo: new FormControl(null, {
            nonNullable: true,
            validators: [],
        }),
        id_tipo_procedimiento: new FormControl('', [
          Validators.required
        ]),
        id_tipo_caracter_licitacion: new FormControl('', [
          Validators.required
        ]),
        id_tipo_modalidad: new FormControl('', [
          Validators.required
        ]),
        licitacion_recortada: new FormControl('', [
          Validators.required
        ]),
        licitacion_tecnologia: new FormControl('', [
          Validators.required
        ]),
        descripcion_concepto_contratacion: new FormControl('', [
          Validators.required
        ]),
        numero_oficio_autorizacion: new FormControl('', [
          Validators.required,
          Validators.maxLength(80)
        ]),
        importe_autorizado: new FormControl('', [
          Validators.required
        ]),
        capitulo: new FormControl('', [
          Validators.required
        ]),
        proyecto: new FormControl('', [
          Validators.required
        ]),
        partida: new FormControl('', [
          Validators.required
        ]),
        numero_procedimiento: new FormControl('', [
            Validators.required
        ]),
        numero_licitanet: new FormControl('', [
          Validators.required
        ]),
        activo: new FormControl('', [
            Validators.required
        ]),
        id_tipo_contratacion: new FormControl('', [
            Validators.required
        ]),
        id_unidad_compradora: new FormControl('', [
            Validators.required
        ]),
        id_detalle_convocatoria: new FormControl('', [
          Validators.required
        ]),
        fecha_publicacion: new FormControl('', [
            Validators.required
        ])
        ,
        fecha_limite_inscripcion: new FormControl('', [
            Validators.required
        ])
        ,
        fecha_visita_lugar: new FormControl('', [
            Validators.required
        ])
        ,
        hora_visita_lugar: new FormControl('', [
            Validators.required
        ])
        ,
        existen_visitas_adicionales: new FormControl('', [
            Validators.required
        ])
        ,
        descripcion_lugar: new FormControl('', [
            Validators.required
        ])
        ,
        fecha_junta_aclaraciones: new FormControl('', [
            Validators.required
        ])
        ,
        hora_junta_aclaraciones: new FormControl('', [
            Validators.required
        ])
        ,
        existen_juntas_adicionales: new FormControl('', [
            Validators.required
        ])
        ,
        fecha_apertura: new FormControl('', [
            Validators.required
        ])
        ,
        hora_apertura: new FormControl('', [
            Validators.required
        ])
        ,
        fecha_fallo: new FormControl('', [
            Validators.required
        ])
        ,
        hora_fallo: new FormControl('', [
            Validators.required
        ]),
        costo_bases: new FormControl('', [
            Validators.required
        ]),
        costo_inscripcion_aut: new FormControl('', [
            Validators.required
        ]),
        archivo_convocatoria: new FormControl(null, [
          Validators.required
        ]),
        archivo_bases: new FormControl(null, [
          Validators.required
        ]),
        archivo_oficio_autorizacion: new FormControl(null, [
          Validators.required
        ]),
        archivo_partidas: new FormControl(null, [
          Validators.required
        ]),

        id_junta_aclaraciones: new FormControl('', [
          Validators.required
        ]),
        fecha_prorroga: new FormControl('', [
          Validators.required
        ]),
        url_archivo: new FormControl('', [
          Validators.required
        ]),



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

        ])




    });


    return formTmp;
  }

  llenarFormularioEditar(){

    this.loaderBusqueda = true;

    this.formRegistro.patchValue({id_procedimiento_administrativo: this.datosProcedimientoAdministrativo?.procedimiento.id_procedimiento_administrativo});

    this.formRegistro.patchValue({id_tipo_procedimiento: this.datosProcedimientoAdministrativo?.procedimiento.id_tipo_procedimiento});
    this.llenarCatalogoCostos(this.datosProcedimientoAdministrativo?.procedimiento.id_tipo_procedimiento);

    this.formRegistro.patchValue({id_tipo_caracter_licitacion: this.datosProcedimientoAdministrativo?.procedimiento.id_tipo_caracter_licitacion});
    this.formRegistro.patchValue({id_tipo_modalidad: this.datosProcedimientoAdministrativo?.procedimiento.id_tipo_modalidad});
    this.formRegistro.patchValue({licitacion_recortada: this.datosProcedimientoAdministrativo?.procedimiento.licitacion_recortada});
    this.formRegistro.patchValue({licitacion_tecnologia: this.datosProcedimientoAdministrativo?.procedimiento.licitacion_tecnologia});
    this.formRegistro.patchValue({descripcion_concepto_contratacion: this.datosProcedimientoAdministrativo?.procedimiento.descripcion_concepto_contratacion});
    this.formRegistro.patchValue({numero_oficio_autorizacion: this.datosProcedimientoAdministrativo?.procedimiento.numero_oficio_autorizacion});
    this.formRegistro.patchValue({importe_autorizado: this.datosProcedimientoAdministrativo?.procedimiento.importe_autorizado});
    this.formRegistro.patchValue({capitulo: this.datosProcedimientoAdministrativo?.procedimiento.capitulo});
    this.formRegistro.patchValue({proyecto: this.datosProcedimientoAdministrativo?.procedimiento.proyecto});
    this.formRegistro.patchValue({partida: this.datosProcedimientoAdministrativo?.procedimiento.partida});
    this.formRegistro.patchValue({numero_procedimiento: this.datosProcedimientoAdministrativo?.procedimiento.numero_procedimiento});
    this.formRegistro.patchValue({numero_licitanet: this.datosProcedimientoAdministrativo?.procedimiento.numero_licitanet});
    this.formRegistro.patchValue({activo: this.datosProcedimientoAdministrativo?.procedimiento.activo});
    this.formRegistro.patchValue({id_tipo_contratacion: this.datosProcedimientoAdministrativo?.procedimiento.id_tipo_contratacion});
    this.formRegistro.patchValue({id_unidad_compradora: this.datosProcedimientoAdministrativo?.procedimiento.id_unidad_compradora});
    this.formRegistro.patchValue({id_detalle_convocatoria: this.datosProcedimientoAdministrativo?.procedimiento.id_detalle_convocatoria});

    this.formRegistro.patchValue({fecha_publicacion: this.datepipe.transform(this.datosProcedimientoAdministrativo?.procedimiento.fecha_publicacion,'yyyy-MM-dd')});
    this.formRegistro.patchValue({fecha_limite_inscripcion: this.datepipe.transform(this.datosProcedimientoAdministrativo?.procedimiento.fecha_limite_inscripcion,'yyyy-MM-dd')});
    this.formRegistro.patchValue({fecha_visita_lugar: this.datepipe.transform(this.datosProcedimientoAdministrativo?.procedimiento.fecha_visita_lugar,'yyyy-MM-dd')});
    this.formRegistro.patchValue({hora_visita_lugar: this.datepipe.transform(this.datosProcedimientoAdministrativo?.procedimiento.fecha_visita_lugar,'HH:mm:ss')});
    this.formRegistro.patchValue({existen_visitas_adicionales: this.datosProcedimientoAdministrativo?.procedimiento.existen_visitas_adicionales});
    this.formRegistro.patchValue({descripcion_lugar: this.datosProcedimientoAdministrativo?.procedimiento.descripcion_lugar});
    this.formRegistro.patchValue({fecha_junta_aclaraciones: this.datepipe.transform(this.datosProcedimientoAdministrativo?.procedimiento.fecha_junta_aclaraciones,'yyyy-MM-dd')});
    this.formRegistro.patchValue({hora_junta_aclaraciones: this.datepipe.transform(this.datosProcedimientoAdministrativo?.procedimiento.fecha_junta_aclaraciones,'HH:mm:ss')});
    this.formRegistro.patchValue({existen_juntas_adicionales: this.datosProcedimientoAdministrativo?.procedimiento.existen_juntas_adicionales});
    this.formRegistro.patchValue({fecha_apertura: this.datepipe.transform(this.datosProcedimientoAdministrativo?.procedimiento.fecha_apertura,'yyyy-MM-dd')});
    this.formRegistro.patchValue({hora_apertura: this.datepipe.transform(this.datosProcedimientoAdministrativo?.procedimiento.fecha_apertura,'HH:mm:ss')});
    this.formRegistro.patchValue({fecha_fallo: this.datepipe.transform(this.datosProcedimientoAdministrativo?.procedimiento.fecha_fallo,'yyyy-MM-dd')});
    this.formRegistro.patchValue({hora_fallo: this.datepipe.transform(this.datosProcedimientoAdministrativo?.procedimiento.fecha_fallo,'HH:mm:ss')});
    this.formRegistro.patchValue({costo_bases: this.datosProcedimientoAdministrativo?.procedimiento.costo_bases});
    this.formRegistro.patchValue({costo_inscripcion_aut: this.datosProcedimientoAdministrativo?.procedimiento.costo_inscripcion_aut});
    this.formRegistro.patchValue({archivo_convocatoria: this.datosProcedimientoAdministrativo?.procedimiento.archivo_convocatoria});

    this.formRegistro.patchValue({id_junta_aclaraciones: this.datosProcedimientoAdministrativo?.procedimiento.id_junta_aclaraciones});
    this.formRegistro.patchValue({fecha_prorroga: this.datosProcedimientoAdministrativo?.procedimiento.fecha_prorroga});
    this.formRegistro.patchValue({url_archivo: this.datosProcedimientoAdministrativo?.procedimiento.url_archivo});


    if (this.datosProcedimientoAdministrativo?.procedimiento.url_archivo_bases !== null && this.datosProcedimientoAdministrativo?.procedimiento.url_archivo_bases !== undefined){
      const urlArchivoBases = this.datosProcedimientoAdministrativo?.procedimiento.url_archivo_bases;
      this.archivoBasesAux = this.obtenerNombreDeArchivoDesdeURL(urlArchivoBases);
    }

    if (this.datosProcedimientoAdministrativo?.procedimiento.url_archivo_convocatoria !== null && this.datosProcedimientoAdministrativo?.procedimiento.url_archivo_convocatoria !== undefined){
      const urlArchivoConv = this.datosProcedimientoAdministrativo?.procedimiento.url_archivo_convocatoria;
      this.archivoConvocatoriaAux = this.obtenerNombreDeArchivoDesdeURL(urlArchivoConv);
    }

    if (this.datosProcedimientoAdministrativo?.procedimiento.url_archivo_oficio_autorizacion !== null && this.datosProcedimientoAdministrativo?.procedimiento.url_archivo_oficio_autorizacion !== undefined){
      const urlArchivoAutorizacion = this.datosProcedimientoAdministrativo?.procedimiento.url_archivo_oficio_autorizacion;
      this.archivoAutorizacionAux = this.obtenerNombreDeArchivoDesdeURL(urlArchivoAutorizacion);
    }

    if (this.datosProcedimientoAdministrativo?.procedimiento.url_archivo_partidas !== null && this.datosProcedimientoAdministrativo?.procedimiento.url_archivo_partidas !== undefined){
      const urlPartidas = this.datosProcedimientoAdministrativo?.procedimiento.url_archivo_partidas;
      this.archivoPartidasAux = this.obtenerNombreDeArchivoDesdeURL(urlPartidas);
    }

    let unidadSeleccionada = this._lstTablaUnidadesCompradoras?.find(uc => uc.id_unidad_compradora == this.datosProcedimientoAdministrativo?.procedimiento.id_unidad_compradora);
    if (unidadSeleccionada && (unidadSeleccionada.id_tipo_unidad_responsable === 3 || unidadSeleccionada.id_tipo_unidad_responsable === 4)) {
      this.formRegistro.get('costo_bases')?.clearValidators();
      this.formRegistro.get('costo_bases')?.setErrors(null);
      this.formRegistro.get('costo_bases')?.updateValueAndValidity();
      this.formRegistro.get('costo_inscripcion_aut')?.setValidators([Validators.required]);
      this.formRegistro.get('costo_inscripcion_aut')?.updateValueAndValidity();
     } else {
      this.formRegistro.get('costo_inscripcion_aut')?.clearValidators();
      this.formRegistro.get('costo_inscripcion_aut')?.setErrors(null);
      this.formRegistro.get('costo_inscripcion_aut')?.updateValueAndValidity();
      this.formRegistro.get('costo_bases')?.setValidators([Validators.required]);
      this.formRegistro.get('costo_bases')?.updateValueAndValidity();
     }



    this.formRegistro.get('archivo_convocatoria')?.clearValidators();
    this.formRegistro.get('archivo_bases')?.clearValidators();
    this.formRegistro.get('archivo_oficio_autorizacion')?.clearValidators();

    this.formRegistro.get('archivo_convocatoria')?.setErrors(null);
    this.formRegistro.get('archivo_convocatoria')?.updateValueAndValidity();
    this.formRegistro.get('archivo_bases')?.setErrors(null);
    this.formRegistro.get('archivo_bases')?.updateValueAndValidity();
    this.formRegistro.get('archivo_oficio_autorizacion')?.setErrors(null);
    this.formRegistro.get('archivo_oficio_autorizacion')?.updateValueAndValidity();

    this.formRegistro.get('archivo_partidas')?.clearValidators();
    this.formRegistro.get('archivo_partidas')?.setErrors(null);
    this.formRegistro.get('archivo_partidas')?.updateValueAndValidity();

    this.lstAnexosProcedimientos = this.datosProcedimientoAdministrativo?.anexos!;
    this.lstDatosPartidaPresupuestal = this.datosProcedimientoAdministrativo?.procedimiento?.lstDatosPartidaPresupuestal;

    this.cambiarFechaPublicacion();
    this.cambiarFechaInscripcion();
    this.cambiarFechaApertura();

    this.loaderBusqueda = false;
  }


  datosGeneralesProcedimiento() {
    this.agregarDatosGenerales = true;
    this.agregarDetalleProcedimiento = false;
    this.agregarAnexosConvocatoria = false;
    this.agregarAnexosProcedimiento = false;
  }


  detalleProcedimiento() {
    this.agregarDatosGenerales = false;
    this.agregarDetalleProcedimiento = true;
    this.agregarAnexosConvocatoria = false;
    this.agregarAnexosProcedimiento = false;


  }

  anexosConvocatoria() {
    this.agregarDatosGenerales = false;
    this.agregarDetalleProcedimiento = false;
    this.agregarAnexosConvocatoria = true;
    this.agregarAnexosProcedimiento = false;
    if (this.archivoConvocatoria !== null && this.archivoConvocatoria !== undefined){
      this.archivoConvocatoriaAux = this.archivoConvocatoria?.nombreArchivo;
    }
    if (this.archivoBases !== null && this.archivoBases !== undefined){
      this.archivoBasesAux = this.archivoBases?.nombreArchivo;
    }
    if (this.archivoAutorizacion !== null && this.archivoAutorizacion !== undefined){
      this.archivoAutorizacionAux = this.archivoAutorizacion?.nombreArchivo;
    }
    if (this.archivoPartidas !== null && this.archivoPartidas !== undefined){
      this.archivoPartidasAux = this.archivoPartidas?.nombreArchivo;
    }
  }

  obtenerNombreDeArchivoDesdeURL(url: any) {
    const partesDeURL = url.split('/');
    const nombreDeArchivo = partesDeURL[partesDeURL.length - 1];
    return nombreDeArchivo;
  }

  anexosProcedimientos() {
    this.agregarDatosGenerales = false;
    this.agregarDetalleProcedimiento = false;
    this.agregarAnexosConvocatoria = false;
    this.agregarAnexosProcedimiento = true;
  }


  cancelarAgregarProcedimientoModal(content: any) {
    this.modalRefCancelarAgregar = this.modalService.open(content);
  }

  cancelarAgregarProcedimiento() {
    this.cancelarCancelarAgregarProcedimientoModal();
    this._cancelarAgregarProcedimiento.emit();

  }

  cancelarCancelarAgregarProcedimientoModal() {
    this.modalRefCancelarAgregar?.close();
  }






  guardarSubmit() {

   this.formRegistro.patchValue({id_tipo_contratacion: this._idTipo});

    this.formRegistro.patchValue({fecha_visita_lugar: this.formRegistro.value.fecha_visita_lugar || ' ' || this.formRegistro.value.hora_visita_lugar});

    const datosGuardar: IProcedimientoAdministrativo = this.formRegistro?.value as IProcedimientoAdministrativo;

    datosGuardar.archivo_convocatoria = this.archivoConvocatoria;
    datosGuardar.archivo_bases = this.archivoBases;
    datosGuardar.archivo_oficio_autorizacion = this.archivoAutorizacion;
    datosGuardar.archivo_partidas = this.archivoPartidas;
    datosGuardar.anexos_procedimiento = this.lstAnexosProcedimientos;
    datosGuardar.anexos_procedimiento_eliminar = this.lstAnexosProcedimientosEliminar;
    datosGuardar.lstDatosPartidaPresupuestal = this.lstDatosPartidaPresupuestal;


    this._convocantesService.guardarProcedimientoAdministrativo(datosGuardar).subscribe({
        next: (data) => {
            swal.fire(data.mensaje, "", 'success');
            this.cancelarAgregarProcedimiento();
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




  confirmarGuardarSubmitModal(content: any) {
    this.modalRefConfirmarGuardar = this.modalService.open(content);
  }

  cancelarConfirmarGuardarSubmitModal() {
    this.modalRefConfirmarGuardar?.close();
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

  validarArchivoEXCEL(archivo: any, event: any, mensaje? : boolean) {
    let extension = archivo.name.split('.').pop();

    if (extension !== "xlsx" ) {
      event.target.value = '';
      swal.fire(
        '¡Archivo incorrecto!',
        mensaje ? "El tipo de archivo solo permite 'EXCEL XLSX'" : "Solo permite archivos 'EXCEL XLSX'",
        "error"
      );
      return false;
    }
    return true;
  }


  obtenerArchivoConvocatoriaBase64(event: any) {
    this.archivoConvocatoria = null;
    let files = event.target.files;
    let archivo = files[0];

    if (files && archivo) {

      // let isPDF = this.validarArchivoPDF(archivo, event);

      // if (!isPDF) return;

      getBase64(archivo)
        .then((data64) => {
          this.archivoConvocatoria = {
            base64: String(data64),
            nombreArchivo: archivo.name,
            procedimiento: this.formRegistro.value.id_unidad_compradora,
            tipoArchivo: 3,
            encriptar: false
          }
          this.archivoConvocatoria.base64 = this.archivoConvocatoria.base64?.replace(
            /^data:.+;base64,/,
            ''
          );
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }


  obtenerArchivoBasesBase64(event: any) {
    this.archivoBases = null;
    let files = event.target.files;
    let archivo = files[0];

    if (files && archivo) {

      // let isPDF = this.validarArchivoPDF(archivo, event);

      // if (!isPDF) return;

      getBase64(archivo)
        .then((data64) => {
          this.archivoBases = {
            base64: String(data64),
            nombreArchivo: archivo.name,
            procedimiento: this.formRegistro.value.id_unidad_compradora,
            tipoArchivo: 2,
            encriptar: false
          }
          this.archivoBases.base64 = this.archivoBases.base64?.replace(
            /^data:.+;base64,/,
            ''
          );
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }


  obtenerArchivoAutorizacionBase64(event: any) {
    this.archivoAutorizacion = null;
    let files = event.target.files;
    let archivo = files[0];

    if (files && archivo) {

      // let isPDF = this.validarArchivoPDF(archivo, event);

      // if (!isPDF) return;

      getBase64(archivo)
        .then((data64) => {
          this.archivoAutorizacion = {
            base64: String(data64),
            nombreArchivo: archivo.name,
            procedimiento: this.formRegistro.value.id_unidad_compradora,
            tipoArchivo: 4,
            encriptar: false
          }
          this.archivoAutorizacion.base64 = this.archivoAutorizacion.base64?.replace(
            /^data:.+;base64,/,
            ''
          );
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }

  obtenerArchivoPartidasBase64(event: any) {
    this.archivoPartidas = null;
    let files = event.target.files;
    let archivo = files[0];

    if (files && archivo) {

      let isExcel = this.validarArchivoEXCEL(archivo, event);

      if (!isExcel) return;

      getBase64(archivo)
        .then((data64) => {
          this.archivoPartidas = {
            base64: String(data64),
            nombreArchivo: archivo.name,
            procedimiento: this.formRegistro.value.id_unidad_compradora,
            tipoArchivo: 18,
            encriptar: false
          }
          this.archivoPartidas.base64 = this.archivoPartidas.base64?.replace(
            /^data:.+;base64,/,
            ''
          );
          this.procesarPartidaPresupuestal();
        })
        .catch((err) => {
          console.error(err);
        });
    }
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

      // let isPDF = this.validarArchivoPDF(archivo, event);

      // if (!isPDF) {
      //   this.resetArchivoAnexo();
      //   return;
      // }

      getBase64(archivo)
        .then((data64) => {
          this.archivoAnexo = {
            base64: String(data64),
            nombreArchivo: archivo.name,
            procedimiento: this.formRegistro.value.id_unidad_compradora,
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

  procesarPartidaPresupuestal() {

    this.lstDatosPartidaPresupuestal = [];

    let ext = this.archivoPartidas.nombreArchivo?.split('.').pop();
    const extensiones = ['xls', 'xlsx'];
    if (extensiones.indexOf(ext) < 0 ) {
      swal.fire("La partida presupuestal debe ser un archivo excel y no un " + ext, "", 'error');
      return;
    }

    const base64 = this.archivoPartidas.base64;

    const workbook = read(base64ToArrayBuffer(base64), {raw:false});
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    let json = utils.sheet_to_json(worksheet, {header: 1});

    if (json != null) {
      json.shift();

      if (json?.length == 0) {
        swal.fire("El archivo de partidas no contienen datos ", "", 'error');
        return;
      }

      json?.forEach(it=>{
          const val = it as any;
          const objTmp = {
              id_procedimiento_administrativo: (this.formRegistro?.value as IProcedimientoAdministrativo).id_procedimiento_administrativo,
              numero_partida: val[0],
              nombre_partida: val[1],
              codigo_partida: val[2],
              descripcion_partida: val[3],
              cantidad_partida: val[4]
          } as IDatoPartidaPresupuestal;

          if (objTmp.numero_partida != null && objTmp.nombre_partida != null
              && objTmp.codigo_partida != null && objTmp.descripcion_partida != null && objTmp.cantidad_partida != null) {
              this.lstDatosPartidaPresupuestal?.push(objTmp);
          }
      });

      this.abrirCerrarModalPartidas(true);

    } else {
      swal.fire("El archivo de partidas no contienen datos ", "", 'error');
      return;
    }
  }

  procesarPartidaPresupuestalAceptar() {
    this.archivoPartidasAux = this.obtenerNombreDeArchivoDesdeURL(this.archivoPartidas.nombreArchivo);
    this.abrirCerrarModalPartidas(false);
  }

  procesarPartidaPresupuestalCancelar() {
    this.lstDatosPartidaPresupuestal = [];
    this.archivoPartidas = null;

    this.formRegistro.get('archivo_partidas')?.patchValue(null);
    this.formRegistro.get('archivo_partidas')?.setErrors(null);
    this.formRegistro.get('archivo_partidas')?.updateValueAndValidity();

    this.abrirCerrarModalPartidas(false);
  }

  abrirCerrarModalPartidas(abrir: boolean= false, consulta:boolean = false) {
    if (abrir) {
      this.modalMostrarPartidasPresupuestalesRef = this.modalService.open(this.modalMostrarPartidasPresupuestales,
        {
          backdrop : 'static',
          keyboard : false
        });
    } else {
      this.modalMostrarPartidasPresupuestalesRef?.close();
    }
    this.consultarDatosPartida = consulta;
  }


  eliminarAnexosModal(modal: any, datos: IAnexoProcedimiento) {
    this.modalRefEliminarAnexo = this.modalService.open(modal, { size: 'lg' });

    this.anexoElegido = datos;
  }

  cerrarModalEliminar() {
    this.modalRefEliminarAnexo?.close();
  }

  eliminarAnexoConfirm() {
    const indice = this.lstAnexosProcedimientos.indexOf(this.anexoElegido!);

    const elementoEliminar = this.lstAnexosProcedimientos[indice];
    if (elementoEliminar.id_tipo_archivo == 18) {
        this.lstDatosPartidaPresupuestal = [];
    }

    this.lstAnexosProcedimientos.splice(indice,1);

    if(this.anexoElegido?.id_anexo_procedimiento !== null && this.anexoElegido?.id_anexo_procedimiento !== undefined){
      this.lstAnexosProcedimientosEliminar.push(this.anexoElegido);
    }

    this.modalRefEliminarAnexo?.close();
  }

  numeroProcedimientoModal(content: any) {

    this._convocantesService.obtenerSiguienteNumeroProcedimiento(this.datosProcedimientoAdministrativo?.procedimiento?.id_tipo_contratacion!,this.datosProcedimientoAdministrativo?.procedimiento?.id_tipo_procedimiento!,this.datosProcedimientoAdministrativo?.procedimiento?.id_unidad_compradora!, this.datosProcedimientoAdministrativo?.procedimiento?.id_procedimiento_administrativo!).subscribe({
      next: (data) => {
        this.siguienteNumeroProcedimiento = data.datos;
        this.modalRefNumeroProcedimiento = this.modalService.open(content);
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

  cancelarNumeroProcedimientoModal() {
    this.modalRefNumeroProcedimiento?.close();
  }


  confirmarFijarNumeroProcedimientoModal(content: any) {
    this.modalRefConfirmarFijar = this.modalService.open(content);
  }

  cancelarconfirmarFijarNumeroProcedimientoModal() {
    this.modalRefConfirmarFijar?.close();
  }


  fijarNumeroProcedimiento() {

    this.busquedaParticipante.id_procedimiento_administrativo = this.datosProcedimientoAdministrativo?.procedimiento?.id_procedimiento_administrativo!;
    const tipoContratacion = this.datosProcedimientoAdministrativo?.procedimiento.id_tipo_contratacion;
    this.loaderBusqueda = true;
    this._convocantesService.buscarParticipanteInvitado(this.busquedaParticipante).subscribe({
        next: (data) => {
          this.participantes=data.datos;

          if(tipoContratacion == 2 && this.participantes.length < 3){

            swal.fire("Se necesita agregar al menos 3 invitados para poder fijar el Número de Procedimiento","", 'error');

          }else{

            this.loaderBusqueda = true;
            this._convocantesService.fijarSiguienteNumeroProcedimiento(this.datosProcedimientoAdministrativo?.procedimiento?.id_tipo_contratacion!,this.datosProcedimientoAdministrativo?.procedimiento?.id_tipo_procedimiento!,this.datosProcedimientoAdministrativo?.procedimiento?.id_unidad_compradora!, this.datosProcedimientoAdministrativo?.procedimiento?.id_procedimiento_administrativo!).subscribe({
              next: (data) => {
                this.siguienteNumeroProcedimiento = data.datos;

                this.cancelarconfirmarFijarNumeroProcedimientoModal();
                this.cancelarNumeroProcedimientoModal();
                this.cancelarAgregarProcedimiento();

                swal.fire(data.mensaje, "", 'success');
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


        },
        error: (err) => {
            console.info(err)
            swal.fire(err.error.mensaje, "", 'error');

        },
        complete: () => {
          this.loaderBusqueda = false;
        }
    });








  }


  cambiarFechaPublicacion() {

    this.fechaPublicacionElegido = new Date(this.formRegistro.value.fecha_publicacion);
    this.fechaPublicacionElegido.setDate(this.fechaPublicacionElegido.getDate() + 2);

    this.minPickerFechaVisita = {
      year: new Date(this.fechaPublicacionElegido).getFullYear(),
      month: new Date(this.fechaPublicacionElegido).getMonth() + 1,
      day: new Date(this.fechaPublicacionElegido).getDate()
    };

    this.minPickerFechaJuntaAclaraciones = {
      year: new Date(this.fechaPublicacionElegido).getFullYear(),
      month: new Date(this.fechaPublicacionElegido).getMonth() + 1,
      day: new Date(this.fechaPublicacionElegido).getDate()
    };

    this.minPickerFechaInscripcion = {
      year: new Date(this.fechaPublicacionElegido).getFullYear(),
      month: new Date(this.fechaPublicacionElegido).getMonth() + 1,
      day: new Date(this.fechaPublicacionElegido).getDate()
    };


    console.log(this.fechaPublicacionElegido);
    this.fechaAperturaPropuestasCalculado.setDate(this.fechaPublicacionElegido.getDate() + 2);
    console.log(this.fechaAperturaPropuestasCalculado);
    this.fechaJuntaAclaracionesCalculado.setDate(this.fechaAperturaPropuestasCalculado.getDate() - 6);

    this.pickerFechaAperturaPropuestas = {
      year: new Date(this.fechaAperturaPropuestasCalculado).getFullYear(),
      month: new Date(this.fechaAperturaPropuestasCalculado).getMonth() + 1,
      day: new Date(this.fechaAperturaPropuestasCalculado).getDate()
    };
  }


  cambiarFechaInscripcion() {

    this.fechaInscripcionElegido = new Date(this.formRegistro.value.fecha_limite_inscripcion);
    this.fechaInscripcionElegido.setDate(this.fechaInscripcionElegido.getDate() + 2);

    this.minPickerFechaAperturaPropuestas = {
      year: new Date(this.fechaInscripcionElegido).getFullYear(),
      month: new Date(this.fechaInscripcionElegido).getMonth() + 1,
      day: new Date(this.fechaInscripcionElegido).getDate()
    };


  }


  cambiarFechaApertura() {

    this.fechaAperturaPropuestasElegido = new Date(this.formRegistro.value.fecha_apertura);
    this.fechaAperturaPropuestasElegido.setDate(this.fechaAperturaPropuestasElegido.getDate() + 2);

    this.minPickerFechaFallo = {
      year: new Date(this.fechaAperturaPropuestasElegido).getFullYear(),
      month: new Date(this.fechaAperturaPropuestasElegido).getMonth() + 1,
      day: new Date(this.fechaAperturaPropuestasElegido).getDate()
    };


  }

  adjuntarPartidas(valor:any){
    const tipo_procedimiento = valor;
    if(tipo_procedimiento == 5 || tipo_procedimiento == 6) {
      this._blnAdjuntarPartidas = false;
    }else{
      this._blnAdjuntarPartidas = true;
    }
  }


  protected readonly JSON = JSON;
}
