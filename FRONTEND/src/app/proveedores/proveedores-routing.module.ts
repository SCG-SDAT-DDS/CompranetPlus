import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegistroProveedoresComponent } from './registro-proveedores/registro-proveedores.component';
import { DetalleLicitacionComponent } from './procedimientos-vigentes-vista-publica/detalle-licitacion/detalle-licitacion.component';
import { InscripcionComponent } from './procedimientos-vigentes-vista-publica/inscripcion/inscripcion.component';
import { ProcedimientosVigentesVistaPublicaComponent } from './procedimientos-vigentes-vista-publica/procedimientos-vigentes-vista-publica.component';

const routes: Routes = [
  {
    path: 'portal-licitaciones',
    component: ProcedimientosVigentesVistaPublicaComponent
  },
  {
    path: 'portal-licitaciones/detalle',
    component: DetalleLicitacionComponent
  },
  {
    path: 'inscripcion',
    component: InscripcionComponent
  },
  
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProveedoresRoutingModule { }
