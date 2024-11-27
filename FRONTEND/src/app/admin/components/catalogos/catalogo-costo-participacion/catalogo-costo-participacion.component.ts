import { Component, OnInit } from '@angular/core';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {AuthService} from "../../../../components/login/auth.service";
import swal from 'sweetalert2';

import { ICatalogoCostoParticipacion } from '../../../../interfaces/catalogos/ICatalogoCostoParticipacion';
import { ICatalogoTipoProcedimiento } from '../../../../interfaces/catalogos/ICatalogoTipoProcedimiento';
import { CatalogoCostoParticipacionService } from 'src/app/services/catalogoCostosParticipacion.service';



@Component({
  selector: 'app-catalogo-costo-participacion',
  templateUrl: './catalogo-costo-participacion.component.html',
  styleUrls: ['./catalogo-costo-participacion.component.css']
})
export class CatalogoCostoParticipacionComponent implements OnInit {

  loaderBusqueda: boolean = false;
  loaderGuardar: boolean = false;

  formBusqueda: FormGroup;
  formRegistro: FormGroup;
  lstCatTipoProcedimiento: ICatalogoTipoProcedimiento[] | null = null;
  lstCatCostosParticipacion: ICatalogoCostoParticipacion[] | null = null;
  pageLstCatCostoParticipacion = 1;
  pageSizeLstCatCostoParticipacion = 15;

  blnAgregar: boolean = false;
  blnEditar: boolean = false;

  messageTitle: string = '';
  messageSubTitle: string = '';
  messageButton: string = '';

  modalRefEliminar:NgbModalRef|undefined;

  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private _catalogoCostoParticipacionService: CatalogoCostoParticipacionService,
    private _authService: AuthService
  ) {
    this.formBusqueda = this.iniciarFormularioBusqueda();
    this.formRegistro = this.iniciarFormularioRegistro();
  }

  ngOnInit() {
    //al cargar el componente
    this.buscarCatTipoProcedimiento();
    this.buscarCatCostoParticipacion();
  }

  canActivate(permiso:string): boolean {
    return this._authService.canActivateFunction(permiso);
  }

  iniciarFormularioBusqueda() {
    return new FormGroup({
        descripcion: new FormControl(null, [

        ]),
        id_tipo_procedimiento: new FormControl(null, {

        }),
    });
  }

  iniciarFormularioRegistro(data: ICatalogoCostoParticipacion | null = null) {
    const formTmp: FormGroup | null = new FormGroup({
      id_costo_inscripcion: new FormControl(null, {
        nonNullable: true,
        validators: [],
      }),
      anio: new FormControl('', [
        Validators.required,
        Validators.pattern("^[0-9]*$"),
        Validators.minLength(4)
      ]),
      presupuesto_autorizado: new FormControl('', [
        Validators.required,
        Validators.minLength(1)
      ]),
      costo_inscripcion: new FormControl('', [
        Validators.required,
        Validators.minLength(1)
      ]),
      activo: new FormControl(null, {
        nonNullable: true,
        validators: [],
      }),
      id_tipo_procedimiento: new FormControl(null,[
        Validators.required
      ])
    });

    if (data != null) {

        if (data.id_costo_inscripcion != null) {
          formTmp.patchValue({id_costo_inscripcion: data.id_costo_inscripcion});
        }
        
        if (data.anio != null) {
          formTmp.patchValue({anio: data.anio});
        }
        
        if (data.presupuesto_autorizado != null) {
          formTmp.patchValue({presupuesto_autorizado: data.presupuesto_autorizado});
        }
        
        if (data.costo_inscripcion != null) {
          formTmp.patchValue({costo_inscripcion: data.costo_inscripcion});
        }
        
        if (data.activo != null) {
          formTmp.patchValue({activo: data.activo});
        }
        
        if(data.id_tipo_procedimiento != null){
          formTmp.patchValue({id_tipo_procedimiento: data.id_tipo_procedimiento});
        }
    }

    return formTmp;
  }

  buscarCatTipoProcedimiento(){
    this._catalogoCostoParticipacionService.buscarCatalogoTipoProcedimiento().subscribe({
      next: (response) => {
        this.lstCatTipoProcedimiento = response.datos
      },error: (err) => {
        console.info(err);
        swal.fire(err.error.mensaje,"",'error');
      },complete: () => {}
    });
  }

  buscarCatCostoParticipacion(){
    this.loaderBusqueda = true;
    const datosBusqueda: ICatalogoCostoParticipacion = this.formBusqueda?.value as ICatalogoCostoParticipacion;
    this._catalogoCostoParticipacionService.buscarCatalogoUnidadResponsable(datosBusqueda).subscribe({
      next: (response) => {
        console.log(response.datos);
        this.lstCatCostosParticipacion = response.datos;
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
    this.messageTitle = 'Registrar Costo Participacion';
    this.messageSubTitle = 'Registrar un Costo de Participación';
    this.messageButton = 'Registrar';

    this.formRegistro = this.iniciarFormularioRegistro();
    this.formRegistro.controls['id_costo_inscripcion'].setValidators(null);
    this.formRegistro.controls['activo'].setValidators(null);
    this.formRegistro.updateValueAndValidity();
  }

  editar(datos: ICatalogoCostoParticipacion){
    this.blnEditar = true;
    this.messageTitle = 'Editar Costo Participacion';
    this.messageSubTitle = 'Editar un Costo Participacion';
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
    const datosGuardar: ICatalogoCostoParticipacion = this.formRegistro?.value as ICatalogoCostoParticipacion;

    this._catalogoCostoParticipacionService.guardarCatalogo(datosGuardar).subscribe({
        next: (data) => {
            swal.fire(data.mensaje, "", 'success');
            this.buscarCatCostoParticipacion();
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

  eliminarModal(content: any, datos: ICatalogoCostoParticipacion){
    this.formRegistro = this.iniciarFormularioRegistro(datos);
    this.modalRefEliminar = this.modalService.open(content);
  }

  eliminarSubmit(){
    this.loaderGuardar = true;
    const datosEliminar: ICatalogoCostoParticipacion = this.formRegistro?.value as ICatalogoCostoParticipacion;
    datosEliminar.activo = false;
    this._catalogoCostoParticipacionService.cambiarEstatus(datosEliminar).subscribe({
      next: (response) => {
        swal.fire(response.mensaje, "", 'success');
        this.buscarCatCostoParticipacion();
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
