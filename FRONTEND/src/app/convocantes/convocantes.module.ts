import { NgModule } from '@angular/core';
import { CommonModule, DatePipe  } from '@angular/common';

import { ConvocantesRoutingModule } from './convocantes-routing.module';
import { RecepcionAperturaProposicionesComponent } from './administrar-procedimientos/recepcion-apertura-proposiciones/recepcion-apertura-proposiciones.component';
import { AdminModule } from '../admin/admin.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { AgregarProcedimientoComponent } from './administrar-procedimientos/agregar-procedimiento/agregar-procedimiento.component';
import { DetalleProcedimientoComponent } from './administrar-procedimientos/detalle-procedimiento/detalle-procedimiento.component';
import { AgregarProcedimientoAdjudicacionComponent } from './administrar-procedimientos/agregar-procedimiento-adjudicacion/agregar-procedimiento-adjudicacion.component';
import { AdministrarAdjudicacionComponent } from './administrar-procedimientos/administrar-adjudicacion/administrar-adjudicacion.component';
import { ParticipanteComponent } from './administrar-procedimientos/participante/participante.component';
import { EvaluacionPropuestaFalloComponent } from './administrar-procedimientos/evaluacion-propuesta-fallo/evaluacion-propuesta-fallo.component';
import { AdministrarComponent } from './administrar-procedimientos/administrar/administrar.component';
import { AnexosProcedimientosComponent } from './administrar-procedimientos/anexos-procedimientos/anexos-procedimientos.component';
import { DiferendoAperturaComponent } from './administrar-procedimientos/diferendo-apertura/diferendo-apertura.component';
import { DetalleProcedimientoAdjudicacionComponent } from './administrar-procedimientos/detalle-procedimiento-adjudicacion/detalle-procedimiento-adjudicacion.component';
import { CambiarEstatusComponent } from './administrar-procedimientos/cambiar-estatus/cambiar-estatus.component';
import { CampoObligatorioComponent } from '../components/campo-obligatorio/campo-obligatorio.component';
import { AnunciosTableroComponent } from './anuncios-tablero/anuncios-tablero.component';
import { ContratosComponent } from './administrar-procedimientos/contratos/contratos.component';
import { AgregarContratoComponent } from './administrar-procedimientos/agregar-contrato/agregar-contrato.component';
import { EncabezadoProcedimientoComponent } from './administrar-procedimientos/encabezado-procedimiento/encabezado-procedimiento.component';
import { PresentarPropuestaComponent } from './anuncios-tablero/presentar-propuesta/presentar-propuesta.component';
import { PaseCajaComponent } from './anuncios-tablero/pase-caja/pase-caja.component';
import { ProveedoresModule } from '../proveedores/proveedores.module';

import {
  PartidasPresupuestalesComponent
} from "../convocantes/administrar-procedimientos/partidas-presupuestales/partidas-presupuestales.component";
import {
  RespuestasProcedimientoComponent
} from "./administrar-procedimientos/junta-aclaraciones/respuestas-procedimiento/respuestas-procedimiento.component";
import {
  PreguntasProcedimientoComponent
} from "./administrar-procedimientos/junta-aclaraciones/preguntas-procedimiento/preguntas-procedimiento.component";
import {NombreArchivoPipe} from "../pipes/nombre-archivo.pipe";
import {FechaPipe} from "../pipes/fecha.pipe";
import { FechaProcedimientoPipe } from '../pipes/fechaDetalleProcedimiento.pipe';


@NgModule({
  declarations: [
    AdministrarComponent,
    AnexosProcedimientosComponent,
    DiferendoAperturaComponent,
    RecepcionAperturaProposicionesComponent,
    AgregarProcedimientoComponent,
    DetalleProcedimientoComponent,
    AgregarProcedimientoAdjudicacionComponent,
    AdministrarAdjudicacionComponent,
    ParticipanteComponent,
    EvaluacionPropuestaFalloComponent,
    DetalleProcedimientoAdjudicacionComponent,
    CambiarEstatusComponent,
    AnunciosTableroComponent,
    PresentarPropuestaComponent,
    PaseCajaComponent,
    ContratosComponent,
    AgregarContratoComponent,
    EncabezadoProcedimientoComponent,
    PartidasPresupuestalesComponent,
    RespuestasProcedimientoComponent,
    PreguntasProcedimientoComponent,
    NombreArchivoPipe,
    FechaPipe,
    FechaProcedimientoPipe
  ],
    imports: [
        CommonModule,
        AdminModule,
        NgbModule,
        ConvocantesRoutingModule,
        FormsModule,
        NgbTooltipModule,
        ReactiveFormsModule,
        CampoObligatorioComponent,
        ProveedoresModule
    ],
  exports: [
    EncabezadoProcedimientoComponent
  ],
  providers: [
    DatePipe
  ]
})
export class ConvocantesModule { }
