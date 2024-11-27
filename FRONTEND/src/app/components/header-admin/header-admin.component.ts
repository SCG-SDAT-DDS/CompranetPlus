import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import {AuthService} from "../login/auth.service";
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-header-admin',
  templateUrl: './header-admin.component.html',
  styleUrls: ['./header-admin.component.css'],
	encapsulation: ViewEncapsulation.Emulated,
})
export class HeaderAdminComponent implements OnInit {
  nameUser: string | null;
  rolUser: string | null;
  unidadesCompradoras: any[];
  unidadesResponsables: any[];

  constructor(private _authService: AuthService, private offcanvasService: NgbOffcanvas) {
    this.nameUser = localStorage.getItem('me');
    this.rolUser = this._authService.rolSys;
    this.unidadesCompradoras = JSON.parse(JSON.stringify(this._authService.unidadCompradora));
    this.unidadesResponsables = JSON.parse(JSON.stringify(this._authService.unidadResponsable));
  }

  ngOnInit() {
  }

  logout() {
    this._authService.logout();
  }

  open(content: any) {
		this.offcanvasService.open(content, { position: 'end'});
	}

  getName() {
    return this._authService.rfcProveedor ? this._authService.rfcProveedor : this.nameUser
  }
}
