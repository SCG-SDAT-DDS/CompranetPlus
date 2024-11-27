import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/components/login/auth.service';
import { IBusquedaParticipante, IParticipanteInvitado } from 'src/app/interfaces/convocantes/IBusquedaParticipantes';
import { IProcedimientoAdministrativo } from 'src/app/interfaces/convocantes/IProcedimientoAdministrativo';
import { IProveedor } from 'src/app/interfaces/proveedores/IProveedores';
import { ConvocantesService } from 'src/app/services/convocantes.service';
import swal from 'sweetalert2';


@Component({
  selector: 'app-participante',
  templateUrl: './participante.component.html',
  styleUrls: ['./participante.component.css']
})
export class ParticipanteComponent {

  @Input() public _procedimientoElegido:IProcedimientoAdministrativo | null = null;
  @Output() public _cancelarVerParticipantes = new EventEmitter();

  participantes:  IParticipanteInvitado[]=[];
  lstProveedores: IProveedor[]  | null = null;
  formRegistro:   FormGroup;
  formularioParticipante: FormGroup = new FormGroup({});
  
  modalRefEliminar: NgbModalRef | undefined;
  modalRefCancelarAgregar:NgbModalRef|undefined;

  agregarParticipante: boolean = true;
  activarBtnRegistro: boolean = true;
  loaderGuardar: boolean = false;
  loaderBusqueda: boolean = false;
  loader: boolean = false;
  
  messageTitle: string = '';
  messageSubTitle: string = '';

  constructor(
    private modalService: NgbModal,
    private _convocantesService: ConvocantesService,
    private _authService: AuthService,
  ) { 

    this.formRegistro = this.iniciarFormularioRegistro();
    this.formularioParticipante = this.iniciarFormularioParticipante();
    
  }

  
  ngOnChanges(): void {

    this.obtenerProcedimientos();
    
    if(this._procedimientoElegido?.id_tipo_participacion ==2){
      this.messageTitle = 'Participante';
      this.messageSubTitle = 'Participante';
    }else{
      this.messageTitle = 'Invitado';
      this.messageSubTitle = 'invitado';
    }
  }

  iniciarFormularioParticipante() {
    const formTmp: FormGroup | null = new FormGroup({
      id_participante_procedimiento: new FormControl (null,{
        nonNullable: true,
        validators: [],
      }),
      id_procedimiento_administrativo: new FormControl('', [
        Validators.required
      ]),
      id_proveedor: new FormControl('', [
        Validators.required  
      ]),
      id_tipo_participacion:new FormControl('', [
        Validators.required
      ]),
      rfc: new FormControl({
        value: '', disabled: true}, [
      ]),
      nombre_proveedor: new FormControl({
        value: '', disabled: true}, [
      ]),
      nombre_representante_proveedor: new FormControl({
        value: '', disabled: true}, [
      ]),
      giro_empresa: new FormControl({
        value: '', disabled: true}, [
      ]),
    });
    return formTmp;
  }  

  iniciarFormularioRegistro(data: IParticipanteInvitado | null = null) {

    const formTmp: FormGroup | null = new FormGroup({
      id_participante_procedimiento: new FormControl(null, {
        nonNullable: true,
        validators: [],
      }),
      activo: new FormControl('', [
            
      ])
    });

    if (data != null) {
      if (data.id_participante_procedimiento != null) {
        formTmp.patchValue({id_participante_procedimiento: data.id_participante_procedimiento});
      }
    }
    return formTmp;
  }
  
  mostrarValoresSeleccion() {
    
    this.activarBtnRegistro = false;
    this.formularioParticipante.patchValue({id_procedimiento_administrativo: this._procedimientoElegido?.id_procedimiento_administrativo});
    this.formularioParticipante.patchValue({id_tipo_participacion: this._procedimientoElegido?.id_tipo_participacion});
  
  }

  actualizarNombreProveedor(){

    if((this.lstProveedores?.find((element) => element.id_proveedor == this.formularioParticipante.value.id_proveedor)?.razon_social) === null){
      this.formularioParticipante.patchValue({nombre_proveedor: this.lstProveedores?.find((element) => element.id_proveedor == this.formularioParticipante.value.id_proveedor)?.nombre_proveedor+" "+this.lstProveedores?.find((element) => element.id_proveedor == this.formularioParticipante.value.id_proveedor)?.primer_apellido_proveedor +" "+this.lstProveedores?.find((element) => element.id_proveedor == this.formularioParticipante.value.id_proveedor)?.segundo_apellido_proveedor});
      this.formularioParticipante.patchValue({nombre_representante_proveedor: " "});
      this.formularioParticipante.patchValue({rfc: this.lstProveedores?.find((element) => element.id_proveedor == this.formularioParticipante.value.id_proveedor)?.rfc_proveedor});
    }else{
      this.formularioParticipante.patchValue({nombre_proveedor: this.lstProveedores?.find((element) => element.id_proveedor == this.formularioParticipante.value.id_proveedor)?.razon_social});
      this.formularioParticipante.patchValue({nombre_representante_proveedor: this.lstProveedores?.find((element) => element.id_proveedor == this.formularioParticipante.value.id_proveedor)?.nombre_representante+" "+this.lstProveedores?.find((element) => element.id_proveedor == this.formularioParticipante.value.id_proveedor)?.primer_apellido_representante +" "+this.lstProveedores?.find((element) => element.id_proveedor == this.formRegistro.value.id_proveedor)?.segundo_apellido_representante});
    }

    if (this.formularioParticipante.get('nombre_proveedor')?.value == undefined) {
      this.activarBtnRegistro = true;
      this.formularioParticipante.reset();
      return;
    }

    this.mostrarValoresSeleccion()

  }

  redireccionar() {
    this.agregarParticipante = !this.agregarParticipante;

    if(!this.agregarParticipante && !this.lstProveedores ){

      const datosBusquedaProveedores = {
        id_tipo_personeria_juridica: null,
        id_estatus_proveedor: 3,
        rfc_proveedor : '',
        nombre_proveedor : ''
      };
      this.loaderBusqueda = true;
      this._convocantesService.buscarProveedores(datosBusquedaProveedores).subscribe({
        next: (data) => {
            this.lstProveedores = data.datos;
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

  }
  
  obtenerProcedimientoAdministrativo(id: IBusquedaParticipante){
    this.loader = true;
    this._convocantesService.buscarParticipanteInvitado(id).subscribe({
        next: (data) => {
          this.participantes=data.datos;
        },
        error: (err) => {
            console.info(err)
            swal.fire(err.error.mensaje, "", 'error');
            
        },
        complete: () => {
          this.loader = false;
        }
    });

  }

  guardarDatos(){
    const datosGuardar: IParticipanteInvitado = this.formularioParticipante?.value as IParticipanteInvitado;
    datosGuardar.numero_procedimiento=this._procedimientoElegido?.numero_procedimiento;
    this.loaderGuardar = true;
    this._convocantesService.agregarParticipante(datosGuardar).subscribe({
      next: (data) => {
        swal.fire(data.mensaje, "", 'success');
        this.obtenerProcedimientos();
      },
      error: (err) => {
        this.loader = false;
        this.loaderGuardar = false;
          console.info(err)
          swal.fire(err.error.mensaje, "", 'error');
      },
      complete: () => {
        this.loader = false;
        this.loaderGuardar = false;
        this.cancelarAgregarProcedimiento();
      }
    });
  }

  obtenerProcedimientos(){
    if(this._procedimientoElegido?.id_procedimiento_administrativo != undefined){
      const id: IBusquedaParticipante = {
        id_procedimiento_administrativo: this._procedimientoElegido.id_procedimiento_administrativo
      };
      this.obtenerProcedimientoAdministrativo(id);
    }
  }

  eliminarModal(content :any, datos:IParticipanteInvitado) {
    this.formRegistro = this.iniciarFormularioRegistro(datos);
    this.modalRefEliminar = this.modalService.open(content);
	}

  eliminarSubmit(){
    this.loaderGuardar = true;
    const datosEliminar: IParticipanteInvitado = this.formRegistro?.value as IParticipanteInvitado;
    datosEliminar.activo=false;
    
    this._convocantesService.cambiarEstatusParticipante(datosEliminar).subscribe({
      next: (data) => {
        swal.fire(data.mensaje, "", 'success');
        this.obtenerProcedimientos();
      },
      error: (err) => {
          console.info(err)
          swal.fire(err.error.mensaje, "", 'error');
      },
      complete: () => {
          this.loaderGuardar = false;
          this.cancelarEliminar();
      }
    });
 
  }
  cancelarEliminar(){
    this.modalRefEliminar?.close();
  }

  cancelar(){
    this.modalRefCancelarAgregar?.close();
  }

  cancelarAgregarProcedimientoModal(content: any) {
    this.modalRefCancelarAgregar = this.modalService.open(content);
  }

  cancelarAgregarProcedimiento() {
    this.cancelar();
    this.formularioParticipante.reset();
    this.agregarParticipante = !this.agregarParticipante;
    this.activarBtnRegistro=true;
  }

  cancelarParticipantesProcedimiento() {
    this._cancelarVerParticipantes.emit();
  }

  canActivate(permiso:string): boolean {
    return this._authService.canActivateFunction(permiso);
  }
}
