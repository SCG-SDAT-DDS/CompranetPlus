import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { LoginSesionComponent } from './components/login-sesion/login-sesion.component';

const routes: Routes = [
  {
    path: 'inicio',
    loadChildren: () => import('./proveedores/proveedores.module').then(m => m.ProveedoresModule)
  },
  {
    path: 'inicio-sesion',
    component: LoginComponent
  },
  {
    path: 'iniciar-sesion',
    component: LoginSesionComponent
  },
  {
    path: 'admin/panel',
    loadChildren: () => import('../app/convocantes/convocantes.module').then((m) => m.ConvocantesModule),
  },
  {
    path: 'admin/reportes',
    loadChildren: () => import('../app/reportes/reportes.module').then((m) => m.ReportesModule),
  },
  {
    path: 'admin',
    loadChildren: () => import('../app/admin/admin.module').then((m) => m.AdminModule),
  },
  {
    path: '',
    redirectTo: 'inicio/portal-licitaciones',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
