import { Component, OnInit } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from "../../../../components/login/auth.service";
import swal from 'sweetalert2';
import { ActivatedRoute } from '@angular/router';

import { ICatalogoUnidadCompradora } from 'src/app/interfaces/catalogos/ICatalogoUnidadCompradora';
import { IMsUsuarios } from 'src/app/interfaces/catalogos/IMsUsuarios';
import { CatalogoUnidadCompradoraService } from 'src/app/services/catalogoUnidadCompradora.service';
import { ICatalogoUnidadesCompradorasUsuario } from 'src/app/interfaces/catalogos/ICatalogoUnidadesCompradorasUsuario';



@Component({
  selector: 'app-catalogo-uc-usuario',
  templateUrl: './catalogo-uc-usuario.component.html',
  styleUrls: ['./catalogo-uc-usuario.component.css']
})
export class CatalogoUcUsuarioComponent implements OnInit {

  loaderBusqueda: boolean = false;
  loaderGuardar: boolean = false;

  id_unidad_compradora: any | null;
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

  lstUsuario: IMsUsuarios[] | null = null;
  lstUsuariosDisponibles: IMsUsuarios[] | any;
  existenUsuariosDisponibles: boolean = true;

  blnAgregar: boolean = false;

  messageTitle: string = '';
  messageSubTitle: string = '';
  messageButton: string = '';

  modalRefEliminar:NgbModalRef|undefined;

  id_unidad_responsable: any | null;
  selectedUser: any;

  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private _catalogoUnidadCompradoraService: CatalogoUnidadCompradoraService,
    private _authService: AuthService,
    private _route: ActivatedRoute
  ) {
    this.id_unidad_compradora = Number(this._route.snapshot.paramMap.get('id_unidad_compradora')) || null;
    this.catUnidadCompradora.id_unidad_compradora = Number(this._route.snapshot.paramMap.get('id_unidad_compradora')) || null;
    this.id_unidad_responsable = Number(this._route.snapshot.paramMap.get('id_unidad_responsable')) || null;
    this.formRegistro = this.iniciarFormularioRegistro();
    this.buscarCatUnidadCompradora();//para actualizar los datos de la unidad  compradora que se agregaran los datos
  }

  ngOnInit() {
    this.buscarUsuarios();
  }

  canActivate(permiso:string): boolean {
    return this._authService.canActivateFunction(permiso);
  }

  agregar(){
    this.blnAgregar = true;
    this.messageTitle = 'Registrar Usuario';
    this.messageSubTitle = 'Registrar un Usuario';
    this.messageButton = 'Registrar';
    this.buscarUsuariosDisponibles();
    this.iniciarFormularioRegistro();
  }

  cancelar() {
    this.blnAgregar = false;
    this.formRegistro?.reset();
    this.modalRefEliminar?.close();
  }

  iniciarFormularioRegistro(id_usuario:number | null = null) {
    const formTmp: FormGroup | null = new FormGroup({
      id_unidad_compradora: new FormControl(this.catUnidadCompradora.id_unidad_compradora, [ Validators.required,]),
      id_usuario: new FormControl(null, [
        Validators.required,
      ]),
    });
    formTmp.patchValue({id_unidad_compradora: this.id_unidad_compradora});
    id_usuario != null ? formTmp.patchValue({id_usuario: id_usuario}) : false;
    return formTmp;
  }

  buscarCatUnidadCompradora(){
    this._catalogoUnidadCompradoraService.buscarUnidadCompradora(this.catUnidadCompradora).subscribe({
      next: (response) => {
        this.catUnidadCompradora = response.datos;
      },error: (err) => {
        swal.fire(err.error.mensaje,"",'error');
      },complete: () => {}
    });
  }

  buscarUsuarios(){
    this.loaderBusqueda = true;
    const datosBusquedaCUC: ICatalogoUnidadCompradora = {
      id_unidad_compradora: this.id_unidad_compradora,
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
    this._catalogoUnidadCompradoraService.buscarUsuarios(datosBusquedaCUC).subscribe({
      next: (response) => {
        this.lstUsuario = response.datos;
      },error: (err) => {
        swal.fire(err.error.mensaje,"",'error');
      },complete: () => {}
    });
  }

  buscarUsuariosDisponibles(){
    this.loaderBusqueda = true;
    const datosBusquedaCUC: ICatalogoUnidadCompradora = {
      id_unidad_compradora: this.id_unidad_compradora,
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
    this._catalogoUnidadCompradoraService.buscarUsuariosDisponibles(datosBusquedaCUC).subscribe({
      next: (response) => {
        this.lstUsuariosDisponibles = response.datos;
      },error: (err) => {
        swal.fire(err.error.mensaje,"",'error');
      },complete: () => {}
    });
  }

  guardarSubmit(){
    if(this.formRegistro == undefined || this.formRegistro.invalid){
      for (const control of Object.keys(this.formRegistro.controls)) {
        this.formRegistro.controls[control].markAsTouched();
      }
      return;
    }
    const datosGuardar: ICatalogoUnidadesCompradorasUsuario = this.formRegistro?.value as ICatalogoUnidadesCompradorasUsuario;
    datosGuardar.id_usuario = this.selectedUser.id_usuario;

    this._catalogoUnidadCompradoraService.guardarUsuario(datosGuardar).subscribe({
        next: (data) => {
            swal.fire(data.mensaje, "", 'success');
            this.buscarUsuarios();
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
    const datosEliminar: ICatalogoUnidadesCompradorasUsuario = this.formRegistro?.value as ICatalogoUnidadesCompradorasUsuario;
    this._catalogoUnidadCompradoraService.eliminarUsuario(datosEliminar).subscribe({
      next: (response) => {
        swal.fire(response.mensaje, "", 'success');
        this.buscarUsuarios();
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

  actualizarNombreUsuario(event: any) {
    const selectedValue = event.target.value;

    this.selectedUser = this.lstUsuariosDisponibles?.find(
      (element: any) =>
        selectedValue.includes(element.nombre_usuario) &&
        selectedValue.includes(element.primer_apellido_usuario) &&
        selectedValue.includes(element.segundo_apellido_usuario)
    );

    if (this.selectedUser) {
      this.formRegistro.patchValue({
        nombre: this.selectedUser.nombre_usuario + ' ' + this.selectedUser.primer_apellido_usuario + ' ' + this.selectedUser.segundo_apellido_usuario,
        correo: this.selectedUser.correo
      });
    }
  }



}
