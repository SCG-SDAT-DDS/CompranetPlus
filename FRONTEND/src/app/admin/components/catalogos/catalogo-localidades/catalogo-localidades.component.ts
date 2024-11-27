import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/components/login/auth.service';
import { IEstado, IEstadoId } from 'src/app/interfaces/catalogos/ICatalogoEstado';
import { ICatalogoBusquedaLocalidad, ICatalogoLocalidad } from 'src/app/interfaces/catalogos/ICatalogoLocalidad';
import { IMunicipio } from 'src/app/interfaces/catalogos/ICatalogoMunicipio';
import { CatalogoEstadosService } from 'src/app/services/catalogoEstados.service';
import { CatalogoLocalidadesService } from 'src/app/services/catalogoLocalidades.service';
import { CatalogoMunicipiosService } from 'src/app/services/catalogoMunicipios.service';
import swal from 'sweetalert2';


@Component({
  selector: 'app-catalogo-localidades',
  templateUrl: './catalogo-localidades.component.html',
  styleUrls: ['./catalogo-localidades.component.css']
})
export class CatalogoLocalidadesComponent implements OnInit {

  formBusqueda: FormGroup;
  loaderBusqueda: boolean = false;

  lstTabla: ICatalogoLocalidad[] | null = null;

  data: ICatalogoLocalidad[] | null = null;
  page = 1;
	pageSize = 0;
  collectionSize = 0;
  lstEstados: IEstado[] | null = null;
  lstMunicipios: IMunicipio[] | null = null;
  loader = false;

  constructor(
    private _authService: AuthService,
    private _catalogoEstadosService: CatalogoEstadosService,
    private _catalogoMunicipiosService: CatalogoMunicipiosService,
    private _catalogoLocalidadesService: CatalogoLocalidadesService,
    ) { 

      this.formBusqueda = this.iniciarFormularioBusqueda();

    }

  ngOnInit() {
    this.obtenerEstados();
    this.obtenerMunicipios(null);
    this.buscarSubmit();

    this.formBusqueda.get('idEstado')?.valueChanges.subscribe(selectedValue => {
    
      this.obtenerMunicipios(selectedValue);
      
    });

  }

  iniciarFormularioBusqueda() {
    return new FormGroup({
        nombreLocalidad: new FormControl(null, [
            Validators.minLength(3)
        ]),
        idMunicipio: new FormControl(null, []),
        idEstado: new FormControl(null, [])
    });
  }
  
  buscarSubmit(getByInput?: boolean){

    this.loaderBusqueda = true;
    if (this.formBusqueda?.invalid) {
      for (const control of Object.keys(this.formBusqueda.controls)) {
          this.formBusqueda.controls[control].markAsTouched();
          console.info(this.formBusqueda.controls[control].errors);
      }
      return;
    }
    const datosBusqueda: ICatalogoBusquedaLocalidad = this.formBusqueda?.value as ICatalogoBusquedaLocalidad;
    
    datosBusqueda.page = this.page;

    if (getByInput) datosBusqueda.pageSize = this.pageSize;
    this.getLocalidades(datosBusqueda);
  }

  getLocalidades(datosBusqueda: ICatalogoBusquedaLocalidad){
    this.loader = true;
    this._catalogoLocalidadesService.getLocalidades(datosBusqueda).subscribe({
      next: (res) => {
        
        const data = res.datos
        this.lstTabla = data.datos;
        this.pageSize =data.per_page;
        this.collectionSize = data.total;

      },
      error: (err) => {
          console.info(err)
          swal.fire(err.error.mensaje, "", 'error');
      },
      complete: () => {
          this.loaderBusqueda = false;
          this.loader = false;
      }
    });

  }

  obtenerEstados(){
    this._catalogoEstadosService.getListEstados().subscribe({
      next: (data) => {
        
        this.lstEstados = data.datos;          
      },
      error: (err) => {
          console.info(err)
          swal.fire(err.error.mensaje, "", 'error');
      },
      complete: () => {
          this.loaderBusqueda = false;
      }
    });

  }

  obtenerMunicipios(idEstado: number | null){
    const  param: IEstadoId = {
      id: idEstado,
    };
    this._catalogoMunicipiosService.getMunicipiosIdEstado(param).subscribe({
      next: (data) => {
        
        this.lstMunicipios = data.datos;
          
      },
      error: (err) => {
          console.info(err)
          swal.fire(err.error.mensaje, "", 'error');
      },
      complete: () => {
          this.loaderBusqueda = false;
      }
    });

  }

  filtrar(){
    this.page = 1;
    this.buscarSubmit();
  }
  
  reset(){
    this.formBusqueda.reset();
    this.page = 1;
    this.buscarSubmit();
  }

  canActivate(permiso:string): boolean {
    return this._authService.canActivateFunction(permiso);
  }

  

}
