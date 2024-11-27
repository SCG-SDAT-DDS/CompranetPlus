import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/components/login/auth.service';
import { ICatalogoUnidadCompradora } from 'src/app/interfaces/catalogos/ICatalogoUnidadCompradora';
import { IBusquedaProcedimiento } from 'src/app/interfaces/convocantes/IBusquedaProcedimiento';
import { IProcedimientoAdministrativo } from 'src/app/interfaces/convocantes/IProcedimientoAdministrativo';
import { ITipoProcedimiento } from 'src/app/interfaces/convocantes/ITipoProcedimiento';
import { ConvocantesService } from 'src/app/services/convocantes.service';
import swal from 'sweetalert2';



@Component({
  selector: 'app-administrar-adjudicacion',
  templateUrl: './administrar-adjudicacion.component.html',
  styleUrls: ['./administrar-adjudicacion.component.css']
})
export class AdministrarAdjudicacionComponent implements OnInit{

  idUnidadCompradoraElegida: number = 0;

  formBusqueda: FormGroup;
  idTipo: number;


  loaderBusqueda: boolean = false;

  public blnActivarAdministrar: boolean;
  public blnActivarAgregar: boolean;
  public blnActivarDetalle: boolean;
  public blnActivarAnexosProcedimientos: boolean;
  selectedUC: ICatalogoUnidadCompradora | any;

  lstTablaTiposProcedimientos: ITipoProcedimiento[] | null = null;
  lstTablaProcedimientos: IProcedimientoAdministrativo[] | null = null;
  lstTablaUnidadesCompradoras: ICatalogoUnidadCompradora[] | null = null;

  procedimientoElegido: IProcedimientoAdministrativo | null = null;

  public blnActivarEditar: boolean = false;

  messageTitle: string = '';
  messageSubTitle: string = '';
  messageButton: string = '';

  page = 1;
  pageSize = 10;
  collectionSize= 0;


  constructor(private modalService: NgbModal,private router: Router, private _authService: AuthService,
    private rutaActiva: ActivatedRoute, private _convocantesService: ConvocantesService){

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

      this.idTipo = 3;

      this.blnActivarAdministrar = true;
      this.blnActivarAgregar = false;
      this.blnActivarDetalle = false;
      this.blnActivarAnexosProcedimientos = false;


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



    this.blnActivarAdministrar = true;
    this.blnActivarAgregar = false;
    this.blnActivarDetalle = false;
    this.blnActivarAnexosProcedimientos = false;


    this.llenarCatalogos();



  }


  llenarCatalogos(){

    this.loaderBusqueda = true;
    this._convocantesService.obtenerTiposProcedimientos(3).subscribe({
        next: (data) => {
            this.lstTablaTiposProcedimientos = data.datos;
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
          swal.fire(err.error.mensaje, "", 'error');
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
          console.info(this.formBusqueda.controls[control].errors);
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
            swal.fire(err.error.mensaje, "", 'error');
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


  agregarProcedimiento(){
    this.blnActivarAgregar = true;
    this.blnActivarAdministrar = false;

    this.blnActivarEditar = false;
    this.messageTitle = 'Nuevo procedimiento de adjudicación';
    this.messageSubTitle = 'crear un nuevo procedimiento de adjudicación directa';
    this.messageButton = 'Registar';
  }

  editarProcedimiento(datos: IProcedimientoAdministrativo) {
    this.procedimientoElegido = datos;
    this.blnActivarAgregar = true;
    this.blnActivarAdministrar = false;

    this.blnActivarEditar = true;
    this.messageTitle = 'Editar procedimiento de adjudicación';
    this.messageSubTitle = 'editar un procedimiento de adjudicación directa';
    this.messageButton = 'Actualizar';

  }

  detalleProcedimiento(datos: IProcedimientoAdministrativo){
    this.procedimientoElegido = datos;

    this.blnActivarDetalle = true;
    this.blnActivarAdministrar = false;

  }


  anexosProcedimiento(datos: IProcedimientoAdministrativo){
    this.procedimientoElegido = datos;

    this.blnActivarAnexosProcedimientos = true;
    this.blnActivarAdministrar = false;

  }

  public cancelarAgregarProcedimiento() {
    this.blnActivarAgregar = false;
    this.blnActivarAdministrar = true;

    this.buscarProcedimientosAdministrativos();
  }


  public cancelarDetalleProcedimiento() {
    this.blnActivarDetalle = false;
    this.blnActivarAdministrar = true;
  }



  public cancelarAnexosProcedimiento() {
    this.blnActivarAnexosProcedimientos = false;
    this.blnActivarAdministrar = true;
  }

  descargarPdf(base64String: any, fileName: any, extensionArchivo: any) {
    const source = `data:application/pdf;base64,${base64String}`;
    const link = document.createElement("a");
    link.href = source;
    link.download = `${fileName}.${extensionArchivo}`
    link.click();
  }

  onClickDescargarPdf(url: any, nombre: any){
    const extensionArchivo = this.obtenerExtensionArchivo(url);
    this._convocantesService.obtenerArchivoBase64(url, false).subscribe({
      next: (data) => {
        let base64String = data.datos;
        this.descargarPdf(base64String, nombre, extensionArchivo);
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

  onPageChange() {
    this.buscarProcedimientosAdministrativos();
  }

  permiteModificar(datos: IProcedimientoAdministrativo) {

      return true;

  }

  permiteAnexos(datos: IProcedimientoAdministrativo) {

      return true;

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

        console.log('Unidad Compradora', this.selectedUC);
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
