import { Component } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/components/login/auth.service';
import { CatalogoTipoArchivoService } from 'src/app/services/catalogoTipoArchivo.service';
import {
  ICatalogoTipoArchivo,
  ICatalogoTipoArchivoBusqueda,
} from 'src/app/interfaces/catalogos/ICatalogoTipoArchivo';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-catalogo-conceptos',
  templateUrl: './catalogo-conceptos.component.html',
  styleUrls: ['./catalogo-conceptos.component.css'],
})
export class CatalogoConceptosComponent {
  list_conceptos: ICatalogoTipoArchivo[] = [];
  formBusqueda: FormGroup;
  formRegistro: FormGroup;
  loaderBusqueda: boolean = false;
  agregarConcepto: boolean = false;
  editarConcepto: boolean = false;
  conceptoEdit: ICatalogoTipoArchivo | any;
  conceptoDelete: ICatalogoTipoArchivo | any;
  messageTitle: string = '';
  messageSubTitle: string = '';
  messageButton: string = '';
  blnMsgRed: boolean = false;
  loaderGuardar: boolean = false;

  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private _authService: AuthService,
    private _tipoArchivo: CatalogoTipoArchivoService
  ) {
    this.formBusqueda = this.iniciarFormularioBusqueda();
    this.formRegistro = this.iniciarFormularioRegistro();
  }


  get nombreTipoArchivoForm() {
    return this.formRegistro.get('nombre_tipo_archivo');
  }

  get caracterForm(){
    return this.formRegistro.get('caracter');
  }

  iniciarFormularioBusqueda() {
    return new FormGroup({
      nombre_tipo_archivo: new FormControl(null, [Validators.minLength(3)]),
      caracter: new FormControl(null),
      activo: new FormControl(null),
    });
  }

  iniciarFormularioRegistro(data: ICatalogoTipoArchivo | null = null) {
    const formTmp: FormGroup | null = new FormGroup({
      id_tipo_archivo: new FormControl(null, {
        nonNullable: true,
        validators: [],
      }),
      nombre_tipo_archivo: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
      ]),
      caracter: new FormControl(null, [Validators.required]),
      activo: new FormControl(null),
    });

    if (data != null) {
      if (data.id_tipo_archivo != null) {
        formTmp.patchValue({ id_tipo_archivo: data.id_tipo_archivo });
      }

      if (data.nombre_tipo_archivo != null) {
        formTmp.patchValue({ nombre_tipo_archivo: data.nombre_tipo_archivo });
      }

      if (data.caracter != null) {
        formTmp.patchValue({ caracter: data.caracter });
      }

      if (data.activo != null) {
        formTmp.patchValue({ activo: data.activo });
      }
    }

    return formTmp;
  }

  ngOnInit() {
    this.loaderBusqueda = true;
    this._tipoArchivo.getTipoArchivos().subscribe({
      next: (data) => {
        this.list_conceptos = data.datos;
      },
      error: (err) => {
        Swal.fire(err.error.mensaje, '', 'error');
        this.loaderBusqueda = false;
      },
      complete: () => {
        this.loaderBusqueda = false;
      }
    });
  }

  canActivate(permiso: string): boolean {
    return this._authService.canActivateFunction(permiso);
  }

  buscarSubmit() {
    this.loaderBusqueda = true;

    if (this.formBusqueda?.invalid) {
      for (const control of Object.keys(this.formBusqueda.controls)) {
        this.formBusqueda.controls[control].markAsTouched();
      }
      return;
    }

    const datosBusqueda: ICatalogoTipoArchivoBusqueda = this.formBusqueda
      ?.value as ICatalogoTipoArchivoBusqueda;
    this._tipoArchivo.getTipoArchivos(datosBusqueda).subscribe({
      next: (data) => {
        this.list_conceptos = data.datos;
      },
      error: (err) => {
        console.info(err);
        Swal.fire(err.error.mensaje, '', 'error');
        this.loaderBusqueda = false;
      },
      complete: () => {
        this.loaderBusqueda = false;
      },
    });
  }

  /**
   *
   * @param content Mostrar modal de eliminación
   * @param datosConcepto
   */
  deleteConcepto(content: any, datosConcepto: ICatalogoTipoArchivo) {
    this.conceptoDelete = datosConcepto;
    if (this.conceptoDelete.enUso){
      this.blnMsgRed = true;
    }else{
      this.blnMsgRed = false;
    }
    this.modalService.open(content);
  }

  /**
   * Mostrar formulario de registro
   */
  addConcepto() {
    this.agregarConcepto = true;
    this.messageTitle = 'Agregar Concepto';
    this.messageSubTitle = 'Agregar un concepto nuevo';
    this.messageButton = 'Registrar';
  }

  /**
   * Metodo para mostrar formulario y setear los datos del elemento en el
   * @param concepto (datos del elemento)
   */
  editConcepto(concepto: ICatalogoTipoArchivo) {
    this.editarConcepto = true;
    this.conceptoEdit = concepto;
    this.messageTitle = 'Editar Concepto';
    this.messageSubTitle = 'Editar un concepto';
    this.messageButton = 'Actualizar';
    this.formRegistro = this.iniciarFormularioRegistro(concepto);
  }

  /**
   * Ocultar formulario y mostrar tablero con listado
   */
  redireccionar() {
    this.agregarConcepto = false;
    this.editarConcepto = false;
    this.formRegistro.reset();
  }

  /**
   * Metodo para guardar o editar los datos del formulario
   */
  guardarSubmit() {
    if (this.formRegistro == undefined || this.formRegistro.invalid) {
      for (const control of Object.keys(this.formRegistro?.controls)) {
        this.formRegistro.controls[control].markAsTouched();
      }
      return;
    }

    this.loaderGuardar = true;
    const datosGuardar: ICatalogoTipoArchivo = this.formRegistro
      ?.value as ICatalogoTipoArchivo;

    this._tipoArchivo.guardarTipoArchivo(datosGuardar).subscribe({
      next: (data) => {
        Swal.fire(data.mensaje, '', 'success');
        this.buscarSubmit();
      },
      error: (err) => {
        this.loaderGuardar = false;
        Swal.fire(err.error.mensaje, '', 'error');
      },
      complete: () => {
        this.loaderGuardar = false;
        this.redireccionar();
      },
    });
  }

  /**
   * Metodo para confirmar la eliminación del elemento
   * @param this.conceptoDelete (datos del elemento)
   *
   */
  deleteConfirm() {
    const params = {
      id_tipo_archivo: this.conceptoDelete.id_tipo_archivo,
      enUso: this.conceptoDelete.enUso
    }
    this._tipoArchivo.cambiarEstatus(params).subscribe({
      next: (data)=>{
        Swal.fire(data.mensaje,'','success');
      },
      error: (err)=> {
        console.info(err);
        Swal.fire('Ha ocurrido un error','','error');
      },
      complete: ()=> {
        this.modalService.dismissAll();
        this.borrarFiltros();
      }
    })
    
  }

  borrarFiltros() {
    const params: ICatalogoTipoArchivoBusqueda = {
      nombre_tipo_archivo: null,
      caracter: null,
      activo: null,
    };
    this.loaderBusqueda = true;
    this._tipoArchivo.getTipoArchivos(params).subscribe({
      next: (data) => {
        this.list_conceptos = data.datos;
      },
      error: (err) => {
        Swal.fire(err.error.mensaje, '', 'error');
        this.loaderBusqueda = false;
      },
      complete: () => {
        this.formBusqueda?.reset();
        this.loaderBusqueda = false;
      }
    });
  }
}
