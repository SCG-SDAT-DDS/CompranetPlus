import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CrearReporteComponent } from './generar-reportes/crear-reporte/crear-reporte.component';
import { ListaReportesComponent } from './generar-reportes/lista-reportes/lista-reportes.component';

const routes: Routes = [
  {
    path: 'crear-reportes', 
    component: CrearReporteComponent
  },
  {
    path: 'lista-reportes',
    component: ListaReportesComponent
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportesRoutingModule { }
