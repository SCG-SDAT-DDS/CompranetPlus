import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { IProveedor } from 'src/app/interfaces/proveedores/IProveedores';
import { ProveedoresService } from '../../services/proveedores.service';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import swal from 'sweetalert2';
import { SociosService } from '../../services/socios.service';
import { ISociosProveedor } from 'src/app/interfaces/proveedores/ISociosProveedor';
import { IEstado } from 'src/app/interfaces/catalogos/ICatalogoEstado';
import { IMunicipio } from 'src/app/interfaces/catalogos/ICatalogoMunicipio';
import { ILocalidad } from 'src/app/interfaces/catalogos/ICatalogoLocalidad';
import { getBase64 } from '../../../enums/getBase64-util';
import { IDetDocumentosProveedores } from '../../../interfaces/proveedores/IDetDocumentosProveedores';
import { DocumentoProveedorService } from '../../services/documentoProveedor.service';
import { IFilesUpload } from 'src/app/interfaces/comun/IFilesUpload';
import { IUsuario } from 'src/app/interfaces/comun/IUsuario';
import { AuthService } from 'src/app/components/login/auth.service';
import { CatalogoAsentamientoService } from 'src/app/services/catalogoAsentamiento.service';
import { ConvocantesService } from '../../../services/convocantes.service';

@Component({
  selector: 'app-form-persona-moral',
  templateUrl: './form-persona-moral.component.html',
  styleUrls: ['./form-persona-moral.component.css'],
})
export class FormPersonaMoralComponent implements OnInit {
  @Input() idPersonaJuridica: any;
  @Input() proveedorEdit: IProveedor | null = null;
  @Output() cancelarEditar = new EventEmitter<boolean>();

  formEditar: boolean = false;
  editarSocio: boolean = false;

  formRegistroProveedorPersonaMoral: FormGroup;
  formRegistroSocios: FormGroup;

  lst_actas: any[] = [];
  lst_cat_estados: IEstado[] = [];
  lst_cat_municipio: IMunicipio[] = [];
  lst_socios: ISociosProveedor[] = [];
  lst_cat_localidad: ILocalidad[] = [];
  lst_Documentos_prov: IDetDocumentosProveedores[] = [];

  modalRefAgregarSocio: NgbModalRef | undefined;
  messageTitle: string = '';
  messageSubTitle: string = '';
  messageButton: string = '';
  modalRefEliminarSocio: NgbModalRef | undefined;
  socioEdit: boolean = false;
  archivoIneAdverso!: IFilesUpload | any;
  archivoIneReverso!: IFilesUpload | any;
  archivoSituacionFiscal!: IFilesUpload | any;
  archivosActas: IDetDocumentosProveedores[] = [];
  blnResponseCaptcha: boolean = true;
  rfcProveedor: any;
  estado_selected: { id_estado: any; nombre_estado: any };
  municipio_selected: { id_municipio: any; nombre_municipio: any };
  lst_cat_asentamientos: any;
  indexSocio: number = 0;

  loaderGuardar: boolean = false;
  loaderBuscarCP: boolean = false;
  loaderBuscarSocios: boolean = false;
  loaderDocumentosProv: boolean = false;

  /* Estas variables se ocupan solo
     cuando editan proveedor para mostrar
     sus archivos si es que tiene
  */
  archivoCSF = null;
  archivoINEFront = null;
  archivoINEBack = null;
  btnCancelCSF = false;
  btnCancelINEFront = false;
  btnCancelINEBack = false;

  constructor(
    private _proveedor: ProveedoresService,
    private _socioService: SociosService,
    private _router: Router,
    private modalService: NgbModal,
    private _documentosProveedor: DocumentoProveedorService,
    private _cp: CatalogoAsentamientoService,
    private _authService: AuthService,
    private _convocantesService: ConvocantesService
  ) {
    this.formRegistroProveedorPersonaMoral =
      this.iniciarFormularioRegistroProveedorPersonaMoral();
    this.formRegistroSocios = this.iniciarFormularioRegistroSocios();
    this.estado_selected = { id_estado: null, nombre_estado: null };
    this.municipio_selected = { id_municipio: null, nombre_municipio: null };
  }

  get nombreProveedorForm() {
    return this.formRegistroProveedorPersonaMoral.get('nombre_proveedor');
  }

  get paternoProveedorForm() {
    return this.formRegistroProveedorPersonaMoral.get(
      'primer_apellido_proveedor'
    );
  }

  get maternoProveedorForm() {
    return this.formRegistroProveedorPersonaMoral.get(
      'segundo_apellido_proveedor'
    );
  }

  get nombreRepresentanteForm() {
    return this.formRegistroProveedorPersonaMoral.get('nombre_representante');
  }

  get paternoRepresentanteForm() {
    return this.formRegistroProveedorPersonaMoral.get(
      'primer_apellido_representante'
    );
  }

  get maternoRepresentanteForm() {
    return this.formRegistroProveedorPersonaMoral.get(
      'segundo_apellido_representante'
    );
  }

  get passwordForm() {
    return this.formRegistroProveedorPersonaMoral.get('password');
  }

  get passwordConfirmForm() {
    return this.formRegistroProveedorPersonaMoral.get('passwordConfirm');
  }

  get rfc_proveedorForm() {
    return this.formRegistroProveedorPersonaMoral.get('rfc_proveedor');
  }

  get ineRepresentanteForm() {
    return this.formRegistroProveedorPersonaMoral.get(
      'url_identificacion_representante'
    );
  }
  get ineReversoRepresentanteForm() {
    return this.formRegistroProveedorPersonaMoral.get(
      'url_identificacion_reverso_representante'
    );
  }

  get razonSocialForm() {
    return this.formRegistroProveedorPersonaMoral.get('razon_social');
  }

  get vialidadForm() {
    return this.formRegistroProveedorPersonaMoral.get('nombre_vialidad');
  }

  get numExteriorForm() {
    return this.formRegistroProveedorPersonaMoral.get('numero_exterior');
  }

  get numInteriorForm() {
    return this.formRegistroProveedorPersonaMoral.get('numero_interior');
  }

  get estadoForm() {
    return this.formRegistroProveedorPersonaMoral.get('id_estado');
  }

  get municipioForm() {
    return this.formRegistroProveedorPersonaMoral.get('id_municipio');
  }

  get localidadForm() {
    return this.formRegistroProveedorPersonaMoral.get('id_localidad');
  }

  get coloniaForm() {
    return this.formRegistroProveedorPersonaMoral.get('nombre_colonia');
  }

  get codigoPostalForm() {
    return this.formRegistroProveedorPersonaMoral.get('codigo_postal');
  }

  get correoForm() {
    return this.formRegistroProveedorPersonaMoral.get('correo_electronico');
  }

  get telefonoForm() {
    return this.formRegistroProveedorPersonaMoral.get('telefono');
  }

  get sitFiscalForm() {
    return this.formRegistroProveedorPersonaMoral.get(
      'url_constancia_situacion'
    );
  }

  /**
   * Campos del formulario de socios
   * */
  get nombreSocioForm() {
    return this.formRegistroSocios.get('nombre_socio');
  }

  get paternoSocioForm() {
    return this.formRegistroSocios.get('primer_apellido_socio');
  }

  get maternoSocioForm() {
    return this.formRegistroSocios.get('segundo_apellido_socio');
  }

  get rfcSocioForm() {
    return this.formRegistroSocios.get('rfc_socio');
  }

  get curpSocioForm() {
    return this.formRegistroSocios.get('curp_socio');
  }

  get domicilioForm() {
    return this.formRegistroSocios.get('domicilio');
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

    // validacion para editar proveedor //
    if (this.proveedorEdit !== undefined && this.proveedorEdit !== null) {
      this.formEditar = true;
      this.formRegistroProveedorPersonaMoral =
        this.iniciarFormularioRegistroProveedorPersonaMoral(this.proveedorEdit);

      const datos: IProveedor = this.formRegistroProveedorPersonaMoral?.value as IProveedor;

      this.archivoCSF = this.obtenerNombreDeArchivoDesdeURL(this.proveedorEdit.url_constancia_situacion);
      this.archivoINEFront = this.obtenerNombreDeArchivoDesdeURL(this.proveedorEdit.url_identificacion_representante);
      this.archivoINEBack = this.obtenerNombreDeArchivoDesdeURL(this.proveedorEdit.url_identificacion_reverso_representante);

      this.buscarPorCodigoPostal(Number(datos.codigo_postal));

      this.obtenerDocumentosProveedor(datos.id_proveedor);

      this.obtenerSocios(datos.id_proveedor);
    }
  }

  /**
   * Inicializar formulario de registro de Proveedores
   * @param data
   * @returns
   */
  iniciarFormularioRegistroProveedorPersonaMoral(
    data: IProveedor | null = null
  ) {
    const formTmp: FormGroup | null = new FormGroup({
      id_proveedor: new FormControl(null, {
        nonNullable: true,
        validators: [],
      }),
      rfc_proveedor: new FormControl('', [
        Validators.required,
        Validators.minLength(12),
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
      id_tipo_personeria_juridica: new FormControl(''),
      passwordConfirm: new FormControl(
        '',
        !this.formEditar ? [Validators.required] : []
      ),
      nombre_proveedor: new FormControl('', [Validators.required]),
      primer_apellido_proveedor: new FormControl('', [Validators.required]),
      segundo_apellido_proveedor: new FormControl('', [Validators.required]),
      nombre_representante: new FormControl('', [Validators.required]),
      primer_apellido_representante: new FormControl('', [Validators.required]),
      segundo_apellido_representante: new FormControl('', [
        Validators.required,
      ]),
      url_identificacion_representante: new FormControl(
        '',
        !this.formEditar ? [Validators.required] : []
      ),
      url_identificacion_reverso_representante: new FormControl(
        '',
        !this.formEditar ? [Validators.required] : []
      ),
      razon_social: new FormControl('', [Validators.required]),
      numero_registro_imss: new FormControl(null),
      descripcion_giro_empresa: new FormControl(null),
      nombre_vialidad: new FormControl('', [Validators.required]),
      numero_exterior: new FormControl('', [Validators.required]),
      numero_interior: new FormControl(null),
      codigo_postal: new FormControl('', [Validators.required]),
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

      if (data.id_tipo_personeria_juridica != null) {
        formTmp.patchValue({
          id_tipo_personeria_juridica: data.id_tipo_personeria_juridica,
        });
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

      if (data.nombre_representante != null) {
        formTmp.patchValue({ nombre_representante: data.nombre_representante });
      }

      if (data.primer_apellido_representante != null) {
        formTmp.patchValue({
          primer_apellido_representante: data.primer_apellido_representante,
        });
      }

      if (data.segundo_apellido_representante != null) {
        formTmp.patchValue({
          segundo_apellido_representante: data.segundo_apellido_representante,
        });
      }

      if (data.razon_social != null) {
        formTmp.patchValue({
          razon_social: data.razon_social,
        });
      }

      if (data.numero_registro_imss != null) {
        formTmp.patchValue({ numero_registro_imss: data.numero_registro_imss });
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
      this.formRegistroProveedorPersonaMoral.get('password')?.value ===
      this.formRegistroProveedorPersonaMoral.get('passwordConfirm')?.value
    ) {
      this.formRegistroProveedorPersonaMoral
        ?.get('passwordConfirm')
        ?.setErrors(null);
    } else {
      this.formRegistroProveedorPersonaMoral
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
      this.formRegistroProveedorPersonaMoral == undefined ||
      this.formRegistroProveedorPersonaMoral.invalid
    ) {
      for (const control of Object.keys(
        this.formRegistroProveedorPersonaMoral.controls
      )) {
        this.formRegistroProveedorPersonaMoral.controls[
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
    const datosGuardar: IProveedor = this.formRegistroProveedorPersonaMoral
      ?.value as IProveedor;

    if (!this.formEditar) {
      datosGuardar.id_tipo_personeria_juridica =
        this.idPersonaJuridica.id_tipo_personeria_juridica;
    }

    datosGuardar.url_identificacion_representante = this.archivoIneAdverso;
    datosGuardar.url_identificacion_reverso_representante =
      this.archivoIneReverso;
    datosGuardar.url_constancia_situacion = this.archivoSituacionFiscal;
    datosGuardar.id_estado = this.estado_selected.id_estado;
    datosGuardar.id_municipio = this.municipio_selected.id_municipio;
    datosGuardar.id_localidad = this.municipio_selected.id_municipio;
    const jsonData = {
      proveedor: datosGuardar,
      socios: this.lst_socios,
      documentos: this.archivosActas,
    };

    if (this.formEditar) {
      console.log(jsonData);
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
          this.cancelarEditar.emit(false);
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
          this.cancelarEditar.emit(false);
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
    this.formRegistroProveedorPersonaMoral.reset();

    this.formEditar
      ? this.cancelarEditar.emit(true)
      : this._router.navigateByUrl('inicio/portal-licitaciones');
  }

  /**
   * Mostrar seccion de registro y ocultal tablero de usuarios
   */
  agregarSociosModal(modal: any) {
    this.modalRefAgregarSocio = this.modalService.open(modal, { size: 'lg' });
    this.messageTitle = 'Registro';
    this.messageSubTitle = 'Registrar un socio';
    this.messageButton = 'Registar';
    this.editarSocio = false;

    this.formRegistroSocios = this.iniciarFormularioRegistroSocios();
    this.formRegistroSocios.controls['id_proveedor_socio'].setValidators(null);
    // this.formRegistroSocios.controls['vigente'].setValidators(null)
    this.formRegistroSocios.updateValueAndValidity();
  }

  /**
   * Metodo para mostrar sección de editar y ocultar tablero de Usuarios
   * @author Adan
   *
   * @param datos (Datos del item a modificar)
   */
  editarSociosModal(modal: any, datos: ISociosProveedor, indexSocio: number) {
    this.modalRefAgregarSocio = this.modalService.open(modal, { size: 'lg' });
    this.messageTitle = 'Editar';
    this.messageSubTitle = 'Editar un socio';
    this.messageButton = 'Actualizar';
    this.editarSocio = true;
    this.indexSocio = indexSocio;
    this.formRegistroSocios = this.iniciarFormularioRegistroSocios(datos);
  }

  eliminarSociosModal(modal: any, datos: ISociosProveedor) {
    this.formRegistroSocios = this.iniciarFormularioRegistroSocios(datos);
    this.modalRefEliminarSocio = this.modalService.open(modal, { size: 'lg' });
  }

  cerrarModalRegistroOeliminar() {
    this.modalRefAgregarSocio?.close();
    this.modalRefEliminarSocio?.close();
    this.formRegistroSocios?.reset();
  }

  iniciarFormularioRegistroSocios(datos: ISociosProveedor | null = null) {
    const formTmp: FormGroup | null = new FormGroup({
      id_proveedor_socio: new FormControl(null, {
        nonNullable: true,
        validators: [],
      }),
      id_proveedor: new FormControl(null, {
        nonNullable: true,
        validators: [],
      }),
      nombre_socio: new FormControl('', [Validators.required]),
      primer_apellido_socio: new FormControl('', [Validators.required]),
      segundo_apellido_socio: new FormControl('', [Validators.required]),
      rfc_socio: new FormControl('', [
        Validators.required,
        Validators.minLength(13),
        Validators.maxLength(13),
      ]),
      curp_socio: new FormControl('', [
        Validators.required,
        Validators.minLength(18),
        Validators.maxLength(18),
      ]),
      domicilio: new FormControl('', [Validators.required]),
      vigente: new FormControl(1)
    });

    if (datos != null) {
      if (datos.id_proveedor_socio != null) {
        formTmp.patchValue({ id_proveedor_socio: datos.id_proveedor_socio });
      }

      if (datos.id_proveedor != null) {
        formTmp.patchValue({ id_proveedor: datos.id_proveedor });
      }

      if (datos.nombre_socio != null) {
        formTmp.patchValue({ nombre_socio: datos.nombre_socio });
      }

      if (datos.primer_apellido_socio != null) {
        formTmp.patchValue({
          primer_apellido_socio: datos.primer_apellido_socio,
        });
      }

      if (datos.segundo_apellido_socio != null) {
        formTmp.patchValue({
          segundo_apellido_socio: datos.segundo_apellido_socio,
        });
      }

      if (datos.rfc_socio != null) {
        formTmp.patchValue({ rfc_socio: datos.rfc_socio });
      }

      if (datos.curp_socio != null) {
        formTmp.patchValue({ curp_socio: datos.curp_socio });
      }

      if (datos.domicilio != null) {
        formTmp.patchValue({ domicilio: datos.domicilio });
      }

      if (datos.vigente != null) {
        formTmp.patchValue({ vigente: datos.vigente });
      }
    }

    return formTmp;
  }

  guardarSocioSubmit() {
    if (
      this.formRegistroSocios == undefined ||
      this.formRegistroSocios.invalid
    ) {
      for (const control of Object.keys(this.formRegistroSocios.controls)) {
        this.formRegistroSocios.controls[control].markAsTouched();
      }
      return;
    }
    // Asegúrate de que lst_socios no sea null antes de utilizar push
    if (this.lst_socios === null) {
      this.lst_socios = [];
    }

    if (this.editarSocio) {

      let socioEditado = this.formRegistroSocios.value as ISociosProveedor;

      // Se filtra el array con socios que no sean igual al socio editado
      this.lst_socios = this.lst_socios.filter(
        (socio, index) => index != this.indexSocio
      );

      // Se agrega el socio editado al array desde el indice que tenia para no moverlo de posición
      this.lst_socios.splice(this.indexSocio, 0, socioEditado);

    } else {
      this.lst_socios.push(this.formRegistroSocios.value);
    }

    this.cerrarModalRegistroOeliminar();
  }

  eliminarSocioConfirm() {
    let socioEliminar = this.formRegistroSocios.value as ISociosProveedor;

    let indexSocio = this.lst_socios.findIndex(
      (socio) => socio.id_proveedor_socio == socioEliminar.id_proveedor_socio
    );

    this.lst_socios[indexSocio].vigente = 0;

    this.cerrarModalRegistroOeliminar();
  }

  eliminarSocioNuevo(indexSocio: number) {
    this.lst_socios.splice(indexSocio,1);
  }

  /**
   * Codigos para subida de archivos
   */
  obtenerIneFrontBase64(event: any) {
    this.archivoIneAdverso = null;
    let files = event.target.files;
    let archivo = files[0];

    if (files && archivo) {
      getBase64(archivo)
        .then((data64) => {
          this.archivoIneAdverso = {
            base64: String(data64),
            nombreArchivo: archivo.name,
            procedimiento: '1',
            tipoArchivo: 6,
            encriptar: false,
          };
          this.archivoIneAdverso.base64 =
            this.archivoIneAdverso.base64?.replace(/^data:.+;base64,/, '');
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }

  obtenerIneBackBase64(event: any) {
    this.archivoIneReverso = null;
    let files = event.target.files;
    let archivo = files[0];

    if (files && archivo) {
      getBase64(archivo)
        .then((data64) => {
          this.archivoIneReverso = {
            base64: String(data64),
            nombreArchivo: archivo.name,
            procedimiento: '1',
            tipoArchivo: 6,
            encriptar: false,
          };
          this.archivoIneReverso.base64 =
            this.archivoIneReverso.base64?.replace(/^data:.+;base64,/, '');
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }

  obtenerSitFiscalBase64(event: any) {
    this.archivoSituacionFiscal = null;
    let files = event.target.files;
    let archivo = files[0];

    if (files && archivo) {
      getBase64(archivo)
        .then((data64) => {
          this.archivoSituacionFiscal = {
            base64: String(data64),
            nombreArchivo: archivo.name,
            procedimiento: '1',
            tipoArchivo: 7,
            encriptar: false,
          };
          this.archivoSituacionFiscal.base64 =
            this.archivoSituacionFiscal.base64?.replace(/^data:.+;base64,/, '');
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }

  obtenerArchivosBase64(event: any) {
    let files = event.target.files;

    if (files && files.length > 0) {
      for (const element of files) {
        const archivo = element;
        getBase64(archivo)
          .then((data64) => {
            const files: IFilesUpload | any = {
              base64: String(data64),
              nombreArchivo: archivo.name,
              procedimiento: '1',
              tipoArchivo: 9,
              encriptar: false,
            };
            files.base64 = files?.base64.replace(/^data:.+;base64,/, '');
            this.archivosActas.push({
              id_documento_proveedor: null,
              id_proveedor: null,
              url_documento_proveedor: files,
              activo: null,
              fecha_ultima_mod: null,
            });
          })
          .catch((err) => {
            console.error(err);
          });
      }
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

  // Funcion para obtener Documentos de Acta Constitutiva
  obtenerDocumentosProveedor(id_proveedor: number){
    this.loaderDocumentosProv = true;
    this._documentosProveedor.obtenerDocumentosProveedor(id_proveedor).subscribe({
      next: (res) => {
        this.lst_actas = [];
        this.lst_Documentos_prov = res.datos;

        this.lst_actas = this.lst_Documentos_prov.map((documento) => {
          let nombreArchivo = this.obtenerNombreDeArchivoDesdeURL(documento.url_documento_proveedor);

          let propiedades = {
            "id_documento": documento.id_documento_proveedor,
            "nombre_archivo": nombreArchivo,
            "activo": documento.activo,
            "url_documento": documento.url_documento_proveedor
          }

          return propiedades;
        });
      },
      error: (err) => {
        console.info(err);
        swal.fire(err.error.mensaje,"",'error');
      },
      complete: () => {
        this.loaderDocumentosProv = false;
      },
    })
  }

  obtenerSocios(id_proveedor: number){
    this.loaderBuscarSocios = true;
    this._socioService.obtenerSociosProveedor(id_proveedor).subscribe({
      next: (res) => {
        let { data, total, per_page } = res.datos;

        this.lst_socios = data;
        /*if (this.proveedores !== null) {
          this.collectionSize = total;
          this.pageSize = per_page;
        } */
      },
      error: (err) => {
        console.info(err);
        swal.fire(err.error.mensaje,"",'error');
      },
      complete: () => {
        this.loaderBuscarSocios = false;
      },
    })
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
    this.formRegistroProveedorPersonaMoral.controls[
      'url_constancia_situacion'
    ].reset();
  }

  cancelarArchivoINEFront() {
    this.btnCancelINEFront = false;
    this.archivoIneAdverso = undefined;
    this.formRegistroProveedorPersonaMoral.controls[
      'url_identificacion_representante'
    ].reset();
  }

  cancelarArchivoINEBack() {
    this.btnCancelINEBack = false;
    this.archivoIneReverso = undefined;
    this.formRegistroProveedorPersonaMoral.controls[
      'url_identificacion_reverso_representante'
    ].reset();
  }
}
