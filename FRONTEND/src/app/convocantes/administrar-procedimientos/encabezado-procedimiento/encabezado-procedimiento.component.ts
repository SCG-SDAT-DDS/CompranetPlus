import { Component, Input } from '@angular/core';
import { IProcedimientoAdministrativo } from 'src/app/interfaces/convocantes/IProcedimientoAdministrativo';

@Component({
  selector: 'app-encabezado-procedimiento',
  templateUrl: './encabezado-procedimiento.component.html',
  styleUrls: ['./encabezado-procedimiento.component.css']
})
export class EncabezadoProcedimientoComponent {

  @Input() public __procedimientoElegido: IProcedimientoAdministrativo | null = null;

}
