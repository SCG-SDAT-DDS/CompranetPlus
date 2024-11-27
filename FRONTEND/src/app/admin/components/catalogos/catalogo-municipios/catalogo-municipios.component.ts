import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/components/login/auth.service';
import { IEstado } from 'src/app/interfaces/catalogos/ICatalogoEstado';
import { ICatalogoBusquedaMunicipio, ICatalogoMunicipio } from 'src/app/interfaces/catalogos/ICatalogoMunicipio';
import { CatalogoEstadosService } from 'src/app/services/catalogoEstados.service';
import { CatalogoMunicipiosService } from 'src/app/services/catalogoMunicipios.service';
import swal from 'sweetalert2';


@Component({
  selector: 'app-catalogo-municipios',
  templateUrl: './catalogo-municipios.component.html',
  styleUrls: ['./catalogo-municipios.component.css']
})
export class CatalogoMunicipiosComponent implements OnInit {

  formBusqueda: FormGroup;
  loaderBusqueda: boolean = false;
  lstTabla: ICatalogoMunicipio[] | null = null;

  data: ICatalogoMunicipio[] | null = null;
  page = 1;
	pageSize = 0;
  collectionSize = 0;
  lstEstados: IEstado[] | null = null;
  loader = false;
  constructor(
    private _authService: AuthService,
    private _catalogoMunicipiosService: CatalogoMunicipiosService,
    private _catalogoEstadosService: CatalogoEstadosService
    ) { 

      this.formBusqueda = this.iniciarFormularioBusqueda();

    }

  ngOnInit() {
    this.obtenerEstados();
    this.buscarSubmit();
  }

  iniciarFormularioBusqueda() {
    return new FormGroup({
        nombreMunicipio: new FormControl(null, [
            Validators.minLength(3)
        ]),
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
    const datosBusqueda: ICatalogoBusquedaMunicipio = this.formBusqueda?.value as ICatalogoBusquedaMunicipio;
  
    datosBusqueda.page = this.page;
    if (getByInput) datosBusqueda.pageSize = this.pageSize;
    
    this.getMunicipios(datosBusqueda);

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

  filtrar(){
    this.page = 1;
    this.buscarSubmit();
  }
  
  reset(){
    this.formBusqueda.reset();
    this.page = 1;
    this.buscarSubmit();
  }

  getMunicipios(datosBusqueda: ICatalogoBusquedaMunicipio){

    this.loader = true;
    this._catalogoMunicipiosService.getMunicipios(datosBusqueda).subscribe({
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

  getMunicipiosPage(page: number | null){
    const datosBusqueda: ICatalogoBusquedaMunicipio = this.formBusqueda?.value as ICatalogoBusquedaMunicipio;
    datosBusqueda.page = page;
    this.getMunicipios(datosBusqueda);
  }

  canActivate(permiso:string): boolean {
    return this._authService.canActivateFunction(permiso);
  }


}
