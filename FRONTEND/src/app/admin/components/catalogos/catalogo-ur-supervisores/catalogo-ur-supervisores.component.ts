import { Component, OnInit } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from "../../../../components/login/auth.service";
import swal from 'sweetalert2';
import { ActivatedRoute } from '@angular/router';

import { ICatalogoUnidadResponsable } from 'src/app/interfaces/catalogos/ICatalogoUnidadResponsable';
import { CatalogoUnidadResponsableService } from 'src/app/services/catalogoUnidadResponsable.service';
import { IMsUsuarios } from 'src/app/interfaces/catalogos/IMsUsuarios';
import { ICatalogoUnidadesResponsablesUsuario } from 'src/app/interfaces/catalogos/ICatalogoUnidadesResponsablesUsuario';



@Component({
  selector: 'app-catalogo-ur-supervisores',
  templateUrl: './catalogo-ur-supervisores.component.html',
  styleUrls: ['./catalogo-ur-supervisores.component.css']
})
export class CatalogoUrSupervisoresComponent implements OnInit {

  loaderBusqueda: boolean = false;
  loaderGuardar: boolean = false;

  id_unidad_responsable: any | null;
  formRegistro: FormGroup;

  catUnidadResponsable: ICatalogoUnidadResponsable ={
    id_unidad_responsable: null,
    nombre_unidad_responsable: null,
    siglas: null,
    activo: null,
    id_tipo_unidad_responsable: null,
    cat_tipo_unidades_responsables: null
  };

  lstUsuarioSupervisor: IMsUsuarios[] | null = null;
  lstUsuariosSupervisorDisponibles: IMsUsuarios[] | null = null;
  existenUsuariosSupervisores: boolean = true;

  blnAgregar: boolean = false;

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
    this.id_unidad_responsable = Number(this._route.snapshot.paramMap.get('id_unidad_responsable')) || null;
    this.formRegistro = this.iniciarFormularioRegistro();
  }

  ngOnInit() {
    this.buscarUsuariosSupervisores();
  }

  canActivate(permiso:string): boolean {
    return this._authService.canActivateFunction(permiso);
  }

  agregar(){
    this.blnAgregar = true;
    this.messageTitle = 'Registrar Usuario Supervisor';
    this.messageSubTitle = 'Registrar un Usuario Supervisor';
    this.messageButton = 'Registrar';
    this.buscarUsuariosSupervisoresDisponibles();
    this.iniciarFormularioRegistro();
  }

  cancelar() {
    this.blnAgregar = false;
    this.formRegistro?.reset();
    this.modalRefEliminar?.close();
  }

  iniciarFormularioRegistro(id_usuario:number | null = null) {
    const formTmp: FormGroup | null = new FormGroup({
      id_unidad_responsable: new FormControl(this.id_unidad_responsable, {
        nonNullable: true,
        validators: [],
      }),
      id_usuario: new FormControl(null, [
        Validators.required,
      ]),
    });
    formTmp.patchValue({id_unidad_responsable: this.id_unidad_responsable});
    id_usuario != null ? formTmp.patchValue({id_usuario: id_usuario}) : false;
    return formTmp;
  }

  buscarUsuariosSupervisores(){
    this.loaderBusqueda = true;
    const datosBusquedaCUR: ICatalogoUnidadResponsable = {
      id_unidad_responsable: this.id_unidad_responsable,
      nombre_unidad_responsable: null,
      siglas: null,
      activo: null,
      id_tipo_unidad_responsable: null,
      cat_tipo_unidades_responsables: null
    };
    this._catalogoUnidadResponsableService.buscarUsuariosSupervisores(datosBusquedaCUR).subscribe({
      next: (response) => {
        console.log(response);
        this.lstUsuarioSupervisor = response.datos;
      },error: (err) => {
        console.info(err);
        swal.fire(err.error.mensaje,"",'error');
      },complete: () => {}
    });
  }

  buscarUsuariosSupervisoresDisponibles(){
    this.loaderBusqueda = true;
    const datosBusquedaCUR: ICatalogoUnidadResponsable = {
      id_unidad_responsable: this.id_unidad_responsable,
      nombre_unidad_responsable: null,
      siglas: null,
      activo: null,
      id_tipo_unidad_responsable: null,
      cat_tipo_unidades_responsables: null
    };
    this._catalogoUnidadResponsableService.buscarUsuariosSupervisoresDisponibles(datosBusquedaCUR).subscribe({
      next: (response) => {
        console.log(response);
        this.lstUsuariosSupervisorDisponibles = response.datos;
      },error: (err) => {
        console.info(err);
        swal.fire(err.error.mensaje,"",'error');
      },complete: () => {}
    });
  }

  guardarSubmit(){
    if(this.formRegistro == undefined || this.formRegistro.invalid){
      for (const control of Object.keys(this.formRegistro.controls)) {
        this.formRegistro.controls[control].markAsTouched();
        console.info(this.formRegistro.controls[control].errors)
      }
      return;
    }
    const datosGuardar: ICatalogoUnidadesResponsablesUsuario = this.formRegistro?.value as ICatalogoUnidadesResponsablesUsuario;
    console.log(this.formRegistro,datosGuardar);

    this._catalogoUnidadResponsableService.guardarSupervisor(datosGuardar).subscribe({
        next: (data) => {
            swal.fire(data.mensaje, "", 'success');
            this.buscarUsuariosSupervisores();
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

  eliminarModal(content: any, id_usuario: number | null){
    this.formRegistro = this.iniciarFormularioRegistro(id_usuario);
    this.modalRefEliminar = this.modalService.open(content);
  }

  eliminarSubmit(){
    this.loaderGuardar = true;
    const datosEliminar: ICatalogoUnidadesResponsablesUsuario = this.formRegistro?.value as ICatalogoUnidadesResponsablesUsuario;
    this._catalogoUnidadResponsableService.eliminarSupervisor(datosEliminar).subscribe({
      next: (response) => {
        swal.fire(response.mensaje, "", 'success');
        this.buscarUsuariosSupervisores();
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
