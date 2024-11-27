import { RecepcionAperturaProposicionesComponent } from './administrar-procedimientos/recepcion-apertura-proposiciones/recepcion-apertura-proposiciones.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdministrarComponent } from './administrar-procedimientos/administrar/administrar.component';
import { DiferendoAperturaComponent } from './administrar-procedimientos/diferendo-apertura/diferendo-apertura.component';
import { AnexosProcedimientosComponent } from './administrar-procedimientos/anexos-procedimientos/anexos-procedimientos.component';
import { AgregarProcedimientoAdjudicacionComponent } from './administrar-procedimientos/agregar-procedimiento-adjudicacion/agregar-procedimiento-adjudicacion.component';
import { AdministrarAdjudicacionComponent } from './administrar-procedimientos/administrar-adjudicacion/administrar-adjudicacion.component';
import { ParticipanteComponent } from './administrar-procedimientos/participante/participante.component';
import { EvaluacionPropuestaFalloComponent } from './administrar-procedimientos/evaluacion-propuesta-fallo/evaluacion-propuesta-fallo.component';
import { AnunciosTableroComponent } from './anuncios-tablero/anuncios-tablero.component';

const routes: Routes = [
  {
    path: 'administrar-procedimientos/:tipo', component: AdministrarComponent,
  },
  {
    path: 'recepcion-proposiciones',
    component: RecepcionAperturaProposicionesComponent,
  },
  {
    path: 'diferendo-apertura', component: DiferendoAperturaComponent,
  },
  {
    path: 'administrar-adjudicaciones', component: AdministrarAdjudicacionComponent,
  },
  {
    path: 'tablero-procedimientos', component: AnunciosTableroComponent,
  },
  {
    path: 'agregar-adjudicacion', component: AgregarProcedimientoAdjudicacionComponent,
  },
  {
    path: 'participante', component: ParticipanteComponent
  },
  {
    path: 'evaluacion-propuesta-fallo', component: EvaluacionPropuestaFalloComponent
  },
  {
    path: 'anexos-procedimientos', component: AnexosProcedimientosComponent,
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConvocantesRoutingModule { }

