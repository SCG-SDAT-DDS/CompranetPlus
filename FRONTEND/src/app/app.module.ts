import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule } from '@angular/common/http';
import { CaptchaComponent } from './components/captcha/captcha.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {CampoObligatorioComponent} from "./components/campo-obligatorio/campo-obligatorio.component";

@NgModule({
  declarations: [
    AppComponent,
  ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
        NgbModule,
        FormsModule,
        ReactiveFormsModule,
        CampoObligatorioComponent,
        CaptchaComponent
    ],
  exports: [
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
