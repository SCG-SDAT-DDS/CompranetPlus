import {Component, OnInit} from '@angular/core';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {AuthService} from "../../../../components/login/auth.service";
import {ICatalogoFuncionSistema} from "../../../../interfaces/catalogos/ICatalogoFuncionSistema";
import {CatalogoFuncionesSistemaService} from "../../../../services/catalogoFuncionesSistema.service";
import swal from 'sweetalert2';
import {ICatalogoFuncionSistemaEstatus} from "../../../../interfaces/catalogos/ICatalogoFuncionSistemaEstatus";
import {ICatalogoFuncionSistemaBusqueda} from "../../../../interfaces/catalogos/ICatalogoFuncionSistemaBusqueda";

@Component({
    selector: 'app-catalogo-funciones',
    templateUrl: './catalogo-funciones.component.html',
    styleUrls: ['./catalogo-funciones.component.css']
})
export class CatalogoFuncionesComponent implements OnInit {

    loaderBusqueda: boolean = false;
    loaderGuardar: boolean = false;

    formBusqueda: FormGroup;
    formRegistro: FormGroup;
    lstTabla: ICatalogoFuncionSistema[] | null = null;
    pageLstTabla = 1;
    pageSizeLstTabla = 15;

    blnAgregar: boolean = false;
    blnEditar: boolean = false;

    page = 1;
	pageSize = 10;
    collectionSize = 0;

    messageTitle: string = '';
    messageSubTitle: string = '';
    messageButton: string = '';

    modalRefEliminar:NgbModalRef|undefined;

    constructor(
        private modalService: NgbModal,
        private fb: FormBuilder,
        private _catalogoFuncionesSistemaService: CatalogoFuncionesSistemaService,
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
            estatus: new FormControl(null, [])
        });
    }

    iniciarFormularioRegistro(data: ICatalogoFuncionSistema | null = null) {
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
                const controlNombre = formTmp.get('nombre');
                if (controlNombre) {
                    controlNombre.disable();
                }
            }

            if (data.estatus != null) {
                formTmp.patchValue({estatus: data.estatus});
            }
        }

        return formTmp;
    }

    buscarSubmit(getByInput?: boolean) {
        this.loaderBusqueda = true;

        if (this.formBusqueda?.invalid) {
            for (const control of Object.keys(this.formBusqueda.controls)) {
                this.formBusqueda.controls[control].markAsTouched();
                console.info(this.formBusqueda.controls[control].errors);
            }
            return;
        }

        const datosBusqueda: ICatalogoFuncionSistemaBusqueda = this.formBusqueda?.value as ICatalogoFuncionSistemaBusqueda;
        datosBusqueda.page = this.page;
        if (getByInput) datosBusqueda.pageSize = this.pageSize;
        this._catalogoFuncionesSistemaService.buscarFuncionesSis(datosBusqueda).subscribe({
            next: (data) => {
               
                this.lstTabla = data.datos.datos;
                this.pageSize =data.datos.per_page;
                this.collectionSize = data.datos.total;
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


    /**
     * Metodo para abrir modal de eliminación y guardar temporalmente para eliminar
     * @author Edgar
     * @param content (Nombre del Modal)
     * @param datos (Datos del item a eliminar)
     */
    eliminarModal(content: any, datos: ICatalogoFuncionSistema) {
        this.formRegistro = this.iniciarFormularioRegistro(datos);
        this.modalRefEliminar = this.modalService.open(content);
    }

    eliminarSubmit() {
        this.loaderGuardar = true;

        const datosEliminar: ICatalogoFuncionSistemaEstatus = this.formRegistro?.value as ICatalogoFuncionSistemaEstatus;
        datosEliminar.estatus = false;

        this._catalogoFuncionesSistemaService.cambiarEstatusFuncionesSis(datosEliminar).subscribe({
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
    editar(datos: ICatalogoFuncionSistema) {
        this.blnEditar = true;
        this.messageTitle = 'Editar función';
        this.messageSubTitle = 'Editar una función del sistema';
        this.messageButton = 'Actualizar';
        this.formRegistro = this.iniciarFormularioRegistro(datos);
    }

    /**
     * Mostrar seccion de registro y ocultal tablero de usuarios
     */
    agregar() {
        this.blnAgregar = true;
        this.messageTitle = 'Registrar función';
        this.messageSubTitle = 'Registrar una función del sistema';
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
        this.formRegistro?.reset();
        this.modalRefEliminar?.close();
    }


    guardarSubmit() {

        if (this.formRegistro == undefined || this.formRegistro.invalid) {
            for (const control of Object.keys(this.formRegistro.controls)) {
                this.formRegistro.controls[control].markAsTouched();
                console.info(this.formRegistro.controls[control].errors)
            }
            return;
        }

        const datosGuardar: ICatalogoFuncionSistema = this.formRegistro?.value as ICatalogoFuncionSistema;
        
        const controlNombre = this.formRegistro.get('nombre');
        if (controlNombre && controlNombre.value !== null) {
            datosGuardar.nombre = controlNombre.value;
        }

        this._catalogoFuncionesSistemaService.guardarFuncionesSis(datosGuardar).subscribe({
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
