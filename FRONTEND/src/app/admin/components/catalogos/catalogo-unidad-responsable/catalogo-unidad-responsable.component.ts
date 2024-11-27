import { Component, OnInit } from '@angular/core';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {AuthService} from "../../../../components/login/auth.service";
import swal from 'sweetalert2';
import { ActivatedRoute } from '@angular/router';

import { ICatalogoTipoUnidadResponsable } from '../../../../interfaces/catalogos/ICatalogoTipoUnidadResponsable';
import { ICatalogoUnidadResponsable } from 'src/app/interfaces/catalogos/ICatalogoUnidadResponsable';
import { CatalogoUnidadResponsableService } from 'src/app/services/catalogoUnidadResponsable.service';


@Component({
  selector: 'app-catalogo-unidad-responsable',
  templateUrl: './catalogo-unidad-responsable.component.html',
  styleUrls: ['./catalogo-unidad-responsable.component.css']
})
export class CatalogoUnidadResponsableComponent implements OnInit {

  loaderBusqueda: boolean = false;
  loaderGuardar: boolean = false;

  formBusqueda: FormGroup;
  formRegistro: FormGroup;
  lstCatTipoUnidadResponsable: ICatalogoTipoUnidadResponsable[] | null = null;
  lstCatUnidadResponsable: ICatalogoUnidadResponsable[] | null = null;
  pageLstCatUnidadResponsable = 1;
  pageSizeLstCatUnidadResponsable = 15;

  blnAgregar: boolean = false;
  blnEditar: boolean = false;

  messageTitle: string = '';
  messageSubTitle: string = '';
  messageButton: string = '';

  modalRefEliminar:NgbModalRef|undefined;

  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private _catalogoUnidadResponsableService: CatalogoUnidadResponsableService,
    private _authService: AuthService,
    private _route: ActivatedRoute
  ) {
    this.formBusqueda = this.iniciarFormularioBusqueda();
    this.formRegistro = this.iniciarFormularioRegistro();
  }

  ngOnInit() {
    //al cargar el componente
    this.buscarCatTipoUnidadResponsable();
    this.buscarCatUnidadResponsable();
  }

  canActivate(permiso:string): boolean {
    return this._authService.canActivateFunction(permiso);
  }

  iniciarFormularioBusqueda() {
    return new FormGroup({
        descripcion_cur: new FormControl(null, [
            //Validators.minLength(3)
        ]),id_tipo_unidad_responsable: new FormControl(null, {
          //nonNullable: false,
          //validators: [],
        }),
    });
  }

  iniciarFormularioRegistro(data: ICatalogoUnidadResponsable | null = null) {
    const formTmp: FormGroup | null = new FormGroup({
        id_unidad_responsable: new FormControl(null, {
          nonNullable: true,
          validators: [],
        }),
        nombre_unidad_responsable: new FormControl('', [
          Validators.required,
          Validators.minLength(5)
        ]),
        siglas: new FormControl('', [
          Validators.required,
          Validators.minLength(1)
        ]),
        activo: new FormControl(null, {
          nonNullable: true,
          validators: [],
        }),
        id_tipo_unidad_responsable: new FormControl(null,[
          Validators.required
        ])
    });

    if (data != null) {

        if (data.id_unidad_responsable != null) {
          formTmp.patchValue({id_unidad_responsable: data.id_unidad_responsable});
        }if (data.nombre_unidad_responsable != null) {
          formTmp.patchValue({nombre_unidad_responsable: data.nombre_unidad_responsable});
        }if (data.siglas != null) {
          formTmp.patchValue({siglas: data.siglas});
        }if (data.activo != null) {
          formTmp.patchValue({activo: data.activo});
        }if(data.id_tipo_unidad_responsable != null){
          formTmp.patchValue({id_tipo_unidad_responsable: data.id_tipo_unidad_responsable});
        }
    }

    return formTmp;
  }

  buscarCatTipoUnidadResponsable(){
    this._catalogoUnidadResponsableService.buscarCatalogoTipoUnidadResponsable().subscribe({
      next: (response) => {
        this.lstCatTipoUnidadResponsable = response.datos
      },error: (err) => {
        console.info(err);
        swal.fire(err.error.mensaje,"",'error');
      },complete: () => {}
    });
  }

  buscarCatUnidadResponsable(){
    this.loaderBusqueda = true;
    const datosBusquedaCUR: ICatalogoUnidadResponsable = this.formBusqueda?.value as ICatalogoUnidadResponsable;
    this._catalogoUnidadResponsableService.buscarCatalogoUnidadResponsable(datosBusquedaCUR).subscribe({
      next: (response) => {
        console.log(response.datos);
        this.lstCatUnidadResponsable = response.datos;
      },error: (err) => {
        console.info(err);
        swal.fire(err.error.mensaje,"",'error');
        this.loaderBusqueda = false;
      },complete: () => {
        this.loaderBusqueda = false;
      }
    });
  }

  agregar(){
    this.blnAgregar = true;
    this.messageTitle = 'Registrar Unidad Responsable';
    this.messageSubTitle = 'Registrar una Unidad Responsable';
    this.messageButton = 'Registrar';

    this.formRegistro = this.iniciarFormularioRegistro();
    this.formRegistro.controls['id_unidad_responsable'].setValidators(null);
    this.formRegistro.controls['activo'].setValidators(null);
    this.formRegistro.updateValueAndValidity();
  }

  editar(datos: ICatalogoUnidadResponsable){
    this.blnEditar = true;
    this.messageTitle = 'Editar Unidad Responsable';
    this.messageSubTitle = 'Editar una Unidad Responsable';
    this.messageButton = 'Actualizar';

    this.formRegistro = this.iniciarFormularioRegistro(datos);
  }

  cancelar() {
    this.blnEditar = false;
    this.blnAgregar = false;
    this.formRegistro?.reset();
    this.modalRefEliminar?.close();
  }

  guardarSubmit(){
    if(this.formRegistro == undefined || this.formRegistro.invalid){
      for (const control of Object.keys(this.formRegistro.controls)) {
        this.formRegistro.controls[control].markAsTouched();
        console.info(this.formRegistro.controls[control].errors)
      }
      return;
    }
    const datosGuardar: ICatalogoUnidadResponsable = this.formRegistro?.value as ICatalogoUnidadResponsable;

    this._catalogoUnidadResponsableService.guardarCatalogo(datosGuardar).subscribe({
        next: (data) => {
            swal.fire(data.mensaje, "", 'success');
            this.buscarCatUnidadResponsable();
        },
        error: (err) => {
            console.info(err);
            this.loaderGuardar = false;
            swal.fire(err.error.mensaje, "", 'error');
        },
        complete: () => {
            this.loaderGuardar = false;
            this.cancelar();
        }
    });
  }

  eliminarModal(content: any, datos: ICatalogoUnidadResponsable){
    this.formRegistro = this.iniciarFormularioRegistro(datos);
    this.modalRefEliminar = this.modalService.open(content);
  }

  eliminarSubmit(){
    this.loaderGuardar = true;
    const datosEliminar: ICatalogoUnidadResponsable = this.formRegistro?.value as ICatalogoUnidadResponsable;
    datosEliminar.activo = false;
    this._catalogoUnidadResponsableService.cambiarEstatus(datosEliminar).subscribe({
      next: (response) => {
        swal.fire(response.mensaje, "", 'success');
        this.buscarCatUnidadResponsable();
      },error: (err) => {
        console.info(err);
        swal.fire(err.error.mensaje,"",'error');
        this.loaderGuardar = false;
      },complete: () => {
        this.loaderGuardar = false;
        this.cancelar();
      }
    });
  }

}
