import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { CatalogoEstadosComponent } from './components/catalogos/catalogo-estados/catalogo-estados.component';
import { CatalogoMunicipiosComponent } from './components/catalogos/catalogo-municipios/catalogo-municipios.component';
import { CatalogoLocalidadesComponent } from './components/catalogos/catalogo-localidades/catalogo-localidades.component';
import { CatalogoUsuariosComponent } from './components/catalogos/catalogo-usuarios/catalogo-usuarios.component';
import { CatalogoDiasFestivosComponent } from './components/catalogos/catalogo-dias-festivos/catalogo-dias-festivos.component';
import { CatalogoCodigoPostalComponent } from './components/catalogos/catalogo-codigo-postal/catalogo-codigo-postal.component';
import { CatalogoConceptosComponent } from './components/catalogos/catalogo-conceptos/catalogo-conceptos.component';
import { CambiarPasswordComponent } from './components/cuenta/cambiar-password/cambiar-password.component';
import { CatalogoCostoParticipacionComponent } from './components/catalogos/catalogo-costo-participacion/catalogo-costo-participacion.component';
import {CatalogoFuncionesComponent} from "./components/catalogos/catalogo-funciones-sys/catalogo-funciones.component";
import { CatalogoUnidadCompradoraComponent } from './components/catalogos/catalogo-unidad-compradora/catalogo-unidad-compradora.component';
import {CatalogoRolesComponent} from "./components/catalogos/catalogo-roles-sys/catalogo-roles.component";
import { AdministrarProveedoresComponent } from './components/proveedores/administrar-proveedores/administrar-proveedores.component';
import { CatalogoUnidadResponsableComponent } from './components/catalogos/catalogo-unidad-responsable/catalogo-unidad-responsable.component';
import { CatalogoUcExtemporaneoComponent } from './components/catalogos/catalogo-uc-extemporaneo/catalogo-uc-extemporaneo.component';
import { CatalogoUrSupervisoresComponent } from './components/catalogos/catalogo-ur-supervisores/catalogo-ur-supervisores.component';
import { CatalogoUcUsuarioComponent } from './components/catalogos/catalogo-uc-usuario/catalogo-uc-usuario.component';
import { ConsultarBitacoraComponent } from './components/bitacora/consultar-bitacora/consultar-bitacora.component';


const routes: Routes = [
  {
    path: 'tablero', component: AdminComponent,
  },
  {
    path: 'estados', component: CatalogoEstadosComponent,
  },
  {
    path: 'municipios', component: CatalogoMunicipiosComponent,
  },
  {
    path: 'localidades', component: CatalogoLocalidadesComponent,
  },
  {
    path: 'codigo-postal', component: CatalogoCodigoPostalComponent,
  },
  {
    path: 'tipos-archivo', component: CatalogoConceptosComponent
  },
  {
    path: 'dias-festivos', component: CatalogoDiasFestivosComponent,
  },
  {
    path: 'usuarios', component: CatalogoUsuariosComponent,
  },
  {
    path: 'conceptos', component: CatalogoConceptosComponent
  },
  {
    path: 'configuracion-cuenta', component: CambiarPasswordComponent
  },
  {
    path: 'roles', component: CatalogoRolesComponent,
  },
  {
    path: 'costo-participacion', component: CatalogoCostoParticipacionComponent,
  },
  //rutas de unidades responsables y unidades compradroas
  {
    path: 'unidad-responsable', component: CatalogoUnidadResponsableComponent,
  },
  {
    path: 'unidad-responsable/supervisores/:id_unidad_responsable', component: CatalogoUrSupervisoresComponent,
  },
  {
    path: 'unidad-compradora', component: CatalogoUnidadCompradoraComponent,
  },
  {
    path: 'unidad-compradora/usuarios/:id_unidad_compradora', component: CatalogoUcUsuarioComponent
  },
  {
    path: 'unidad-compradora/usuarios/:id_unidad_compradora/:id_unidad_responsable', component: CatalogoUcUsuarioComponent
  },
  {
    path: 'unidad-compradora/:id_unidad_responsable', component: CatalogoUnidadCompradoraComponent
  },
  {
    path: 'unidad-compradora/ad-extemporanea/:id_unidad_compradora/:id_unidad_responsable', component: CatalogoUcExtemporaneoComponent
  },
  {
    path: 'unidad-compradora/ad-extemporanea/:id_unidad_compradora', component: CatalogoUcExtemporaneoComponent
  },
  {
    path: 'unidad-compradora/ad-extemporanea/:id_unidad_compradora/:id_unidad_responsable', component: CatalogoUcExtemporaneoComponent
  },
  //rutas proveedores
  {
    path: 'funciones', component: CatalogoFuncionesComponent,
  },
  {
    path: 'admin-proveedores', component: AdministrarProveedoresComponent,
  },
  // rutas bitacora
  {
    path: 'bitacora', component: ConsultarBitacoraComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
