import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {AppSettingsService} from "../../app-settings.service";
import {HttpClient, HttpParams} from "@angular/common/http";
import {Router} from "@angular/router";
import {IUsuario} from "../../interfaces/comun/IUsuario";
import {CriptoService} from "../../admin/services/Cripto.service";
import {IUsuarioRestablecerPass} from "../../interfaces/comun/IUsuarioRestablecerPass";
import {IUsuarioNuevoPass} from "../../interfaces/comun/IUsuarioNuevoPass";
import {IUsuarioValidarCodigoPass} from "../../interfaces/comun/IUsuarioValidarCodigoPass";
import { ConvocantesService } from 'src/app/services/convocantes.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private isLoggedInSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(
    private _app: AppSettingsService,
    private _http: HttpClient,
    private _router: Router,
    private _cripto: CriptoService,
    private _convocantesService: ConvocantesService
  ) {
    // Recuperar el estado de inicio de sesión desde localStorage
    const initialLoggedInState = localStorage.getItem('isLoggedIn') === 'true';

    setTimeout(()=>{                           // <<<---using ()=> syntax
      if (this.isLoggedInSubject && this.isTokenExpired()) {
        this.logout();
      }
    }, 3000);

    this.isLoggedInSubject = new BehaviorSubject<boolean>(initialLoggedInState);
  }

  // Método para iniciar sesión
  login(params: IUsuario, rememberMe: boolean): Observable<any> {
    return new Observable<any>(observer => {
      this._http.post(
        `${this._app.API_ENDPOINT}/api/auth/login`,
        params,
        {headers: this._app.getHeaders()}
      ).subscribe({
        next: (data:any) => {

          this.isLoggedInSubject.next(true); // Cambia el estado a "logueado"
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('tk_str', data.datos.access_token);
          localStorage.setItem('functions', this._cripto.encrypt(data.datos.functions));
          localStorage.setItem('roles', this._cripto.encrypt(data.datos.roles));
          localStorage.setItem('me', data.datos.me);
          localStorage.setItem('id_p', data.datos.proveedor.id_p);
          localStorage.setItem('sts_p', data.datos.proveedor.sts_p);
          localStorage.setItem('rp_', this._cripto.encrypt(data.datos.proveedor.rp));
          localStorage.setItem('id_usuario', data.datos.id);
          localStorage.setItem('unidades_compradoras', this._cripto.encrypt(data.datos.unidades_compradoras));
          localStorage.setItem('unidades_responsables', this._cripto.encrypt(data.datos.unidades_responsables));

          if (rememberMe) {
            localStorage.setItem('usuarioRemember', params.usuario);
            localStorage.setItem('usuarioPRemember', params.password);
          } else {
            localStorage.removeItem('usuarioRemember');
            localStorage.removeItem('usuarioPRemember');
          }

          observer.next(data);
          observer.complete();


          this._convocantesService.buscarAdExtemporaneasUsuario().subscribe({
            next: (data) => {
                localStorage.setItem('extemporaneas', this._cripto.encrypt(data.datos));
            },
            error: (err) => {
                console.info(err)

            },
            complete: () => {

            }
          });
        },
        error: error => {
          console.error(error);
          observer.error(error)
          observer.complete();
        }
      });
    });

  }

  passwordReset(params: IUsuarioRestablecerPass): Observable<any> {
    return new Observable<any>(observer => {

      let queryParams = new HttpParams();
      queryParams = queryParams.append("correo",params.correo);
      queryParams = queryParams.append("usuario",params.usuario);

      this._http.get(
        `${this._app.API_ENDPOINT}/api/auth/passwordReset`,
        {headers: this._app.getHeaders(), params:queryParams}
      ).subscribe({
        next: (data:any) => {
          observer.next(data);
          observer.complete();
        },
        error: error => {
          console.error(error);
          observer.error(error)
          observer.complete();
        }
      });
    });

  }

  validarRecuperarPass(params: IUsuarioValidarCodigoPass): Observable<any> {
    return new Observable<any>(observer => {

      this._http.post(
        `${this._app.API_ENDPOINT}/api/auth/validarCodigoPass`,
        params,
        {headers: this._app.getHeaders()}
      ).subscribe({
        next: (data:any) => {
          observer.next(data);
          observer.complete();
        },
        error: error => {
          console.error(error);
          observer.error(error)
          observer.complete();
        }
      });
    });

  }

  udpatePassword(params: IUsuarioNuevoPass): Observable<any> {
    return new Observable<any>(observer => {

      this._http.post(
        `${this._app.API_ENDPOINT}/api/auth/udpatePassword`,
        params,
        {headers: this._app.getHeaders()}
      ).subscribe({
        next: (data:any) => {
          observer.next(data);
          observer.complete();
        },
        error: error => {
          console.error(error);
          observer.error(error)
          observer.complete();
        }
      });
    });

  }

  // Método para cerrar sesión
  logout() {
    this.isLoggedInSubject.next(false); // Cambia el estado a "no logueado"

    const remember:string|null = this.rememberMe;
    const rememberP:string|null = this.rememberPMe;

    localStorage.clear();

    if (remember && rememberP) {
      localStorage.setItem('usuarioRemember', remember);
      localStorage.setItem('usuarioPRemember', rememberP);
    }

    setTimeout(() => {
      this._router.navigate(['/inicio/portal-licitaciones']);
    }, 1000);
    return true;
  }

  // Método para verificar el estado de inicio de sesión
  isLoggedIn(): Observable<boolean> {
    return this.isLoggedInSubject.asObservable();
  }

  get token(): string | null {
    return localStorage.getItem('tk_str');
  }

  get rememberMe(): string|null {
    return localStorage.getItem('usuarioRemember');
  }

  get rememberPMe(): string|null {
    return localStorage.getItem('usuarioPRemember');
  }

  get functionsSys(): string|null {
    return this._cripto.decrypt(localStorage.getItem('functions'));
  }

  get rolSys(): string|null {
    return this._cripto.decrypt(localStorage.getItem('roles'));
  }

  get unidadCompradora(): string|null {
    return this._cripto.decrypt(localStorage.getItem('unidades_compradoras'));
  }

  get unidadResponsable(): string|null {
    return this._cripto.decrypt(localStorage.getItem('unidades_responsables'));
  }

  get rfcProveedor(): string|null {
    return this._cripto.decrypt(localStorage.getItem('rp_'));
  }

  public canActivateFunction(funtionSys: string) {

    if (this.isLoggedInSubject && this.isTokenExpired()) {
      this.logout();
    }

    if (this.functionsSys !== null) {
      for (let item of this.functionsSys) {
        if (item === funtionSys) {
          return true;
        }
      }
    }
    return false;
  }

  public canActivateRole(rolSys: string) {

    if (this.isLoggedInSubject && this.isTokenExpired()) {
      this.logout();
    }

    if (this.rolSys !== null) {
      for (let item of this.rolSys) {
        if (item === rolSys) {
          return true;
        }
      }
    }
    return false;
  }

  private isTokenExpired() {
    const token = this.token;
    if (token ==null) {
      return false;
    }
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
        atob(base64)
            .split("")
            .map(function (c) {
              return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join("")
    );

    const { exp } = JSON.parse(jsonPayload);
    const expired = Date.now() >= exp * 1000
    return expired
  }


  public getTieneExtemporaneas() {

    if(this._cripto.decrypt(localStorage.getItem('extemporaneas')).length > 0){
      return true;
    }else{
      return false;
    }


  }

  public getExtemporaneas() {

    return this._cripto.decrypt(localStorage.getItem('extemporaneas'));


  }


}
