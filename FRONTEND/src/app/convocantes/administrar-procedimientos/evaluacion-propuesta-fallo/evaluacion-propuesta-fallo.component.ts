import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { getBase64 } from 'src/app/enums/getBase64-util';
import { IFilesUpload } from 'src/app/interfaces/comun/IFilesUpload';
import { IBusquedaParticipante, IGanadorFallo, IParticipanteInvitado } from 'src/app/interfaces/convocantes/IBusquedaParticipantes';
import { IProcedimientoAdministrativo } from 'src/app/interfaces/convocantes/IProcedimientoAdministrativo';
import { ConvocantesService } from 'src/app/services/convocantes.service';
import swal from 'sweetalert2';



@Component({
  selector: 'app-evaluacion-propuesta-fallo',
  templateUrl: './evaluacion-propuesta-fallo.component.html',
  styleUrls: ['./evaluacion-propuesta-fallo.component.css']
})
export class EvaluacionPropuestaFalloComponent {

  @Input() public _procedimientoElegido: IProcedimientoAdministrativo | null = null;
  @Output() public _cancelarFalloProcedimiento = new EventEmitter();

  participantes:    IParticipanteInvitado[]=[];
  ganadores:        number[] = [];
  modalRefCancelar: NgbModalRef|undefined;
  formFallo:        FormGroup;
  archivoFallo!:    IFilesUpload | any;
  loaderGuardar:    boolean = false;
  loader:           boolean = false;
  seleccionar:      boolean = true;
  lstPartcipantes:  number[] = [];
  formularioParticipante: FormGroup = new FormGroup({});
  modalRef: NgbModalRef | undefined = undefined;

  constructor(
    private _convocantesService: ConvocantesService,
    private modalService: NgbModal,
    ) { 
      this.formFallo = this.iniciarFormularioFallo();
    }


  ngOnChanges(): void {
    
    this.obtenerProcedimientos();
  }
  
  iniciarFormularioFallo(data: IProcedimientoAdministrativo | null = null) {
    const formTmp: FormGroup | null = new FormGroup({
      id_procedimiento_administrativo: new FormControl(null, {
        nonNullable: true,
        validators: [],
      }),
      id_participante_procedimiento: new FormControl(null, {
        nonNullable: true,
        validators: [],
      }),
      ids: new FormControl(null, {
        nonNullable: true,
          validators: [],
      }),
      archivo_fallo: new FormControl('', [
        Validators.required
      ]),
      
    });

    
    return formTmp;
  }

  obtenerProcedimientos(){
    if(this._procedimientoElegido?.id_procedimiento_administrativo != undefined){
      const id: IBusquedaParticipante = {
        id_procedimiento_administrativo: this._procedimientoElegido.id_procedimiento_administrativo
      };
      this.obtenerProcedimientoAdministrativo(id);
    }
  }

  obtenerProcedimientoAdministrativo(id: IBusquedaParticipante){
    this.loader = true;
    this._convocantesService.buscarParticipanteInvitadoFallo(id).subscribe({
        next: (data) => {
          this.participantes=data.datos;
          
          this.lstPartcipantes = this.participantes.map(partcipante => partcipante.id_usuario);
          
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

  ganadorSeleccionado(participante: IParticipanteInvitado) {
    return this.ganadores.includes(participante.id_participante_procedimiento);
  }

  seleccionado(participante: IParticipanteInvitado){

    const id = participante.id_participante_procedimiento;
    const index = this.ganadores.findIndex(item => item === id);

    if (index !== -1) {
      this.ganadores.splice(index, 1);
    } else {
      this.ganadores.push( id );
    }
    
  }

  guardarFallo(){
  
    this.formFallo.patchValue({id_procedimiento_administrativo: this._procedimientoElegido?.id_procedimiento_administrativo,});
      
    const datosGuardar: IGanadorFallo = this.formFallo?.value as IGanadorFallo;
  
    datosGuardar.archivo_fallo = this.archivoFallo;
    datosGuardar.ganadores = this.ganadores;
    datosGuardar.participantes = this.lstPartcipantes;
    datosGuardar.numero_procedimiento = this._procedimientoElegido?.numero_procedimiento

    this.loaderGuardar = true;

    this._convocantesService.guardarFallo(datosGuardar).subscribe({
      next: (data) => {
        swal.fire(data.mensaje, "", 'success');
        this.obtenerProcedimientos();
        this.ganadores=[];
        this.formFallo.reset();
      },
      error: (err) => {
          console.info(err)
          swal.fire(err.error.mensaje, "", 'error');
          
      },
      complete: () => {
        this.loaderGuardar = false;
        this.seleccionar  = false;
       
      }
  });
  }

  cancelarFalloProcedimiento(){
    this._cancelarFalloProcedimiento.emit();
  }
  cancelarAgregarProcedimientoModal(content: any) {
    this.modalRefCancelar = this.modalService.open(content);
  }
  cancelar(){
    this.modalRefCancelar?.close();
  }

  cancelarAgregarFallo() {
    this.cancelarFalloProcedimiento();
    this.cancelar()
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

  descargarPdf(base64String: any, fileName: any) {
    const source = `data:application/pdf;base64,${base64String}`;
    const link = document.createElement("a");
    link.href = source;
    link.download = `${fileName}.pdf`
    link.click();
  }
  

  obtenerArchivoFalloBase64(event: any) {
    this.archivoFallo = null;
    let files = event.target.files;
    let archivo = files[0];

    if (files && archivo) {
      getBase64(archivo)
        .then((data64) => {
          this.archivoFallo = {
            base64: String(data64),
            nombreArchivo: archivo.name,
            procedimiento: this._procedimientoElegido?.numero_procedimiento,
            tipoArchivo: 13,
            encriptar: false
          } 
          this.archivoFallo.base64 = this.archivoFallo.base64?.replace(
            /^data:.+;base64,/,
            ''
          );
        })
        .catch((err) => {
          console.error(err);
        });
    } else {
      alert('No se seleccionó ningún archivo.');
    }
  }



}
