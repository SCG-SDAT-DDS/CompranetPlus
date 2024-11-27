import {Router} from '@angular/router';
import {Component, Input} from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {IUsuario} from "../../interfaces/comun/IUsuario";
import swal from "sweetalert2";
import {IUsuarioRestablecerPass} from "../../interfaces/comun/IUsuarioRestablecerPass";
import {IUsuarioNuevoPass} from "../../interfaces/comun/IUsuarioNuevoPass";
import {IUsuarioValidarCodigoPass} from "../../interfaces/comun/IUsuarioValidarCodigoPass";
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CampoObligatorioComponent } from '../campo-obligatorio/campo-obligatorio.component';
import { CaptchaComponent } from '../captcha/captcha.component';
import { CommonModule } from '@angular/common';
import { AuthService } from '../login/auth.service';

@Component({
  selector: 'app-login-sesion',
  templateUrl: './login-sesion.component.html',
  styleUrls: ['./login-sesion.component.css'],
  standalone: true,
  imports: [NgbModule, FormsModule , ReactiveFormsModule, CampoObligatorioComponent, CaptchaComponent,CommonModule]
})
export class LoginSesionComponent {

  @Input() loginInscripcion: boolean = false;

  formLogin: FormGroup;
  formRecuperarPass: FormGroup;
  formCodigoPass: FormGroup;
  formRestablecerPass: FormGroup;
  loader = false;

  isButtonDisabled:boolean = true;

  mostrarLogin: boolean = true;
  mostrarFormulario: boolean = false;
  mostrarCodigoRecPass:boolean = false;
  mostrarLlenarNuevoPass:boolean = false;

  constructor(private _router: Router , private _authService: AuthService){
    this.formLogin = this.iniciarFormulario();
    this.formRecuperarPass = this.iniciarFormularioRecPass();
    this.formCodigoPass = this.iniciarFormularioCodigoPass();
    this.formRestablecerPass = this.iniciarFormularioRestablecerPass();

    if (this._authService.rememberMe != null) {
      this.formLogin.patchValue({
        usuario: this._authService.rememberMe,
        password: this._authService.rememberPMe,
        rememberMe: true
      });
    }
  }
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }

  get usuarioForm() {
      return this.formLogin.get('usuario')!;
  }

  get passwordForm() {
      return this.formLogin.get('password')!;
  }

  get usuarioFormResetPass() {
    return this.formRecuperarPass.get('usuario')!;
  }

  get correoFormResetPass() {
    return this.formRecuperarPass.get('correo')!;
  }

  get codigoFormRestablecerPass() {
    return this.formCodigoPass.get('codigo')!;
  }

  get nuevaContraFormRestablecerPass() {
    return this.formRestablecerPass.get('nuevaContrasena')!;
  }

  get nuevaContraRepFormRestablecerPass() {
    return this.formRestablecerPass.get('repetirNuevaContrasena')!;
  }



  iniciarFormulario() {
    return new FormGroup({
      usuario: new FormControl('', [
        Validators.required,
        Validators.minLength(3)
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(3)
      ]),
      rememberMe: new FormControl(false, []),
    });
  }

  iniciarFormularioRecPass() {
    return new FormGroup({
      usuario: new FormControl('', [
        Validators.required,
        Validators.minLength(3)
      ]),
      correo: new FormControl('', [
        Validators.required,
        Validators.email,
        Validators.minLength(5)
      ]),
      rememberMe: new FormControl(false, []),
    });
  }

  iniciarFormularioCodigoPass() {
    return new FormGroup({
      codigo: new FormControl('', [
        Validators.required
      ])
    });
  }

  iniciarFormularioRestablecerPass() {
    const validador = new FormGroup({
      nuevaContrasena: new FormControl('', [
        Validators.required,
        Validators.pattern('(?=\\D*\\d)(?=[^a-z]*[a-z])(?=[^A-Z]*[A-Z]).{8,30}'),
      ]),
      repetirNuevaContrasena: new FormControl('', [
        Validators.required,
        Validators.pattern('(?=\\D*\\d)(?=[^a-z]*[a-z])(?=[^A-Z]*[A-Z]).{8,30}'),
      ])
    });

    validador.setValidators(this.comparisonValidator(validador));

    return validador;
  }

  comparisonValidator(g: FormGroup) : any {
    console.info("'''''''''''''''''''''''''", g.get('nuevaContrasena')?.value)
    if (g.get('nuevaContrasena')?.value != g.get('repetirNuevaContrasena')?.value) {
      g.controls['repetirNuevaContrasena'].setErrors({ 'noMatch': true });
    }
  }

  login() {

    if (this.formLogin == undefined || this.formLogin.invalid) {
        console.info("------Form invalido", this.formLogin.errors, this.formLogin.controls)
      for (const control of Object.keys(this.formLogin.controls)) {
          this.formLogin.controls[control].markAsTouched();
          console.info(this.formLogin.controls[control].errors)
      }
      return;
    }

    localStorage.setItem('me', this.formLogin.get('usuario')?.value);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('roles', 'ADMINISTRADOR');
    this._router.navigate(['/inicio/portal-licitaciones']);

    setTimeout(() => {
      // Redireccionar a la ruta después de recargar
      window.location.reload();

    }, 300);

    /*this.loader = true;
    const usuario = this.formLogin.value as IUsuario;
    this._authService.login(usuario, this.formLogin.get('rememberMe')?.value).subscribe({
      next: (data) => {
        if(this.loginInscripcion){
          return;
        }
        this._router.navigate(['/admin/tablero']);
      },
      error: (err) => {
        console.info(err)
        swal.fire(err.error.mensaje, "", 'error');
        this.loader = false;
      },
      complete: () => {
        this.loader = false;
      }
    });*/
  }


  solicitarRecuperarPass() {
    this.formRecuperarPass = this.iniciarFormularioRecPass();
    this.formCodigoPass = this.iniciarFormularioCodigoPass();
    this.formRestablecerPass = this.iniciarFormularioRestablecerPass();
    this.mostrarLogin = false;
    this.mostrarFormulario = true;
    this.mostrarCodigoRecPass = false;
    this.mostrarLlenarNuevoPass = false;
  }

  solicitarRecuperarPassSubmit() {
    if (this.formRecuperarPass == undefined || this.formRecuperarPass.invalid) {
      console.info("------Form invalido", this.formRecuperarPass.errors, this.formRecuperarPass.controls)
      for (const control of Object.keys(this.formRecuperarPass.controls)) {
        this.formRecuperarPass.controls[control].markAsTouched();
        console.info(this.formRecuperarPass.controls[control].errors)
      }
      return;
    }

    this.loader = true;
    const usuarioRecPass = this.formRecuperarPass.value as IUsuarioRestablecerPass;
    this._authService.passwordReset(usuarioRecPass).subscribe({
      next: (data) => {
        this.mostrarFormulario = false;
        this.mostrarCodigoRecPass = true;
        swal.fire(data.mensaje, "", 'info');
      },
      error: (err) => {
        console.info(err)
        swal.fire(err.error.mensaje, "", 'error');
        this.loader = false;
      },
      complete: () => {
        this.loader = false;
      }
    });
  }

  validarRecuperarPassSubmit() {

    this.loader = true;
    const usuarioRecPass = this.formRecuperarPass.value as IUsuarioValidarCodigoPass;
    usuarioRecPass.codigo = this.codigoFormRestablecerPass.value;

    this._authService.validarRecuperarPass(usuarioRecPass).subscribe({
      next: () => {
        this.mostrarCodigoRecPass = false;
        this.mostrarLlenarNuevoPass = true;
      },
      error: (err) => {
        console.info(err)
        swal.fire(err.error.mensaje, "", 'error');
        this.loader = false;
      },
      complete: () => {
        this.loader = false;
      }
    });
  }

  cambiarPassSubmit() {

    if (this.nuevaContraFormRestablecerPass.value != this.nuevaContraRepFormRestablecerPass.value) {
      this.nuevaContraRepFormRestablecerPass.setErrors({ 'noMatch': true });
    }

    if (this.formRestablecerPass == undefined || this.formRestablecerPass.invalid) {
      console.info("------Form invalido", this.formRestablecerPass.errors, this.formRestablecerPass.controls)
      for (const control of Object.keys(this.formRestablecerPass.controls)) {
        this.formRestablecerPass.controls[control].markAsTouched();
        console.info(this.formRestablecerPass.controls[control].errors)
      }
      return;
    }

    this.loader = true;
    const usuarioNuevoPass = this.formRecuperarPass.value as IUsuarioNuevoPass;
    usuarioNuevoPass.nuevaContrasena = this.nuevaContraFormRestablecerPass.value;

    this._authService.udpatePassword(usuarioNuevoPass).subscribe({
      next: (data) => {
        this.cancelarCambiarPass();
        swal.fire(data.mensaje, "", 'info');
      },
      error: (err) => {
        console.info(err)
        swal.fire(err.error.mensaje, "", 'error');
        this.loader = false;
      },
      complete: () => {
        this.loader = false;
      }
    });
  }

  cancelarCambiarPass() {
    this.formRecuperarPass = this.iniciarFormularioRecPass();
    this.formCodigoPass = this.iniciarFormularioCodigoPass();
    this.formRestablecerPass = this.iniciarFormularioRestablecerPass();
    this.mostrarLogin = true;
    this.mostrarFormulario = false;
    this.mostrarCodigoRecPass = false;
    this.mostrarLlenarNuevoPass = false;
  }

  captchaResponse(response: boolean) {
    //se recibe la respuesta del captcha
    this.isButtonDisabled= response


  }

  registrarse(){
    this._router.navigate(['inicio/registro-proveedores']);
  }
}
