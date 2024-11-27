import { Component } from '@angular/core';

@Component({
  selector: 'app-lista-reportes',
  templateUrl: './lista-reportes.component.html',
  styleUrls: ['./lista-reportes.component.css']
})
export class ListaReportesComponent {

  reportes = [
    { nombre: 'Licitaciones presenciales',   descripcion:"Reporte de licitaciones presenciales de la UC central",  fecha:"21/07/2023"},
    { nombre: 'Licitaciones de partida 001', descripcion:"Reporte de licitaciones de partida 001 concentrado",  fecha:"01/08/2023"}
    

  ];


}
