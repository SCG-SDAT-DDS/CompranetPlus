import { IDetReporte } from './../../../interfaces/reportes/IDetReporte';
import { Component } from '@angular/core';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import { AuthService } from 'src/app/components/login/auth.service';
import swal from 'sweetalert2';
import { IReporteTablero } from 'src/app/interfaces/reportes/IReporteTablero';
import { CatalogoUnidadResponsableService } from 'src/app/services/catalogoUnidadResponsable.service';
import { ICatalogoTipoUnidadResponsable } from 'src/app/interfaces/catalogos/ICatalogoTipoUnidadResponsable';
import { ICatalogoUnidadCompradora } from 'src/app/interfaces/catalogos/ICatalogoUnidadCompradora';
import { CatalogoUnidadCompradoraService } from 'src/app/services/catalogoUnidadCompradora.service';
import { CatalogoCostoParticipacionService } from 'src/app/services/catalogoCostosParticipacion.service';
import { ICatalogoTipoProcedimiento } from 'src/app/interfaces/catalogos/ICatalogoTipoProcedimiento';
import { ConvocantesService } from 'src/app/services/convocantes.service';
import { ITipoCaracter } from 'src/app/interfaces/convocantes/ITipoCaracter';
import { ItipoModalidad } from 'src/app/interfaces/convocantes/ITipoModalidad';
import { IEstatusProcedimientoPublic } from 'src/app/interfaces/convocantes/IEstatusProcedimiento';
import { ICatalogoPersonalidadJuridica } from 'src/app/interfaces/catalogos/ICatalogoPersonalidadJuridica';
import { CatalogoPersonalidadJuridicaService } from 'src/app/services/catalogoPersonalidadJuridica.service';
import { CatalogoEstadosService } from 'src/app/services/catalogoEstados.service';
import { IMunicipio } from 'src/app/interfaces/catalogos/ICatalogoMunicipio';
import { ILocalidad } from 'src/app/interfaces/catalogos/ICatalogoLocalidad';
import { CatalogoMunicipiosService } from 'src/app/services/catalogoMunicipios.service';
import { CatalogoLocalidadesService } from 'src/app/services/catalogoLocalidades.service';
import { IEstado, IEstadoId } from 'src/app/interfaces/catalogos/ICatalogoEstado';
import { IMunicipioId } from '../../../interfaces/catalogos/ICatalogoMunicipio';
import { IReporteFiltro } from 'src/app/interfaces/reportes/IReporteFiltro';
import { ReporteService } from 'src/app/services/reporte.service';
import { IColumnasDisponibles } from 'src/app/interfaces/reportes/IColumnasDisponibles';
import { IReporte } from 'src/app/interfaces/reportes/IReporte';
import { IMsReportes } from 'src/app/interfaces/reportes/IMsReportes';
import { ICatalogoEstatusParticipacion } from 'src/app/interfaces/catalogos/ICatalogoEstatusParticipacion';
import { IDetReportesPublico } from 'src/app/interfaces/reportes/IDetReportesPublico';

@Component({
  selector: 'app-crear-reporte',
  templateUrl: './crear-reporte.component.html',
  styleUrls: ['./crear-reporte.component.css']
})
export class CrearReporteComponent {

  loaderGuardar: boolean = false;
  guardarReporte: boolean = false

  loaderFiltro: boolean = false;
  pantallaIncial: boolean = true;

  modalRegistroReporte:NgbModalRef|undefined;
  modalRefEliminar:NgbModalRef|undefined;
  modalListadoReporte:NgbModalRef|undefined;

  formFiltro: FormGroup;
  formRegistro: FormGroup;
  formColumns = new FormControl();
  formColumnsRmv = new FormControl();
  iMsReporteUltimo: IMsReportes | null = null;
  iReporte: IReporte = {filtro: null, columnas: [], formato : 'json'}

  reporteTablero: IReporteTablero[] | null = null;
  reporteTableroPaginado: IReporteTablero[] | null = null;
  pageLstReporteTablero = 1;
  pageSizeLstReporteTablero = 10;
  pageCollectionReporteTablero = 0;
  //variables para los catalogos select
  lstCatTipoUnidadResponsable: ICatalogoTipoUnidadResponsable[] | null = null;
  lstCatUnidadCompradora: ICatalogoUnidadCompradora[] | null = null;
  lstCatTipoProcedimiento: ICatalogoTipoProcedimiento[] | null = null;
  lstTablaCaracteres: ITipoCaracter[] | null = null;
  lstTablaModalidades: ItipoModalidad[] | null = null;
  lstTablaEstatusProcedimientos: IEstatusProcedimientoPublic[] | null = null;
  lstCatPersonalidadJuridica: ICatalogoPersonalidadJuridica[] | null = null;
  lstEstado: IEstado[] | null = null;
  lstMunicipios: IMunicipio[] | null = null;
  lstLocalidad: ILocalidad[] | null = null;

  //para el listado de columnas disponibles para el reporte
  lstColumnasDisponibles: IColumnasDisponibles[] | null = null;
  lstColumnasSeleccionadas: IColumnasDisponibles[] | null = [];
  lstCatEstatusParticipaciones: ICatalogoEstatusParticipacion[] | null = [];

  lstMisReportes: IDetReporte[] | null = null;
  lstMisReportesPaginado: IDetReporte[] | null = null;
  pageLstMisReportes = 1;
  pagSizeLstMisReporte = 10;
  pagCollectionSize = 0;

  //para el apartado de reportes publicos
  loaderBuscarRp: boolean = false;
  lodaerGuardarRegistroPublico: boolean = false;
  showTableroReportesClientes: boolean = false;
  showFormRegistroReportePublico: boolean = false;
  guardarReportePublic: boolean = false;
  formRegistroReportePublic: FormGroup;
  lstDetReportePublic: IDetReportesPublico[] | null = null;
  reporteSeleccionadoRP: IDetReporte | null = null;
  idDetReporteSeleccionado: number;

  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private _catalogoUnidadResponsableService: CatalogoUnidadResponsableService,
    private _catalogoUnidadCompradoraService : CatalogoUnidadCompradoraService,
    private _catalogoCostoParticipacionService: CatalogoCostoParticipacionService,
    private _catalogoPersonalidadJuridicaService: CatalogoPersonalidadJuridicaService,
    private _catalogoEstadosService: CatalogoEstadosService,
    private _catalogoMunicipiosService: CatalogoMunicipiosService,
    private _catalogoLocalidadesService: CatalogoLocalidadesService,
    private _convocantesService: ConvocantesService,
    private _reporteService: ReporteService,
    private _authService: AuthService
  ){
    this.formFiltro = this.iniciarFormularioFiltro();
    this.formRegistro = this.iniciarFormularioRegistro();
    this.formRegistroReportePublic = this.iniciarFormularioRegistroReportePublico();
    this.idDetReporteSeleccionado = 0;
    //iniciar los catalogos del select
    this.inicarCatalogosFiltros();
  }

  ngOnInit() {
    //change de estado
    this.formFiltro.get('id_estado')?.valueChanges.subscribe(selectedValue => {
      this.obtenerMunicipios(selectedValue);
    });
    //change de municipio
    this.formFiltro.get('id_municipio')?.valueChanges.subscribe(selectedValue => {
      this.obtenerLocalidades(selectedValue);
    });
  }

  canActivate(permiso:string): boolean {
    return this._authService.canActivateFunction(permiso);
  }

  iniciarFormularioFiltro() {
    return new FormGroup({
      id_unidad_responsable: new FormControl(null, []),
      id_unidad_compradora:  new FormControl(null, []),
      id_tipo_procedimiento:  new FormControl(null, []),
      id_tipo_caracter_licitacion:  new FormControl(null, []),
      id_tipo_modalidad:  new FormControl(null, []),
      id_estatus_procedimiento:  new FormControl(null, []),
      id_estatus_participacion:  new FormControl(null, []),
      id_estado:  new FormControl(null, []),
      id_municipio:  new FormControl(null, []),
      id_localidad:  new FormControl(null, []),
      id_tipo_personeria_juridica:  new FormControl(null, []),
      numero_licitacion: new FormControl('', []),
      numero_oficio: new FormControl(null, []),
      importe:  new FormControl(null, []),
      concepto: new FormControl(null, []),
      capitulo: new FormControl(null, []),
      proyecto: new FormControl(null, []),
      partida: new FormControl(null, []),
      fecha_publicacion: new FormControl(null, []),
      fecha_limite_inscripcion: new FormControl(null, []),
      fecha_visita_lugar: new FormControl(null, []),
      fecha_apertura: new FormControl(null, []),
      fecha_fallo: new FormControl(null, []),
      fecha_junta_aclaraciones: new FormControl(null, []),
      rfc: new FormControl(null, []),
      razon_social: new FormControl(null, []),
      giro: new FormControl(null, []),
      codigo_postal: new FormControl(null, []),
      licitacion_recortada: new FormControl(null, []),
      licitacion_tecnologia: new FormControl(null, []),
      diferendo_acto_apertura: new FormControl(null, []),
    });
  }

  iniciarFormularioRegistro(data: IDetReporte | null = null){
    const formTmp: FormGroup | null = new FormGroup({

      nombre_reporte: new FormControl('', [
        Validators.required,
        Validators.minLength(1)
      ]),

    });

    if (data != null) {

        if (data.nombre_reporte != null) {
          formTmp.patchValue({nombre_reporte: data.nombre_reporte});
        }
    }

    return formTmp;
  }

  inicarCatalogosFiltros(){

    //ultimo reporte
    this._reporteService.obtenerUltimoReporte().subscribe({
      next: (data) => {
          this.iMsReporteUltimo = data.datos;
          console.log(this.iMsReporteUltimo);
      },
      error: (err) => {
          console.info(err)
          swal.fire(err.error.mensaje, "", 'error');
      },
      complete: () => {}
    });

    //unidades responsables
    this._catalogoUnidadResponsableService.buscarCatalogoTipoUnidadResponsable().subscribe({
      next: (response) => {
        this.lstCatTipoUnidadResponsable = response.datos
      },error: (err) => {
        console.info(err);
        swal.fire(err.error.mensaje,"",'error');
      },complete: () => {}
    });

    //unidad compradora
    const datosBusquedaCUC: ICatalogoUnidadCompradora = {
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
    this._catalogoUnidadCompradoraService.buscarCatalogo(datosBusquedaCUC).subscribe({
      next: (response) => {
        console.log(response.datos);
        this.lstCatUnidadCompradora = response.datos;
      },error: (err) => {
        console.info(err);
        swal.fire(err.error.mensaje,"",'error');
      },complete: () => {}
    });

    //tipos de procedimiento
    this._catalogoCostoParticipacionService.buscarCatalogoTipoProcedimiento().subscribe({
      next: (response) => {
        this.lstCatTipoProcedimiento = response.datos
      },error: (err) => {
        console.info(err);
        swal.fire(err.error.mensaje,"",'error');
      },complete: () => {}
    });

    //caracteres procedimientos
    this._convocantesService.obtenerCaracteres(1).subscribe({
      next: (data) => {
          this.lstTablaCaracteres = data.datos;
      },
      error: (err) => {
          console.info(err)
          swal.fire(err.error.mensaje, "", 'error');
      },
      complete: () => {}
    });

    //modalidad
    this._convocantesService.obtenerModalidades(1).subscribe({
      next: (data) => {
          this.lstTablaModalidades = data.datos;
      },
      error: (err) => {
          console.info(err)
          swal.fire(err.error.mensaje, "", 'error');
      },
      complete: () => {}
    });

    //estatus procedimiento
    this._reporteService.obtenerCatEstatusProcedimiento().subscribe({
      next: (data) => {
          this.lstTablaEstatusProcedimientos = data.datos;
      },
      error: (err) => {
          console.info(err)
          swal.fire(err.error.mensaje, "", 'error');
      },
      complete: () => {}
    });

    //personalidad juridica
    this._catalogoPersonalidadJuridicaService.buscarCatalogoPersonalidadJuridica().subscribe({
      next: (data) => {
        this.lstCatPersonalidadJuridica = data.datos;
      },
      error: (err) => {
        console.info(err)
        swal.fire(err.error.mensaje, "", 'error');
      },
      complete: () => {}
    });


    this._catalogoEstadosService.getListEstados().subscribe({
      next: (data) => {
          this.lstEstado = data.datos;
          console.log(this.lstEstado);
      },
      error: (err) => {
          console.info(err)
          swal.fire(err.error.mensaje, "", 'error');
      },
      complete: () => {}
    });

    this._reporteService.obtenerColumnasDisponiblesReporte().subscribe({
      next: (data) => {
          this.lstColumnasDisponibles = data.datos;
      },
      error: (err) => {
          console.info(err)
          swal.fire(err.error.mensaje, "", 'error');
      },
      complete: () => {}
    });

    this._reporteService.obtenerCatEstatusParticipacion().subscribe({
      next: (data) => {
          this.lstCatEstatusParticipaciones = data.datos;
      },
      error: (err) => {
          console.info(err)
          swal.fire(err.error.mensaje, "", 'error');
      },
      complete: () => {}
    });

    console.log(this.showTableroReportesClientes);

  }

  obtenerMunicipios(idEstado: number | null){
    if(idEstado != null){
      let param: IEstadoId = {
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
        complete: () => {}
      });
    }else{
      this.lstMunicipios = [];
    }
  }

  obtenerLocalidades(idMunicipio: number | null){
    if(idMunicipio != null){
      let params:IMunicipioId = {
        id: idMunicipio
      }
      this._catalogoLocalidadesService.obtenerLocalidadesByMunicipio(params).subscribe({
        next: (res) => {
          this.lstLocalidad = res.datos;
        },
        error: (err) => {
            console.info(err)
            swal.fire(err.error.mensaje, "", 'error');
        },
        complete: () => {}
      });
    }else{
      this.lstLocalidad = [];
    }
  }

  agregarColumnaDatosSalida(){
    let indexColumnasSeleccionadas:number[] = [];
    let valuesSelected = this.formColumns.value;
    console.log(valuesSelected);
    this.lstColumnasDisponibles?.forEach((element:IColumnasDisponibles,index) =>{
      if(valuesSelected.includes(element.Field)){
        indexColumnasSeleccionadas.push(index);
        this.lstColumnasSeleccionadas?.push(element);
      }
    });
    this.formColumns.reset();
    indexColumnasSeleccionadas.sort((a,b) => b-a);
    this.lstColumnasDisponibles = this.lstColumnasDisponibles?.filter((item,i) => !indexColumnasSeleccionadas.includes(i)) as IColumnasDisponibles[];
  }

  removerColumnasDatosSalida(){
    let indexColumnasSeleccionadasRmv:number[] = [];
    let valuesSelectedRmv = this.formColumnsRmv.value;
    this.lstColumnasSeleccionadas?.forEach((element:IColumnasDisponibles,index) => {
      if(valuesSelectedRmv.includes(element.Field)){
        indexColumnasSeleccionadasRmv.push(index);
        this.lstColumnasDisponibles?.push(element);
      }
    });
    this.formColumnsRmv.reset();
    indexColumnasSeleccionadasRmv.sort((a,b) => b-a);
    this.lstColumnasSeleccionadas = this.lstColumnasSeleccionadas?.filter((item,i) => !indexColumnasSeleccionadasRmv.includes(i)) as IColumnasDisponibles[];
  }

  generarReporte(tipo: string){
    this.guardarReporte = false;
    this.pantallaIncial = false;
    this.iReporte.columnas = [];
    //cargamos lo de la columnas seleccionadas
    this.lstColumnasSeleccionadas?.forEach((element:IColumnasDisponibles,index) => {
      this.iReporte.columnas?.push(element.Field);
    });
    if(tipo === 'tablero'){
      this.loaderFiltro = true;
      const datosFiltro: IReporteFiltro = this.formFiltro?.value as IReporteFiltro;
      this.iReporte.filtro = datosFiltro;
      this.iReporte.formato = tipo;
      this._reporteService.generar(this.iReporte).subscribe({
        next: (res) => {
          this.reporteTablero = res.datos.length == 0 ? null : res.datos;
          this.guardarReporte = true;
          if(this.reporteTablero !== null){
            this.pageCollectionReporteTablero = this.reporteTablero.length;
            this.paginacionReportesTablero();
          }
        },
        error: (err) => {
            console.info(err)
            swal.fire(err.error.mensaje, "", 'error');
        },
        complete: () => {}
      });
      this.loaderFiltro = false;
    }else{
      this.loaderFiltro = true;
      const datosFiltro: IReporteFiltro = this.formFiltro?.value as IReporteFiltro;
      this.iReporte.filtro = datosFiltro;
      this.iReporte.formato = tipo;
      this._reporteService.generarReporte(this.iReporte);
      this.loaderFiltro = false;
      this.guardarReporte = true;
    }
  }

  paginacionReportesTablero() {
    if (this.reporteTablero !== null)
		this.reporteTableroPaginado = this.reporteTablero.map((reporte, i) => ({ reporte: i + 1, ...reporte })).slice(
			(this.pageLstReporteTablero - 1) * this.pageSizeLstReporteTablero,
			(this.pageLstReporteTablero - 1) * this.pageSizeLstReporteTablero + this.pageSizeLstReporteTablero,
		);
	}

  generarReporteMiReporte(tipo: string, iDetReporte: IDetReporte){
    const ireporte:IReporte = {
      filtro: JSON.parse(iDetReporte.filtro) as IReporteFiltro,
      columnas: JSON.parse(iDetReporte.columnas),
      formato: tipo
    }
    this._reporteService.generarReporte(ireporte);
  }

  /**
   * apartado para la modal de guardar reporte
   */
  abrirModalRegistro(content: any){
    this.formRegistro = this.iniciarFormularioRegistro();
    this.formRegistro.updateValueAndValidity();
    this.modalRegistroReporte = this.modalService.open(content);
  }

  listadoModalMisReportes(content: any){
    this.loaderFiltro = true;
    this._reporteService.misReportesListado().subscribe({
      next: (res) => {
        this.lstMisReportes = res.datos.length == 0 ? null : res.datos;
        this.lstMisReportesPaginado = this.lstMisReportes;
        if(this.lstMisReportes !== null){
          this.pagCollectionSize = this.lstMisReportes.length;
          this.paginacionMisReportes();
        }
        this.modalListadoReporte = this.modalService.open(content,{ size: 'lg' });
      },
      error: (err) => {
          console.info(err)
          swal.fire(err.error.mensaje, "", 'error');
      },
      complete: () => {}
    });
    this.loaderFiltro = false;
  }

  paginacionMisReportes() {
    if (this.lstMisReportes !== null)
		this.lstMisReportesPaginado = this.lstMisReportes.map((reporte, i) => ({ reporte: i + 1, ...reporte })).slice(
			(this.pageLstMisReportes - 1) * this.pagSizeLstMisReporte,
			(this.pageLstMisReportes - 1) * this.pagSizeLstMisReporte + this.pagSizeLstMisReporte,
		);
	}

  actualizarReporteSistema (){
    this.loaderGuardar = true;
    this._reporteService.actualizarReporteSistema().subscribe({
      next: (data) => {
          swal.fire(data.mensaje, "", 'success');
          this.loaderGuardar = false;
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

  guardarSubmit(){
    if(this.formRegistro == undefined || this.formRegistro.invalid){
      for (const control of Object.keys(this.formRegistro.controls)) {
        this.formRegistro.controls[control].markAsTouched();
        console.info(this.formRegistro.controls[control].errors)
      }
      return;
    }
    const datosGuardar: IDetReporte = this.formRegistro?.value as IDetReporte;
    const filtro: IReporteFiltro = this.formFiltro?.value as IReporteFiltro;
    let columnas:string[] = [];
    this.lstColumnasSeleccionadas?.forEach((element:IColumnasDisponibles,index) => {
      columnas.push(element.Field);
    });
    datosGuardar.filtro = JSON.stringify(filtro);//codificamos el filtro
    datosGuardar.columnas = JSON.stringify(columnas);
    this._reporteService.guardarReporte(datosGuardar).subscribe({
        next: (data) => {
            swal.fire(data.mensaje, "", 'success');
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

  eliminarSubmit(datos: IDetReporte){
    this.loaderGuardar = true;
    datos.activo = false;
    this._reporteService.cambiarEstatus(datos).subscribe({
      next: (response) => {
        swal.fire(response.mensaje, "", 'success');
        this._reporteService.misReportesListado().subscribe({
          next: (res) => {
            this.lstMisReportes = res.datos.length == 0 ? null : res.datos;
          },
          error: (err) => {
              console.info(err)
              swal.fire(err.error.mensaje, "", 'error');
          },
          complete: () => {}
        });
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

  cancelar() {
    this.formRegistro?.reset();
    this.modalRegistroReporte?.close();
  }

  cerrarListado(){
    this.modalListadoReporte?.close();
  }

/**
   * funcioens para el reporte public
   */
  showTableroReportesPublicados(item: IDetReporte,idDetReporte: number){
    this.showTableroReportesClientes = true;
    this.showFormRegistroReportePublico = false;
    this.reporteSeleccionadoRP = item;
    this.idDetReporteSeleccionado = idDetReporte;
    this.lstDetReportePublic = null;
    this.listarReportesPublicosRegistrados();
  }

  showFormReporteNuevoCliente(){
    this.showFormRegistroReportePublico = true;
    this.formRegistroReportePublic = this.iniciarFormularioRegistroReportePublico();
    this.formRegistroReportePublic.updateValueAndValidity();
  }

  cerrarTableroReportesPublicados(){
    this.showTableroReportesClientes = false;
    this.reporteSeleccionadoRP = null;
    this.lstDetReportePublic = [];
  }

  cancelarFormReporteNuevoCliente(){
    this.showFormRegistroReportePublico = false;
    this.showTableroReportesClientes = true;
    this.formRegistroReportePublic.reset();
  }

  listarReportesPublicosRegistrados(){
    this.loaderBuscarRp = true;
    this._reporteService.reportePublicoListado(this.idDetReporteSeleccionado).subscribe({
      next: (res) => {
        this.lstDetReportePublic = res.datos.length == 0 ? null : res.datos;
        this.loaderBuscarRp = false;
      },
      error: (err) => {
          console.info(err)
          swal.fire(err.error.mensaje, "", 'error');
          this.loaderBuscarRp = false;
      },
      complete: () => {
        this.loaderBuscarRp = false;
      }
    });
  }

  guardarReportePublicoSubmit(){
    if(this.formRegistroReportePublic == undefined || this.formRegistroReportePublic.invalid){
      for (const control of Object.keys(this.formRegistroReportePublic.controls)) {
        this.formRegistroReportePublic.controls[control].markAsTouched();
        console.info(this.formRegistroReportePublic.controls[control].errors)
      }
      return;
    }
    const datosGuardar: IDetReportesPublico = this.formRegistroReportePublic?.value as IDetReportesPublico;
    datosGuardar.id_det_reportes = this.idDetReporteSeleccionado;
    this._reporteService.guardarReportePublico(datosGuardar).subscribe({
        next: (data) => {
            swal.fire(data.mensaje, "", 'success');
            this.showFormRegistroReportePublico = false;
            this.listarReportesPublicosRegistrados();
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

  eliminarRegistroPublicSubmit(datos: IDetReportesPublico){
    this.loaderGuardar = true;
    datos.activo = false;
    this._reporteService.cambiarEstatusReportePublico(datos).subscribe({
      next: (response) => {
        swal.fire(response.mensaje, "", 'success');
        this.listarReportesPublicosRegistrados();
      },error: (err) => {
        console.info(err);
        swal.fire(err.error.mensaje,"",'error');
      },complete: () => {
      }
    });
  }

  enviarCorreoReporte(datos: IDetReportesPublico){
    this._reporteService.enviarCorreoReportePublico(datos).subscribe({
      next: (response) => {
        swal.fire(response.mensaje, "", 'success');
      },error: (err) => {
        console.info(err);
        swal.fire(err.error.mensaje,"",'error');
      },complete: () => {
      }
    });
  }

  cancelarRegistroReportePublic(){
    this.showFormRegistroReportePublico = false;
    this.formRegistroReportePublic.reset();
  }

  iniciarFormularioRegistroReportePublico(data: IDetReportesPublico | null = null){
    const formTmp: FormGroup | null = new FormGroup({

      nombre_cliente: new FormControl('', [
        Validators.required,
        Validators.minLength(5)
      ]),
      correo: new FormControl('', [
        Validators.required,
        Validators.minLength(5)
      ]),

    });

    if (data != null) {

        if (data.nombre_cliente != null) {
          formTmp.patchValue({nombre_cliente: data.nombre_cliente});
        }
        if (data.correo != null) {
          formTmp.patchValue({correo: data.correo});
        }
    }

    return formTmp;
  }

}
