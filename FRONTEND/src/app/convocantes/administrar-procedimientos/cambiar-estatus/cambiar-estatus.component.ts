import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/components/login/auth.service';
import { IDetalleProcedimiento } from 'src/app/interfaces/convocantes/IDetalleProcedimiento';
import { IEstatusProcedimiento } from 'src/app/interfaces/convocantes/IEstatusProcedimiento';
import { IProcedimientoAdministrativo } from 'src/app/interfaces/convocantes/IProcedimientoAdministrativo';
import { ConvocantesService } from 'src/app/services/convocantes.service';
import swal from 'sweetalert2';



@Component({
  selector: 'app-cambiar-estatus',
  templateUrl: './cambiar-estatus.component.html',
  styleUrls: ['./cambiar-estatus.component.css']
})
export class CambiarEstatusComponent implements OnInit{

  @Input() public _id_procedimiento_administrativo: number | undefined | null = null;
  @Input() public _datosProcedimientoAdministrativo: IDetalleProcedimiento | null = null;
  @Output() public _cancelarEstatusProcedimiento = new EventEmitter();


  formRegistro: FormGroup;

  lstTablaEstatusProcedimientos: IEstatusProcedimiento[] | null = null;

  loaderBusqueda: boolean = false;

  constructor(
    private fb: FormBuilder,
    private _convocantesService: ConvocantesService,
    private _authService: AuthService
  ) {

    this.formRegistro = this.iniciarFormularioRegistro();
      
  }
  
  
  ngOnInit() {
    
    this.llenarCatalogos();
    
        
  }


  llenarCatalogos(){

    this.loaderBusqueda= true;
    this._convocantesService.obtenerEstatusProcedimientos(this._datosProcedimientoAdministrativo?.procedimiento.id_estatus_procedimiento).subscribe({
      next: (data) => {
          this.lstTablaEstatusProcedimientos = data.datos;
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

  iniciarFormularioRegistro(data: IProcedimientoAdministrativo | null = null) {
    const formTmp: FormGroup | null = new FormGroup({
      id_procedimiento_administrativo: new FormControl(null, {
            nonNullable: true,
            validators: [],
        }),
        id_estatus_procedimiento: new FormControl('', [
            Validators.required
        ])
       
    });

    return formTmp;
  }


  cancelarEstatusProcedimiento() {
    this._cancelarEstatusProcedimiento.emit();
    
  }


  guardarSubmit() {

  

    this.formRegistro.patchValue({id_procedimiento_administrativo: this._id_procedimiento_administrativo});
  
    const datosGuardar: IProcedimientoAdministrativo = this.formRegistro?.value as IProcedimientoAdministrativo;


    this._convocantesService.guardarEstatusProcedimientoAdministrativo(datosGuardar).subscribe({
        next: (data) => {
            swal.fire(data.mensaje, "", 'success');
            this.cancelarEstatusProcedimiento();
        },
        error: (err) => {
            console.info(err)
            swal.fire(err.error.mensaje, "", 'error');
        },
        complete: () => {
            this.cancelarEstatusProcedimiento();
        }
    });
  }

}
