import { Component, EventEmitter, Input, OnInit, Output, ChangeDetectorRef, Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbCalendar, NgbDate, NgbDateAdapter, NgbDateParserFormatter, NgbDateStruct, NgbDatepickerConfig, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/components/login/auth.service';
import { IFilesUpload } from 'src/app/interfaces/comun/IFilesUpload';
import { IBusquedaParticipante } from 'src/app/interfaces/convocantes/IBusquedaParticipantes';
import { IParticipanteProcedimiento } from 'src/app/interfaces/convocantes/IParticipanteProcedimiento';
import { IProcedimientoAdministrativo } from 'src/app/interfaces/convocantes/IProcedimientoAdministrativo';
import { ConvocantesService } from 'src/app/services/convocantes.service';
import swal from 'sweetalert2';
import { getBase64 } from '../../../enums/getBase64-util';
import { IContrato } from 'src/app/interfaces/convocantes/IContrato';
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
  selector: 'app-agregar-contrato',
  templateUrl: './agregar-contrato.component.html',
  styleUrls: ['./agregar-contrato.component.css'],
  providers: [
    { provide: NgbDateAdapter, useClass: CustomAdapter },
    { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter}
  ]
})
export class AgregarContratoComponent implements OnInit{

  @Input() public __procedimientoElegido: IProcedimientoAdministrativo | null = null;

  @Output() public _cancelarAgregarContrato = new EventEmitter();

  loaderGuardar: boolean = false;
  blnMostrarArchivoConvenio = false;

  formContrato: FormGroup;
  formBusquedaParticipantes: FormGroup;

  archivoContrato!: IFilesUpload | any;
  archivoConvenio!: IFilesUpload | any;

  lstTablaParticipantes: IParticipanteProcedimiento[]  | null = null;

  modalRefCancelarAgregar:NgbModalRef|undefined;
  modalRefConfirmarGuardar:NgbModalRef|undefined;

  loaderBusqueda: boolean = false;
  listDiasFestivos: any;

  datePickerJson = {};
  json = {
    disable: [6, 7],
    disabledDates: [
      { year: 1900, month: 10, day: 19 }
    ]
  };
  isDisabled;

  minPickerDate = {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    day: new Date().getDate()
  };

  constructor(
    private fb: FormBuilder,
    private _convocantesService: ConvocantesService,
    private _authService: AuthService,
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef,
    private config: NgbDatepickerConfig,
    private calendar: NgbCalendar,
    private _diasFestivosService: CatalogoDiasFestivosService
  ) {

    this.formContrato = this.iniciarFormularioContrato();
    this.formBusquedaParticipantes = this.iniciarFormularioBusquedaParticipantes();

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
    
        
  }

  
  iniciarFormularioContrato(data: IProcedimientoAdministrativo | null = null) {
    const formTmp: FormGroup | null = new FormGroup({
      id_procedimiento_administrativo: new FormControl(null, {
        nonNullable: true,
        validators: [],
      }),
      id_participante_procedimiento: new FormControl(null, {
        nonNullable: true,
        validators: [],
      }),
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
      contrato_generado: new FormControl('', [
        Validators.required
      ]),
      convenio_modificatorio: new FormControl('', [
        Validators.required
      ]),
      archivo_convenio_modificatorio: new FormControl('', [
        
      ])       
    });

    
    return formTmp;
  }


  iniciarFormularioBusquedaParticipantes() {
    const formTmp: FormGroup | null = new FormGroup({
        id_procedimiento_administrativo: new FormControl('', [
        ])
    });
    return formTmp;
  }

  llenarCatalogos(){

    this.formBusquedaParticipantes.patchValue({id_procedimiento_administrativo: this.__procedimientoElegido?.id_procedimiento_administrativo});
    const datosBusquedaParticipantes: IBusquedaParticipante = this.formBusquedaParticipantes?.value as IBusquedaParticipante;

    this.loaderBusqueda = true;
    this._convocantesService.buscarParticipantesGanadores(datosBusquedaParticipantes).subscribe({
      next: (data) => {
          this.lstTablaParticipantes = data.datos;
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
    });

  }

  guardarSubmit() {

      this.formContrato.patchValue({id_procedimiento_administrativo: this.__procedimientoElegido?.id_procedimiento_administrativo});
      
      const datosGuardar: IContrato = this.formContrato?.value as IContrato;
  
      datosGuardar.archivo_contrato = this.archivoContrato;
      datosGuardar.archivo_convenio = this.archivoConvenio;
      
      this._convocantesService.guardarContratoProcedimientoAdministrativo(datosGuardar).subscribe({
          next: (data) => {
              swal.fire(data.mensaje, "", 'success');
              this.cancelarAgregarContrato();
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

    cancelarAgregarContrato() {
      this.cancelarCancelarAgregarContratoModal();
      this._cancelarAgregarContrato.emit();
      
    }

    cancelarCancelarAgregarContratoModal() {
      this.modalRefCancelarAgregar?.close();
    }

    cancelarConfirmarGuardarSubmitModal() {
      this.modalRefConfirmarGuardar?.close();
    }

    cancelarAgregarContratoModal(content: any) {
      this.modalRefCancelarAgregar = this.modalService.open(content);
    }

    confirmarGuardarSubmitModal(content: any) {
      this.modalRefConfirmarGuardar = this.modalService.open(content);
    }
    
  obtenerArchivoContratoBase64(event: any) {
    this.archivoContrato = null;
    let files = event.target.files;
    let archivo = files[0];

    if (files && archivo) {
      getBase64(archivo)
        .then((data64) => {
          this.archivoContrato = {
            base64: String(data64),
            nombreArchivo: archivo.name,
            procedimiento: this.__procedimientoElegido?.id_unidad_compradora,
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

   
  obtenerArchivoConvenioBase64(event: any) {
    this.archivoConvenio = null;
    let files = event.target.files;
    let archivo = files[0];

    if (files && archivo) {
      getBase64(archivo)
        .then((data64) => {
          this.archivoConvenio = {
            base64: String(data64),
            nombreArchivo: archivo.name,
            procedimiento: this.__procedimientoElegido?.id_unidad_compradora,
            tipoArchivo: 1,
            encriptar: false
          } 
          this.archivoConvenio.base64 = this.archivoConvenio.base64?.replace(
            /^data:.+;base64,/,
            ''
          );
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }

  seleccionarConvenioModificatorio(){

    if(this.formContrato?.value.convenio_modificatorio){
      this.blnMostrarArchivoConvenio = true;
      this.formContrato.controls['archivo_convenio_modificatorio'].setValidators([Validators.required]);
    }else{
      this.blnMostrarArchivoConvenio = false;
      this.formContrato.get('archivo_convenio_modificatorio')?.clearValidators();
      this.formContrato.get('archivo_convenio_modificatorio')?.setErrors(null); 
      this.formContrato.get('archivo_convenio_modificatorio')?.updateValueAndValidity();
    }

  }

  ngAfterViewChecked(){
    this.cdr.detectChanges();
  }

}
