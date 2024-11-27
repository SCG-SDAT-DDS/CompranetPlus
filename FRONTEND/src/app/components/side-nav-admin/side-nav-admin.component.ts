import { Component, OnInit } from '@angular/core';
import { AuthService } from '../login/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-side-nav-admin',
  templateUrl: './side-nav-admin.component.html',
  styleUrls: ['./side-nav-admin.component.css']
})
export class SideNavAdminComponent implements OnInit {
  public isCollapsed = false;
  public isProveedores =true;
  constructor(private _auth: AuthService, private _router: Router,private _authService: AuthService) { }

  ngOnInit() {
  }

  canActivate(permiso:string): boolean {
    return this._authService.canActivateFunction(permiso);
  }

  cerrarSesion(){
    this._auth.logout();
    this._router.navigateByUrl('#');
  }

  tieneExtemporaneas(): boolean {
    return this._authService.getTieneExtemporaneas();
  }

}
