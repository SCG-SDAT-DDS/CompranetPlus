import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { IProveedor } from 'src/app/interfaces/proveedores/IProveedores';
import { ProveedoresService } from '../../services/proveedores.service';
import { Router } from '@angular/router';
import swal from 'sweetalert2';
import { IEstado } from 'src/app/interfaces/catalogos/ICatalogoEstado';
import { ILocalidad } from 'src/app/interfaces/catalogos/ICatalogoLocalidad';
import { IMunicipio } from 'src/app/interfaces/catalogos/ICatalogoMunicipio';
import { getBase64 } from '../../../enums/getBase64-util';
import { IFilesUpload } from 'src/app/interfaces/comun/IFilesUpload';
import { AuthService } from 'src/app/components/login/auth.service';
import { IUsuario } from 'src/app/interfaces/comun/IUsuario';
import { CatalogoAsentamientoService } from 'src/app/services/catalogoAsentamiento.service';
import { ConvocantesService } from '../../../services/convocantes.service';

@Component({
  selector: 'app-form-persona-fisica',
  templateUrl: './form-persona-fisica.component.html',
  styleUrls: ['./form-persona-fisica.component.css'],
})
export class FormPersonaFisicaComponent implements OnInit {
  @Input() idPersonaJuridica: any;
  @Input() proveedorEdit: IProveedor | null = null;
  @Output() cancelarEditar = new EventEmitter<boolean>();

  formEditar: boolean = false;

  formRegistroProveedorPersonaFisica: FormGroup;
  lst_cat_estados: IEstado[] = [];
  lst_cat_municipio: IMunicipio[] = [];
  lst_cat_localidad: ILocalidad[] = [];
  archivoCedula!: IFilesUpload | any;
  archivoSituacionFiscal: any;
  blnResponseCaptcha: boolean = true;
  rfcProveedor: any;
  estado_selected: { id_estado: any; nombre_estado: any };
  municipio_selected: { id_municipio: any; nombre_municipio: any };
  lst_cat_asentamientos: any;

  loaderGuardar: boolean = false;
  loaderBuscarCP: boolean = false;

  /* Estas variables se ocupan solo
     cuando editan proveedor para mostrar
     sus archivos si es que tiene
  */
  archivoCSF = null;
  btnCancelCSF = false;
  archivoCedulaP = null;
  btnCancelCedulaP = false;

  constructor(
    private _proveedor: ProveedoresService,
    private _router: Router,
    private _cp: CatalogoAsentamientoService,
    private _authService: AuthService,
    private _convocantesService: ConvocantesService
  ) {
    this.formRegistroProveedorPersonaFisica =
      this.iniciarFormularioRegistroProveedorPersonaFisica();
    this.estado_selected = { id_estado: null, nombre_estado: null };
    this.municipio_selected = { id_municipio: null, nombre_municipio: null };
  }

  get nombreProveedorForm() {
    return this.formRegistroProveedorPersonaFisica.get('nombre_proveedor');
  }

  get paternoProveedorForm() {
    return this.formRegistroProveedorPersonaFisica.get(
      'primer_apellido_proveedor'
    );
  }

  get maternoProveedorForm() {
    return this.formRegistroProveedorPersonaFisica.get(
      'segundo_apellido_proveedor'
    );
  }

  get passwordForm() {
    return this.formRegistroProveedorPersonaFisica.get('password');
  }

  get passwordConfirmForm() {
    return this.formRegistroProveedorPersonaFisica.get('passwordConfirm');
  }

  get rfc_proveedorForm() {
    return this.formRegistroProveedorPersonaFisica.get('rfc_proveedor');
  }

  get curpProveedorForm() {
    return this.formRegistroProveedorPersonaFisica.get('curp');
  }

  get vialidadForm() {
    return this.formRegistroProveedorPersonaFisica.get('nombre_vialidad');
  }

  get numExteriorForm() {
    return this.formRegistroProveedorPersonaFisica.get('numero_exterior');
  }

  get numInteriorForm() {
    return this.formRegistroProveedorPersonaFisica.get('numero_interior');
  }

  get estadoForm() {
    return this.formRegistroProveedorPersonaFisica.get('id_estado');
  }

  get municipioForm() {
    return this.formRegistroProveedorPersonaFisica.get('id_municipio');
  }

  get localidadForm() {
    return this.formRegistroProveedorPersonaFisica.get('id_localidad');
  }

  get coloniaForm() {
    return this.formRegistroProveedorPersonaFisica.get('nombre_colonia');
  }

  get codigoPostalForm() {
    return this.formRegistroProveedorPersonaFisica.get('codigo_postal');
  }

  get correoForm() {
    return this.formRegistroProveedorPersonaFisica.get('correo_electronico');
  }

  get telefonoForm() {
    return this.formRegistroProveedorPersonaFisica.get('telefono');
  }

  get sitFiscalForm() {
    return this.formRegistroProveedorPersonaFisica.get(
      'url_constancia_situacion'
    );
  }

  numericValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      const hasNonNumeric = /[^\d]/.test(value);
      if (hasNonNumeric) {
        return { nonNumeric: true };
      }
      return null;
    };
  }

  ngOnInit() {
    if (this.proveedorEdit !== undefined && this.proveedorEdit !== null) {
      this.formEditar = true;
      this.formRegistroProveedorPersonaFisica =
        this.iniciarFormularioRegistroProveedorPersonaFisica(
          this.proveedorEdit
        );
      const datos: IProveedor = this.formRegistroProveedorPersonaFisica?.value as IProveedor;

      this.archivoCSF = this.obtenerNombreDeArchivoDesdeURL(this.proveedorEdit.url_constancia_situacion);
      this.archivoCedulaP = this.obtenerNombreDeArchivoDesdeURL(this.proveedorEdit.url_cedula_profesional);

      this.buscarPorCodigoPostal(Number(datos.codigo_postal));
    }
  }

  /**
   * Inicializar formulario de registro de Proveedores
   * @param data
   * @returns
   */
  iniciarFormularioRegistroProveedorPersonaFisica(
    data: IProveedor | null = null
  ) {
    const formTmp: FormGroup | null = new FormGroup({
      id_proveedor: new FormControl(null, {
        nonNullable: true,
        validators: [],
      }),
      rfc_proveedor: new FormControl('', [
        Validators.required,
        Validators.minLength(13),
      ]),
      curp: new FormControl('', [
        Validators.required,
        Validators.minLength(18),
        Validators.maxLength(18),
      ]),
      password: new FormControl(
        '',
        !this.formEditar
          ? [
              Validators.required,
              Validators.pattern(
                '(?=\\D*\\d)(?=[^a-z]*[a-z])(?=[^A-Z]*[A-Z]).{8,30}'
              ),
              Validators.minLength(8),
            ]
          : []
      ),
      passwordConfirm: new FormControl(
        '',
        !this.formEditar ? [Validators.required] : []
      ),
      nombre_proveedor: new FormControl('', [Validators.required]),
      primer_apellido_proveedor: new FormControl('', [Validators.required]),
      segundo_apellido_proveedor: new FormControl('', [Validators.required]),
      numero_registro_imss: new FormControl(null),
      url_cedula_profesional: new FormControl(null),
      numero_cedula_profesional: new FormControl(null),
      descripcion_giro_empresa: new FormControl(null),
      nombre_vialidad: new FormControl('', [Validators.required]),
      numero_exterior: new FormControl('', [Validators.required]),
      numero_interior: new FormControl(null),
      codigo_postal: new FormControl('', [
        Validators.required,
        Validators.minLength(5),
      ]),
      nombre_colonia: new FormControl('', [Validators.required]),
      id_localidad: new FormControl('', [Validators.required]),
      id_municipio: new FormControl('', [Validators.required]),
      id_estado: new FormControl('', [Validators.required]),
      referencia: new FormControl(null),
      correo_electronico: new FormControl('', [
        Validators.required,
        Validators.email,
      ]),
      telefono: new FormControl('', [
        Validators.required,
        this.numericValidator(),
        Validators.minLength(10),
        Validators.maxLength(10),

      ]),
      id_usuario: new FormControl(null),
      activo: new FormControl(null),
      url_constancia_situacion: new FormControl(
        '',
        !this.formEditar ? [Validators.required] : []
      ),
    });

    if (data != null) {
      if (data.id_proveedor != null) {
        formTmp.patchValue({ id_proveedor: data.id_proveedor });
      }

      if (data.rfc_proveedor != null) {
        formTmp.patchValue({ rfc_proveedor: data.rfc_proveedor });
      }

      if (data.curp != null) {
        formTmp.patchValue({ curp: data.curp });
      }

      if (data.nombre_proveedor != null) {
        formTmp.patchValue({ nombre_proveedor: data.nombre_proveedor });
      }

      if (data.primer_apellido_proveedor != null) {
        formTmp.patchValue({
          primer_apellido_proveedor: data.primer_apellido_proveedor,
        });
      }

      if (data.segundo_apellido_proveedor != null) {
        formTmp.patchValue({
          segundo_apellido_proveedor: data.segundo_apellido_proveedor,
        });
      }

      if (data.numero_registro_imss != null) {
        formTmp.patchValue({ numero_registro_imss: data.numero_registro_imss });
      }

      if (data.numero_cedula_profesional != null) {
        formTmp.patchValue({
          numero_cedula_profesional: data.numero_cedula_profesional,
        });
      }

      if (data.descripcion_giro_empresa != null) {
        formTmp.patchValue({
          descripcion_giro_empresa: data.descripcion_giro_empresa,
        });
      }

      if (data.nombre_vialidad != null) {
        formTmp.patchValue({ nombre_vialidad: data.nombre_vialidad });
      }

      if (data.numero_exterior != null) {
        formTmp.patchValue({ numero_exterior: data.numero_exterior });
      }

      if (data.numero_interior != null) {
        formTmp.patchValue({ numero_interior: data.numero_interior });
      }

      if (data.codigo_postal != null) {
        formTmp.patchValue({ codigo_postal: data.codigo_postal });
      }

      if (data.nombre_colonia != null) {
        formTmp.patchValue({ nombre_colonia: data.nombre_colonia });
      }

      if (data.id_localidad != null) {
        formTmp.patchValue({ id_localidad: data.id_localidad });
      }

      if (data.id_municipio != null) {
        formTmp.patchValue({ id_municipio: data.id_municipio });
      }

      if (data.id_estado != null) {
        formTmp.patchValue({ id_estado: data.id_estado });
      }

      if (data.referencia != null) {
        formTmp.patchValue({ referencia: data.referencia });
      }

      if (data.correo_electronico != null) {
        formTmp.patchValue({ correo_electronico: data.correo_electronico });
      }

      if (data.telefono != null) {
        formTmp.patchValue({ telefono: data.telefono });
      }

      if (data.id_usuario !== null) {
        formTmp.patchValue({ id_usuario: data.id_usuario });
      }

      if (data.activo !== null) {
        formTmp.patchValue({ activo: data.activo });
      }
    }

    return formTmp;
  }

  onPasswordConfirmInput() {
    if (
      this.formRegistroProveedorPersonaFisica.get('password')?.value ===
      this.formRegistroProveedorPersonaFisica.get('passwordConfirm')?.value
    ) {
      this.formRegistroProveedorPersonaFisica
        ?.get('passwordConfirm')
        ?.setErrors(null);
    } else {
      this.formRegistroProveedorPersonaFisica
        ?.get('passwordConfirm')
        ?.setErrors({ mismatchedPasswords: true });
    }
  }

  /**
   * Guardar los datos del Proveedor
   * @author Adan
   */
  guardarSubmit() {
    if (
      this.formRegistroProveedorPersonaFisica == undefined ||
      this.formRegistroProveedorPersonaFisica.invalid
    ) {
      for (const control of Object.keys(
        this.formRegistroProveedorPersonaFisica.controls
      )) {
        this.formRegistroProveedorPersonaFisica.controls[
          control
        ].markAsTouched();
      }
      swal.fire('Hay campos obligatorios sin llenar', '', 'error');
      return;
    }

    if (this.blnResponseCaptcha && !this.formEditar) {
      swal.fire('Falta validar el Captcha', '', 'error');
      return;
    }
    this.loaderGuardar = true;
    const datosGuardar: IProveedor = this.formRegistroProveedorPersonaFisica
      ?.value as IProveedor;

    if (!this.formEditar) {
      datosGuardar.id_tipo_personeria_juridica =
        this.idPersonaJuridica.id_tipo_personeria_juridica;
    }
    datosGuardar.url_cedula_profesional = this.archivoCedula
      ? this.archivoCedula
      : null;
    datosGuardar.url_constancia_situacion = this.archivoSituacionFiscal;
    datosGuardar.id_estado = this.estado_selected.id_estado;
    datosGuardar.id_municipio = this.municipio_selected.id_municipio;
    datosGuardar.id_localidad = this.municipio_selected.id_municipio;

    const jsonData = {
      proveedor: datosGuardar,
    };

    if (this.formEditar) {
      this._proveedor.guardarProveedorAdmin(jsonData).subscribe({
        next: (data) => {
          swal.fire(
            this.formEditar
              ? '¡La información se actualizó correctamente!'
              : data.mensaje,
            '',
            'success'
          );
        },
        error: (err) => {
          swal.fire(
            err.error.mensaje,'',
            'error'
          );
          this.loaderGuardar = false;
        },
        complete: () => {
          this.loaderGuardar = false;
          this.cancelar();
        },
      });
    } else {
      this._proveedor.guardarProveedor(jsonData).subscribe({
        next: (data) => {
          swal.fire(
            this.formEditar
              ? '¡La información se actualizó correctamente!'
              : data.mensaje,
            '',
            'success'
          );
          if (!this.formEditar) {
            const login = {
              usuario: datosGuardar.rfc_proveedor,
              password: datosGuardar.password,
            };
            this.iniciarSesion(login);
          }
        },
        error: (err) => {
          swal.fire(
            err.error.mensaje,
            '',
            'error'
          );
          this.loaderGuardar = false;
        },
        complete: () => {
          this.loaderGuardar = false;
          this.cancelar();
        },
      });
    }
  }

  cancelar() {
    this.formRegistroProveedorPersonaFisica.reset();

    this.formEditar
      ? this.cancelarEditar.emit(true)
      : this._router.navigateByUrl('inicio/portal-licitaciones');
  }

  /**
   * Codigos para subida de archivos
   */
  obtenerCedulaBase64(event: any) {
    this.archivoCedula = null;
    let files = event.target.files;
    let archivo = files[0];

    if (files && archivo) {
      getBase64(archivo)
        .then((data64) => {
          this.archivoCedula = {
            base64: String(data64),
            nombreArchivo: archivo.name,
            procedimiento: '1',
            tipoArchivo: 8,
            encriptar: false,
          };
          this.archivoCedula.base64 = this.archivoCedula.base64?.replace(
            /^data:.+;base64,/,
            ''
          );
        })
        .catch((err) => {
          console.error(err);
        });
    } else {
      alert('No se seleccionó ningún archivo.');
    }
  }

  obtenerSitFiscalBase64(event: any) {
    this.archivoSituacionFiscal = [];
    let files = event.target.files;
    let archivo = files[0];

    if (files && archivo) {
      getBase64(archivo)
        .then((data64) => {
          this.archivoSituacionFiscal = {
            base64: String(data64),
            nombreArchivo: archivo.name,
            procedimiento: null,
            tipoArchivo: 7,
            encriptar: false,
          };
          this.archivoSituacionFiscal.base64 =
            this.archivoSituacionFiscal.base64.replace(/^data:.+;base64,/, '');
        })
        .catch((err) => {
          console.error(err);
        });
    } else {
      alert('No se seleccionó ningún archivo.');
    }
  }

  captchaResponse(response: boolean) {
    this.blnResponseCaptcha = response;
  }

  iniciarSesion(login: IUsuario) {
    this._authService.login(login, false).subscribe({
      next: (data) => {
        this._router.navigateByUrl('/inicio/portal-licitaciones');
        window.location.reload();
      },
    });
  }

  buscarPorCodigoPostal(cp?: number) {
    if (this.codigoPostalForm == undefined || this.codigoPostalForm.invalid) {
      swal.fire('Ingrese un código postal valido', '', 'error');
    } else {
      this.loaderBuscarCP = true;
      const cp = Number(this.codigoPostalForm?.value);
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
          this.lst_cat_localidad = data.datos.localidades;
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

  obtenerNombreDeArchivoDesdeURL(url: any) {
    if (url == null) return null;

    const partesDeURL = url.split('/');
    const nombreDeArchivo = partesDeURL[partesDeURL.length - 1];
    return nombreDeArchivo;
  }

  descargarArchivo(base64String: any, fileName: any) {
    const source = `data:application/pdf;base64,${base64String}`;
    const link = document.createElement("a");
    link.href = source;
    link.download = `${fileName}`;
    link.click();
  }

  obtenerArchivo(url: any, nombre: any){
    this._convocantesService.obtenerArchivoBase64(url, false).subscribe({
      next: (data) => {
        let base64String = data.datos;
        this.descargarArchivo(base64String, nombre);
      },
      error: (err) => {
          console.info(err)
          swal.fire(err.error.mensaje, "", 'error');
      },
      complete: () => {
      }
    });
  }

  /* Estas funciones de cancelar solo aplican cuando editan un proveedor
     y suben un archivo nuevo ya sea de situacion fiscal o INE
  */

  cancelarArchivoCSF() {
    this.btnCancelCSF = false;
    this.archivoSituacionFiscal = undefined;
    this.formRegistroProveedorPersonaFisica.controls[
      'url_constancia_situacion'
    ].reset();
  }

  cancelarArchivoCedula() {
    this.btnCancelCedulaP = false;
    this.archivoCedula = undefined;
    this.formRegistroProveedorPersonaFisica.controls[
      'url_cedula_profesional'
    ].reset();
  }
}
