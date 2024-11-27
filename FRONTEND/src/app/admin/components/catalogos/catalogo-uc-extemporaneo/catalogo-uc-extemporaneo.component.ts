import { Component, OnInit } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import { AuthService} from "../../../../components/login/auth.service";
import swal from 'sweetalert2';
import { ActivatedRoute } from '@angular/router';
import { formatDate } from '@angular/common';

import { ICatalogoUnidadCompradora } from 'src/app/interfaces/catalogos/ICatalogoUnidadCompradora';
import { ICatalogoUCADExtemporanea } from 'src/app/interfaces/catalogos/ICatalogoUCADExtemporanea';
import { CatalogoUnidadCompradoraService } from 'src/app/services/catalogoUnidadCompradora.service';

@Component({
  selector: 'app-catalogo-uc-extemporaneo',
  templateUrl: './catalogo-uc-extemporaneo.component.html',
  styleUrls: ['./catalogo-uc-extemporaneo.component.css']
})
export class CatalogoUcExtemporaneoComponent implements OnInit {

  loaderBusqueda: boolean = false;
  loaderGuardar: boolean = false;

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
  lstCatUnidadCompradoraADExtemporanea: ICatalogoUCADExtemporanea[] | null = null;

  pageLstCatUnidadCompradoraADExtemporanea = 1;
  pageSizeLstCatUnidadcompradoraADExtemporanea = 15;

  blnAgregar: boolean = false;
  blnEditar: boolean = false;

  messageTitle: string = '';
  messageSubTitle: string = '';
  messageButton: string = '';

  modalRefEliminar:NgbModalRef|undefined;

  //paramentro para el parametro de la ruta
  id_unidad_responsable: any | null;

  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private _catalogoUnidadCompradoraService : CatalogoUnidadCompradoraService,
    private _authService: AuthService,
    private _route: ActivatedRoute,

  ) {
    //para habilitar el filtro por si llega por unidad responsable
    this.catUnidadCompradora.id_unidad_compradora = Number(this._route.snapshot.paramMap.get('id_unidad_compradora')) || null;
    this.id_unidad_responsable = Number(this._route.snapshot.paramMap.get('id_unidad_responsable')) || null;
    this.buscarCatUnidadCompradora();//para actualizar los datos de la unidad  compradora que se agregaran los datos
    this.formRegistro = this.iniciarFormularioRegistro();
  }

  ngOnInit() {
    this.buscarCatUnidadCompradoraADExtemporanea();
  }

  canActivate(permiso:string): boolean {
    return this._authService.canActivateFunction(permiso);
  }

  buscarCatUnidadCompradora(){
    this._catalogoUnidadCompradoraService.buscarUnidadCompradora(this.catUnidadCompradora).subscribe({
      next: (response) => {
        console.log(response.datos);
        this.catUnidadCompradora = response.datos;
      },error: (err) => {
        console.info(err);
        swal.fire(err.error.mensaje,"",'error');
      },complete: () => {}
    });
  }

  iniciarFormularioRegistro(data: ICatalogoUCADExtemporanea | null = null) {
    const formTmp: FormGroup | null = new FormGroup({
      id_cat_unidades_compradoras_ad_extemporanea: new FormControl(null, {nonNullable: true,validators: [],}),
      //fecha_otorgado: new FormControl('', [Validators.required,]),
      fecha_inicio_periodo: new FormControl('', [Validators.required,]),
      fecha_fin_periodo: new FormControl('', [Validators.required,]),
      //seteamos el valor predeterminado de la unidad compradora
      id_unidad_compradora: new FormControl(this.catUnidadCompradora.id_unidad_compradora, [ Validators.required,]),
      activo: new FormControl(null, {nonNullable: true,validators: [],}),
      estatus_periodo: new FormControl(null, {nonNullable: true,validators: [],})
    });

    if (data != null) {

        if (data.id_cat_unidades_compradoras_ad_extemporanea != null) {
          formTmp.patchValue({id_cat_unidades_compradoras_ad_extemporanea: data.id_cat_unidades_compradoras_ad_extemporanea});
        }

        if (data.fecha_otorgado != null) {
          formTmp.patchValue({fecha_otorgado: data.fecha_otorgado});
        }

        if (data.fecha_inicio_periodo != null) {
          let fecha = new Date(data.fecha_inicio_periodo);
          formTmp.patchValue({fecha_inicio_periodo: formatDate(fecha,'yyyy-MM-dd',"en-US") });
        }

        if (data.fecha_fin_periodo != null) {
          let fecha = new Date(data.fecha_fin_periodo);
          formTmp.patchValue({fecha_fin_periodo: formatDate(fecha,'yyyy-MM-dd',"en-US") });
        }

        if (data.activo != null) {
          formTmp.patchValue({activo: data.activo});
        }

        if (data.id_unidad_compradora != null) {
          formTmp.patchValue({id_unidad_compradora: data.id_unidad_compradora});
        }

        if (data.estatus_periodo != null) {
          formTmp.patchValue({estatus_periodo: data.estatus_periodo});
        }
    }

    return formTmp;
  }

  buscarCatUnidadCompradoraADExtemporanea(){
    this.loaderBusqueda = true;
    this._catalogoUnidadCompradoraService.buscarUnidadCompradoraADExtemporaneas(this.catUnidadCompradora).subscribe({
      next: (response) => {
        console.log(response.datos);
        this.lstCatUnidadCompradoraADExtemporanea = response.datos;
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
    this.messageTitle = 'Registrar Unidad Compradora AD Extemporanea';
    this.messageSubTitle = 'Registrar una Unidad Compradora Adjudicación Directa Extemporanea';
    this.messageButton = 'Registrar';

    this.formRegistro = this.iniciarFormularioRegistro();
    this.formRegistro.controls['id_unidad_compradora'].setValidators(null);
    this.formRegistro.controls['activo'].setValidators(null);
    this.formRegistro.updateValueAndValidity();
    this.formRegistro.patchValue({
      id_unidad_compradora: this.catUnidadCompradora.id_unidad_compradora
    });
  }

  editar(datos: ICatalogoUCADExtemporanea){
    this.blnEditar = true;
    this.messageTitle = 'Editar Unidad Compradora AD Extemporanea';
    this.messageSubTitle = 'Editar una Unidad Compradora Adjudicación Directa Extemporanea';
    this.messageButton = 'Actualizar';

    this.formRegistro = this.iniciarFormularioRegistro(datos);
    console.log(datos,this.formRegistro);
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
    const datosGuardar: ICatalogoUCADExtemporanea = this.formRegistro?.value as ICatalogoUCADExtemporanea;
    this._catalogoUnidadCompradoraService.guardarCatalogoUCADExtemporanea(datosGuardar).subscribe({
        next: (data) => {
            swal.fire(data.mensaje, "", 'success');
            this.buscarCatUnidadCompradoraADExtemporanea();
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

  eliminarModal(content: any, datos: ICatalogoUCADExtemporanea){
    this.formRegistro = this.iniciarFormularioRegistro(datos);
    this.modalRefEliminar = this.modalService.open(content);
  }

  eliminarSubmit(){
    this.loaderGuardar = true;
    const datosEliminar: ICatalogoUCADExtemporanea = this.formRegistro?.value as ICatalogoUCADExtemporanea;
    datosEliminar.activo = false;
    this._catalogoUnidadCompradoraService.cambiarEstatusUCADExtemporanea(datosEliminar).subscribe({
      next: (response) => {
        swal.fire(response.mensaje, "", 'success');
        this.buscarCatUnidadCompradoraADExtemporanea();
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

  cerrarPeriodoModal(content: any, datos: ICatalogoUCADExtemporanea){
    this.formRegistro = this.iniciarFormularioRegistro(datos);
    this.modalRefEliminar = this.modalService.open(content);
  }

  cerrarPeriodoSubmit(){
    this.loaderGuardar = true;
    const datosEliminar: ICatalogoUCADExtemporanea = this.formRegistro?.value as ICatalogoUCADExtemporanea;
    datosEliminar.estatus_periodo = true;
    this._catalogoUnidadCompradoraService.cambiarEstatusUCADExtemporanea(datosEliminar).subscribe({
      next: (response) => {
        swal.fire(response.mensaje, "", 'success');
        this.buscarCatUnidadCompradoraADExtemporanea();
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
