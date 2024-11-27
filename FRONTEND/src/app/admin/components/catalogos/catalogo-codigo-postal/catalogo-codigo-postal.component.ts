import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/components/login/auth.service';
import { ICatalogoAsentamiento, ICatalogoAsentamientoEstatus, ICatalogoBusquedaAsentamiento } from 'src/app/interfaces/catalogos/ICatalogoAsentamientos';
import { IEstado, IEstadoId } from 'src/app/interfaces/catalogos/ICatalogoEstado';
import { ILocalidad } from 'src/app/interfaces/catalogos/ICatalogoLocalidad';
import { IMunicipio } from 'src/app/interfaces/catalogos/ICatalogoMunicipio';
import { CatalogoAsentamientoService } from 'src/app/services/catalogoAsentamiento.service';
import { CatalogoEstadosService } from 'src/app/services/catalogoEstados.service';
import { CatalogoMunicipiosService } from 'src/app/services/catalogoMunicipios.service';
import swal from 'sweetalert2';



@Component({
  selector: 'app-catalogo-codigo-postal',
  templateUrl: './catalogo-codigo-postal.component.html',
  styleUrls: ['./catalogo-codigo-postal.component.css']
})
export class CatalogoCodigoPostalComponent {

  formBusqueda: FormGroup;
  loaderBusqueda: boolean = false;
  loaderGuardar: boolean = false;
  lstTabla: ICatalogoAsentamiento[] | null = null;

  data: ICatalogoAsentamiento[] | null = null;
  page = 1;
	pageSize = 0;
  collectionSize = 0;
  lstEstados: IEstado[] | null = null;
  lstMunicipios: IMunicipio[] | null = null;
  lsLocalidad : ILocalidad[] | null = null;

  blnAgregar: boolean = false;
  blnEditar: boolean = false;

  messageTitle: string = '';
  messageSubTitle: string = '';
  messageButton: string = '';

  modalRefEliminar:NgbModalRef|undefined;

  formRegistro: FormGroup;
  constructor(
    private modalService: NgbModal,
    private _authService: AuthService,
    private _catalogoAsentamientosService: CatalogoAsentamientoService,
    private _catalogoEstadosService: CatalogoEstadosService,
    private _catalogoMunicipiosService: CatalogoMunicipiosService,
    ) {
      this.formBusqueda = this.iniciarFormularioBusqueda();
      this.formRegistro = this.iniciarFormularioRegistro();
     }

  ngOnInit() {
    this.obtenerEstados();
    this.obtenerMunicipios(null);
    this.buscarSubmit();

    this.formBusqueda.get('idEstado')?.valueChanges.subscribe(selectedValue => {
      this.obtenerMunicipios(selectedValue);
    });
  }

  iniciarFormularioBusqueda() {
    return new FormGroup({
        cp: new FormControl(null, [
            Validators.minLength(3)
        ]),
        idMunicipio: new FormControl(null, []),
        idEstado: new FormControl(null, []),
        idLocalidad: new FormControl(null, []),
        activo: new FormControl(null, [])
    });
  }

  iniciarFormularioRegistro(data: ICatalogoAsentamiento | null = null) {
    const formTmp: FormGroup | null = new FormGroup({
        id_asentamiento: new FormControl(null, {
            nonNullable: true,
            validators: [],
        }),
        codigo_postal: new FormControl('', [
            Validators.required,
            Validators.minLength(5)
        ]),
        nombre_asentamiento: new FormControl('', [
            Validators.required,
            Validators.minLength(5)
        ]),
        tipo_asentamiento: new FormControl('', [
          Validators.required,
          Validators.minLength(5)
        ]),
        id_estado: new FormControl('', [
          Validators.required,
          
        ]),
        id_municipio: new FormControl('', [
          Validators.required,
          
        ]),
        activo: new FormControl('', [
          
      ])
    });

    if (data != null) {

      if (data.id_asentamiento != null) {
        formTmp.patchValue({id_asentamiento: data.id_asentamiento});
      }
        if (data.codigo_postal != null) {
            formTmp.patchValue({codigo_postal: data.codigo_postal});
        }

        if (data.nombre_asentamiento != null) {
            formTmp.patchValue({nombre_asentamiento: data.nombre_asentamiento});
        }
        
        if (data.tipo_asentamiento != null) {
          formTmp.patchValue({tipo_asentamiento: data.tipo_asentamiento});
        }
        if (data.id_estado != null) {
          formTmp.patchValue({id_estado: data.id_estado});
        }
        if (data.id_municipio != null) {
          formTmp.patchValue({id_municipio: data.id_municipio});
        }
    }

    return formTmp;
}

  buscarSubmit(getByInput?: boolean){

    this.loaderBusqueda = true;
    if (this.formBusqueda?.invalid) {
      for (const control of Object.keys(this.formBusqueda.controls)) {
          this.formBusqueda.controls[control].markAsTouched();
          console.info(this.formBusqueda.controls[control].errors);
      }
      return;
    }

    const datosBusqueda: ICatalogoBusquedaAsentamiento = this.formBusqueda?.value as ICatalogoBusquedaAsentamiento;
    
    datosBusqueda.page = this.page;
    if (getByInput) datosBusqueda.pageSize = this.pageSize;
    
    this._catalogoAsentamientosService.getAsentamientos(datosBusqueda).subscribe({
      next: (res) => {
          const data = res.datos
          this.lstTabla = data.data;
          this.pageSize =data.per_page;
          this.collectionSize = data.total; 
          
      },
      error: (err) => {
          console.info(err)
          swal.fire(err.error.mensaje, "", 'error');
      },
      complete: () => {
          this.loaderBusqueda = false;
         
      }
    });
  }

  obtenerEstados(){
    this._catalogoEstadosService.getListEstados().subscribe({
      next: (data) => {
        
        this.lstEstados = data.datos;          
      },
      error: (err) => {
          console.info(err)
          swal.fire(err.error.mensaje, "", 'error');
      },
      complete: () => {
          this.loaderBusqueda = false;
      }
    });

  }
  
  obtenerMunicipios(idEstado: number | null){
    const  param: IEstadoId = {
      id: idEstado,
    };
    this._catalogoMunicipiosService.getMunicipiosIdEstado(param).subscribe({
      next: (data) => {
        
        this.lstMunicipios = data.datos;
          
      },
      error: (err) => {
          console.info(err)
          swal.fire(err.error.mensaje, "", 'error');
      },
      complete: () => {
          this.loaderBusqueda = false;
      }
    });

  }
  
  canActivate(permiso:string): boolean {
    return this._authService.canActivateFunction(permiso);
  }

  

  
  eliminarModal(content :any, datos:ICatalogoAsentamiento) {
    this.formRegistro = this.iniciarFormularioRegistro(datos);
    this.modalRefEliminar = this.modalService.open(content);
	}
  eliminarSubmit(){
    this.loaderGuardar = true;

        const datosEliminar: ICatalogoAsentamientoEstatus = this.formRegistro?.value as ICatalogoAsentamientoEstatus;
        datosEliminar.activo = false;

        this._catalogoAsentamientosService.cambiarEstatusAsentamiento(datosEliminar).subscribe({
            next: (data) => {
               swal.fire(data.mensaje, "", 'success');
               this.buscarSubmit();
            },
            error: (err) => {
                console.info(err)
                swal.fire(err.error.mensaje, "", 'error');
            },
            complete: () => {
                this.loaderGuardar = false;
                this.cancelar();
            }
        });

  }
  guardarSubmit() {

    if (this.formRegistro == undefined || this.formRegistro.invalid) {
        for (const control of Object.keys(this.formRegistro.controls)) {
            this.formRegistro.controls[control].markAsTouched();
            console.info(this.formRegistro.controls[control].errors)
        }
        return;
    }

    const datosGuardar: ICatalogoAsentamiento = this.formRegistro?.value as ICatalogoAsentamiento;
  
    this._catalogoAsentamientosService.guardarAsentamiento(datosGuardar).subscribe({
      next: (data) => {
          swal.fire(data.mensaje, "", 'success');
          this.buscarSubmit();
      },
      error: (err) => {
          console.info(err)
          swal.fire(err.error.mensaje, "", 'error');
      },
      complete: () => {
          this.loaderGuardar = false;
          this.cancelar();
      }
  });

  }

  editar(data:ICatalogoAsentamiento){
    
    this.blnEditar = true;
    this.messageTitle = 'Editar codigo postal';
    this.messageSubTitle = 'Editar un codigo postal del sistema';
    this.messageButton = 'Actualizar';
    this.formRegistro = this.iniciarFormularioRegistro(data);
    
  }

  agregar(){
    this.blnAgregar = true;
        this.messageTitle = 'Registrar codigo postal';
        this.messageSubTitle = 'Registrar un codigo postal del sistema';
        this.messageButton = 'Registar';

        this.formRegistro = this.iniciarFormularioRegistro();
        this.formRegistro.controls['id_asentamiento'].setValidators(null);
        this.formRegistro.updateValueAndValidity()
  }



  cancelar() {
    this.blnEditar = false;
    this.blnAgregar = false;
    this.formRegistro?.reset();
    this.modalRefEliminar?.close();
  }
  filtrar(){
    this.page = 1;
    this.buscarSubmit();
  }

  reset(){
    this.formBusqueda.reset();
    this.page = 1;
    this.buscarSubmit();
  }
}
