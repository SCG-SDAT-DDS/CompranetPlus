import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProveedoresRoutingModule } from './proveedores-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { RegistroProveedoresComponent } from './registro-proveedores/registro-proveedores.component';
import { NgbDatepickerModule, NgbModule, NgbPaginationModule, NgbDatepickerI18n } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DetalleLicitacionComponent } from './procedimientos-vigentes-vista-publica/detalle-licitacion/detalle-licitacion.component';
import { InscripcionComponent } from './procedimientos-vigentes-vista-publica/inscripcion/inscripcion.component';
import { CampoObligatorioComponent } from "../components/campo-obligatorio/campo-obligatorio.component";
import { ProcedimientosVigentesVistaPublicaComponent } from './procedimientos-vigentes-vista-publica/procedimientos-vigentes-vista-publica.component';
import { HeaderPublicoComponent } from '../components/header-publico/header-publico.component';
import { FooterComponent } from '../components/footer/footer.component';
import { BotonTopComponent } from '../components/boton-top/boton-top.component';
import { EFirmaComponent } from '../components/e-firma/e-firma.component';
import { FormPersonaFisicaComponent } from './registro-proveedores/form-persona-fisica/form-persona-fisica.component';
import { FormPersonaMoralComponent } from './registro-proveedores/form-persona-moral/form-persona-moral.component';
import { CaptchaComponent } from '../components/captcha/captcha.component';
import { LoginComponent } from '../components/login/login.component';


import { NgbDatepickerI18nSpanish } from '../enums/datepicker-es';
import { FechaPipe } from '../pipes/fechaDetalle.pipe';

@NgModule({
  declarations: [
    ProcedimientosVigentesVistaPublicaComponent,
    RegistroProveedoresComponent,
    DetalleLicitacionComponent,
    InscripcionComponent,
    EFirmaComponent,
    FormPersonaFisicaComponent,
    FormPersonaMoralComponent,
    FechaPipe
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    ProveedoresRoutingModule,
    FormsModule,
    NgbPaginationModule,
    ReactiveFormsModule,
    CampoObligatorioComponent,
    HeaderPublicoComponent,
    FooterComponent,
    NgbDatepickerModule,
    NgbModule,
    BotonTopComponent,
    CaptchaComponent,
    LoginComponent
  ],
  exports: [
    FormPersonaFisicaComponent,
    FormPersonaMoralComponent,
    EFirmaComponent
  ],
  providers: [
    {
      provide: NgbDatepickerI18n,
      useClass: NgbDatepickerI18nSpanish,
    },
  ],
})
export class ProveedoresModule { }
