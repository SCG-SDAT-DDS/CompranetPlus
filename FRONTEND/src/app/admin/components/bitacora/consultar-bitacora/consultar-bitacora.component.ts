import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { AuthService } from 'src/app/components/login/auth.service';
import { IBitacora } from 'src/app/interfaces/bitacora/IBitacora';
import { IBusquedaBitacora } from 'src/app/interfaces/bitacora/IBusquedaBitacora';
import { ICatalogoRolesSistema } from 'src/app/interfaces/catalogos/ICatalogoRolesSistema';
import { ICatalogoRolesSistemaBusqueda } from 'src/app/interfaces/catalogos/ICatalogoRolesSistemaBusqueda';
import { ICatalogoUsuarios } from 'src/app/interfaces/catalogos/ICatalogoUsuarios';
import { ICatalogoUsuariosBuscar } from 'src/app/interfaces/catalogos/ICatalogoUsuariosBuscar';
import { BitacorasService } from 'src/app/services/bitacoras.service';
import { CatalogoRolesSistemaService } from 'src/app/services/catalogoRolesSistema.service';
import { CatalogoUsuariosService } from 'src/app/services/catalogoUsuarios.service';
import swal from 'sweetalert2';

@Component({
  selector: 'app-consultar-bitacora',
  templateUrl: './consultar-bitacora.component.html',
  styleUrls: ['./consultar-bitacora.component.css']
})
export class ConsultarBitacoraComponent implements OnInit{


  loaderBusqueda: boolean = false;
  loaderBusquedaRoles: boolean = false;

  formBusqueda: FormGroup;

  lstTablaBitacora: IBitacora[] | null = null;
  lstTablaRoles: ICatalogoRolesSistema[] | null = null;
  lstTablaUsuarios: ICatalogoUsuarios[] | null = null;

  constructor( private _authService: AuthService,
    private _catalogoRolesSistemaService: CatalogoRolesSistemaService,
    private _catalogoUsuariosService: CatalogoUsuariosService,
    private _bitacorasService: BitacorasService){

      this.formBusqueda = this.iniciarFormularioBusqueda();
      
  }

  ngOnInit() {
   
        
   this.llenarCatalogos();

    
  }

  llenarCatalogos() {
    
    this.loaderBusquedaRoles = true;
    const datosBusqueda: ICatalogoRolesSistemaBusqueda = {
        nombre: '',
        estatus: true,
        omitir: ''
    } as ICatalogoRolesSistemaBusqueda;
    this._catalogoRolesSistemaService.buscarRolesSis(datosBusqueda).subscribe({
        next: (data) => {
            this.lstTablaRoles = data.datos;
        },
        error: (err) => {
            console.info(err)
            swal.fire(err.error.mensaje, "", 'error');
            this.loaderBusquedaRoles = false;
        },
        complete: () => {
            this.loaderBusquedaRoles = false;
        }
    });




    const datosBusquedaUsuarios: ICatalogoUsuariosBuscar = this.formBusqueda?.value as ICatalogoUsuariosBuscar;
    datosBusquedaUsuarios.nombre = "";
    datosBusquedaUsuarios.aPaterno = "";
    datosBusquedaUsuarios.aMaterno = "";
    datosBusquedaUsuarios.idRol = 0;
    datosBusquedaUsuarios.estatus = true;
        this._catalogoUsuariosService.buscarUsuarios(datosBusquedaUsuarios).subscribe({
            next: (data) => {
                this.lstTablaUsuarios = data.datos;
            },
            error: (err) => {
                console.info(err)
                swal.fire(err.error.mensaje, "", 'error');
                this.loaderBusqueda = false;
            },
            complete: () => {
                this.loaderBusqueda = false;
            }
        });
}

  
  iniciarFormularioBusqueda() {
    return new FormGroup({
        fecha_accion_inicio: new FormControl(null, []),
        fecha_accion_fin: new FormControl(null, []),
        id_usuario: new FormControl(null, []),
        id_rol: new FormControl(null, []),
        nombre_usuario: new FormControl({value:'', disabled: true}, [])
    });

    
  }

  
  buscarBitacora(){

    this.loaderBusqueda = true;

    if (this.formBusqueda?.invalid) {
      for (const control of Object.keys(this.formBusqueda.controls)) {
          this.formBusqueda.controls[control].markAsTouched();
          console.info(this.formBusqueda.controls[control].errors);
      }
      return;
    }

    
    const datosBusqueda: IBusquedaBitacora = this.formBusqueda?.value as IBusquedaBitacora;

    
    this._bitacorasService.buscarBitacoras(datosBusqueda).subscribe({
        next: (data) => {
            this.lstTablaBitacora = data.datos;
        },
        error: (err) => {
            console.info(err)
            swal.fire(err.error.mensaje, "", 'error');
            this.loaderBusqueda = false;
        },
        complete: () => {
            this.loaderBusqueda = false;
        }
    });

    

  }


  canActivate(permiso:string): boolean {
    return this._authService.canActivateFunction(permiso);
  }


  actualizarNombreUsuario(){
    
    if(this.formBusqueda.value.id_usuario == null || this.formBusqueda.value.id_usuario == ""){
      this.formBusqueda.patchValue({nombre_usuario: ""});    
    }else{
      this.formBusqueda.patchValue({nombre_usuario: this.lstTablaUsuarios?.find((element) => element.id == this.formBusqueda.value.id_usuario)?.nombre +' '+this.lstTablaUsuarios?.find((element) => element.id == this.formBusqueda.value.id_usuario)?.aPaterno + ' '+ this.lstTablaUsuarios?.find((element) => element.id == this.formBusqueda.value.id_usuario)?.aMaterno});    
    }

  }

}
