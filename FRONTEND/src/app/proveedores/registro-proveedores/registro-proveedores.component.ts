import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registro-proveedores',
  templateUrl: './registro-proveedores.component.html',
  styleUrls: ['./registro-proveedores.component.css'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class RegistroProveedoresComponent {
  personaJuridicaSeleccionada: string | null = null;
  lst_tipos_personeria_juridica = [
    {
      id_tipo_personeria_juridica: 1,
      nombre_personeria_juridica: 'Persona Moral'
    },
    {
      id_tipo_personeria_juridica: 2,
      nombre_personeria_juridica: 'Persona Física'
    }
  ];
  tipoPersona: any;

  constructor(
    private _router: Router,
  ) {}

 
  redireccionar() {
    this._router.navigateByUrl('inicio/portal-licitaciones');
  }

 
  tipoPersonaJuridica(typePerson: any) {
    this.personaJuridicaSeleccionada = typePerson?.nombre_personeria_juridica;
    this.tipoPersona = typePerson;
  }


}
