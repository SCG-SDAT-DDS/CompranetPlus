import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AuthService } from 'src/app/components/login/auth.service';
import { IContrato } from 'src/app/interfaces/convocantes/IContrato';
import { IProcedimientoAdministrativo } from 'src/app/interfaces/convocantes/IProcedimientoAdministrativo';
import { ConvocantesService } from 'src/app/services/convocantes.service';
import swal from 'sweetalert2';

@Component({
  selector: 'app-contratos',
  templateUrl: './contratos.component.html',
  styleUrls: ['./contratos.component.css']
})
export class ContratosComponent implements OnInit{

  @Input() public _procedimientoElegido: IProcedimientoAdministrativo | null = null;
  @Output() public _cancelarContratosProcedimiento = new EventEmitter();

  loaderBusqueda= false;
  
  datosContratosProcedimientoAdministrativo: IContrato [] = [];
  
  public blnActivarAgregarContrato: boolean;

  constructor(
    private _convocantesService: ConvocantesService,
    private _authService: AuthService
  ) {

    this.blnActivarAgregarContrato = false;
      
  }

  ngOnInit() {
    
    this.blnActivarAgregarContrato = false;
    this.obtenerContratosProcedimientoAdministrativo();

        
  }


  
  obtenerContratosProcedimientoAdministrativo(){

    this.loaderBusqueda= true;    
    this._convocantesService.obtenerContratosProcedimientoAdministrativo(this._procedimientoElegido?.id_procedimiento_administrativo).subscribe({
        next: (data) => {
            this.datosContratosProcedimientoAdministrativo = data.datos.contratos;

        },
        error: (err) => {
            console.info(err)
            swal.fire(err.error.mensaje, "", 'error');
            this.loaderBusqueda= false;
        },
        complete: () => {
          this.loaderBusqueda= false;
        }
    });

  }


  canActivate(permiso:string): boolean {
    return this._authService.canActivateFunction(permiso);
  }

  cancelarContratosProcedimiento() {
    this._cancelarContratosProcedimiento.emit();
    
  }

  agregarContrato(){

   
    this.blnActivarAgregarContrato = true;
    
  }


  public cancelarAgregarContrato() {
    this.blnActivarAgregarContrato = false;
    this.obtenerContratosProcedimientoAdministrativo();
  }


  descargarPdf(base64String: any, fileName: any) {
    const source = `data:application/pdf;base64,${base64String}`;
    const link = document.createElement("a");
    link.href = source;
    link.download = `${fileName}.pdf`
    link.click();
  }
  
  onClickDescargarPdf(url: any, nombre: any){
    
    this._convocantesService.obtenerArchivoBase64(url, false).subscribe({
      next: (data) => {
        let base64String = data.datos;
        this.descargarPdf(base64String, nombre);
      },
      error: (err) => {
          console.info(err)
          swal.fire(err.error.mensaje, "", 'error');
          
      },
      complete: () => {
          
      }
    });
    

    
  }

}
