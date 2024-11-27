import {Component, ElementRef, EventEmitter, Injectable, Input, OnInit, Output, ViewChild} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/components/login/auth.service';
import { IFilesUpload } from 'src/app/interfaces/comun/IFilesUpload';
import { IAnexoProcedimiento } from 'src/app/interfaces/convocantes/IAnexoProcedimiento';
import { IProcedimientoAdministrativo } from 'src/app/interfaces/convocantes/IProcedimientoAdministrativo';
import { ITipoProcedimiento } from 'src/app/interfaces/convocantes/ITipoProcedimiento';
import { ConvocantesService } from 'src/app/services/convocantes.service';
import swal from 'sweetalert2';
import {base64ToArrayBuffer, getBase64} from '../../../enums/getBase64-util';
import { ItipoArchivo } from 'src/app/interfaces/convocantes/ITipoArchivo';
import { NgbCalendar, NgbDate, NgbDateAdapter, NgbDateParserFormatter, NgbDateStruct, NgbDatepickerConfig, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { IDetalleProcedimiento } from 'src/app/interfaces/convocantes/IDetalleProcedimiento';
import { DatePipe } from '@angular/common'
import { IProveedor } from 'src/app/interfaces/proveedores/IProveedores';
import { IBusquedaProveedor } from 'src/app/interfaces/proveedores/IBusquedaProveedor';
import { ICatalogoUnidadCompradora } from 'src/app/interfaces/catalogos/ICatalogoUnidadCompradora';
import {read, utils} from "xlsx";
import {IDatoPartidaPresupuestal} from "../../../interfaces/convocantes/IDatoPartidaPresupuestal";
import { IAnios } from 'src/app/interfaces/convocantes/IAnios';
import { Router } from '@angular/router';
import { CatalogoDiasFestivosService } from 'src/app/services/catalogoDiasFestivos.service';




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
  selector: 'app-agregar-procedimiento-adjudicacion',
  templateUrl: './agregar-procedimiento-adjudicacion.component.html',
  styleUrls: ['./agregar-procedimiento-adjudicacion.component.css'],
  providers: [
    { provide: NgbDateAdapter, useClass: CustomAdapter },
    { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter}
  ]

})
export class AgregarProcedimientoAdjudicacionComponent implements OnInit {


  @Input() public _procedimientoElegido: IProcedimientoAdministrativo | null = null;

  @Input() public _blnActivarEditar: any;
  @Input() public _messageTitle: any;
  @Input() public _messageSubTitle: any;
  @Input() public _messageButton: any;

  @Input() public _lstTablaUnidadesCompradoras: ICatalogoUnidadCompradora[] | null = null;

  @Output() public _cancelarAgregarProcedimiento = new EventEmitter();


  formRegistro: FormGroup;
  formAnexos: FormGroup;
  formBusquedaProveedores: FormGroup;

  agregarDatosGenerales: boolean = true;
  agregarDetalleContrato: boolean = false;
  agregarDatosProveedor: boolean = false;
  agregarAnexosProcedimiento: boolean = false;

  lstTablaTiposProcedimientos: ITipoProcedimiento[] | null = null;
  lstAnexosProcedimientos: IAnexoProcedimiento[] = [];
  lstAnexosProcedimientosEliminar: IAnexoProcedimiento[] = [];
  lstTablaTiposArchivos: ItipoArchivo[] | null = null;
  lstTablaProveedores: IProveedor[]  | null = null;

  lstAniosAnteriores: IAnios[] | null = null;

  archivoAutorizacion!: IFilesUpload | any;
  archivoContrato!: IFilesUpload | any;
  archivoAnexo!: IFilesUpload | any;
  archivoAutorizacionAux = null;
  archivoContratoAux = null;

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

  esExtemporanea: boolean = false;

  listDiasFestivos: any;

  datePickerJson = {};
  json = {
    disable: [6, 7],
    disabledDates: [
      { year: 1900, month: 10, day: 19 }
    ]
  };
  isDisabled;


  constructor(
    private fb: FormBuilder,
    private _convocantesService: ConvocantesService,
    private _authService: AuthService,
    private modalService: NgbModal,
    public datepipe: DatePipe,
    private _router: Router,
    private config: NgbDatepickerConfig,
    private calendar: NgbCalendar,
    private _diasFestivosService: CatalogoDiasFestivosService

  ) {

    this.formRegistro = this.iniciarFormularioRegistro();
    this.formAnexos = this.iniciarFormularioAnexos();
    this.formBusquedaProveedores = this.iniciarFormularioBusquedaProveedores();


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





  }



  ngOnInit() {

    this.llenarCatalogos();



    if(this._lstTablaUnidadesCompradoras?.length! == undefined && this._authService.getTieneExtemporaneas()){
      this.llenarCatalogosExtemporaneas();
      this.esExtemporanea = true;
      this._messageButton = "Registrar extemporanea";
    }else{
      this.formRegistro.get('anio')?.clearValidators();
      this.formRegistro.get('anio')?.setErrors(null);
      this.formRegistro.get('anio')?.updateValueAndValidity();

    }


    if(this._blnActivarEditar){
      this.obtenerProcedimientoAdministrativo();
    }

    if (this._lstTablaUnidadesCompradoras !== null) {
      for (let item of this._lstTablaUnidadesCompradoras) {
        this.idUnidadCompradoraElegida = (JSON.parse(JSON.stringify(item))).id_unidad_compradora;

      }
    }

    this.formRegistro.patchValue({id_unidad_compradora: this.idUnidadCompradoraElegida});

  }

  llenarCatalogos(){

    this.loaderBusqueda= true;
    this._convocantesService.obtenerTiposProcedimientos(3).subscribe({
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
    this._convocantesService.obtenerTiposArchivos(3).subscribe({
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


    this.formBusquedaProveedores.patchValue({id_estatus_proveedor: 3});
    const datosBusquedaProveedores: IBusquedaProveedor = this.formBusquedaProveedores?.value as IBusquedaProveedor;

    this.loaderBusqueda = true;
    this._convocantesService.buscarProveedores(datosBusquedaProveedores).subscribe({
      next: (data) => {
          this.lstTablaProveedores = data.datos;
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


  llenarCatalogosExtemporaneas(){

    this.loaderBusqueda= true;
    this._convocantesService.buscarAniosAnteriores().subscribe({
      next: (data) => {
          this.lstAniosAnteriores = data.datos;
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


    this._lstTablaUnidadesCompradoras = this._authService.getExtemporaneas();

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
        licitacion_tecnologia: new FormControl('', [
          Validators.required
        ]),
        descripcion_concepto_contratacion: new FormControl('', [
          Validators.required
        ]),
        descripcion_normatividad: new FormControl('', [
          Validators.required
        ]),
        numero_cotizaciones: new FormControl('', [
          Validators.required
        ]),
        numero_oficio_autorizacion: new FormControl('', [
          Validators.required,
          Validators.maxLength(80)
        ]),
        importe_autorizado: new FormControl('', [
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
        anio: new FormControl('', [
            Validators.required
        ]),
        archivo_oficio_autorizacion: new FormControl('', [
          Validators.required
        ]),



        id_contrato: new FormControl('', [
          Validators.required
        ]),
        numero_contrato: new FormControl('', [
            Validators.required
        ]),
        fecha_firma_contrato: new FormControl('', [
            Validators.required
        ]),
        fecha_inicio_contrato: new FormControl('', [
            Validators.required
        ]),
        fecha_fin_contrato: new FormControl('', [
            Validators.required
        ]),
        monto: new FormControl('', [
            Validators.required
        ]),
        monto_anticipo: new FormControl('', [
            Validators.required
        ]),
        archivo_contrato: new FormControl('', [
          Validators.required
        ]),



        id_participante_procedimiento: new FormControl('', [
          Validators.required
        ]),
        id_proveedor: new FormControl('', [
          Validators.required
        ]),
        nombre_proveedor: new FormControl({value: '', disabled: true}, [

        ]),
        nombre_representante_proveedor: new FormControl({value: '', disabled: true}, [

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


  llenarFormularioEditar(){

    this.loaderBusqueda = true;
    this.formRegistro.patchValue({id_procedimiento_administrativo: this.datosProcedimientoAdministrativo?.procedimiento.id_procedimiento_administrativo});

    this.formRegistro.patchValue({id_tipo_procedimiento: this.datosProcedimientoAdministrativo?.procedimiento.id_tipo_procedimiento});
    this.formRegistro.patchValue({licitacion_tecnologia: this.datosProcedimientoAdministrativo?.procedimiento.licitacion_tecnologia});
    this.formRegistro.patchValue({descripcion_concepto_contratacion: this.datosProcedimientoAdministrativo?.procedimiento.descripcion_concepto_contratacion});
    this.formRegistro.patchValue({descripcion_normatividad: this.datosProcedimientoAdministrativo?.procedimiento.descripcion_normatividad});
    this.formRegistro.patchValue({numero_cotizaciones: this.datosProcedimientoAdministrativo?.procedimiento.numero_cotizaciones});
    this.formRegistro.patchValue({numero_oficio_autorizacion: this.datosProcedimientoAdministrativo?.procedimiento.numero_oficio_autorizacion});
    this.formRegistro.patchValue({importe_autorizado: this.datosProcedimientoAdministrativo?.procedimiento.importe_autorizado});
    this.formRegistro.patchValue({numero_procedimiento: this.datosProcedimientoAdministrativo?.procedimiento.numero_procedimiento});
    this.formRegistro.patchValue({activo: this.datosProcedimientoAdministrativo?.procedimiento.activo});
    this.formRegistro.patchValue({id_tipo_contratacion: this.datosProcedimientoAdministrativo?.procedimiento.id_tipo_contratacion});
    this.formRegistro.patchValue({id_unidad_compradora: this.datosProcedimientoAdministrativo?.procedimiento.id_unidad_compradora});
    this.formRegistro.patchValue({numero_licitanet: this.datosProcedimientoAdministrativo?.procedimiento.numero_licitanet});

    this.formRegistro.patchValue({id_contrato: this.datosProcedimientoAdministrativo?.contratos[0]?.id_contrato});
    this.formRegistro.patchValue({numero_contrato: this.datosProcedimientoAdministrativo?.contratos[0]?.numero_contrato});
    this.formRegistro.patchValue({fecha_firma_contrato: this.datepipe.transform(this.datosProcedimientoAdministrativo?.contratos[0]?.fecha_firma_contrato,'yyyy-MM-dd')});
    this.formRegistro.patchValue({fecha_inicio_contrato: this.datepipe.transform(this.datosProcedimientoAdministrativo?.contratos[0]?.fecha_inicio_contrato,'yyyy-MM-dd')});
    this.formRegistro.patchValue({fecha_fin_contrato: this.datepipe.transform(this.datosProcedimientoAdministrativo?.contratos[0]?.fecha_fin_contrato,'yyyy-MM-dd')});
    this.formRegistro.patchValue({monto: this.datosProcedimientoAdministrativo?.contratos[0]?.monto});
    this.formRegistro.patchValue({monto_anticipo: this.datosProcedimientoAdministrativo?.contratos[0]?.monto_anticipo});



    this.formRegistro.patchValue({id_participante_procedimiento: this.datosProcedimientoAdministrativo?.participantes[0]?.id_participante_procedimiento});
    this.formRegistro.patchValue({id_proveedor: this.datosProcedimientoAdministrativo?.participantes[0]?.id_proveedor});

    if (this.datosProcedimientoAdministrativo?.procedimiento.url_archivo_contrato !== null && this.datosProcedimientoAdministrativo?.procedimiento.url_archivo_contrato !== undefined){
      const urlArchivoContrato = this.datosProcedimientoAdministrativo?.procedimiento.url_archivo_contrato;
      this.archivoContratoAux = this.obtenerNombreDeArchivoDesdeURL(urlArchivoContrato);
    }

    if (this.datosProcedimientoAdministrativo?.procedimiento.url_archivo_oficio_autorizacion !== null && this.datosProcedimientoAdministrativo?.procedimiento.url_archivo_oficio_autorizacion !== undefined){
      const urlArchivoAutorizacion = this.datosProcedimientoAdministrativo?.procedimiento.url_archivo_oficio_autorizacion;
      this.archivoAutorizacionAux = this.obtenerNombreDeArchivoDesdeURL(urlArchivoAutorizacion);
    }

    this.formRegistro.get('archivo_oficio_autorizacion')?.clearValidators();
    this.formRegistro.get('archivo_contrato')?.clearValidators();

    this.formRegistro.get('archivo_oficio_autorizacion')?.setErrors(null);
    this.formRegistro.get('archivo_oficio_autorizacion')?.updateValueAndValidity();
    this.formRegistro.get('archivo_contrato')?.setErrors(null);
    this.formRegistro.get('archivo_contrato')?.updateValueAndValidity();


    this.lstAnexosProcedimientos = this.datosProcedimientoAdministrativo?.anexos!;
    this.lstDatosPartidaPresupuestal = this.datosProcedimientoAdministrativo?.procedimiento?.lstDatosPartidaPresupuestal;

    this.actualizarNombreProveedor();

    this.loaderBusqueda = false;


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


  iniciarFormularioBusquedaProveedores() {
    const formTmp: FormGroup | null = new FormGroup({
        id_estatus_proveedor: new FormControl('', [

        ])




    });


    return formTmp;
  }



  datosGeneralesProcedimiento() {
    this.agregarDatosGenerales = true;
    this.agregarDetalleContrato = false;
    this.agregarDatosProveedor = false;
    this.agregarAnexosProcedimiento = false;
    if (this.archivoAutorizacion !== null && this.archivoAutorizacion !== undefined){
      this.archivoAutorizacionAux = this.archivoAutorizacion?.nombreArchivo;
    }
  }


  detalleContrato() {
    this.agregarDatosGenerales = false;
    this.agregarDetalleContrato = true;
    this.agregarDatosProveedor = false;
    this.agregarAnexosProcedimiento = false;
    if (this.archivoContrato !== null && this.archivoContrato !== undefined){
      this.archivoContratoAux = this.archivoContrato?.nombreArchivo;
    }
  }

  obtenerNombreDeArchivoDesdeURL(url: any) {
    const partesDeURL = url.split('/');
    const nombreDeArchivo = partesDeURL[partesDeURL.length - 1];
    return nombreDeArchivo;
  }

  datosProveedor() {
    this.agregarDatosGenerales = false;
    this.agregarDetalleContrato = false;
    this.agregarDatosProveedor = true;
    this.agregarAnexosProcedimiento = false;
  }

  anexosProcedimientos() {
    this.agregarDatosGenerales = false;
    this.agregarDetalleContrato = false;
    this.agregarDatosProveedor = false;
    this.agregarAnexosProcedimiento = true;
  }


  guardarSubmit() {


    this.formRegistro.patchValue({id_tipo_contratacion: 3});

    const datosGuardar: IProcedimientoAdministrativo = this.formRegistro?.value as IProcedimientoAdministrativo;

    datosGuardar.archivo_oficio_autorizacion = this.archivoAutorizacion;
    datosGuardar.archivo_contrato = this.archivoContrato;
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

    if(this.esExtemporanea){
      this._router.navigate(['/admin/tablero']);
    }
  }


  confirmarGuardarSubmitModal(content: any) {
    this.modalRefConfirmarGuardar = this.modalService.open(content);
  }

  cancelarConfirmarGuardarSubmitModal() {
    this.modalRefConfirmarGuardar?.close();
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

  obtenerArchivoContratoBase64(event: any) {
    this.archivoContrato = null;
    let files = event.target.files;
    let archivo = files[0];

    if (files && archivo) {

      // let isPDF = this.validarArchivoPDF(archivo, event);

      // if (!isPDF) return;

      getBase64(archivo)
        .then((data64) => {
          this.archivoContrato = {
            base64: String(data64),
            nombreArchivo: archivo.name,
            procedimiento: this.formRegistro.value.id_unidad_compradora,
            tipoArchivo: 1,
            encriptar: false
          }
          this.archivoContrato.base64 = this.archivoContrato.base64?.replace(
            /^data:.+;base64,/,
            ''
          );
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

      // let isPDFOrExcel = this.validarArchivoPdfExcel(archivo, event);

      // if (!isPDFOrExcel) {
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

    if (this.formRegistro.value.id_tipo_archivo == 18) {
      this.procesarPartidaPresupuestal();
    } else {
      this.procesarCargaArchivoNormal();
    }
  }

  procesarPartidaPresupuestal() {

    this.lstDatosPartidaPresupuestal = [];

    const indiceArchivoExistente = this.lstAnexosProcedimientos.find(it=>it.id_tipo_archivo==18);
    if (indiceArchivoExistente != null) {
      swal.fire("Solo puedes cargar un archivo de partidas", "", 'error');
      return;
    }

    let ext = this.archivoAnexo.nombreArchivo?.split('.').pop();
    const extensiones = ['xls', 'xlsx'];
    if (extensiones.indexOf(ext) < 0 ) {
      swal.fire("La partida presupuestal debe ser un archivo excel y no un " + ext, "", 'error');
      return;
    }

    const base64 = this.archivoAnexo.base64;

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
        this.lstDatosPartidaPresupuestal?.push({
          id_procedimiento_administrativo: (this.formRegistro?.value as IProcedimientoAdministrativo).id_procedimiento_administrativo,
          numero_partida: val[0],
          nombre_partida: val[1],
          codigo_partida: val[2],
          descripcion_partida: val[3],
          cantidad_partida: val[4]
        } as IDatoPartidaPresupuestal)
      });

      this.abrirCerrarModalPartidas(true);

    } else {
      swal.fire("El archivo de partidas no contienen datos ", "", 'error');
      return;
    }
  }

  procesarPartidaPresupuestalAceptar() {
    this.procesarCargaArchivoNormal();
    this.abrirCerrarModalPartidas(false);
  }

  procesarPartidaPresupuestalCancelar() {
    this.lstDatosPartidaPresupuestal = [];
    this.formRegistro.patchValue({nombre_tipo_archivo: null});
    this.formRegistro.patchValue({comentarios: null});
    this.formRegistro.patchValue({archivo_anexo: null});
    this.formRegistro.patchValue({id_tipo_archivo: null});
    this.abrirCerrarModalPartidas(false);
  }

  abrirCerrarModalPartidas(abrir: boolean= false, consulta:boolean = false) {
    if (abrir) {
      this.modalMostrarPartidasPresupuestalesRef = this.modalService.open(this.modalMostrarPartidasPresupuestales);
    } else {
      this.modalMostrarPartidasPresupuestalesRef?.close();
    }
    this.consultarDatosPartida = consulta;
  }

  procesarCargaArchivoNormal() {
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


  eliminarAnexosModal(modal: any, datos: IAnexoProcedimiento) {
    this.modalRefEliminarAnexo = this.modalService.open(modal, { size: 'lg' });

    this.anexoElegido = datos;
  }

  cerrarModalEliminar() {
    this.modalRefEliminarAnexo?.close();
  }

  eliminarAnexoConfirm() {
    const indice = this.lstAnexosProcedimientos.indexOf(this.anexoElegido!);

    this.lstAnexosProcedimientos.splice(indice,1);

    if(this.anexoElegido?.id_anexo_procedimiento !== null && this.anexoElegido?.id_anexo_procedimiento !== undefined){
      this.lstAnexosProcedimientosEliminar.push(this.anexoElegido);
    }

    this.modalRefEliminarAnexo?.close();
  }

  actualizarNombreProveedor(){

    if((this.lstTablaProveedores?.find((element) => element.id_proveedor == this.formRegistro.value.id_proveedor)?.razon_social) === null){
      this.formRegistro.patchValue({nombre_proveedor: this.lstTablaProveedores?.find((element) => element.id_proveedor == this.formRegistro.value.id_proveedor)?.nombre_proveedor+" "+this.lstTablaProveedores?.find((element) => element.id_proveedor == this.formRegistro.value.id_proveedor)?.primer_apellido_proveedor +" "+this.lstTablaProveedores?.find((element) => element.id_proveedor == this.formRegistro.value.id_proveedor)?.segundo_apellido_proveedor});
      this.formRegistro.patchValue({nombre_representante_proveedor: " "});
    }else{
      this.formRegistro.patchValue({nombre_proveedor: this.lstTablaProveedores?.find((element) => element.id_proveedor == this.formRegistro.value.id_proveedor)?.razon_social});
      this.formRegistro.patchValue({nombre_representante_proveedor: this.lstTablaProveedores?.find((element) => element.id_proveedor == this.formRegistro.value.id_proveedor)?.nombre_representante+" "+this.lstTablaProveedores?.find((element) => element.id_proveedor == this.formRegistro.value.id_proveedor)?.primer_apellido_representante +" "+this.lstTablaProveedores?.find((element) => element.id_proveedor == this.formRegistro.value.id_proveedor)?.segundo_apellido_representante});
    }



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

  tieneExtemporaneas(): boolean {
    return this._authService.getTieneExtemporaneas();
  }

}
