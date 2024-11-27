import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/components/login/auth.service';
import { ICatalogoBusquedaEstado, ICatalogoEstado } from 'src/app/interfaces/catalogos/ICatalogoEstado';
import { CatalogoEstadosService } from 'src/app/services/catalogoEstados.service';
import swal from 'sweetalert2';

@Component({
  selector: 'app-catalogo-estados',
  templateUrl: './catalogo-estados.component.html',
  styleUrls: ['./catalogo-estados.component.css']
})
export class CatalogoEstadosComponent implements OnInit {

  formBusqueda: FormGroup;
  loaderBusqueda: boolean = false;
  lstTabla: ICatalogoEstado[] | null = null;

  data: ICatalogoEstado[] | null = null;
  page = 1;
	pageSize = 10;
  collectionSize = 0;

  constructor(
    private _authService: AuthService,
    private _catalogoEstadosService: CatalogoEstadosService,
  ) { 
      
    this.formBusqueda = this.iniciarFormularioBusqueda();
  }

  ngOnInit() {
    this.buscarSubmit();
  }

  iniciarFormularioBusqueda() {
    return new FormGroup({
        nombreEstado: new FormControl(null, [
            Validators.minLength(3)
        ]),
        abrEstado: new FormControl(null, [
          Validators.minLength(2)
      ])
    });
  }

  buscarSubmit(){
    
    this.loaderBusqueda = true;
    if (this.formBusqueda?.invalid) {
      for (const control of Object.keys(this.formBusqueda.controls)) {
          this.formBusqueda.controls[control].markAsTouched();
          console.info(this.formBusqueda.controls[control].errors);
      }
      return;
    }
    const datosBusqueda: ICatalogoBusquedaEstado = this.formBusqueda?.value as ICatalogoBusquedaEstado;

    this._catalogoEstadosService.getEstados(datosBusqueda).subscribe({
      next: (data) => {
        
          this.lstTabla = data.datos;
          this.data =this.lstTabla;
          if( this.lstTabla !== null){
            this.collectionSize = this.lstTabla.length;
            this.paginacionEstados();
          } 
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
  
  /**
    Paginación de tabla estados
  */
  paginacionEstados() {
    if (this.lstTabla !== null)
		this.data = this.lstTabla.map((estado, i) => ({ estado: i + 1, ...estado })).slice(
			(this.page - 1) * this.pageSize,
			(this.page - 1) * this.pageSize + this.pageSize,
		);
	}
  onPageChange() {
    this.buscarSubmit();
  }
  
  reset(){
    this.formBusqueda.reset();
    this.page = 1;
    this.pageSize=10;
    this.buscarSubmit();
  }

  canActivate(permiso:string): boolean {
    return this._authService.canActivateFunction(permiso);
  }
  
}
