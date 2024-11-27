import {Component, OnInit} from '@angular/core';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {AuthService} from "../../../../components/login/auth.service";
import swal from 'sweetalert2';
import {ICatalogoRolesSistemaEstatus} from "../../../../interfaces/catalogos/ICatalogoRolesSistemaEstatus";
import {ICatalogoRolesSistemaBusqueda} from "../../../../interfaces/catalogos/ICatalogoRolesSistemaBusqueda";
import {ICatalogoRolesSistema} from "../../../../interfaces/catalogos/ICatalogoRolesSistema";
import {CatalogoRolesSistemaService} from "../../../../services/catalogoRolesSistema.service";
import {IAsignarFuncionRoplSistema} from "../../../../interfaces/catalogos/IAsignarFuncionRoplSistema";
import {IActivarFuncionRoplSistema} from "../../../../interfaces/catalogos/IActivarFuncionRoplSistema";

@Component({
    selector: 'app-catalogo-roles',
    templateUrl: './catalogo-roles.component.html',
    styleUrls: ['./catalogo-roles.component.css']
})
export class CatalogoRolesComponent implements OnInit {

    loaderBusqueda: boolean = false;
    loaderGuardar: boolean = false;

    formBusqueda: FormGroup;
    formRegistro: FormGroup;
    lstTabla: ICatalogoRolesSistema[] | null = null;
    pageLstTabla = 1;
    pageSizeLstTabla = 15;

    blnAgregar: boolean = false;
    blnEditar: boolean = false;
    blnEditarFunciones: boolean = false;

    messageTitle: string = '';
    messageSubTitle: string = '';
    messageButton: string = '';

    modalRefEliminar:NgbModalRef|undefined;

    lstFunciones: IAsignarFuncionRoplSistema[] | null = null;
    filtroFunciones: string = '';

    constructor(
        private modalService: NgbModal,
        private fb: FormBuilder,
        private _catalogoRolesSistemaService: CatalogoRolesSistemaService,
        private _authService: AuthService
    ) {

        this.formBusqueda = this.iniciarFormularioBusqueda();
        this.formRegistro = this.iniciarFormularioRegistro();
    }

    ngOnInit() {
        this.buscarSubmit();
    }

    canActivate(permiso:string): boolean {
        return this._authService.canActivateFunction(permiso);
    }

    iniciarFormularioBusqueda() {
        return new FormGroup({
            nombre: new FormControl(null, [
                Validators.minLength(3)
            ]),
            estatus: new FormControl(null, []),
            omitir: new FormControl(null, [])
        });
    }

    iniciarFormularioRegistro(data: ICatalogoRolesSistema | null = null) {
        const formTmp: FormGroup | null = new FormGroup({
            id: new FormControl(null, {
                nonNullable: true,
                validators: [],
            }),
            nombre: new FormControl('', [
                Validators.required,
                Validators.minLength(3)
            ]),
            estatus: new FormControl('', [
                Validators.required
            ])
        });

        if (data != null) {

            if (data.id != null) {
                formTmp.patchValue({id: data.id});
            }

            if (data.nombre != null) {
                formTmp.patchValue({nombre: data.nombre});
            }

            if (data.estatus != null) {
                formTmp.patchValue({estatus: data.estatus});
            }
        }

        return formTmp;
    }

    buscarSubmit() {
        this.loaderBusqueda = true;

        if (this.formBusqueda?.invalid) {
            for (const control of Object.keys(this.formBusqueda.controls)) {
                this.formBusqueda.controls[control].markAsTouched();
                console.info(this.formBusqueda.controls[control].errors);
            }
            return;
        }

        const datosBusqueda: ICatalogoRolesSistemaBusqueda = this.formBusqueda?.value as ICatalogoRolesSistemaBusqueda;
        this._catalogoRolesSistemaService.buscarRolesSis(datosBusqueda).subscribe({
            next: (data) => {
                this.lstTabla = data.datos;
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
    }


    /**
     * Metodo para abrir modal de eliminación y guardar temporalmente para eliminar
     * @author Edgar
     * @param content (Nombre del Modal)
     * @param datos (Datos del item a eliminar)
     */
    eliminarModal(content: any, datos: ICatalogoRolesSistema) {
        this.formRegistro = this.iniciarFormularioRegistro(datos);
        this.modalRefEliminar = this.modalService.open(content);
    }

    eliminarSubmit() {
        this.loaderGuardar = true;

        const datosEliminar: ICatalogoRolesSistemaEstatus = this.formRegistro?.value as ICatalogoRolesSistemaEstatus;
        datosEliminar.estatus = false;

        this._catalogoRolesSistemaService.cambiarEstatusRolesSis(datosEliminar).subscribe({
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



    /**
     * Metodo para mostrar sección de editar y ocultar tablero de Usuarios
     * @author Adan
     *
     * @param datos (Datos del item a modificar)
     */
    editar(datos: ICatalogoRolesSistema) {
        this.blnEditar = true;
        this.messageTitle = 'Editar rol';
        this.messageSubTitle = 'Editar un rol del sistema';
        this.messageButton = 'Actualizar';
        this.formRegistro = this.iniciarFormularioRegistro(datos);
    }

    /**
     * Mostrar seccion de registro y ocultal tablero de usuarios
     */
    agregar() {
        this.blnAgregar = true;
        this.messageTitle = 'Registrar rol';
        this.messageSubTitle = 'registrar un rol del sistema';
        this.messageButton = 'Registar';

        this.formRegistro = this.iniciarFormularioRegistro();
        this.formRegistro.controls['id'].setValidators(null)
        this.formRegistro.controls['estatus'].setValidators(null)
        this.formRegistro.updateValueAndValidity()
    }

    /**
     * Metodo para regresar a la sección del listado de usuarios y ocultar la seccion de registro o edicion
     */
    cancelar() {
        this.blnEditar = false;
        this.blnAgregar = false;
        this.blnEditarFunciones = false;
        this.formRegistro?.reset();
        this.modalRefEliminar?.close();
    }


    guardarSubmit() {

        if (this.formRegistro == undefined || this.formRegistro.invalid) {
            for (const control of Object.keys(this.formRegistro?.controls)) {
                this.formRegistro.controls[control].markAsTouched();
                console.info(this.formRegistro.controls[control].errors)
            }
            return;
        }

        const datosGuardar: ICatalogoRolesSistema = this.formRegistro?.value as ICatalogoRolesSistema;

        this._catalogoRolesSistemaService.guardarRolesSis(datosGuardar).subscribe({
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


  editarFunciones(datos: ICatalogoRolesSistema) {
    this.blnEditarFunciones = true;
    this.messageTitle = 'Editar el rol ' + datos.nombre.toLowerCase();
    this.messageSubTitle = 'Editar las funciones de rol del sistema';
    this.messageButton = 'Actualizar';

    this.filtroFunciones = '';
    this.formRegistro = this.iniciarFormularioRegistro(datos);

    this.loaderBusqueda = true;
    if (datos.id !== null) {
      this._catalogoRolesSistemaService.obtenerFuncionesRolesSistema(datos.id).subscribe({
        next: (data) => {
          this.lstFunciones = data.datos as IAsignarFuncionRoplSistema[];
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
    }
  }

  get funciones(): undefined | null | IAsignarFuncionRoplSistema[] {

      if (this.filtroFunciones.trim() != "") {
        return this.lstFunciones?.filter(it=>it.nombre.toLowerCase().includes(this.filtroFunciones.toLowerCase()));
      }

      return this.lstFunciones;
  }

  activarRolSistema(event:any, funcionSys:IAsignarFuncionRoplSistema) {
    funcionSys.loading = true;

    const params = {
      idRol: this.formRegistro.get('id')?.value,
      idFuncion: funcionSys.id,
      estatus: funcionSys.estatus
    } as IActivarFuncionRoplSistema;

    this._catalogoRolesSistemaService.activarRolSistema(params).subscribe({
      next: (data) => {
        this.loaderGuardar = data.datos;
      },
      error: (err) => {
        console.info(err)
        funcionSys.estatus = false;
        funcionSys.loading = false;
      },
      complete: () => {
        funcionSys.loading = false;
      }
    });
  }

  protected readonly JSON = JSON;
}
