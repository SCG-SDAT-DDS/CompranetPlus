import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AppSettingsService } from 'src/app/app-settings.service';
import { ISociosProveedor } from 'src/app/interfaces/proveedores/ISociosProveedor';

@Injectable({providedIn: 'root'})
export class SociosService {

  private _socios: ISociosProveedor[] = [
    {id_proveedor_socio: 1, nombre_socio: 'Romina' ,
     id_proveedor: 6,
     primer_apellido_socio: 'Hernández',
     segundo_apellido_socio: 'Hernádez' ,
     rfc_socio: 'HTRA078892G1',
     curp_socio: 'HTRA078890MTLDZDA2',
     domicilio: ' Plz Luis N Morones Edi U Dep 8 U Hab "El llanito" Sta Ana , Chiautempan, Tlax, 90804',
     vigente: true,
     fecha_ultima_mod: null}
  ]
  private _sociosSubject = new BehaviorSubject<ISociosProveedor[]>([]);

  constructor(private _http:HttpClient,
    private _app:AppSettingsService) {
    this._sociosSubject = new BehaviorSubject<ISociosProveedor[]>([]);
      this._sociosSubject.next(this._socios);
  }

  obtenerSociosProveedor(id_proveedor: number): Observable<any> {
    let params = {id_proveedor};

    return this._http.post(
      `${this._app.API_ENDPOINT}/api/admin-proveedores/obtenerSociosProveedor `,
      params,
      {headers: this._app.getHeadersToken()}
    );
  }

  guardarSocio(params: ISociosProveedor[]): Observable<any> {
    return this._http.post(
      `${this._app.API_ENDPOINT}/api/proveedores/guardarSocioProveedor`,
      params,
      { headers: this._app.getHeaders() }
    );
  }
   // Método para agregar un nuevo socio a la lista de socios
   agregarSocio(datosSocio: ISociosProveedor) {
    this._socios.push(datosSocio);
    this._sociosSubject.next(this._socios);
  }

  get socios() {
    return this._sociosSubject.asObservable();
  }

  eliminarSocio(socioDelete: ISociosProveedor) {
    // Eliminar definitivamente al socio del arreglo
    this._socios = this._socios.filter((socio) => socio.id_proveedor_socio !== socioDelete.id_proveedor_socio);

    // Emitir la lista de socios actualizada
    this._sociosSubject.next(this._socios);
  }

  // Método para agregar o actualizar un socio
  editarSocio(datosSocio: ISociosProveedor): void {
    const index = this._socios.findIndex((u) => u.id_proveedor_socio === datosSocio.id_proveedor_socio);

    if (index !== -1) {
      // Si el socio ya existe, actualiza la información
      this._socios[index] = datosSocio;
    } else {
      // Si el socio no existe, agrégalo a la lista
      this._socios.push(datosSocio);
    }
  }

}
