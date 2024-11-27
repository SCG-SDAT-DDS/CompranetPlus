import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';
import { NgbModule, NgbAccordionModule, NgbCollapseModule, NgbDropdownModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';

// COMPONENTES //
import { AdminComponent } from './admin.component';
import { HeaderAdminComponent } from '../components/header-admin/header-admin.component';
import { SideNavAdminComponent } from '../components/side-nav-admin/side-nav-admin.component';
import { CatalogoEstadosComponent } from './components/catalogos/catalogo-estados/catalogo-estados.component';
import { CatalogoMunicipiosComponent } from './components/catalogos/catalogo-municipios/catalogo-municipios.component';
import { CatalogoLocalidadesComponent } from './components/catalogos/catalogo-localidades/catalogo-localidades.component';
import { CatalogoUsuariosComponent } from './components/catalogos/catalogo-usuarios/catalogo-usuarios.component';
import { CatalogoDiasFestivosComponent } from './components/catalogos/catalogo-dias-festivos/catalogo-dias-festivos.component';
import { CatalogoCodigoPostalComponent } from './components/catalogos/catalogo-codigo-postal/catalogo-codigo-postal.component';
import { CatalogoConceptosComponent } from './components/catalogos/catalogo-conceptos/catalogo-conceptos.component';
import { CambiarPasswordComponent } from './components/cuenta/cambiar-password/cambiar-password.component';
import { CatalogoCostoParticipacionComponent } from './components/catalogos/catalogo-costo-participacion/catalogo-costo-participacion.component';
import { CatalogoUnidadCompradoraComponent } from './components/catalogos/catalogo-unidad-compradora/catalogo-unidad-compradora.component';
import { CatalogoUcExtemporaneoComponent } from './components/catalogos/catalogo-uc-extemporaneo/catalogo-uc-extemporaneo.component';
import { CatalogoUrSupervisoresComponent } from './components/catalogos/catalogo-ur-supervisores/catalogo-ur-supervisores.component';
import { CatalogoUnidadResponsableComponent } from './components/catalogos/catalogo-unidad-responsable/catalogo-unidad-responsable.component';
import { CatalogoUcUsuarioComponent } from './components/catalogos/catalogo-uc-usuario/catalogo-uc-usuario.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';



import { NotificacionesComponent } from '../components/notificaciones/notificaciones.component';
import { CrearReporteComponent } from '../reportes/generar-reportes/crear-reporte/crear-reporte.component';
import { ListaReportesComponent } from '../reportes/generar-reportes/lista-reportes/lista-reportes.component';
import {CatalogoFuncionesComponent} from "./components/catalogos/catalogo-funciones-sys/catalogo-funciones.component";
import {CampoObligatorioComponent} from "../components/campo-obligatorio/campo-obligatorio.component";
import { AdministrarProveedoresComponent } from './components/proveedores/administrar-proveedores/administrar-proveedores.component';
import {CatalogoRolesComponent} from "./components/catalogos/catalogo-roles-sys/catalogo-roles.component";
import { ProveedoresModule } from '../proveedores/proveedores.module';
import { ConsultarBitacoraComponent } from './components/bitacora/consultar-bitacora/consultar-bitacora.component';

@NgModule({
  declarations: [
    AdminComponent,
    HeaderAdminComponent,
    SideNavAdminComponent,
    CatalogoEstadosComponent,
    CatalogoMunicipiosComponent,
    CatalogoLocalidadesComponent,
    CatalogoUsuariosComponent,
    CatalogoDiasFestivosComponent,
    CatalogoConceptosComponent,
    CatalogoCodigoPostalComponent,
    CambiarPasswordComponent,
    CatalogoRolesComponent,
    CatalogoCostoParticipacionComponent,
    CatalogoUnidadCompradoraComponent,
    CatalogoUcExtemporaneoComponent,
    CatalogoUnidadResponsableComponent,
    CatalogoUrSupervisoresComponent,
    CatalogoFuncionesComponent,
    CatalogoUcUsuarioComponent,
    CrearReporteComponent,
    ListaReportesComponent,


    AdministrarProveedoresComponent,
    ConsultarBitacoraComponent,


  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    FormsModule,
    NgbDropdownModule,
    NgbCollapseModule,
    FormsModule,
    NgbPaginationModule,
    NgbAccordionModule,
    ReactiveFormsModule,
    NotificacionesComponent,
    NgbModule,
    CampoObligatorioComponent,
    ProveedoresModule
  ],
  exports: [
    AdminComponent,
    HeaderAdminComponent,
    SideNavAdminComponent,
  ],
})
export class AdminModule { }
