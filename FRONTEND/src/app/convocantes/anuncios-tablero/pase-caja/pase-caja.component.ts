import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IDetalleParticipanteProcedimiento, IPaseCaja } from 'src/app/interfaces/proveedores/ITableroProveedores';
import { TableroProveedoresService } from 'src/app/services/tableroProveedores.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-pase-caja',
  templateUrl: './pase-caja.component.html',
  styleUrls: ['./pase-caja.component.css']
})
export class PaseCajaComponent implements OnInit {
  @Output() public _cancelarPaseCaja = new EventEmitter();
  @Input() public _procedimientoElegido: any;
  _detallePaseCaja: any;
  loader: boolean;

  constructor(private _participante: TableroProveedoresService) {
    this.loader = true;
   }

  ngOnInit() {
    this.cargarInfoProveedor();
  }

  cargarInfoProveedor(){
    const params:IDetalleParticipanteProcedimiento =
    {
      id_proveedor: Number(localStorage.getItem('id_p')),
      id_procedimiento_administrativo: this._procedimientoElegido.id_procedimiento_administrativo
    }
    this._participante.getDetalleParticipantePaseCaja(params).subscribe({
      next: (data) => {
        this._detallePaseCaja = data.datos;
      },
      error: (err) => {
        Swal.fire(err.error.mensaje,'','error');
      },
      complete: () =>{
        this.loader = false;
      }
    })

  }

  obtenerCuotaInscripcion()
  {
    if (this._procedimientoElegido.id_tipo_unidad_responsable === 3 || this._procedimientoElegido.id_tipo_unidad_responsable === 4 )
    {
      return this._procedimientoElegido.costo_inscripcion_aut;
    }else{
      return this._procedimientoElegido.costo_inscripcion;
    }
  }

  generar_pase(){
    const params:IPaseCaja =
    {
      id_participante_procedimiento:  this._detallePaseCaja.id_participante_procedimiento,
      id_procedimiento_administrativo: this._detallePaseCaja.id_procedimiento_administrativo,
      rfc_proveedor: this._detallePaseCaja.rfc_proveedor,
      nombre: this._detallePaseCaja.razon_social ? this._detallePaseCaja.razon_social : this._detallePaseCaja.nombre_proveedor + ' ' + this._detallePaseCaja.primer_apellido_proveedor + ' ' + this._detallePaseCaja.segundo_apellido_proveedor,
      correo_electronico: this._detallePaseCaja.correo_electronico,
      costo_inscripcion: this.obtenerCuotaInscripcion(),
      direccion: this._detallePaseCaja.nombre_vialidad,
      numero_procedimiento: this._procedimientoElegido.numero_procedimiento,
      fecha_vencimiento: this._procedimientoElegido.fecha_limite_inscripcion_nueva ? this._procedimientoElegido.fecha_limite_inscripcion_nueva.split(' ')[0] : this._procedimientoElegido.fecha_limite_inscripcion.split(' ')[0],
      pase_caja : true,
    }
    this._participante.generarPaseCaja(params).subscribe({
      next: (data) => {
        let base64 = data.datos.base64;
        this.descargarArchivo(base64?.base64, data.datos.folio, 'pdf')
        Swal.fire("Pase a caja generado", "", 'success');
        this.cargarInfoProveedor();
      },
      error: (err) => {
        Swal.fire(err.error.mensaje,'','error');
      },
      complete: () =>{
        this.loader = false;
        this.cargarInfoProveedor();
      }
    })
  }

  consultar_pase()
  {
    const params: any = {
      idPaseCaja: this._detallePaseCaja.folio_pase_caja
    }

    this._participante.obtenerPaseCaja(params).subscribe({
      next: (data) => {
        let base64 = data.datos.base64;
        if (base64 != '' && data.datos.ID_MENSAJE == '000'){
          this.descargarArchivo(base64, this._detallePaseCaja.folio_pase_caja, 'pdf');
        }else{
          Swal.fire(data.datos.descripcion,'','error');
        }
      }
    })
  }

  descargarArchivo(base64String: any, fileName: any, extensionArchivo?: string) {
    const source = `data:application/pdf;base64,${base64String}`;
    const link = document.createElement("a");
    link.href = source;
    link.download = `${fileName}.${extensionArchivo}`;
    link.click();
  }

  consultar_recibo()
  {
    const params: any = {
      idPaseCaja: this._detallePaseCaja.folio_pase_caja,
      id_participante_procedimiento:  this._detallePaseCaja.id_participante_procedimiento
    }

    this._participante.consultarRecibo(params).subscribe({
      next: (data) => {
        let base64 = data.datos.base64;
        if (base64 !== '' && base64 !== undefined){
          this.descargarArchivo(base64, this._detallePaseCaja.folio_pase_caja, 'pdf');
          this.cargarInfoProveedor();
        }
        if(base64 == undefined || base64 == ''){
          Swal.fire('El pase a caja no ha sido pagado','','error');
          this.cargarInfoProveedor();
        }
      }
    })
  }

  cancelarPaseCaja() {
    this._cancelarPaseCaja.emit();
  }

}
