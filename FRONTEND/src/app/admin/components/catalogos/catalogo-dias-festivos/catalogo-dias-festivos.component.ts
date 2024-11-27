import { Component, Injectable, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbDateAdapter, NgbDateParserFormatter, NgbDateStruct, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/components/login/auth.service';
import { ICatalogoDiaFestivo } from 'src/app/interfaces/catalogos/ICatalogoDiaFestivo';
import { CatalogoDiasFestivosService } from 'src/app/services/catalogoDiasFestivos.service';
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
  selector: 'app-catalogo-dias-festivos',
  templateUrl: './catalogo-dias-festivos.component.html',
  styleUrls: ['./catalogo-dias-festivos.component.css'],
  providers: [
    { provide: NgbDateAdapter, useClass: CustomAdapter },
    { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter}
  ]
})
export class CatalogoDiasFestivosComponent implements OnInit {
  page = 1;
  pageSize = 0;
  collectionSize = 0;

  eliminado: boolean = false;
  editar: boolean = false;
  agregar: boolean = false;

  formRegistro: FormGroup;
  formBusqueda: FormGroup;

  loaderGuardar: boolean = false;
  loaderBusqueda: boolean = false;

  modalRefEliminar: NgbModalRef | undefined;

  lstDias: ICatalogoDiaFestivo[] | null = null;

  constructor(
    private modalService: NgbModal,
    private _authService: AuthService,
    private _diasFestivosService: CatalogoDiasFestivosService
  ) {
    this.formRegistro = this.iniciarFormularioRegistro();
    this.formBusqueda = this.iniciarFormularioBusqueda();
  }

  ngOnInit() {
    this.obtenerDias();
  }

  iniciarFormularioRegistro(data: ICatalogoDiaFestivo | null = null) {
    const formTmp: FormGroup | null = new FormGroup({
      id_dia_festivo: new FormControl(null, {
        nonNullable: true,
        validators: [],
      }),
      nombre_dia_festivo: new FormControl(null, [
          Validators.minLength(3), 
          Validators.required
      ]),
      fecha_dia_festivo: new FormControl(null,[
        Validators.required
      ]),
      activo: new FormControl(null,[
        Validators.required
      ]),
    });

    if (data != null) {

      if (data.id_dia_festivo != null) {
          formTmp.patchValue({id_dia_festivo: data.id_dia_festivo});
      }

      if (data.nombre_dia_festivo != null) {
          formTmp.patchValue({nombre_dia_festivo: data.nombre_dia_festivo});
      }

      if (data.fecha_dia_festivo != null) {
          formTmp.patchValue({fecha_dia_festivo: data.fecha_dia_festivo});
      }

      if (data.activo != null) {
        formTmp.patchValue({activo: data.activo});
      }
    }

    return formTmp;
  }

  get fecha() { return this.formRegistro.get('fecha_dia_festivo'); }
  get activo() { return this.formRegistro.get('activo'); }
  get nombre() { return this.formRegistro.get('nombre_dia_festivo'); }

  iniciarFormularioBusqueda() {
    return new FormGroup({
      nombre_dia_festivo: new FormControl(null, [
        Validators.minLength(3)
      ]),
      activo: new FormControl(null),
      fecha_dia_festivo: new FormControl(null)
    });
  }

  obtenerDias(getByInput?: boolean) {
    this.loaderBusqueda = true;

    if (this.formBusqueda?.invalid) {
        for (const control of Object.keys(this.formBusqueda.controls)) {
            this.formBusqueda.controls[control].markAsTouched();
            console.info(this.formBusqueda.controls[control].errors);
        }
        return;
    }

    const datosBusqueda: ICatalogoDiaFestivo = this.formBusqueda?.value as ICatalogoDiaFestivo;
    datosBusqueda.page = this.page;

    if (getByInput) datosBusqueda.pageSize = this.pageSize;

    this._diasFestivosService.obtenerDiasFestivos(datosBusqueda).subscribe({
      next: (res) => {
        let { data, total, per_page } = res.datos;
        this.lstDias = data;

        if (this.lstDias !== null) {
          this.collectionSize = total;
          this.pageSize = per_page;
        }
      },
      error: (err) => {
          console.info(err)
          Swal.fire(err.error.mensaje, "", 'error');
      },
      complete: () => {
          this.loaderBusqueda = false;
      }
    });
  }
  
  agregarDia() { this.agregar = true; }

  editarDia(datos: ICatalogoDiaFestivo) { 
    this.editar = true;
    this.formRegistro = this.iniciarFormularioRegistro(datos);
  }

  guardarDia() {
    if (
      this.formRegistro == undefined ||
      this.formRegistro.invalid
    ) {
      for (const control of Object.keys(this.formRegistro.controls)) {
        this.formRegistro.controls[control].markAsTouched();
      }
      Swal.fire('Hay campos obligatorios sin llenar', '', 'error');
      return;
    }
    
    const datosGuardar: ICatalogoDiaFestivo = this.formRegistro?.value as ICatalogoDiaFestivo;
    datosGuardar.activo = datosGuardar.activo == 1 ? true : false;
    
    this._diasFestivosService.guardarDia(datosGuardar).subscribe({
      next: (data) => {
          Swal.fire(this.editar ? '¡La información se actualizó correctamente!': data.mensaje, "", 'success');
          this.obtenerDias();
      },
      error: (err) => {
          console.info(err)
          Swal.fire(err.error.mensaje, "", 'error');
      },
      complete: () => {
          this.loaderGuardar = false;
          this.cancelarRegistro();
      }
    });

  }

  eliminar() {
    this.loaderGuardar = true;

    const datosEliminar: ICatalogoDiaFestivo = this.formRegistro?.value as ICatalogoDiaFestivo;
    datosEliminar.activo = false;

    this._diasFestivosService.cambiarEstatusDiaFestivo(datosEliminar).subscribe({
        next: (data) => {
           Swal.fire(data.mensaje, "", 'success');
           this.obtenerDias();
        },
        error: (err) => {
            console.info(err)
            Swal.fire(err.error.mensaje, "", 'error');
        },
        complete: () => {
            this.loaderGuardar = false;
            this.cancelarRegistro();
        }
    });
  }

  filtrarDias() {
    this.page = 1;
    this.obtenerDias();
  }

  resetFiltro() {
    this.formBusqueda.reset();
    this.obtenerDias();
  }

  openModalEliminar(modal: any, datos: ICatalogoDiaFestivo) {
    this.formRegistro = this.iniciarFormularioRegistro(datos);
    this.modalRefEliminar = this.modalService.open(modal);
  }

  cancelarRegistro(){
    this.editar = false;
    this.agregar = false;
    this.formRegistro?.reset();
    this.modalRefEliminar?.close();
  }

  canActivate(permiso:string): boolean {
    return this._authService.canActivateFunction(permiso);
  }
}
