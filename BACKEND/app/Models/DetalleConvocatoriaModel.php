<?php

namespace App\Models;

use App\Enums\TipoArchivo;
use App\Helper\ArchivosHelper;
use App\Helper\CorreosHelper;
use App\Helper\NotificacionesHelper;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Lang;
use Illuminate\Support\Facades\Log;


class DetalleConvocatoriaModel extends Model
{

    public $timestamps = false;
    protected $table = 'det_detalles_convocatorias';
    protected $primaryKey = 'id_detalle_convocatoria';

    protected $fillable = [
        'id_procedimiento_administrativo',
        'fecha_publicacion',
        'fecha_limite_inscripcion',
        'fecha_visita_lugar',
        'existen_visitas_adicionales',
        'descripcion_lugar',
        'fecha_junta_aclaraciones',
        'existen_juntas_adicionales',
        'fecha_apertura',
        'fecha_fallo',
        'costo_bases',
        'diferendo_acto_apertura',
        'fecha_junta_aclaraciones_nueva',
        'fecha_limite_inscripcion_nueva',
        'fecha_apertura_nueva',
        'fecha_inicio_obra_nueva',
        'url_archivo_aviso_diferendo',
        'activo',
        'fecha_ultima_mod',
        'usuario_ultima_mod'
    ];

    protected $casts = [
        'fecha_ultima_mod' => 'datetime',
    ];

    public function buscarDetalleConvocatoria($params)
    {
        $query = DB::table('det_detalles_convocatorias as dc')
            ->distinct()
            ->where('dc.id_procedimiento_administrativo','=',$params["id_procedimiento_administrativo"])
            ->select('dc.*');


        $data = $query->get();

        return $data;
    }


    public function guardarDetalleConvocatoria($parametros): RespuestaModel
    {

        DB::beginTransaction();
        try {
            if ($parametros["id_detalle_convocatoria"])
                $datoGuardar = $this::find($parametros["id_detalle_convocatoria"]);

            if (!isset($datoGuardar)) {
                $datoGuardar = new DetalleConvocatoriaModel();
                $datoGuardar->activo = true;

            } else {
                if (isset($parametros["activo"])) {
                    $datoGuardar->activo = $parametros["activo"];
                }

            }

            if (isset($parametros["id_procedimiento_administrativo"])) {
                $datoGuardar->id_procedimiento_administrativo = $parametros["id_procedimiento_administrativo"];
            }

            if (isset($parametros["fecha_publicacion"])) {
                $datoGuardar->fecha_publicacion = $parametros["fecha_publicacion"];
            }
            if (isset($parametros["fecha_limite_inscripcion"])) {
                $datoGuardar->fecha_limite_inscripcion = $parametros["fecha_limite_inscripcion"];
            }
            if (isset($parametros["fecha_visita_lugar"])) {
                $datoGuardar->fecha_visita_lugar = $parametros["fecha_visita_lugar"];
            }

            if (isset($parametros["hora_visita_lugar"])) {
                $datoGuardar->fecha_visita_lugar = $datoGuardar->fecha_visita_lugar.' '.$parametros["hora_visita_lugar"];
            }

            if (isset($parametros["existen_visitas_adicionales"])) {
                $datoGuardar->existen_visitas_adicionales = $parametros["existen_visitas_adicionales"];
            }
            if (isset($parametros["descripcion_lugar"])) {
                $datoGuardar->descripcion_lugar = $parametros["descripcion_lugar"];
            }
            if (isset($parametros["fecha_junta_aclaraciones"])) {
                $datoGuardar->fecha_junta_aclaraciones = $parametros["fecha_junta_aclaraciones"];
            }

            if (isset($parametros["hora_junta_aclaraciones"])) {
                $datoGuardar->fecha_junta_aclaraciones = $datoGuardar->fecha_junta_aclaraciones.' '.$parametros["hora_junta_aclaraciones"];
            }

            if (isset($parametros["existen_juntas_adicionales"])) {
                $datoGuardar->existen_juntas_adicionales = $parametros["existen_juntas_adicionales"];
            }
            if (isset($parametros["fecha_apertura"])) {
                $datoGuardar->fecha_apertura = $parametros["fecha_apertura"];
            }

            if (isset($parametros["hora_apertura"])) {
                $datoGuardar->fecha_apertura = $datoGuardar->fecha_apertura.' '.$parametros["hora_apertura"];
            }


            if (isset($parametros["fecha_fallo"])) {
                $datoGuardar->fecha_fallo = $parametros["fecha_fallo"];
            }

            if (isset($parametros["hora_fallo"])) {
                $datoGuardar->fecha_fallo = $datoGuardar->fecha_fallo.' '.$parametros["hora_fallo"];
            }

            if (isset($parametros["costo_bases"])) {
                $datoGuardar->costo_bases = $parametros["costo_bases"];
            }

            if (isset($parametros["costo_inscripcion_aut"])) {
                $datoGuardar->costo_inscripcion_aut = $parametros["costo_inscripcion_aut"];
            }

            if (isset($parametros["diferendo_acto_apertura"])) {
                $datoGuardar->diferendo_acto_apertura = $parametros["diferendo_acto_apertura"];
            }
            if (isset($parametros["fecha_junta_aclaraciones_nueva"])) {
                $datoGuardar->fecha_junta_aclaraciones_nueva = $parametros["fecha_junta_aclaraciones_nueva"];
            }
            if (isset($parametros["fecha_limite_inscripcion_nueva"])) {
                $datoGuardar->fecha_limite_inscripcion_nueva = $parametros["fecha_limite_inscripcion_nueva"];
            }
            if (isset($parametros["fecha_apertura_nueva"])) {
                $datoGuardar->fecha_apertura_nueva = $parametros["fecha_apertura_nueva"];
            }
            if (isset($parametros["fecha_inicio_obra_nueva"])) {
                $datoGuardar->fecha_inicio_obra_nueva = $parametros["fecha_inicio_obra_nueva"];
            }
            if (isset($parametros["url_archivo_aviso_diferendo"])) {
                $datoGuardar->url_archivo_aviso_diferendo = $parametros["url_archivo_aviso_diferendo"];
            }



            $datoGuardar->fecha_ultima_mod = Carbon::now();
            $datoGuardar->usuario_ultima_mod = $parametros["idUsuario"];

            $datoGuardar->save();

            DB::commit();

            return new RespuestaModel(true,  $datoGuardar->id_detalle_convocatoria, Lang::get('messages.request_guardar'));

        } catch (\Exception $th) {
            Log::error($th);
            DB::rollback();
            return new RespuestaModel(false,  null, $th->getMessage());
        }

    }

    public function obtenerFechasProcedimiento($params)
    {
        $query = DB::table('det_detalles_convocatorias as dc')
            ->distinct()
            ->where('dc.id_procedimiento_administrativo','=',$params["id_procedimiento_administrativo"])
            ->select('dc.id_detalle_convocatoria','dc.fecha_junta_aclaraciones',
                'dc.fecha_junta_aclaraciones_nueva','dc.fecha_limite_inscripcion','dc.fecha_limite_inscripcion_nueva',
                'dc.fecha_apertura','dc.fecha_apertura_nueva','dc.diferendo_acto_apertura','dc.fecha_fallo');


        $data = $query->get()->first();

        return $data;
    }

    public function guardarDiferendo($parametros): RespuestaModel
    {

        DB::beginTransaction();
        try {
            $datoGuardar = $this::find($parametros["id_detalle_convocatoria"]);


            if (isset($parametros["fecha_junta_aclaraciones_nueva"])) {
                $datoGuardar->fecha_junta_aclaraciones_nueva = $parametros["fecha_junta_aclaraciones_nueva"];
            }

            if (isset($parametros["hora_junta_aclaraciones_nueva"])) {
                $datoGuardar->fecha_junta_aclaraciones_nueva = $datoGuardar->fecha_junta_aclaraciones_nueva.' '.$parametros["hora_junta_aclaraciones_nueva"];
            }

            if (isset($parametros["fecha_limite_inscripcion_nueva"])) {
                $datoGuardar->fecha_limite_inscripcion_nueva = $parametros["fecha_limite_inscripcion_nueva"];
            }


            if (isset($parametros["fecha_apertura_nueva"])) {
                $datoGuardar->fecha_apertura_nueva = $parametros["fecha_apertura_nueva"];
            }

            if (isset($parametros["hora_apertura_nueva"])) {
                $datoGuardar->fecha_apertura_nueva = $datoGuardar->fecha_apertura_nueva.' '.$parametros["hora_apertura_nueva"];
            }

            if (isset($parametros["fecha_inicio_obra_nueva"])) {
                $datoGuardar->fecha_inicio_obra_nueva = $parametros["fecha_inicio_obra_nueva"];
            }

            if (isset($parametros["url_archivo_aviso_diferendo"])) {
                $archivoAvisoDiferendo = $parametros["url_archivo_aviso_diferendo"];
                $url_aviso_rep = $this::almacenarArchivo($archivoAvisoDiferendo);
                $datoGuardar->url_archivo_aviso_diferendo = $url_aviso_rep;
            }


            $datoGuardar->diferendo_acto_apertura = 1;
            $datoGuardar->fecha_ultima_mod = Carbon::now();
            $datoGuardar->usuario_ultima_mod = $parametros["idUsuario"] ?? null;

            $params = [
                "id_procedimiento_administrativo" => $datoGuardar->id_procedimiento_administrativo,
                "id_estatus_procedimiento" => 2,
                "idUsuario" => $datoGuardar->usuario_ultima_mod
            ];


            $procedimientoEstatus = new ProcedimientoAdministrativoModel();
            $procedimientoEstatus->cambiarEstatusProcedimiento($params);

            $datoGuardar->save();
            DB::commit();

            $proveedorArray = DetalleParticipantesProcedimientosModel::obtenerParticipantesProcedimiento($datoGuardar->id_procedimiento_administrativo);
            $helpCorreo = new CorreosHelper();
            foreach($proveedorArray as $proveedor) {
                if ($proveedor->id_estatus_participacion == 1){ //Participante
                    if ($proveedor->razon_social !== null){
                        $nombreDestinatario = $proveedor->razon_social;
                    }else{
                        $nombreDestinatario = $proveedor->nombre_proveedor." ".$proveedor->primer_apellido_proveedor." ".$proveedor->segundo_apellido_proveedor;
                    }
                    $helpCorreo->correoDiferimientoAperturaParticipante(
                        $proveedor->correo_electronico,
                        "Diferimiento de Apertura ".$parametros["procedimiento"],
                        $nombreDestinatario ,
                        $parametros["procedimiento"] ,
                        $parametros["fecha_apertura_nueva"] ,
                        $parametros["hora_apertura_nueva"]);
                    NotificacionesHelper::insertNotificacion($proveedor->id_usuario,
                        "Diferimiento de Apertura ".$parametros["procedimiento"],
                        "El acto de apertura de la licitación se ha diferido para el día: ".date('d/m/y', strtotime($parametros["fecha_apertura_nueva"]))
                        ." a las ".date('h:i A', strtotime($parametros["hora_apertura_nueva"])). ".En su correo electronico puede consultar toda la información.");
                }

                if ($proveedor->id_estatus_participacion == 2){ //Invitado
                    if ($proveedor->razon_social !== null){
                        $nombreDestinatario = $proveedor->razon_social;
                    }else{
                        $nombreDestinatario = $proveedor->nombre_proveedor." ".$proveedor->primer_apellido_proveedor." ".$proveedor->segundo_apellido_proveedor;
                    }
                    $helpCorreo->correoDiferimientoAperturaInvitado($proveedor->correo_electronico,
                        "Diferimiento de Apertura ".$parametros["procedimiento"],
                        $nombreDestinatario,
                        $parametros["procedimiento"] ,
                        $parametros["fecha_apertura_nueva"] ,
                        $parametros["hora_apertura_nueva"]);
                    NotificacionesHelper::insertNotificacion($proveedor->id_usuario,
                        "Diferimiento de Apertura ".$parametros["procedimiento"],
                        "El acto de apertura de la licitación se ha diferido para el día: ".date('d/m/y', strtotime($parametros["fecha_apertura_nueva"]))
                        ." a las ".date('h:i A', strtotime($parametros["hora_apertura_nueva"])));
                }
            }


            return new RespuestaModel(true,  $datoGuardar->id_detalle_convocatoria, Lang::get('messages.request_guardar'));
        } catch (\Exception $th) {
            Log::error($th);
            DB::rollback();
            if (str_contains(strtolower($th->getMessage()), 'smtp')) {
                return new RespuestaModel(true, null, 'El servicio de Correos no está disponible por el momento');
            }
            return new RespuestaModel(false,  null, $th->getMessage());
        }

    }

    public function guardarActaRecepcionApertura($parametros): RespuestaModel
    {
        DB::beginTransaction();
        try {
            $datoGuardar = $this::find($parametros["id_detalle_convocatoria"]);


            if (isset($parametros["fecha_fallo"])) {
                $datoGuardar->fecha_fallo = $parametros["fecha_fallo"];
            }

            if (isset($parametros["hora_fallo"])) {
                $datoGuardar->fecha_fallo = $datoGuardar->fecha_fallo.' '.$parametros["hora_fallo"];
            }


            if (isset($parametros["url_acta_recepcion"])) {
                $archivoActaRecepcion = $parametros["url_acta_recepcion"];
                $url_acta_rep = $this::almacenarArchivo($archivoActaRecepcion);
                $datoGuardar->url_archivo_acto_recepcion = $url_acta_rep;
            }

            if (isset($parametros["propuestas"])) {
                $params = [
                    "id_procedimiento_administrativo" => $parametros["id_procedimiento_administrativo"],
                    "id_estatus_procedimiento" => 6,
                    "idUsuario" => $datoGuardar->usuario_ultima_mod
                ];


                $procedimientoEstatus = new ProcedimientoAdministrativoModel();
                $procedimientoEstatus->cambiarEstatusProcedimiento($params);
            }else{
                $params = [
                    "id_procedimiento_administrativo" => $parametros["id_procedimiento_administrativo"],
                    "id_estatus_procedimiento" => 3,
                    "idUsuario" => $datoGuardar->usuario_ultima_mod
                ];


                $procedimientoEstatus = new ProcedimientoAdministrativoModel();
                $procedimientoEstatus->cambiarEstatusProcedimiento($params);
            }

            if (isset($parametros['participantes_propuesta']) && !empty( $parametros['participantes_propuesta']) ) {
                foreach ($parametros['participantes_propuesta'] as $id) {

                    $parametroParticipante = [
                        "id_participante_procedimiento" => $id,
                    ];
                    $participanteProcedimiento = new DetalleParticipantesProcedimientosModel();
                    $participanteProcedimiento->participantesPropuesta($parametroParticipante);
                }
            }


            $datoGuardar->fecha_ultima_mod = Carbon::now();
            $datoGuardar->usuario_ultima_mod = $parametros["idUsuario"] ?? null;

            $datoGuardar->save();

            DB::commit();

            return new RespuestaModel(true,  $datoGuardar->id_detalle_convocatoria, Lang::get('messages.request_guardar'));
        } catch (\Exception $th) {
            Log::error($th);
            DB::rollback();
            return new RespuestaModel(false,  null,  $th);
        }

    }

    public function almacenarArchivo($request)
    {
        $tipoArchivo  = TipoArchivo::obtenerTipoArchivo($request['tipoArchivo']);
        $archivo = new ArchivoModel($request['nombreArchivo'],
            $request['base64'],
            $tipoArchivo);

        $archHelp = new ArchivosHelper();
        $respServ = $archHelp->guardarDocumento(
            $archivo,
            $request['procedimiento'],
            $request['encriptar']
        );


        return $respServ->datos;
    }

    public function guardarFechaJuntaAclaraciones($idProcedimiento, $fecha) {
        $detalleConvocatoria = DetalleConvocatoriaModel::where('id_procedimiento_administrativo', $idProcedimiento)->first();

        if ($detalleConvocatoria) {
            $detalleConvocatoria->fecha_junta_aclaraciones_nueva = $fecha;
            Log::info("************* Fecha de Junta de Aclaraciones nueva ***************************".$detalleConvocatoria);
            $detalleConvocatoria->save();
        }

    }

    public function guardarFechaCargaActaJuntaAclaraciones($idProcedimiento, $fecha) {
//        $detalleConvocatoria = DetalleConvocatoriaModel::where('id_procedimiento_administrativo', $idProcedimiento)->first();
//
//        if ($detalleConvocatoria) {
//            $detalleConvocatoria->fecha_carga_junta_aclaraciones = $fecha;
//            Log::info("************* Fecha de Junta de Aclaraciones nueva ***************************".$detalleConvocatoria);
//            $detalleConvocatoria->save();
//        }

    }




}
