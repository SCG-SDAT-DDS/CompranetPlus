import { Component, OnInit } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {AuthService} from "../../../../components/login/auth.service";
import swal from 'sweetalert2';
import { ActivatedRoute } from '@angular/router';

import { ICatalogoUnidadCompradora } from 'src/app/interfaces/catalogos/ICatalogoUnidadCompradora';
import { CatalogoUnidadCompradoraService } from 'src/app/services/catalogoUnidadCompradora.service';
import { ICatalogoUnidadResponsable } from '../../../../interfaces/catalogos/ICatalogoUnidadResponsable';
import { CatalogoUnidadResponsableService } from 'src/app/services/catalogoUnidadResponsable.service';
import { CatalogoAsentamientoService } from 'src/app/services/catalogoAsentamiento.service';

@Component({
  selector: 'app-catalogo-unidad-compradora',
  templateUrl: './catalogo-unidad-compradora.component.html',
  styleUrls: ['./catalogo-unidad-compradora.component.css']
})
export class CatalogoUnidadCompradoraComponent implements OnInit {

  loaderBusqueda: boolean = false;
  loaderGuardar: boolean = false;

  formBusqueda: FormGroup;
  formRegistro: FormGroup;
  catUnidadCompradora: ICatalogoUnidadCompradora = {
    id_unidad_compradora: null,
    nombre_unidad_compradora: null,
    clave_unidad_compradora: null,
    id_unidad_responsable: null,
    id_tipo_unidad_responsable: null,
    tipo_unidad_responsable: null,
    pagina_web: null,
    nombre_vialidad: null,
    id_estado: null,
    id_municipio: null,
    codigo_postal: null,
    nombre_responsable: null,
    puesto: null,
    correo: null,
    telefono: null,
    activo: null,
    cat_unidades_responsables: null
  };
  lstCatUnidadCompradora: ICatalogoUnidadCompradora[] | null = null;
  lstCatUnidadesResponsables: ICatalogoUnidadResponsable[] | null = null;

  pageLstCatUnidadCompradora = 1;
  pageSizeLstCatUnidadcompradora = 15;

  blnAgregar: boolean = false;
  blnEditar: boolean = false;

  messageTitle: string = '';
  messageSubTitle: string = '';
  messageButton: string = '';

  modalRefEliminar:NgbModalRef|undefined;

  //paramentro para el parametro de la ruta
  id_unidad_responsable: any | null;
  private sub: any;
  loaderBuscarCP: boolean = false;
  estado_selected: { id_estado: any; nombre_estado: any };
  municipio_selected: { id_municipio: any; nombre_municipio: any };
  lst_cat_asentamientos: any;
  respUnidadCompradora: any;


  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private _catalogoUnidadCompradoraService : CatalogoUnidadCompradoraService,
    private _catalogoUnidadResponsableService: CatalogoUnidadResponsableService,
    private _authService: AuthService,
    private _route: ActivatedRoute,
    private _cp: CatalogoAsentamientoService,
  ) {
    //para habilitar el filtro por si llega por unidad responsable
    this.id_unidad_responsable = Number(this._route.snapshot.paramMap.get('id_unidad_responsable')) || null;
    this.formBusqueda = this.iniciarFormularioBusqueda();
    this.formRegistro = this.iniciarFormularioRegistro();
    this.formBusqueda.patchValue({
      id_unidad_responsable: this.id_unidad_responsable
    });
    if(this.id_unidad_responsable){
      this.formBusqueda.get('id_unidad_responsable')?.disable({ onlySelf: true });
    }

    this.estado_selected = { id_estado: null, nombre_estado: null };
    this.municipio_selected = { id_municipio: null, nombre_municipio: null };
  }

  ngOnInit() {
    this.buscarCatUnidadResponsable();
    this.buscarCatUnidadCompradora();
  }

  canActivate(permiso:string): boolean {
    return this._authService.canActivateFunction(permiso);
  }

  iniciarFormularioBusqueda() {
    return new FormGroup({
        descripcion_cuc: new FormControl(null, [
            //Validators.minLength(3)
        ]),id_unidad_responsable: new FormControl(this.id_unidad_responsable, {
          //nonNullable: false,
          //validators: [],
        }),
    });
  }

  iniciarFormularioRegistro(data: ICatalogoUnidadCompradora | null = null) {
    const formTmp: FormGroup | null = new FormGroup({
      id_unidad_compradora: new FormControl(null, {
        nonNullable: true,
        validators: [],
      }),
      nombre_unidad_compradora: new FormControl('', [
        Validators.required,
        Validators.minLength(5)
      ]),
      clave_unidad_compradora: new FormControl('', [
        Validators.required,
        Validators.minLength(9)
      ]),
      id_unidad_responsable: new FormControl(null, [
        Validators.required,
      ]),
      codigo_postal: new FormControl(null, [Validators.required]),
      id_municipio: new FormControl({value: '',disabled: true}),
      id_estado: new FormControl({value: '',disabled: true}),
      nombre_vialidad: new FormControl('', [Validators.required]),
      pagina_web: new FormControl(null, [Validators.required]),
      responsable: new FormControl(null, [Validators.required]),
      correo: new FormControl(null, [Validators.required]),
      telefono: new FormControl(null, [Validators.required]),
      puesto: new FormControl(null, [Validators.required]),
      activo: new FormControl(null, {
        nonNullable: true,
        validators: [],
      })
    });

    if (data != null) {

        if (data.id_unidad_compradora != null) {
          formTmp.patchValue({id_unidad_compradora: data.id_unidad_compradora});
        }

        if (data.nombre_unidad_compradora != null) {
          formTmp.patchValue({nombre_unidad_compradora: data.nombre_unidad_compradora});
        }

        if (data.clave_unidad_compradora != null) {
          formTmp.patchValue({clave_unidad_compradora: data.clave_unidad_compradora});
        }


        if (data.id_municipio != null) {
          formTmp.patchValue({ id_municipio: data.id_municipio });
        }

        if (data.id_estado != null) {
          formTmp.patchValue({ id_estado: data.id_estado });
        }

        if (data.nombre_vialidad != null) {
          formTmp.patchValue({ nombre_vialidad: data.nombre_vialidad });
        }

        if (data.codigo_postal != null) {
          formTmp.patchValue({ codigo_postal: data.codigo_postal });
        }

        if (data.pagina_web != null) {
          formTmp.patchValue({ pagina_web: data.pagina_web });
        }

        if (data.nombre_responsable != null) {
          formTmp.patchValue({ responsable: data.nombre_responsable });
        }

        if (data.puesto != null) {
          formTmp.patchValue({ puesto: data.puesto });
        }

        if (data.correo != null) {
          formTmp.patchValue({ correo: data.correo });
        }

        if (data.telefono != null) {
          formTmp.patchValue({ telefono: data.telefono });
        }

        if (data.activo != null) {
          formTmp.patchValue({activo: data.activo});
        }

        if (data.id_unidad_responsable != null) {
          formTmp.patchValue({id_unidad_responsable: data.id_unidad_responsable});
        }
    }

    return formTmp;
  }

  buscarCatUnidadResponsable(){
    const datosBusquedaCUR: ICatalogoUnidadResponsable = {
      id_unidad_responsable:  null,
      nombre_unidad_responsable:  null,
      siglas: null,
      activo:  null,
      id_tipo_unidad_responsable : null,
      cat_tipo_unidades_responsables :  null,
    };
    this._catalogoUnidadResponsableService.buscarCatalogoUnidadResponsable(datosBusquedaCUR).subscribe({
      next: (response) => {
        this.lstCatUnidadesResponsables = response.datos;
      },error: (err) => {
        console.info(err);
        swal.fire(err.error.mensaje,"",'error');
      },complete: () => {}
    });
  }

  buscarCatUnidadCompradora(){
    this.loaderBusqueda = true;
    const datosBusquedaCUC: ICatalogoUnidadCompradora = this.formBusqueda?.value as ICatalogoUnidadCompradora;
    if(this.id_unidad_responsable){
      datosBusquedaCUC.id_unidad_responsable = this.id_unidad_responsable;
    }

    this._catalogoUnidadCompradoraService.buscarCatalogo(datosBusquedaCUC).subscribe({
      next: (response) => {
        this.lstCatUnidadCompradora = response.datos;
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
    this.messageTitle = 'Registrar Unidad Compradora';
    this.messageSubTitle = 'Registrar una Unidad Compradora';
    this.messageButton = 'Registrar';

    this.formRegistro = this.iniciarFormularioRegistro();
    this.formRegistro.controls['id_unidad_compradora'].setValidators(null);
    this.formRegistro.controls['activo'].setValidators(null);
    this.formRegistro.updateValueAndValidity();
    this.formRegistro.patchValue({
      id_unidad_responsable: this.id_unidad_responsable
    });
    if(this.id_unidad_responsable){
      this.formRegistro.get('id_unidad_responsable')?.disable();
    }
  }

  editar(datos: ICatalogoUnidadCompradora){
    this.blnEditar = true;
    this.messageTitle = 'Editar Unidad Compradora';
    this.messageSubTitle = 'Editar una Unidad Compradora';
    this.messageButton = 'Actualizar';

    this.formRegistro = this.iniciarFormularioRegistro(datos);
    this.buscarPorCodigoPostal(Number(datos.codigo_postal));
  }

  cancelar() {
    this.blnEditar = false;
    this.blnAgregar = false;
    this.formRegistro?.reset();
    this.modalRefEliminar?.close();
    this.estado_selected = { id_estado: null, nombre_estado: null };
    this.municipio_selected = { id_municipio: null, nombre_municipio: null };
  }

  guardarSubmit(){
    if(this.formRegistro == undefined || this.formRegistro.invalid){
      for (const control of Object.keys(this.formRegistro.controls)) {
        this.formRegistro.controls[control].markAsTouched();
        console.info(this.formRegistro.controls[control].errors)
      }
      return;
    }
    const datosGuardar: ICatalogoUnidadCompradora = this.formRegistro?.value as ICatalogoUnidadCompradora;
    if(this.id_unidad_responsable){
      datosGuardar.id_unidad_responsable = this.id_unidad_responsable;
    }
    datosGuardar.id_estado = this.estado_selected.id_estado;
    datosGuardar.id_municipio = this.municipio_selected.id_municipio;
    this._catalogoUnidadCompradoraService.guardarCatalogo(datosGuardar).subscribe({
        next: (data) => {
            swal.fire(data.mensaje, "", 'success');
            this.buscarCatUnidadCompradora();
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

  eliminarModal(content: any, datos: ICatalogoUnidadCompradora){
    this.formRegistro = this.iniciarFormularioRegistro(datos);
    this.modalRefEliminar = this.modalService.open(content);
  }

  eliminarSubmit(){
    this.loaderGuardar = true;
    const datosEliminar: ICatalogoUnidadCompradora = this.formRegistro?.value as ICatalogoUnidadCompradora;
    datosEliminar.activo = false;
    this._catalogoUnidadCompradoraService.cambiarEstatus(datosEliminar).subscribe({
      next: (response) => {
        swal.fire(response.mensaje, "", 'success');
        this.buscarCatUnidadCompradora();
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


  buscarPorCodigoPostal(cp?: number) {
    if (this.formRegistro.value.codigo_postal == undefined || this.formRegistro.value.codigo_postal.invalid) {
      swal.fire('Ingrese un código postal valido', '', 'error');
    } else {
      this.loaderBuscarCP = true;
      const cp = Number(this.formRegistro.value.codigo_postal);
      this._cp.obtenerDatosByCP(cp).subscribe({
        next: (data) => {
          this.estado_selected = {
            id_estado: data.datos.id_estado,
            nombre_estado: data.datos.nombre_estado,
          };
          this.municipio_selected = {
            id_municipio: data.datos.id_municipio,
            nombre_municipio: data.datos.nombre_municipio,
          };
          this.lst_cat_asentamientos = data.datos.asentamientos;
          if (data.datos?.mensaje) {
            swal.fire(data.datos.mensaje, '', 'error');
          }
        },
        error: (err) => {
          swal.fire('Se produjo un error', '', 'error');
          this.loaderBuscarCP = false;
        },
        complete: () => {
          this.loaderBuscarCP = false;
        },
      });
    }
  }

}
