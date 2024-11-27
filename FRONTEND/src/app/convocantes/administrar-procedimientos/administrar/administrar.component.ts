import { Component, OnInit  } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {Router, ActivatedRoute, ParamMap, NavigationEnd} from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CriptoService } from 'src/app/admin/services/Cripto.service';
import { AppSettingsService } from 'src/app/app-settings.service';
import { AuthService } from 'src/app/components/login/auth.service';
import { ICatalogoUnidadCompradora } from 'src/app/interfaces/catalogos/ICatalogoUnidadCompradora';
import { IBusquedaProcedimiento } from 'src/app/interfaces/convocantes/IBusquedaProcedimiento';
import { IProcedimientoAdministrativo } from 'src/app/interfaces/convocantes/IProcedimientoAdministrativo';
import { ITipoProcedimiento } from 'src/app/interfaces/convocantes/ITipoProcedimiento';
import { ConvocantesService } from 'src/app/services/convocantes.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-administrar',
  templateUrl: './administrar.component.html',
  styleUrls: ['./administrar.component.css']
})
export class AdministrarComponent implements OnInit {

  idUnidadCompradoraElegida: number = 0;

  idTipo: number;
  tipo: string | null;
  titulo: string;
  tituloSingular: string;
  tituloParticipantes: string;

  loaderBusqueda: boolean = false;


  formBusqueda: FormGroup;

  public blnActivarAdministrar: boolean;
  public blnActivarAgregar: boolean;
  public blnActivarDetalle: boolean;
  public blnActivarAnexosProcedimientos: boolean;
  public blnActivarDiferendoProcedimientos: boolean;
  public blnActivarRecepcionProcedimientos: boolean;
  public blnActivarContratos: boolean;
  public blnVerParticipante: boolean;
  public blnFalloProcedimiento: boolean;

  lstTablaTiposProcedimientos: ITipoProcedimiento[] | null = null;
  lstTablaProcedimientos: IProcedimientoAdministrativo[] | null = null;
  lstTablaUnidadesCompradoras: ICatalogoUnidadCompradora[] | null = null;


  public procedimientoElegido: IProcedimientoAdministrativo | null = null;
  falloProcedimientoElegido: IProcedimientoAdministrativo | null = null;
  participanteInvitadoElegido: IProcedimientoAdministrativo | null = null;

  tipoParticipacion: number = 0;

  public blnActivarEditar: boolean = false;

  messageTitle: string = '';
  messageSubTitle: string = '';
  messageButton: string = '';
  procedimientoAdministrativo: any;

  procedimientosAdquisicionesServicios = ['LPA', 'LSA', 'LPS', 'LSS'];
  procedimientosObra = ['LPO','LSO'];
  autorizacionData: any;

  page = 1;
  pageSize = 10;
  collectionSize= 0;

  blnActivarCargarPartidasProveedor = false;
  blnActivarRespuestasProcedimient=false;
  selectedUC: ICatalogoUnidadCompradora | any;

  constructor(private modalService: NgbModal,private router: Router, private _authService: AuthService,
    private rutaActiva: ActivatedRoute, private _convocantesService: ConvocantesService, private _cripto: CriptoService,
    private _app: AppSettingsService) {

      //recargar al entrar por link
      this.router.routeReuseStrategy.shouldReuseRoute = function(){
        return false;
      }
      this.router.events.subscribe((evt) => {
        if (evt instanceof NavigationEnd) {
          // trick the Router into believing it's last link wasn't previously loaded
          this.router.navigated = false;
          // if you need to scroll back to top, here is the right place
          window.scrollTo(0, 0);
        }
      });
      //fin recargar al entrar por link

      this.tipo = "";
      this.idTipo = 0;
      this.titulo = "";
      this.tituloSingular = "";
      this.tituloParticipantes = "Ver / Agregar Participantes";

      this.blnActivarAdministrar = true;
      this.blnActivarAgregar = false;
      this.blnActivarDetalle = false;
      this.blnActivarAnexosProcedimientos = false;
      this.blnActivarDiferendoProcedimientos = false;
      this.blnActivarRecepcionProcedimientos = false;
      this.blnActivarContratos = false;
      this.blnVerParticipante = false;
      this.blnFalloProcedimiento = false;
      this.formBusqueda = this.iniciarFormularioBusqueda();

    }

    iniciarFormularioBusqueda() {
      return new FormGroup({
          numero_procedimiento: new FormControl(null, [
              Validators.minLength(3)
          ]),
          concepto_contratacion: new FormControl(null, [
            Validators.minLength(3)
        ]),
          id_tipo_procedimiento: new FormControl(null, []),
          id_tipo_contratacion: new FormControl(null, []),
          nombre_unidad_compradora: new FormControl(null, [Validators.required])
      });
    }

  ngOnInit() {
    this.rutaActiva.paramMap.subscribe(
      (params: ParamMap) => {
        this.tipo = params.get("tipo");
        if(this.tipo == 'publica'){
          this.idTipo = 1;
          this.titulo = "Licitaciones públicas";
          this.tituloSingular = "Licitación pública";
          this.tituloParticipantes = "Ver / Agregar Participantes";

        }else if(this.tipo == 'simplificada'){
          this.idTipo = 2;
          this.titulo = "Licitaciones simplificadas";
          this.tituloSingular = "Licitación simplificada";
          this.tituloParticipantes = "Ver / Agregar Invitados";


        }

        this.blnActivarAdministrar = true;
        this.blnActivarAgregar = false;
        this.blnActivarDetalle = false;
        this.blnActivarAnexosProcedimientos = false;
        this.blnActivarDiferendoProcedimientos = false;
        this.blnActivarContratos = false;

        this.llenarCatalogos();
      }
    );
  }

  llenarCatalogos(){

    this.loaderBusqueda = true;
    this._convocantesService.obtenerTiposProcedimientos(1).subscribe({
        next: (data) => {
            this.lstTablaTiposProcedimientos = data.datos;
        },
        error: (err) => {
            console.info(err)
            Swal.fire(err.error.mensaje, "", 'error');
            this.loaderBusqueda = false;
        },
        complete: () => {
            this.loaderBusqueda = false;
        }
    });

    this.loaderBusqueda = true;
    this._convocantesService.obtenerUnidadesCompradorasUsuario(1).subscribe({
      next: (data) => {
          this.lstTablaUnidadesCompradoras = data.datos;

          // if (this.lstTablaUnidadesCompradoras !== null) {
          //   for (let item of this.lstTablaUnidadesCompradoras) {
          //     this.idUnidadCompradoraElegida = (JSON.parse(JSON.stringify(item))).id_unidad_compradora;

          //   }
          // }

          // this.formBusqueda.patchValue({id_unidad_compradora: this.idUnidadCompradoraElegida});

          this.buscarProcedimientosAdministrativos();

      },
      error: (err) => {
          console.info(err)
          Swal.fire(err.error.mensaje, "", 'error');
          this.loaderBusqueda = false;
      },
      complete: () => {
          this.loaderBusqueda = false;
      }
    });
  }

  buscarProcedimientosAdministrativos(){

    this.loaderBusqueda = true;

    if (this.formBusqueda?.invalid) {
      for (const control of Object.keys(this.formBusqueda.controls)) {
          this.formBusqueda.controls[control].markAsTouched();
      }
      return;
    }

    this.formBusqueda.patchValue({id_tipo_contratacion: this.idTipo});

    const datosBusqueda: IBusquedaProcedimiento = this.formBusqueda?.value as IBusquedaProcedimiento;
    datosBusqueda.id_unidad_compradora = this.selectedUC ? this.selectedUC.id_unidad_compradora : null;

    datosBusqueda.page = this.page;
    datosBusqueda.pageSize = this.pageSize;

    this._convocantesService.buscarProcedimientosAdministrativos(datosBusqueda).subscribe({
        next: (data) => {
            this.lstTablaProcedimientos = data.datos.data;

            if( this.lstTablaProcedimientos !== null){
              this.collectionSize = data.datos.total;
            }

        },
        error: (err) => {
            console.info(err)
            Swal.fire(err.error.mensaje, "", 'error');
            this.loaderBusqueda = false;
        },
        complete: () => {
            this.loaderBusqueda = false;
        }
    });

  }

  canActivate(permiso:string): boolean {
    return this._authService.canActivateFunction(permiso);
  }

  open(content :any) {
		this.modalService.open(content);
	}

  accederSeccion(ruta:string){
    this.router.navigate([ruta]);
  }

  agregarProcedimiento(){
    this.blnActivarAgregar = true;
    this.blnActivarAdministrar = false;

    this.blnActivarEditar = false;
    this.messageTitle = 'Nueva';
    this.messageSubTitle = 'crear una nueva';
    this.messageButton = 'Registar';
  }

  editarProcedimiento(datos: IProcedimientoAdministrativo) {
    this.procedimientoElegido = datos;
    this.blnActivarAgregar = true;
    this.blnActivarAdministrar = false;

    this.blnActivarEditar = true;
    this.messageTitle = 'Editar';
    this.messageSubTitle = 'editar una';
    this.messageButton = 'Actualizar';

  }

  public cancelarAgregarProcedimiento() {
    this.blnActivarAgregar = false;
    this.blnActivarAdministrar = true;

    this.buscarProcedimientosAdministrativos();
  }

  detalleProcedimiento(datos: IProcedimientoAdministrativo){
    this.procedimientoElegido = datos;

    this.blnActivarDetalle = true;
    this.blnActivarAdministrar = false;

  }

  public cancelarDetalleProcedimiento() {
    this.blnActivarDetalle = false;
    this.blnActivarAdministrar = true;
    this.buscarProcedimientosAdministrativos();
  }

  anexosProcedimiento(datos: IProcedimientoAdministrativo){
    this.procedimientoElegido = datos;

    this.blnActivarAnexosProcedimientos = true;
    this.blnActivarAdministrar = false;
  }

  public cancelarAnexosProcedimiento() {
    this.blnActivarAnexosProcedimientos = false;
    this.blnActivarAdministrar = true;
  }

  recepcionProcedimiento(datos: IProcedimientoAdministrativo){
    this.procedimientoElegido = datos;
    if (!this.esFechaApertura(this.procedimientoElegido)){
      return;
    }

    if (this.procedimientoElegido.id_tipo_modalidad == 1 || this.procedimientoElegido.id_tipo_modalidad == 3){
      this.blnActivarRecepcionProcedimientos = true;
      this.blnActivarAdministrar = false;
      return;
    }

    this._convocantesService.obtenerAutorizacionApertura(this.procedimientoElegido?.id_procedimiento_administrativo).subscribe({
      next: (data) => {
        this.autorizacionData = data.datos;
        const datosNulos = this.validacionesUsuario(data.datos);

        if (datosNulos.length === 0) {
          Swal.fire({
            title: 'El acceso ha sido autorizado',
            html: '¿Desea continuar?',
            icon: 'info',
            confirmButtonText: 'Aceptar',
            showCancelButton: true,
            cancelButtonText: 'Cancelar'
          }).then((result) => {
            if (result.isConfirmed) {
              this.autorizarApertura();
            }
          });
          } else {
            Swal.fire({
              title: 'El acceso deberá autorizarse mediante el convocante y el Organo Interno de Control o Administrador del sistema',
              html: '¿Desea autorizar el acceso?',
              icon: 'info',
              confirmButtonText: 'Autorizar',
              showCancelButton: true,
              cancelButtonText: 'Cancelar'
            }).then((result) => {
              if (result.isConfirmed) {
                this.autorizarApertura();
              }
            });
        }
      }
    })
  }

  validacionesUsuario(data: any): string[] {
    const camposNulos = [];

    if (data.id_usuario_convocante === null) {
      camposNulos.push("Convocante");
    }
    if (data.id_usuario_supervisor === null && data.id_usuario_admin === null) {
      camposNulos.push("Organo Interno de Control");
      camposNulos.push("Administrador del Sistema");

    }

    return camposNulos;
  }

  public cancelarRecepcionProcedimiento() {
    this.blnActivarRecepcionProcedimientos = false;
    this.blnActivarAdministrar = true;
    this.buscarProcedimientosAdministrativos();
  }

  diferendoProcedimiento(datos: IProcedimientoAdministrativo){
    const numero_procedimiento = datos.numero_procedimiento.slice(0,3);
    if (this.procedimientosAdquisicionesServicios.includes(numero_procedimiento.toUpperCase())) {
      this.alertProcedimiento(2);
    }
    if (this.procedimientosObra.includes(numero_procedimiento.toUpperCase())) {
      this.alertProcedimiento(1);
    }

    this.procedimientoElegido = datos;

  }

  public cancelarDiferendoProcedimiento() {
    this.blnActivarDiferendoProcedimientos = false;
    this.blnActivarAdministrar = true;
    this.buscarProcedimientosAdministrativos();
  }

  contratosProcedimiento(datos: IProcedimientoAdministrativo){
    this.procedimientoElegido = datos;

    this.blnActivarContratos = true;
    this.blnActivarAdministrar = false;
  }

  public cancelarContratosProcedimiento() {
    this.blnActivarContratos = false;
    this.blnActivarAdministrar = true;
  }

  public cancelarVerParticipantes() {
    this.blnVerParticipante = false;
    this.blnActivarAdministrar = true;
    this.buscarProcedimientosAdministrativos();
  }

  public cancelarFalloProcedimiento() {
    this.blnFalloProcedimiento = false;
    this.blnActivarAdministrar = true;
    this.buscarProcedimientosAdministrativos();
  }

  descargarArchivo(base64String: any, fileName: any, extensionArchivo: any) {
    const source = `data:application/pdf;base64,${base64String}`;
    const link = document.createElement("a");
    link.href = source;
    link.download = `${fileName}.${extensionArchivo}`
    link.click();
  }

  descargarPdf(url: any, nombre: any){
    const extensionArchivo = this.obtenerExtensionArchivo(url);
    this._convocantesService.obtenerArchivoBase64(url, false).subscribe({
      next: (data) => {
        let base64String = data.datos;
        this.descargarArchivo(base64String, nombre, extensionArchivo);
      },
      error: (err) => {
          console.info(err)
          Swal.fire(err.error.mensaje, "", 'error');
          this.loaderBusqueda = false;
      },
      complete: () => {
          this.loaderBusqueda = false;
      }
    });
  }

  verParticipantes(procedimiento : IProcedimientoAdministrativo,tipo : string){
    procedimiento.id_tipo_participacion = (tipo === 'Ver / Agregar Participantes') ? 2 : 1;
    this.participanteInvitadoElegido= procedimiento;
    this.blnActivarAdministrar = false;
    this.blnVerParticipante = true;
  }

  falloProcedimiento(procedimiento : IProcedimientoAdministrativo | any){
    const fechaFallo = new Date(procedimiento.fecha_fallo);
    const fechaActual = new Date(procedimiento.horaServidor);
    if (fechaActual <= fechaFallo) {
      const fecha = fechaFallo.toLocaleDateString('es-MX', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      const hora = fechaFallo.toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      Swal.fire(`No se puede realizar la Apertura de Propuestas debido a que no se ha llegado a la fecha y hora del acto: ${fecha} , ${hora}`, '', 'error');
      return;
      Swal.fire('No se ha llegado a la fecha y hora indicada para realizar la evaluación y fallo','','error')
      return;
    }

    this.falloProcedimientoElegido = procedimiento;
    this.blnActivarAdministrar = false;
    this.blnFalloProcedimiento = true;
  }

  /**
   *
   * @param tipo Funcion para mostrar un aviso en el DIFERIMIENTO DE ACTO DE RECEPCION Y APERTURA
   */
  alertProcedimiento(tipo: number){
    let msjAviso = "";
    if (tipo === 1){
      msjAviso = `<i>“Esta función le permitirá modificar la fecha para el acto de apertura de propuestas,
      las fechas originales se conservarán como historial de la convocatoria. A fin de NO limitar la participación a los licitantes,
      la convocante (como establece el segundo párrafo del artículo 44 y 50 del reglamento de la ley de obra)
      debe modificar igualmente el periodo de venta de bases que se hará hasta el sexto día natural previo a la
      nueva fecha del acto de presentación y apertura de propuestas, y diferir en igual número de días la fecha de
      inicio para la ejecución de la obra o servicio objeto de la licitación. En el caso de que este aviso de diferimiento
      del acto de apertura sea capturado cuando la fecha límite de inscripción original haya vencido, la Convocante deberá
      reponer los días de inscripción donde limitó la participación de los licitantes al procedimiento ya que el proceso ya no se
      encontraba Vigente, por lo que este período debe ser repuesto o subsanado”).</i>`;
    }

    if(tipo === 2){
      msjAviso = `<i>“Esta función le permitirá modificar la fecha para el acto de apertura de propuestas,
      las fechas originales se conservarán como historial de la convocatoria. Como establece el cuarto párrafo
      del artículo 37 de la ley de adquisiciones, que de resultar necesario, la fecha señalada en la convocatoria
      para realizar el acto de presentación y apertura de proposiciones podrá diferirse, considerando que entre la
      última junta de aclaraciones y el acto de apertura de proposiciones debe existir un plazo de al menos 6 días naturales,
      por lo que en cumplimiento de la fracción VI del artículo 33 de la ley de adquisiciones y a fin de No limitar la participación
      de los licitantes, la fecha límite de inscripción también deberá modificarse para dar oportunidad de cubrir el costo de inscripción.
      En el caso de que este aviso de diferimiento del acto de apertura sea capturado cuando la fecha límite de inscripción original
      haya vencido, la Convocante deberá reponer los días de inscripción donde limitó la participación de los licitantes al
      procedimiento ya que el proceso ya no se encontraba Vigente, por lo que este período debe ser repuesto o subsanado”.</i>`;
    }

    Swal.fire({
      title: 'AVISO',
      html: msjAviso,
      icon: 'info',
      confirmButtonText: 'OK'
    }).then((result) => {
      if (result.isConfirmed) {
        this.blnActivarDiferendoProcedimientos = true;
        this.blnActivarAdministrar = false;
      }
    });

  }

  autorizarApertura()
  {
    let params: any;
    const rol = this._cripto.decrypt(localStorage.getItem('roles'));
    if (rol[0] === 'CONVOCANTE')
    {
        params = {
        "id_autorizacion_apertura": this.autorizacionData.id_autorizacion_apertura ?? null,
        "id_procedimiento_administrativo": this.procedimientoElegido?.id_procedimiento_administrativo,
        "id_usuario_convocante": Number(localStorage.getItem('id_usuario')),
        "procedimiento": this.procedimientoElegido?.numero_procedimiento
       }
    }

    if (rol[0] === 'ADMINISTRADOR')
    {
       params = {
        "id_autorizacion_apertura": this.autorizacionData.id_autorizacion_apertura ?? null,
        "id_procedimiento_administrativo": this.procedimientoElegido?.id_procedimiento_administrativo,
        "id_usuario_admin": Number(localStorage.getItem('id_usuario')),
        "procedimiento": this.procedimientoElegido?.numero_procedimiento
       }
    }

    if (rol[0] === 'SUPERVISOR')
    {
       params = {
        "id_autorizacion_apertura": this.autorizacionData.id_autorizacion_apertura ?? null,
        "id_procedimiento_administrativo": this.procedimientoElegido?.id_procedimiento_administrativo,
        "id_usuario_supervisor": Number(localStorage.getItem('id_usuario')),
        "procedimiento": this.procedimientoElegido?.numero_procedimiento
       }
    }

    this._convocantesService.generarAutorizacionApertura(params).subscribe({
      next: (data) => {
        const flag = data.datos;
        if(!flag){
          Swal.fire(data.mensaje,'','info');
        }else{
          // Suponiendo que `data` contiene la respuesta de tu servicio
        if (data.mensaje === 'El servicio de Correos no está disponible por el momento') {
          Swal.fire(data.mensaje, '', 'info');
          this.blnActivarRecepcionProcedimientos = true;
          this.blnActivarAdministrar = false;
        } else {
          Swal.fire(data.mensaje, '', 'success');
          this.blnActivarRecepcionProcedimientos = true;
          this.blnActivarAdministrar = false;
        }

        }
      }
    })
  }

  cargarPartidasProveedor(datos: IProcedimientoAdministrativo){
    this.procedimientoElegido = datos;

    this.blnActivarCargarPartidasProveedor = true;
    this.blnActivarAdministrar = false;
  }

  cancelarPartidasProveedor(){
    this.blnActivarCargarPartidasProveedor = false;
    this.blnActivarAdministrar = true;
  }

  adminRespuestasProcedimiento(datos: IProcedimientoAdministrativo){
    this.procedimientoElegido = datos;

    this.blnActivarRespuestasProcedimient = true;
    this.blnActivarAdministrar = false;
  }

  cancelarRespuestasProcedimiento(){
    this.blnActivarRespuestasProcedimient = false;
    this.blnActivarAdministrar = true;
  }

  onPageChange() {
    this.buscarProcedimientosAdministrativos();
  }

  /**
   * Funciones para validar con respecto a la fecha y hora si las opciones correspondientes se habilitan o no
   * @author Adan
   * @param info
   * @returns
   */

  esFechaDiferimiento(info:any) {
    if (info.fecha_apertura == null && info.fecha_apertura_nueva == null) {
      return false;
    }
    const fechaLimite = info.fecha_apertura_nueva ? new Date(info.fecha_apertura_nueva) : new Date(info.fecha_apertura);
    const fechaActual = new Date(info.horaServidor);
    return fechaActual <= fechaLimite;
  }

  esFechaApertura(procedimiento:any) {
    if (procedimiento.fecha_apertura == null && procedimiento.fecha_apertura_nueva == null) {
      Swal.fire('No hay fecha de apertura capturada en el procedimiento','','error');
      return false;
    }

    // Al menos una de las fechas no es nula, procedemos con la comparación
    const fechaLimite = procedimiento.fecha_apertura_nueva ? new Date(procedimiento.fecha_apertura_nueva) : new Date(procedimiento.fecha_apertura);
    const fechaActual = new Date(procedimiento.horaServidor);
    if (fechaActual >= fechaLimite) {
      return true;
    }else{
      // Formatear la fecha en el formato deseado
      const fecha = fechaLimite.toLocaleDateString('es-MX', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      const hora = fechaLimite.toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      Swal.fire(`No se puede realizar la Apertura de Propuestas debido a que no se ha llegado a la fecha y hora del acto: ${fecha} , ${hora}`, '', 'error');
      return false;
    }
  }

  esFechaFallo(info:any) {
    if (info.fecha_fallo == null) {
      return false;
    }
    const fechaLimite = new Date(info.fecha_fallo);
    const fechaActual = new Date(info.horaServidor);
    return fechaActual >= fechaLimite;
  }


  permiteModificar(datos: IProcedimientoAdministrativo) {
    
    if(this._app.HABILITAR_PROCEDIMIENTOS){
      return true;
    }

    if(datos.id_estatus_procedimiento == 1){
      return true;
    }else{
      return false;
    }
    

    return true;

  }

  permiteAnexos(datos: IProcedimientoAdministrativo) {
    if(this._app.HABILITAR_PROCEDIMIENTOS){
      return true;
    }

    if(datos.id_estatus_procedimiento == 1 || datos.id_estatus_procedimiento == 2 || datos.id_estatus_procedimiento == 3){
      return true;
    }else{
      return false;
    }
  }

  permitePartidas(datos: IProcedimientoAdministrativo) {
    if(this._app.HABILITAR_PROCEDIMIENTOS){
      return true;
    }

    if(datos.id_estatus_procedimiento == 1){
      return true;
    }else{
      return false;
    }
  }

  permiteRespuestas(datos: IProcedimientoAdministrativo) {
    if(this._app.HABILITAR_PROCEDIMIENTOS){
      return true;
    }

    if(datos.id_estatus_procedimiento == 2){
      return true;
    }else{
      return false;
    }
  }


  permiteParticipantes(datos: IProcedimientoAdministrativo) {
    if(this._app.HABILITAR_PROCEDIMIENTOS){
      return true;
    }


    if(datos.id_tipo_contratacion == 1){
      if((datos.id_estatus_procedimiento == 2 || datos.id_estatus_procedimiento == 3) && datos.numero_procedimiento != null){
        return true;
      }else{
        return false;
      }
    }else{
      if((datos.id_estatus_procedimiento == 1) && datos.numero_procedimiento == null){
        return true;
      }else{
        return false;
      }
    }

  }


  permiteDiferimiento(datos: IProcedimientoAdministrativo) {
    if(this._app.HABILITAR_PROCEDIMIENTOS){
      return true;
    }

    if(datos.id_estatus_procedimiento == 2 && datos.numero_procedimiento != null && (this.esFechaDiferimiento(datos) || datos.diferendo_acto_apertura)){
      return true;
    }else{
      return false;
    }
  }

  permiteAperturaProposiciones(datos: IProcedimientoAdministrativo) {
    if(this._app.HABILITAR_PROCEDIMIENTOS){
      return true;
    }

    if(datos.id_estatus_procedimiento == 3 && datos.numero_procedimiento != null){
      return true;
    }else{
      return false;
    }
  }

  permiteEvaluacionPropuestas(datos: IProcedimientoAdministrativo) {
    if(this._app.HABILITAR_PROCEDIMIENTOS){
      return true;
    }

    if(datos.id_estatus_procedimiento == 3 && datos.numero_procedimiento != null && this.esFechaFallo(datos)){
      return true;
    }else{
      return false;
    }
  }


  permiteContrato(datos: IProcedimientoAdministrativo) {
    if(this._app.HABILITAR_PROCEDIMIENTOS){
      return true;
    }

    if(datos.id_estatus_procedimiento == 7 && datos.numero_procedimiento != null){
      return true;
    }else{
      return false;
    }
  }


  actualizarEstatusCron(){
    this.loaderBusqueda = true;

    this._convocantesService.actualizarEstatusCron().subscribe({
      next: (data) => {
        this.buscarProcedimientosAdministrativos();
        Swal.fire(data.mensaje, "", 'success');
      },
      error: (err) => {
        console.info(err)
        Swal.fire(err.error.mensaje, "", 'error');
        this.loaderBusqueda = false;
      },
      complete: () => {
        this.loaderBusqueda = false;
      }
    });

  }

  visualizarAdmin(){
    const rol: string | any = this._authService.rolSys;
    if (rol[0] == 'ADMINISTRADOR'){
      return true;
    } else {
      return false;
    }
  }

  obtenerExtensionArchivo(urlArchivo: any) {
    // Divide la URL usando '/' para obtener las partes
    const partesUrl = urlArchivo.split('/');

    // Obtiene el nombre del archivo de la última parte de la URL
    const nombreArchivo = partesUrl[partesUrl.length - 1];

    // Divide el nombre del archivo usando '.' para obtener las partes
    const partesNombreArchivo = nombreArchivo.split('.');

    // Obtiene la extensión del archivo (la última parte después del último punto)
    const extensionArchivo = partesNombreArchivo[partesNombreArchivo.length - 1];

    return extensionArchivo;
  }

  actualizarNombreUsuario(event: any) {
    this.selectedUC = null;
    const selectedValue = event.target.value.toLowerCase(); // Convertir a minúsculas para búsqueda insensible a mayúsculas y minúsculas

    if (selectedValue.trim() !== '') { // Verificar si el valor no está vacío
        this.selectedUC = this.lstTablaUnidadesCompradoras?.find(
            (element: any) =>
                element.clave_unidad_compradora.toLowerCase().includes(selectedValue)
        );

        if (this.selectedUC) {
            this.formBusqueda.patchValue({
                nombre_unidad_compradora: this.selectedUC.nombre_unidad_compradora
            });
        }
    } else {
        return;
    }
}



}
