import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { INotificacionLeida, INotificaciones, INotificacionesUsuario } from 'src/app/interfaces/INotificaciones';
import { NoticicacionesService } from 'src/app/services/noticicaciones.service';
import swal from 'sweetalert2';

@Component({
  selector: 'app-notificaciones',
  templateUrl: './notificaciones.component.html',
  styleUrls: ['./notificaciones.component.css'],
  imports: [NgbModule, CommonModule],
  standalone: true
})
export class NotificacionesComponent {

  lstNotificaciones: INotificaciones[] | null = null;
  notificacionSeleccionada: INotificaciones | null = null;
  loader  = false;
  total = 0;
  recargar = false;
  intervalId: any;
  id_notificacion_usuario: string | null;


  constructor(
    private modalService: NgbModal,
    private _notificacionesService: NoticicacionesService,
  ) {

    this.id_notificacion_usuario = localStorage.getItem('id_usuario');
    const usuario =  this.usuarioNotificacion( this.id_notificacion_usuario );
    this.obtenerNotificaciones(usuario);
    this.obtenerenuevasNotificaciones();
  }


  openModalNotifications(modal: any) {
		this.modalService.open(modal, { scrollable: true });
	}

  obtenerNotificaciones(id_provedor:INotificacionesUsuario){

    this._notificacionesService.getNotificaciones(id_provedor).subscribe({
      next: (res) => {
        const data = res.datos;
        this.lstNotificaciones = data.notificaciones;
        this.total = data.totalNoLeidas;
      },
      error: (err) => {
        console.info(err)
      },
    });


  }

  mostrarDetalle(notificacion: INotificaciones) {

    this.notificacionSeleccionada = notificacion;

    const id_notificacion: INotificacionLeida = {
      id_notificacion: notificacion.id_notificacion_usuario
    };

    if(!notificacion.estatus_leido){
      this.recargar = true;
      this._notificacionesService.notificacionLeida(id_notificacion).subscribe({
      error: (err) => {
        console.info(err)
        swal.fire(err.error.mensaje, "", 'error');
      },
      complete: () => {
        this.loader = false;
      }
      });
    }
  }

  mostrarNotificaciones() {
    this.notificacionSeleccionada = null;
    if(this.recargar){

      this.recargar = false;
      const usuario =  this.usuarioNotificacion(this.id_notificacion_usuario);
      this.obtenerNotificaciones(usuario);

    }

  }

 obtenerenuevasNotificaciones() {

  this.intervalId = setInterval(() => {
    const usuario =  this.usuarioNotificacion(this.id_notificacion_usuario);
    this.obtenerNotificaciones(usuario);
  }, 60000);

}

  usuarioNotificacion(id: string | null = ''): INotificacionesUsuario {
    return {
      id_usuario: id ?? ''
    };
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }


}
