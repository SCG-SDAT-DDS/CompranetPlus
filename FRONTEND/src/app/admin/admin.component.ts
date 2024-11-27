import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../components/login/auth.service';

@Component({
    selector: 'app-admin',
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  constructor(private _router: Router, private _authService: AuthService) { }

  ngOnInit() {
    if (this.canActivate('ADMIN_TABPROC_MENU')) {
    
      this._router.navigate(['/admin/panel/tablero-procedimientos']);
    }
  }

  canActivate(permiso:string): boolean {
    return this._authService.canActivateFunction(permiso);
  }

}
