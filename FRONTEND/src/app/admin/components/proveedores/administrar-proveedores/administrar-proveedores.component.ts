import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/components/login/auth.service';
import { IProveedor, IProveedorBusqueda } from '../../../../interfaces/proveedores/IProveedores';
import { ProveedoresService } from 'src/app/proveedores/services/proveedores.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import swal from 'sweetalert2';

@Component({
  selector: 'app-administrar-proveedores',
  templateUrl: './administrar-proveedores.component.html',
  styleUrls: ['./administrar-proveedores.component.css']
})
export class AdministrarProveedoresComponent implements OnInit {
  page = 1;
  pageSize = 0;
  collectionSize= 0;

  proveedor: any;
  mostrandoMsj: string = '';
  blnEditar: boolean = false;
  loaderGuardar: boolean = false;
  loaderBusqueda: boolean = false;
  proveedores: any[] | null = null;
  formPersonaMoral: boolean = false;
  modalRef:NgbModalRef|undefined;

  formBusqueda: FormGroup;
  formEstatus: FormGroup;

  lstEstatus: any[] = [
    {id: 1, name: 'PRE REGISTRADO'},
    {id: 2, name: 'REGISTRADO'},
    {id: 3, name: 'VALIDADO'},
    {id: 4, name: 'SUSPENDIDO'}
  ];

  constructor(
    private _authService: AuthService, 
    private _serviceProveedores: ProveedoresService, 
    private modalService: NgbModal
  ) { 
    this.formBusqueda = this.iniciarFormularioBusqueda();
    this.formEstatus = this.iniciarFormEstatus();
  }

  ngOnInit(): void {
    this.obtenerProveedores();
  }

  iniciarFormularioBusqueda() {
    return new FormGroup({
      rfc: new FormControl(null, [
          Validators.minLength(3)
      ]),
      razon_social: new FormControl(null, [
        Validators.minLength(3)
      ]),
      page: new FormControl(null, []),
      id_personalidad_juridica: new FormControl(null),
      estatus: new FormControl(null),
      activo: new FormControl(null)
    });
  }

  iniciarFormEstatus() {
    return new FormGroup({
      id_estatus_proveedor: new FormControl(null, [Validators.required])
    });
  }

  get idEstatusForm() {
    return this.formEstatus.get('id_estatus_proveedor');
  }

  obtenerProveedores(getByInput?: boolean) {
    this.loaderBusqueda = true;

    if (this.formBusqueda?.invalid) {
        for (const control of Object.keys(this.formBusqueda.controls)) {
            this.formBusqueda.controls[control].markAsTouched();
            console.info(this.formBusqueda.controls[control].errors);
        }
        return;
    }

    const datosBusqueda: IProveedorBusqueda = this.formBusqueda?.value as IProveedorBusqueda;
    datosBusqueda.page = this.page;

    if (getByInput) datosBusqueda.pageSize = this.pageSize;

    this._serviceProveedores.obtenerProveedores(datosBusqueda).subscribe({
      next: (res) => {
        let { data, total, per_page } = res.datos;
        this.proveedores = data;

        if (this.proveedores !== null) {
          this.collectionSize = total;
          this.pageSize = per_page;
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

  editarProveedor(proveedor: IProveedor) {
    this.blnEditar = true;
    this.proveedor = proveedor;

    if (proveedor.id_tipo_personeria_juridica === 1) {
      this.formPersonaMoral = true;
    } else {
      this.formPersonaMoral = false;
    }
  }

  eliminar() {
    this.loaderGuardar = true;

    this.proveedor.activo = false;

    this._serviceProveedores.eliminarProveedor(this.proveedor).subscribe({
        next: (data) => {
           swal.fire(data.mensaje, "", 'success');
           this.obtenerProveedores();
        },
        error: (err) => {
            console.info(err)
            swal.fire(err.error.mensaje, "", 'error');
        },
        complete: () => {
            this.loaderGuardar = false;
            this.cerrarModalEstatus();
        }
    });
  }

  cambiarEstatusProveedor() {
    if (this.formEstatus == undefined || this.formEstatus.invalid) {
      for (const control of Object.keys(this.formEstatus.controls)) {
        this.formEstatus.controls[control].markAsTouched();
      }
      swal.fire('No ha seleccionado un estatus nuevo','','error');
    } else {
      this.loaderGuardar = true;
      
      const datos: IProveedor = this.proveedor;
      datos.id_estatus_proveedor = Number(this.formEstatus.get("id_estatus_proveedor")?.value);

      this._serviceProveedores.cambiarEstatusProveedor(datos).subscribe({
        next: (response) => {
          swal.fire(response.mensaje, "", 'success');
          this.obtenerProveedores();
        },
        error: (err) => {
          console.info(err);
          swal.fire(err.error.mensaje,"",'error');
          this.loaderGuardar = false;
        },
        complete: () => {
          this.loaderGuardar = false;
          this.cerrarModalEstatus();
        }
      });
    }

  }

  cancelarEditar(response: boolean) {
    if(response){
      this.blnEditar = false;
      this.obtenerProveedores();
    }
  }

  filtrarProveedores() {
    this.page = 1;
    this.obtenerProveedores();
  }

  openModalEliminar(modal: any, datos: IProveedor) {
    this.proveedor = datos;
    this.modalRef = this.modalService.open(modal);
  }

  openModalCambiarEstatus(modal: any, proveedor: any) {
    this.proveedor = proveedor;
    this.modalRef = this.modalService.open(modal, { size: 'lg' })
  }

  cerrarModalEstatus() {
    this.formEstatus.reset();
    this.modalRef?.close();
  }

  resetFiltro() {
    this.formBusqueda.reset();
    this.obtenerProveedores();
  }

  onPageChange() {    
    this.obtenerProveedores();
  }

  canActivate(permiso:string): boolean {
    return this._authService.canActivateFunction(permiso);
  }

}
