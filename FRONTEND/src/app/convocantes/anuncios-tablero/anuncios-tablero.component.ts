import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {NavigationEnd, Router} from '@angular/router';
import { AuthService } from 'src/app/components/login/auth.service';
import { ICatalogoTipoProcedimiento } from 'src/app/interfaces/catalogos/ICatalogoTipoProcedimiento';
import { IProcedimientoAdministrativo } from 'src/app/interfaces/convocantes/IProcedimientoAdministrativo';
import { ITableroProcedimientosBusqueda } from 'src/app/interfaces/proveedores/ITableroProveedores';
import { CatalogoCostoParticipacionService } from 'src/app/services/catalogoCostosParticipacion.service';
import { TableroProveedoresService } from 'src/app/services/tableroProveedores.service';
import swal from 'sweetalert2';
import * as moment from "moment";

@Component({
  selector: 'app-anuncios-tablero',
  templateUrl: './anuncios-tablero.component.html',
  styleUrls: ['./anuncios-tablero.component.css']
})
export class AnunciosTableroComponent {

  formBusqueda: FormGroup;
  loaderBusqueda: boolean = false;
  lstTabla: IProcedimientoAdministrativo[] | null = null;
  procedimientoElegido: IProcedimientoAdministrativo | null = null;

  lstCatTipoProcedimiento: ICatalogoTipoProcedimiento[] | null = null;
  loader= false;
  page = 1;
	pageSize = 10;
  collectionSize = 0;
  tipo : number | null = 0;
  blnActivarDetalle = true;
  id_usuario: string | null;
  blnPresentarPropuesta: boolean = false;
  blnGenerarPaseCaja: boolean = false;
  blnActivarPreguntasProcedimimento = false;

  constructor(
    private _catalogoCostoParticipacionService: CatalogoCostoParticipacionService,
    private _tableroProveedoresService: TableroProveedoresService,
    private _router: Router, private _authService: AuthService
  ) {
    //recargar al entrar por link
    this._router.routeReuseStrategy.shouldReuseRoute = function(){
      return false;
    }
    this._router.events.subscribe((evt) => {
      if (evt instanceof NavigationEnd) {
        // trick the Router into believing it's last link wasn't previously loaded
        this._router.navigated = false;
        // if you need to scroll back to top, here is the right place
        window.scrollTo(0, 0);
      }
    });

    //fin recargar al entrar por link
		this.id_usuario = localStorage.getItem('id_usuario');
    this.formBusqueda = this.iniciarFormularioBusqueda();
	}

  ngOnInit() {
    this.buscarCatTipoProcedimiento();
    this.buscarSubmit();
  }

  iniciarFormularioBusqueda() {
    return new FormGroup({
        noProcedimiento: new FormControl(null, [
            Validators.minLength(3)
        ]),
        tipoProcedimientoId: new FormControl(null, []),
        tipoEstatusId: new FormControl(null, [])
    });
  }

  buscarSubmit(getByInput?: boolean){
    this.loader = true;
    this.loaderBusqueda = true;
    if (this.formBusqueda?.invalid) {
      for (const control of Object.keys(this.formBusqueda.controls)) {
          this.formBusqueda.controls[control].markAsTouched();
          console.info(this.formBusqueda.controls[control].errors);
      }
      return;
    }
    const datosBusqueda: ITableroProcedimientosBusqueda = this.formBusqueda?.value as ITableroProcedimientosBusqueda;
    datosBusqueda.usuarioId = this.id_usuario;

    if (getByInput) datosBusqueda.pageSize = this.pageSize;
    datosBusqueda.page = this.page;

    this._tableroProveedoresService.getProcedimientos(datosBusqueda).subscribe({
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
          this.loader = false;
      }
    });


  }

  canActivate(permiso:string): boolean {
    return this._authService.canActivateFunction(permiso);
  }

  rutaLink(ruta:string){

    this._router.navigate([ruta]);
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

  filtrar(){
    this.page = 1;
    this.buscarSubmit();
  }

  reset(){
    this.formBusqueda.reset();
    this.page = 1;
    this.buscarSubmit();
  }

  tipoProcedimiento(datos:IProcedimientoAdministrativo){
    this.blnActivarDetalle = false;
    this.procedimientoElegido = datos;
    this.tipo = datos.id_tipo_contratacion;
  }

  public cancelarDetalleProcedimiento() {
    this.tipo = 0;
    this.blnActivarDetalle = true;

  }

  public presentarPropuesta(datos:IProcedimientoAdministrativo){
    if (this.esFechaRecepcion(datos)) {
      this.blnActivarDetalle = false;
      this.procedimientoElegido = datos;
      this.blnPresentarPropuesta = true;
    }
  }

  public cancelarPresentarPropuesta() {
    this.blnPresentarPropuesta = false;
    this.blnActivarDetalle = true;

  }

  public validarGenerarPaseCaja(datos:IProcedimientoAdministrativo){
    //return datos.id_estatus_procedimiento == 2 && datos.pase_caja==null;
    return datos.id_estatus_procedimiento == 2;
  }

  public generarPaseCaja(datos:IProcedimientoAdministrativo){
    if (this.validarGenerarPaseCaja(datos)) {
      this.blnActivarDetalle = false;
      this.procedimientoElegido = datos;
      this.blnGenerarPaseCaja = true;
    }
  }

  public cancelarPaseCaja() {
    this.blnGenerarPaseCaja = false;
    this.blnActivarDetalle = true;
    this.buscarSubmit();

  }

  validarAdminPreguntasProcedimientos(datos: IProcedimientoAdministrativo) {
    return datos.id_tipo_contratacion != 3
  }
  adminPreguntasProcedimientos(datos: IProcedimientoAdministrativo){
    if (this.validarAdminPreguntasProcedimientos(datos)) {
      this.procedimientoElegido = datos;

      this.blnActivarPreguntasProcedimimento = true;
      this.blnActivarDetalle = false;
    }
  }

  cancelarPreguntasProcedimiento(){
    this.blnActivarPreguntasProcedimimento = false;
    this.blnActivarDetalle = true;
  }

  /**
   * Funcion para validar con respecto a la fecha y hora si el botón de presentar propuesta debe mostrarse o no
   * @author Adan
   * @param info
   * @returns
   */
  esFechaRecepcion(info:any) {
    // console.info("------ Es fecha recepcion", info.id_procedimiento_administrativo, info.numero_procedimiento, info.fecha_junta_aclaraciones, info.fecha_apertura, info.fecha_apertura_nueva);
    if (info.fecha_junta_aclaraciones == null &&
      info.fecha_junta_aclaraciones_nueva == null &&
      info.fecha_apertura_nueva == null && info.fecha_apertura) {
      return false;
    }

    const fechas:{
      fechaActual: any,
      fechaJunta: any,
      fechaApertura: any
  } = {
      fechaActual: moment(info.horaServidor),
      fechaJunta: info.fecha_junta_aclaraciones_nueva ? moment(info.fecha_junta_aclaraciones_nueva) : moment(info.fecha_junta_aclaraciones),
      fechaApertura: info.fecha_apertura_nueva ? moment(info.fecha_apertura_nueva) : moment(info.fecha_apertura)
  }
    return fechas.fechaActual > fechas.fechaJunta && fechas.fechaActual < fechas.fechaApertura && info.pase_caja === 1 ||
    fechas.fechaActual > fechas.fechaJunta && fechas.fechaActual < fechas.fechaApertura && info.id_tipo_contratacion === 2;
  }

  /**
   * Funcion para validar si el procedimiento es Presencial y/o Simplificada
   */
  validarParametrosProcedimiento(info: any)
  {
      return info.id_tipo_modalidad !== 1 || info.id_tipo_modalidad !==3 || info.id_tipo_contratacion !== 2;
  }
}
