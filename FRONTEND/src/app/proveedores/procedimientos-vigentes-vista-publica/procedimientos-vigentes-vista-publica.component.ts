import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import {
  NgbCalendar,
  NgbDate,
  NgbDateParserFormatter,
  NgbModal,
} from '@ng-bootstrap/ng-bootstrap';
import { VistaPublicaService } from '../services/vistaPublica.service';
import { ICatalogoUnidadResponsable } from 'src/app/interfaces/catalogos/ICatalogoUnidadResponsable';
import { ICatalogoTipoProcedimiento } from 'src/app/interfaces/catalogos/ICatalogoTipoProcedimiento';
import { IEstatusProcedimientoPublic, } from 'src/app/interfaces/convocantes/IEstatusProcedimiento';
import { FiltrosVistaPublica } from 'src/app/interfaces/proveedores/filtrosVistaPublica';
import Swal from 'sweetalert2';
import { CriptoService } from 'src/app/admin/services/Cripto.service';
import { ProveedoresService } from '../services/proveedores.service';
@Component({
  selector: 'app-procedimientos-vigentes-vista-publica',
  templateUrl: './procedimientos-vigentes-vista-publica.component.html',
  styleUrls: ['./procedimientos-vigentes-vista-publica.component.css'],
})
export class ProcedimientosVigentesVistaPublicaComponent implements OnInit {
  @ViewChild('myModal') myModal : any;
  @ViewChild('dpFromDate') dpFromDate: ElementRef | any;
  @ViewChild('dpToDate') dpToDate: ElementRef | any;
  lst_unidades_responsables: ICatalogoUnidadResponsable[] = [];
  lstCatTipoProcedimiento: ICatalogoTipoProcedimiento[] = [];
  lstCatContratacion: any;
  lst_cat_estatus: IEstatusProcedimientoPublic[] = [];

  page = 1;
  pageSize = 10;
  collectionSize = 0;

  loader: boolean = true;
  list_licitaciones: any;

  ordenAscendente: boolean = true;

  filtros: FiltrosVistaPublica | any;
  vistaListado: boolean = true;
  hoveredDate: NgbDate | null = null;

  fromDate: NgbDate | any;
  toDate: NgbDate | any;
  mostrandoMsj: string = '';

  rfcProveedor: any;
  idProveedor: any;
  estatusProveedor: any;

  constructor(
    private _router: Router,
    private modalService: NgbModal,
    private calendar: NgbCalendar,
    public formatter: NgbDateParserFormatter,
    private _vistaPublica: VistaPublicaService,
    private _proveedor: ProveedoresService,
    private _cripto: CriptoService
  ) {
    this.fromDate = null;
    this.toDate = null;
    this.filtros = {
      unidad_responsable: null,
      concepto_contratacion: null,
      no_licitacion: null,
      tipo_licitacion: 1,
      tipo_procedimiento: null,
      estatus_procedimiento: 2,
      fecha_inicial: null,
      fecha_final: null,
      page: null,
    };
    this.mostrandoMsj = '';
  }

  formatFecha(date?: any): string {
    if (date) {
      const { day, month, year } = date;
      const formattedDay = day < 10 ? `0${day}` : day;
      const formattedMonth = month < 10 ? `0${month}` : month;
      return `${formattedDay}-${formattedMonth}-${year}`;
    }
    return '';
  }

  ngOnInit() {
    this.obtenerUnidadesCompradoras();
    const filtrosStr = localStorage.getItem('filtros');

    if (filtrosStr) {
      // Si hay filtros almacenados, conviértelos de nuevo a un objeto
      const filtros = JSON.parse(filtrosStr);

      // Asigna los valores recuperados a tus variables
      this.filtros = {
        unidad_responsable: filtros?.unidad_responsable,
        concepto_contratacion: filtros?.concepto_contratacion,
        no_licitacion: filtros?.no_licitacion,
        tipo_licitacion: filtros?.tipo_licitacion,
        tipo_procedimiento: filtros?.tipo_procedimiento,
        estatus_procedimiento: filtros?.estatus_procedimiento,
        fecha_inicial: filtros?.fecha_inicial,
        fecha_final: filtros?.fecha_final,
        page: filtros?.page,
      };
      
      
    this.obtenerProcedimientos(this.filtros);
    }else{
      this.obtenerProcedimientos();
    }
  }

  ngAfterViewInit(): void {
    this.rfcProveedor = this._cripto.decrypt(localStorage.getItem('rp_'));
    this.idProveedor = Number(localStorage.getItem('id_p'));
    this.estatusProveedor = Number(localStorage.getItem('sts_p'));
    if(this.estatusProveedor == 1){
      this.modalService.open(this.myModal, {size: 'lg'});
    }

    if (this.dpFromDate && this.dpToDate) {
      this.dpFromDate.nativeElement.value = this.formatFecha(this.formatter.parse(this.filtros.fecha_inicial));
      this.dpToDate.nativeElement.value = this.formatFecha(this.formatter.parse(this.filtros.fecha_final));
    }
  }

  /**
   * Obtener todos los catalogos para los filtros
   * @author Adan
   */

  obtenerUnidadesCompradoras() {
    this._vistaPublica.obtenerUnidadesCompradoras().subscribe({
      next: (data) => {
        this.lst_unidades_responsables = data.datos;
      },
      error: (err) => {},
      complete() {},
    });
  }

  obtenerProcedimientos(filtros?: any , getByInput?: boolean) {
    if (filtros){
      localStorage.setItem('filtros', JSON.stringify(this.filtros));
    }

    if (getByInput) this.filtros.pageSize = this.pageSize;
    this.loader = true;
    this._vistaPublica.obtenerProcedimientos(this.filtros).subscribe({
      next: (data) => {
        this.list_licitaciones = data.datos.data;
        this.loader = false;
        if (this.list_licitaciones.length > 0) {
          this.collectionSize = data.datos.total;
          this.pageSize = data.datos.per_page;
          this.mostrandoMsj = `Mostrando ${data.datos.from} - ${data.datos.to} de ${this.collectionSize} resultados`;
        } else {
          this.mostrandoMsj = '';
        }
      },
    });
  }

  /**
   * Funcion para el paginador
   */
  onPageChange() {
    this.filtros.page = this.page;
    this.obtenerProcedimientos(this.filtros);
  }

  /**
   * Funciones para el uso del Datepicker
   */
  onDateSelection(date: NgbDate) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (
      this.fromDate &&
      !this.toDate &&
      date &&
      date.after(this.fromDate)
    ) {
      this.toDate = date;
    } else {
      this.toDate = null;
      this.fromDate = date;
    }
    const fromDateFormatted = this.fromDate
      ? this.formatNgbDate(this.fromDate)
      : '';
    const toDateFormatted = this.toDate ? this.formatNgbDate(this.toDate) : '';

    this.filtros.fecha_inicial = String(fromDateFormatted);
    this.filtros.fecha_final = String(toDateFormatted);
  }

  isHovered(date: NgbDate) {
    return (
      this.fromDate &&
      !this.toDate &&
      this.hoveredDate &&
      date.after(this.fromDate) &&
      date.before(this.hoveredDate)
    );
  }

  isInside(date: NgbDate) {
    return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
  }

  isRange(date: NgbDate) {
    return (
      date.equals(this.fromDate) ||
      (this.toDate && date.equals(this.toDate)) ||
      this.isInside(date) ||
      this.isHovered(date)
    );
  }

  validateInput(currentValue: NgbDate | null, input: string): NgbDate | null {
    const parsed = this.formatter.parse(input);
    return parsed && this.calendar.isValid(NgbDate.from(parsed))
      ? NgbDate.from(parsed)
      : currentValue;
  }

  /**
   * Funciones de ordenamiento
   */
  ordenarEstatus() {
    this.list_licitaciones.sort((a: any, b: any) => {
      const idA = parseInt(a.id_estatus_procedimiento, 10);
      const idB = parseInt(b.id_estatus_procedimiento, 10);
  
      if (idA < idB) {
        return this.ordenAscendente ? -1 : 1;
      } else if (idA > idB) {
        return this.ordenAscendente ? 1 : -1;
      } else {
        return 0;
      }
    });
  
    this.ordenAscendente = !this.ordenAscendente; // Cambiar el orden
  }

  ordenarNumLicitacion() {
    this.list_licitaciones.sort((a: any, b: any) => {
      const compareResult = a.numero_procedimiento.localeCompare(
        b.numero_procedimiento,
        'en',
        { numeric: true }
      );
      return this.ordenAscendente ? compareResult : -compareResult;
    });
    this.ordenAscendente = !this.ordenAscendente; // Cambiar el orden
  }

  ordenarFecha() {
    this.list_licitaciones.sort((a: any, b: any) => {
      const fechaA = new Date(
        a.fecha_publicacion.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$2-$1')
      );
      const fechaB = new Date(
        b.fecha_publicacion.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$2-$1')
      );
      const compareResult = fechaA.getTime() - fechaB.getTime();
      return this.ordenAscendente ? compareResult : -compareResult;
    });
    this.ordenAscendente = !this.ordenAscendente; // Cambiar el orden
  }

  ordenarConcepto() {
    this.list_licitaciones.sort((a: any, b: any) => {
      const compareResult = a.descripcion_concepto_contratacion.localeCompare(
        b.descripcion_concepto_contratacion,
        'en',
        { sensitivity: 'base' }
      );
      return this.ordenAscendente ? compareResult : -compareResult;
    });
    this.ordenAscendente = !this.ordenAscendente; // Cambiar el orden
  }

  ordenarDependencia() {
    this.list_licitaciones.sort((a: any, b: any) => {
      const compareResult = a.nombre_unidad_responsable.localeCompare(
        b.nombre_unidad_responsable,
        'en',
        { sensitivity: 'base' }
      );
      return this.ordenAscendente ? compareResult : -compareResult;
    });
    this.ordenAscendente = !this.ordenAscendente; // Cambiar el orden
  }

  formatNgbDate(date: NgbDate): string {
    const year = date.year.toString().padStart(4, '0');
    const month = date.month.toString().padStart(2, '0');
    const day = date.day.toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Funcion para filtrar los datos
   */
  filtrarDatos() {
    this.filtros.page = 1;
    this.obtenerProcedimientos(this.filtros);
  }

  /**
   * Funcion para limpiar lo filtros
   */
  limpiarFiltros() {
    this.filtros = {
      unidad_responsable: null,
      concepto_contratacion: null,
      no_licitacion: null,
      tipo_licitacion: 1,
      tipo_procedimiento: null,
      estatus_procedimiento: 2,
      fecha_inicial: null,
      fecha_final: null,
    };
    this.page = 1;
    this.fromDate = null;
    this.toDate = null;
    this.dpFromDate.nativeElement.value = null;
    this.dpToDate.nativeElement.value = null;
    this.obtenerProcedimientos(this.filtros);
    localStorage.removeItem('filtros');
  }

  /**
   * Mostrar el detalle del procedimiento vigente
   * @param ruta
   * @param id
   */
  mostrarDetalle(ruta: string, id: number) {
    const params = {
      id : id,
      estatusProveedor : this.estatusProveedor
    }
    this._vistaPublica.setProcedimiento(params);
    this._router.navigateByUrl(ruta);
  }

  open(content: any, licitacion: any) {
    this.modalService.open(content);
    this._vistaPublica.setLicitacionParticipacion(licitacion);
  }

  /**
   * Redireccionar a la pantalla para Inscripción del proveedor
   */
  redireccionarInscripcion() {
    this._router.navigateByUrl('inicio/inscripcion');
    this.modalService.dismissAll();
  }

  /**
   * Cambiar la vista cuadriculada a lista y viceversa
   */
  cambiarVista() {
    if (this.vistaListado) {
      this.vistaListado = false;
    } else {
      this.vistaListado = true;
    }
  }

  efirmaResponse(event: boolean) {
    if (event) {
      this._proveedor
        .finalizarRegistroProveedor(this.idProveedor)
        .subscribe({
          next: (data) => {
            Swal.fire(data.mensaje, '', 'success');
            localStorage.setItem('sts_p',"2");
            window.location.reload();
          },
        });
    }
  }
}
