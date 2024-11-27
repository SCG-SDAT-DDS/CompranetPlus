import { Component, OnInit , OnDestroy} from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { AuthService } from 'src/app/components/login/auth.service';
import { VistaPublicaService } from '../../services/vistaPublica.service';
import { IProveedorInscripcion } from 'src/app/interfaces/proveedores/IProveedorInscripcion';
import Swal from 'sweetalert2';
import { CriptoService } from 'src/app/admin/services/Cripto.service';

@Component({
  selector: 'app-inscripcion',
  templateUrl: './inscripcion.component.html',
  styleUrls: ['./inscripcion.component.css'],
})
export class InscripcionComponent implements OnInit, OnDestroy {
  isLoggedIn$: Observable<boolean> = new Observable<boolean>();
  usuarioLogueado: boolean = false;
  procedimiento: any;
  datosInscripcion!: IProveedorInscripcion;
  rfcProveedor: any;
  estatusProveedor: any;
  loaderEstatus: boolean = false;
  loaderInscripcion: boolean = false;
  private subscription: Subscription | any;

  constructor(
    private _router: Router,
    private _authService: AuthService,
    private _vistaPublica: VistaPublicaService,
    private _cripto: CriptoService
  ) {}

  ngOnInit(): void {
    const licitacion = this._vistaPublica.getDatosLicitacion();
    if (licitacion !== undefined) {
      this.procedimiento = licitacion;
    } else {
      this._router.navigateByUrl('inicio/portal-licitaciones');
    }

    this.isLoggedIn$ = this._authService.isLoggedIn();
    this.loaderEstatus = true;
     this.subscription = this.isLoggedIn$.subscribe((isLoggedIn) => {
      this.usuarioLogueado = isLoggedIn;
      setTimeout(() => {
        if (this.usuarioLogueado) {
          if (localStorage.getItem('id_p') == 'null') {
            Swal.fire(
              'No cuenta con el rol de Proveedor para participar, verifique sus datos',
              '',
              'error'
            );
            this._router.navigateByUrl('inicio/portal-licitaciones');
            return;
          }

          this.rfcProveedor = this._cripto.decrypt(localStorage.getItem('rp_'));
          this._vistaPublica
            .obtenerEstatusProveedor(Number(localStorage.getItem('id_p')))
            .subscribe({
              next: (data) => {
                this.estatusProveedor = data.datos.id_estatus_proveedor;
                localStorage.setItem('sts_p', this.estatusProveedor);
                this.handleEstatusProveedor(this.estatusProveedor);
              },
              error: (err) => {
                Swal.fire(err.error.mensaje, '', 'error');
              },
            });
        }
      }, 300);
    });
  }

  handleEstatusProveedor(estatus: number) {
    switch (estatus) {
      case 1:
        this.showError(
          'No puede realizar el procedimiento de inscripción',
          'Finalice su registro validando los datos con su e-firma'
        );
        break;
      case 2:
        this.showError(
          'Falta que un Administrador valide sus datos para poder participar en un procedimiento vigente'
        );
        break;
      case 4:
        this.showError('Su estatus de proveedor se encuentra en SUSPENDIDO');
        break;
      default:
        this.loaderEstatus = false;
        break;
    }
  }

  showError(title: string, message: string = '') {
    Swal.fire(title, message, 'error');
    this.redireccionarInicio();
  }

  obtenerFechaActual() {
    // Obtener la fecha y hora actual
    const hoy = new Date();

    // Formatear la fecha en "yyyy-mm-dd"
    const anio = hoy.getFullYear();
    const mes = (hoy.getMonth() + 1).toString().padStart(2, '0');
    const dia = hoy.getDate().toString().padStart(2, '0');
    const fechaFormateada = `${anio}-${mes}-${dia}`;

    // Formatear la hora en "hh:mm:ss"
    const horas = hoy.getHours().toString().padStart(2, '0');
    const minutos = hoy.getMinutes().toString().padStart(2, '0');
    const segundos = hoy.getSeconds().toString().padStart(2, '0');
    const horaFormateada = `${horas}:${minutos}:${segundos}`;

    // Combinar fecha y hora
    const fechaYHoraActual = `${fechaFormateada} ${horaFormateada}`;

    return fechaYHoraActual;
  }

  validacionEfirma(event: boolean) {
    if (event) {
      this.loaderInscripcion = true;
      this.datosInscripcion = {
        id_participante_procedimiento: null,
        id_procedimiento_administrativo:
          this.procedimiento.id_procedimiento_administrativo,
        id_proveedor: Number(localStorage.getItem('id_p')), // agregar el id del proveedor
        id_tipo_participacion: 2,
        id_estatus_participacion: null,
        fecha_inscripcion: this.obtenerFechaActual(),
        certificado_proveedor: null,
        numero_certificado: null,
        fecha_fallo: null,
        url_archivo_acto_fallo: null,
        procedimiento: this.procedimiento.numero_procedimiento,
      };
      this._vistaPublica.generarInscripcion(this.datosInscripcion).subscribe({
        next: (data) => {
          if (data.datos.exito) {
            Swal.fire(data.datos.mensaje, '', 'success');
            this._router.navigateByUrl('/inicio/portal-licitaciones');
            this.loaderInscripcion = false;
          } else {
            Swal.fire(data.datos.mensaje, '', 'error');
            this.loaderInscripcion = false;
          }
        },
        error: (err) => {
          Swal.fire(err.error.mensaje, '', 'error');
          this.loaderInscripcion = false;
        },
      });
    }
  }

  redireccionarInicio() {
    this._router.navigateByUrl('inicio/portal-licitaciones');
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
