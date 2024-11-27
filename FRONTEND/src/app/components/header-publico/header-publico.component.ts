import { Component, HostListener, OnInit , ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../login/auth.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { NotificacionesComponent } from '../notificaciones/notificaciones.component';

@Component({
  selector: 'app-header-publico',
  templateUrl: './header-publico.component.html',
  styleUrls: ['./header-publico.component.css'],
  imports: [NgbModule , CommonModule, NotificacionesComponent],
  encapsulation: ViewEncapsulation.Emulated,
  standalone: true
})
export class HeaderPublicoComponent implements OnInit {
  nameUser: string | null;
  rolUser: string | null;
  isLoggedIn$: Observable<boolean> = new Observable<boolean>();
  usuarioLogueado: boolean = false;
  scrollThreshold = 200;
  isSticky = false;

  constructor(private _router:Router, private _authService: AuthService) {
    this.nameUser = localStorage.getItem('me');
    this.rolUser = this._authService.rolSys ? this._authService.rolSys : localStorage.getItem('roles');
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isSticky = window.scrollY > this.scrollThreshold;
  }

  ngOnInit() {
    this.isLoggedIn$ = this._authService.isLoggedIn();

    // Suscripción para obtener el valor actual
    this.isLoggedIn$.subscribe(isLoggedIn => {
      this.usuarioLogueado = isLoggedIn;
    });
  }

  logout() {
    this._authService.logout();
  }


  rutaLink(ruta:string){
    this._router.navigate([ruta]);
  }

  getName() {
    return this._authService.rfcProveedor ? this._authService.rfcProveedor : this.nameUser
  }
}
