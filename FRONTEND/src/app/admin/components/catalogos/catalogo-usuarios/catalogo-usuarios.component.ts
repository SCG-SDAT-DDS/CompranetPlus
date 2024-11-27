import {Component, OnInit} from '@angular/core';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {AuthService} from "../../../../components/login/auth.service";
import swal from 'sweetalert2';
import {ICatalogoRolesSistema} from "../../../../interfaces/catalogos/ICatalogoRolesSistema";
import {ICatalogoUsuarios} from "../../../../interfaces/catalogos/ICatalogoUsuarios";
import {ICatalogoUsuariosBuscar} from "../../../../interfaces/catalogos/ICatalogoUsuariosBuscar";
import {CatalogoUsuariosService} from "../../../../services/catalogoUsuarios.service";
import {ICatalogoUsuariosEstatus} from "../../../../interfaces/catalogos/ICatalogoUsuariosEstatus";
import {ICatalogoUsuariosContrasena} from "../../../../interfaces/catalogos/ICatalogoUsuariosContrasena";
import {CatalogoRolesSistemaService} from "../../../../services/catalogoRolesSistema.service";
import {ICatalogoRolesSistemaBusqueda} from "../../../../interfaces/catalogos/ICatalogoRolesSistemaBusqueda";

@Component({
    selector: 'app-catalogo-usuarios',
    templateUrl: './catalogo-usuarios.component.html',
    styleUrls: ['./catalogo-usuarios.component.css']
})
export class CatalogoUsuariosComponent implements OnInit {

    loaderBusqueda: boolean = false;
    loaderGuardar: boolean = false;
    loaderBusquedaRoles: boolean = false;

    formBusqueda: FormGroup;
    formRegistro: FormGroup;
    lstTabla: ICatalogoUsuarios[] | null = null;
    pageLstTabla = 1;
    pageSizeLstTabla = 15;

    blnAgregar: boolean = false;
    blnEditar: boolean = false;
    blnEditarContrasena: boolean = false;

    messageTitle: string = '';
    messageSubTitle: string = '';
    messageButton: string = '';

    modalRefEliminar: NgbModalRef | undefined;

    lstRoles: ICatalogoRolesSistema[] | null = null;
    lstRolesFiltro: ICatalogoRolesSistema[] | null = null;

    constructor(
        private modalService: NgbModal,
        private fb: FormBuilder,
        private _catalogoUsuariosService: CatalogoUsuariosService,
        private _authService: AuthService,
        private _catalogoRolesSistemaService: CatalogoRolesSistemaService,
    ) {
        this.formBusqueda = this.iniciarFormularioBusqueda();
        this.formRegistro = this.iniciarFormularioRegistro();
    }

    ngOnInit() {
        this.llenarListadoRoles();
        this.llenarListadoRolesFiltro();
        this.buscarSubmit();
    }

    canActivate(permiso: string): boolean {
        return this._authService.canActivateFunction(permiso);
    }

    iniciarFormularioBusqueda() {
        return new FormGroup({
            nombre: new FormControl(null, [
                Validators.minLength(3)
            ]),
            aPaterno: new FormControl(null, [
                Validators.minLength(3)
            ]),
            aMaterno: new FormControl(null, [
                Validators.minLength(3)
            ]),
            estatus: new FormControl(null, []),
            idRol: new FormControl(null, [])
        });
    }

    iniciarFormularioRegistro(data: ICatalogoUsuarios | null = null) {
        const formTmp: FormGroup | null = new FormGroup({
            id: new FormControl(null, {
                nonNullable: true,
                validators: [],
            }),
            nombre: new FormControl('', [
                Validators.required,
                Validators.minLength(3)
            ]),
            aPaterno: new FormControl('', [
                Validators.required,
                Validators.minLength(3)
            ]),
            aMaterno: new FormControl('', [
                Validators.required,
                Validators.minLength(3)
            ]),
            usuario: new FormControl('', [
                Validators.required,
                Validators.minLength(3)
            ]),
            email: new FormControl('', [
                Validators.required,
                Validators.email
            ]),
            estatus: new FormControl(null, [
                Validators.required
            ]),
            idRol: new FormControl(null, [
                Validators.required
            ]),
            contrasena: new FormControl('', [
                Validators.required,
                Validators.pattern('(?=\\D*\\d)(?=[^a-z]*[a-z])(?=[^A-Z]*[A-Z]).{8,30}'),
            ]),
            repetirContrasena: new FormControl('', [
                Validators.required,
                Validators.pattern('(?=\\D*\\d)(?=[^a-z]*[a-z])(?=[^A-Z]*[A-Z]).{8,30}'),
            ]),
        });

        if (data != null) {

            if (data.id != null) {
                formTmp.patchValue({id: data.id});
            }

            if (data.nombre != null) {
                formTmp.patchValue({nombre: data.nombre});
            }

            if (data.aPaterno != null) {
                formTmp.patchValue({aPaterno: data.aPaterno});
            }

            if (data.aMaterno != null) {
                formTmp.patchValue({aMaterno: data.aMaterno});
            }

            if (data.usuario != null) {
                formTmp.patchValue({usuario: data.usuario});
            }

            if (data.email != null) {
                formTmp.patchValue({email: data.email});
            }

            if (data.estatus != null) {
                formTmp.patchValue({estatus: data.estatus});
            }

            if (data.idRol != null) {
                formTmp.patchValue({idRol: data.idRol});
            }

        }

        return formTmp;
    }

    iniciarFormularioRegistroContrasena(data: ICatalogoUsuarios | null = null) {
        const formTmp: FormGroup | null = new FormGroup({
            id: new FormControl({value: data?.id, disabled: true}, null),
            nombre: new FormControl({value: data?.nombre, disabled: true}, null),
            aPaterno: new FormControl({value: data?.aPaterno, disabled: true}, null),
            aMaterno: new FormControl({value: data?.aMaterno, disabled: true}, null),
            usuario: new FormControl({value: data?.usuario, disabled: true}, null),
            email: new FormControl({value: data?.email, disabled: true}, null),
            estatus: new FormControl({value: data?.estatus, disabled: true}, null),
            idRol: new FormControl({value: data?.idRol, disabled: true}, null),
            contrasena: new FormControl('', [
                Validators.required,
                Validators.pattern('(?=\\D*\\d)(?=[^a-z]*[a-z])(?=[^A-Z]*[A-Z]).{8,30}'),
            ]),
            repetirContrasena: new FormControl('', [
                Validators.required,
                Validators.pattern('(?=\\D*\\d)(?=[^a-z]*[a-z])(?=[^A-Z]*[A-Z]).{8,30}'),
            ]),
        });

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

        const datosBusqueda: ICatalogoUsuariosBuscar = this.formBusqueda?.value as ICatalogoUsuariosBuscar;
        this._catalogoUsuariosService.buscarUsuarios(datosBusqueda).subscribe({
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
    eliminarModal(content: any, datos: ICatalogoUsuarios) {
        this.formRegistro = this.iniciarFormularioRegistro(datos);
        this.modalRefEliminar = this.modalService.open(content);
    }

    eliminarSubmit() {
        this.loaderGuardar = true;

        const datosEliminar: ICatalogoUsuariosEstatus = this.formRegistro?.value as ICatalogoUsuariosEstatus;
        datosEliminar.estatus = false;

        this._catalogoUsuariosService.cambiarEstatusUsuario(datosEliminar).subscribe({
            next: (data) => {
                swal.fire(data.mensaje, "", 'success');
                this.buscarSubmit();
            },
            error: (err) => {
                console.info(err)
                this.loaderGuardar = false;
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
    editar(datos: ICatalogoUsuarios) {
        this.blnEditar = true;
        this.messageTitle = 'Editar usuario';
        this.messageSubTitle = 'Editar usuario';
        this.messageButton = 'Actualizar';
        this.formRegistro = this.iniciarFormularioRegistro(datos);

        this.formRegistro.controls['contrasena'].setValidators(null)
        this.formRegistro.controls['repetirContrasena'].setValidators(null)
        this.formRegistro.updateValueAndValidity()
    }

    /**
     * Mostrar seccion de registro y ocultal tablero de usuarios
     */
    agregar() {
        this.blnAgregar = true;
        this.messageTitle = 'Registrar usuario';
        this.messageSubTitle = 'registrar un usuario';
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
        this.blnEditarContrasena = false;
        this.formRegistro?.reset();
        this.modalRefEliminar?.close();
    }


    guardarSubmit() {

        if (this.formRegistro.get('contrasena')?.value !=
            this.formRegistro.get('repetirContrasena')?.value) {
            this.formRegistro.get('repetirContrasena')?.setErrors({'noMatch': true});
        }

        if (this.blnEditarContrasena) {
            this.cambiarContrasenaSubmit();
        } else {

            if (this.formRegistro == undefined || this.formRegistro.invalid) {
                for (const control of Object.keys(this.formRegistro?.controls)) {
                    this.formRegistro.controls[control].markAsTouched();
                    console.info(control, this.formRegistro.controls[control].errors)
                }
                return;
            }

            const datosGuardar: ICatalogoUsuarios = this.formRegistro?.value as ICatalogoUsuarios;

            this._catalogoUsuariosService.guardarUsuario(datosGuardar).subscribe({
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
    }


    editarContrasena(datos: ICatalogoUsuarios) {
        this.blnEditar = false;
        this.blnEditarContrasena = true;
        this.messageTitle = 'Cambiar contraseña';
        this.messageSubTitle = 'Cambia la contraseña del usuario para ingresar al sistema';
        this.messageButton = 'Actualizar';

        this.formRegistro = this.iniciarFormularioRegistroContrasena(datos);

    }

    cambiarContrasenaSubmit() {

        if (this.formRegistro == undefined || this.formRegistro.invalid) {
            for (const control of Object.keys(this.formRegistro?.controls)) {
                this.formRegistro.controls[control].markAsTouched();
                console.info(this.formRegistro.controls[control].errors)
            }
            return;
        }

        const params = {
            id: Number(this.formRegistro.get('id')?.value),
            contrasena: String(this.formRegistro.get('contrasena')?.value)
        } as ICatalogoUsuariosContrasena;

        this.loaderGuardar = true;

        this._catalogoUsuariosService.cambiarContrasena(params).subscribe({
            next: (data) => {
                this.loaderGuardar = data.datos;
                swal.fire(data.mensaje, "", 'success');
            },
            error: (err) => {
                console.info(err)
                this.loaderGuardar = false;
                swal.fire(err.error.mensaje, "", 'error');
            },
            complete: () => {
                this.loaderGuardar = false;
                this.cancelar();
            }
        });
    }

    llenarListadoRoles() {
        this.loaderBusquedaRoles = true;

        const datosBusqueda: ICatalogoRolesSistemaBusqueda = {
            nombre: '',
            estatus: true,
            omitir: 'PROVEEDOR',
        } as ICatalogoRolesSistemaBusqueda;

        this._catalogoRolesSistemaService.buscarRolesSis(datosBusqueda).subscribe({
            next: (data) => {
                this.lstRoles = data.datos;
            },
            error: (err) => {
                console.info(err)
                swal.fire(err.error.mensaje, "", 'error');
                this.loaderBusquedaRoles = false;
            },
            complete: () => {
                this.loaderBusquedaRoles = false;
            }
        });
    }

    llenarListadoRolesFiltro() {
        this.loaderBusquedaRoles = true;

        const datosBusqueda: ICatalogoRolesSistemaBusqueda = {
            nombre: '',
            estatus: true,
            omitir: '',
            
        } as ICatalogoRolesSistemaBusqueda;

        this._catalogoRolesSistemaService.buscarRolesSis(datosBusqueda).subscribe({
            next: (data) => {
                this.lstRolesFiltro = data.datos;
            },
            error: (err) => {
                console.info(err)
                swal.fire(err.error.mensaje, "", 'error');
                this.loaderBusquedaRoles = false;
            },
            complete: () => {
                this.loaderBusquedaRoles = false;
            }
        });
    }

    protected readonly JSON = JSON;
}
