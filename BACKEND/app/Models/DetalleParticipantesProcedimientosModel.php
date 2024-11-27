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


class DetalleParticipantesProcedimientosModel extends Model
{

    public $timestamps = false;
    protected $table = 'det_participantes_procedimientos';
    protected $primaryKey = 'id_participante_procedimiento';

    protected $fillable = [
        'id_procedimiento_administrativo',
        'id_proveedor',
        'id_tipo_participacion',
        'id_estatus_participacion',
        'fecha_inscripcion',
        'certificado_proveedor',
        'numero_certificado',
        'fecha_fallo',
        'url_archivo_acto_fallo',
        'activo',
        'fecha_ultima_mod',
        'usuario_ultima_mod'
    ];

    protected $casts = [
        'fecha_ultima_mod' => 'datetime',
    ];

    public function buscarDetalleParticipantesProcedimientos($params)
    {
        $query = DB::table('det_participantes_procedimientos as dpp')
            ->join('ms_proveedores as p','p.id_proveedor','=','dpp.id_proveedor')
            ->join('cat_estatus_participaciones as ep','ep.id_estatus_participacion','=','dpp.id_estatus_participacion')
            ->distinct()
            ->where('dpp.id_procedimiento_administrativo','=',$params["id_procedimiento_administrativo"])
            ->where('dpp.activo',1)
            ->select('dpp.*','p.id_usuario','p.rfc_proveedor','p.nombre_proveedor','p.primer_apellido_proveedor','p.segundo_apellido_proveedor','p.razon_social','p.descripcion_giro_empresa','ep.nombre_estatus_participacion', 'ep.estilo');


        $data = $query->get();

        return $data;
    }


    public function buscarParticipantesFalloProcedimientos($params)
    {
        $query = DB::table('det_participantes_procedimientos as dpp')
            ->join('ms_proveedores as p','p.id_proveedor','=','dpp.id_proveedor')
            ->join('cat_estatus_participaciones as ep','ep.id_estatus_participacion','=','dpp.id_estatus_participacion')
            ->leftJoin('det_propuestas_participantes as pp','pp.id_participante_procedimiento','=','dpp.id_participante_procedimiento')
            ->distinct()
            ->where('dpp.id_procedimiento_administrativo','=',$params["id_procedimiento_administrativo"])
            ->where('dpp.propuesta_recibida',1)
            ->where('dpp.activo',1)
            ->select(   'pp.id_participante_procedimiento',
                        'dpp.*','p.id_usuario',
                        'p.rfc_proveedor',
                        'p.nombre_proveedor',
                        'p.primer_apellido_proveedor',
                        'p.segundo_apellido_proveedor',
                        'p.razon_social',
                        'p.descripcion_giro_empresa',
                        'ep.nombre_estatus_participacion',
                        'ep.estilo'
            );


        $data = $query->get();

        return $data;
    }


    public function cambiarEstusParticipanteProcedimiento($params){
        DB::beginTransaction();
        try {
            $data = $this::find($params['id_participante_procedimiento']);

            $data->activo = $params["activo"];
            $data->fecha_ultima_mod = Carbon::now();
            $data->usuario_ultima_mod = $params["idUsuario"];
            $data->save();
            DB::commit();
            return new RespuestaModel(
                                        true,  $data->id_participante_procedimiento
                                        ,Lang::get('messages.request_actualizar')
                                    );

        }catch (\Exception $th) {
            Log::error($th);
            DB::rollback();
            return new RespuestaModel(false,  null, $th);
        }
    }
    public function guardarDetalleParticipantesProcedimientos($parametros): RespuestaModel
    {
        $queryVal = $this::
            where(DB::raw("id_proveedor"), '=', $parametros["id_proveedor"])
            ->where('id_procedimiento_administrativo', '=',  $parametros["id_procedimiento_administrativo"])
            ->where('activo', '!=', 0);

        if (isset($parametros["id_participante_procedimiento"]) && $parametros["id_participante_procedimiento"] != null) {
            $queryVal->where('id_participante_procedimiento', '<>', $parametros["id_participante_procedimiento"]);
        }

        $existeCoincidencia = $queryVal->first();

        if ($existeCoincidencia != null) {
            return new RespuestaModel(false, null, Lang::get('messages.request_reg_existe'));
        }

        DB::beginTransaction();
        try {
            if ($parametros["id_participante_procedimiento"])
                $datoGuardar = $this::find($parametros["id_participante_procedimiento"]);

            if (!isset($datoGuardar)) {
                $datoGuardar = new DetalleParticipantesProcedimientosModel();
                $datoGuardar->activo = true;

            } else {
                if (isset($parametros["activo"])) {
                    $datoGuardar->activo = $parametros["activo"];
                }

            }

            if (isset($parametros["id_proveedor"])) {
                $datoGuardar->id_proveedor = $parametros["id_proveedor"];
            }

            if (isset($parametros["id_procedimiento_administrativo"])) {
                $datoGuardar->id_procedimiento_administrativo = $parametros["id_procedimiento_administrativo"];
            }

            if (isset($parametros["id_tipo_participacion"])) {
                $datoGuardar->id_tipo_participacion = $parametros["id_tipo_participacion"];
            }

            if (isset($parametros["id_estatus_participacion"])) {
                $datoGuardar->id_estatus_participacion = $parametros["id_estatus_participacion"];
            }


            if (isset($parametros["fecha_inscripcion"])) {
                $datoGuardar->fecha_inscripcion = $parametros["fecha_inscripcion"];
            }
            if (isset($parametros["certificado_proveedor"])) {
                $datoGuardar->certificado_proveedor = $parametros["certificado_proveedor"];
            }
            if (isset($parametros["numero_certificado"])) {
                $datoGuardar->numero_certificado = $parametros["numero_certificado"];
            }
            if (isset($parametros["fecha_fallo"])) {
                $datoGuardar->fecha_fallo = $parametros["fecha_fallo"];
            }
            if (isset($parametros["url_archivo_acto_fallo"])) {
                $datoGuardar->url_archivo_acto_fallo = $parametros["url_archivo_acto_fallo"];
            }

            $datoGuardar->fecha_ultima_mod = Carbon::now();
            $datoGuardar->usuario_ultima_mod = $parametros["idUsuario"];

            $datoGuardar->save();

            DB::commit();

            return new RespuestaModel(true,  $datoGuardar->id_participante_procedimiento, Lang::get('messages.request_guardar'));

        } catch (\Exception $th) {
            Log::error($th);
            DB::rollback();
            return new RespuestaModel(false,  null, $th);
        }

    }

    public function generoPaseCaja($params,$folio){
        DB::beginTransaction();
        try {
            $data = $this::find($params['id_participante_procedimiento']);

            $data->pase_caja = $params["pase_caja"];
            $data->folio_pase_caja = $folio;
            $data->fecha_ultima_mod = Carbon::now();
            $data->usuario_ultima_mod = $params["idUsuario"];
            $data->save();
            DB::commit();
            return new RespuestaModel(true,  $data->id_participante_procedimiento,Lang::get('messages.request_actualizar'));

        }catch (\Exception $th) {
            Log::error($th);
            DB::rollback();
            return new RespuestaModel(false,  null, $th);
        }
    }

    public function generoRecibo($params){
        DB::beginTransaction();
        try {
            $data = $this::find($params['id_participante_procedimiento']);

            $data->pase_caja = 1;
            $data->fecha_ultima_mod = Carbon::now();
            $data->usuario_ultima_mod = $params["idUsuario"];
            $data->save();
            DB::commit();
            return new RespuestaModel(true,  $data->id_participante_procedimiento,Lang::get('messages.request_actualizar'));

        }catch (\Exception $th) {
            Log::error($th);
            DB::rollback();
            return new RespuestaModel(false,  null, $th);
        }
    }

    public function notificarParticipanteProveedor( $parametros ){
        try {
            if (isset($parametros["id_proveedor"])) {

                $proveedor = ProveedorModel::obtenerCorreoProveedor($parametros["id_proveedor"]);

                $tipoInscripcion = $parametros["id_tipo_participacion"] === 2 ? "participante" : "invitado";
                NotificacionesHelper::insertNotificacion(
                    $proveedor->id_usuario,
                    "Inscripcion a licitación",
                    "Estimado proveedor le notificamos que ha sido inscrito cómo ".$tipoInscripcion." en la licitación ".$parametros["numero_procedimiento"]
                );

                $helpCorreo = new CorreosHelper();
                $helpCorreo->inscripcionProveedor(
                    $proveedor->correo_electronico, "INSCRIPCION A LICITACION",
                    $proveedor->nombre_proveedor,
                    $parametros["numero_procedimiento"],
                    $parametros["id_tipo_participacion"] === 2 ? 0 : 1
                );


            }
        }catch (\Exception $th) {
            Log::error($th);
            DB::rollback();
            if (str_contains(strtolower($th->getMessage()), 'smtp')) {
                return new RespuestaModel(true, null, 'El servicio de Correos no está disponible por el momento');
            }
            return new RespuestaModel(false,  null, $th);
        }


    }


    public function notificarPropuestaFallo($params)
    {
        foreach ($params["participantes"] as $id_usuario) {
            NotificacionesHelper::insertNotificacion(
                $id_usuario,
                "Evaluación de propuestas y fallo",
                "Estimado proveedor le notificamos que se ha subido el acta de fallo en la licitación ".$params["numero_procedimiento"]
            );
        }
    }

    public function buscarGanadoresProcedimientos($params)
    {
        $query = DB::table('det_participantes_procedimientos as dpp')
            ->join('ms_proveedores as p','p.id_proveedor','=','dpp.id_proveedor')
            ->join('cat_estatus_participaciones as ep','ep.id_estatus_participacion','=','dpp.id_estatus_participacion')
            ->distinct()
            ->where('dpp.id_procedimiento_administrativo','=',$params["id_procedimiento_administrativo"])
            ->where('dpp.id_estatus_participacion','=',3)
            ->select('dpp.*','p.rfc_proveedor','p.nombre_proveedor','p.primer_apellido_proveedor','p.segundo_apellido_proveedor','p.razon_social','p.descripcion_giro_empresa','ep.nombre_estatus_participacion', 'ep.estilo');


        $data = $query->get();

        return $data;
    }


    public function obtenerDetalleParticipante($params)
    {
        $query = DB::table('det_participantes_procedimientos as dpp')
            ->leftJoin('det_propuestas_participantes as dp','dp.id_participante_procedimiento','=','dpp.id_participante_procedimiento')
            ->leftJoin('ms_proveedores as mp','mp.id_proveedor','=','dpp.id_proveedor')
            ->where('dpp.id_procedimiento_administrativo','=',$params["id_procedimiento_administrativo"])
            ->where('dpp.id_proveedor','=',$params["id_proveedor"])
            ->where('dpp.activo',1)
            ->where('dp.activo',1)
            ->select('dpp.*','dp.url_archivo_propuesta','dp.fecha_propuesta','dp.id_propuesta_participante','mp.rfc_proveedor','mp.razon_social','mp.nombre_proveedor','mp.primer_apellido_proveedor','mp.segundo_apellido_proveedor');


        return $query->get();



    }

    public function obtenerDetalleParticipantePaseCaja($params)
    {
        $query = DB::table('det_participantes_procedimientos as dpp')
            ->leftJoin('ms_proveedores as mp','mp.id_proveedor','=','dpp.id_proveedor')
            ->where('dpp.id_procedimiento_administrativo','=',$params["id_procedimiento_administrativo"])
            ->where('dpp.id_proveedor','=',$params["id_proveedor"])
            ->where('dpp.activo',1)
            ->select('dpp.*','mp.rfc_proveedor','mp.razon_social','mp.nombre_proveedor','mp.primer_apellido_proveedor','mp.segundo_apellido_proveedor',
            'mp.correo_electronico','mp.nombre_vialidad');


        return $query->get()->first();



    }

    public function obtenerProposicionesConvocatoria($params)
    {
        $query = DB::table('det_participantes_procedimientos as dpp')
            ->join('ms_proveedores as p', 'p.id_proveedor', '=', 'dpp.id_proveedor')
            ->join('cat_estatus_participaciones as ep', 'ep.id_estatus_participacion', '=', 'dpp.id_estatus_participacion')
            ->leftJoin('det_propuestas_participantes as pp', 'pp.id_participante_procedimiento', '=', 'dpp.id_participante_procedimiento')
            ->where('dpp.id_procedimiento_administrativo', $params["id_procedimiento_administrativo"])
            ->where('dpp.activo', 1)
            ->select('dpp.id_participante_procedimiento',
                'dpp.id_procedimiento_administrativo',
                'dpp.fecha_inscripcion', 'p.id_usuario',
                'dpp.propuesta_recibida',
                'p.rfc_proveedor', 'p.nombre_proveedor',
                'p.primer_apellido_proveedor', 'p.segundo_apellido_proveedor',
                'p.correo_electronico', 'p.razon_social', 'ep.nombre_estatus_participacion',
                'ep.estilo','pp.id_propuesta_participante','pp.url_archivo_propuesta',
                'pp.fecha_propuesta', 'pp.url_archivo_partida');

        $data = $query->get();

        $uniqueResults = [];

        foreach ($data as $item) {
            $idParticipante = $item->id_participante_procedimiento;

            if (!array_key_exists($idParticipante, $uniqueResults)) {
                // Si es la primera vez que encontramos este id_participante_procedimiento, creamos una nueva entrada
                $uniqueResults[$idParticipante] = (object)[
                    'id_participante_procedimiento' => $idParticipante,
                    'id_procedimiento_administrativo' => $item->id_procedimiento_administrativo,
                    'fecha_inscripcion' => $item->fecha_inscripcion,
                    'fecha_propuesta' => $item->fecha_propuesta,
                    'id_usuario' => $item->id_usuario,
                    'rfc_proveedor' => $item->rfc_proveedor,
                    'nombre_proveedor' => $item->nombre_proveedor,
                    'primer_apellido_proveedor' => $item->primer_apellido_proveedor,
                    'segundo_apellido_proveedor' => $item->segundo_apellido_proveedor,
                    'correo_electronico' => $item->correo_electronico,
                    'razon_social' => $item->razon_social,
                    'nombre_estatus_participacion' => $item->nombre_estatus_participacion,
                    'propuesta_recibida' => $item->propuesta_recibida,
                    'estilo' => $item->estilo,
                    'archivos_propuesta' => null,
                ];

                // Agregamos el archivo de partida si existe
                if (!is_null($item->url_archivo_partida)) {
                    $uniqueResults[$idParticipante]->archivos_propuesta['archivo_partida'] = $item->url_archivo_partida;
                }
            }

            // Agregamos el url_archivo_propuesta si existe
            if (!is_null($item->id_propuesta_participante) && !is_null($item->url_archivo_propuesta)) {
                $uniqueResults[$idParticipante]->archivos_propuesta['archivos_propuesta'][] = $item->url_archivo_propuesta;
            }
        }

        // Convertimos el array asociativo en un array indexado
        $uniqueResults = array_values($uniqueResults);

        return $uniqueResults;
    }


    public function participantesPropuesta($params){
            $dataProcedimiento = $this::find($params['id_participante_procedimiento']);
            $dataProcedimiento->propuesta_recibida = 1;
            $dataProcedimiento->save();

        return new RespuestaModel(
            true,  $dataProcedimiento->id_procedimiento_administrativo
            ,Lang::get('messages.request_actualizar')
        );
    }

    public function participantesGanadoresProcedimiento($params){

        if (isset($params["archivo_fallo"])) {

            $dataProcedimiento = ProcedimientoAdministrativoModel::find($params["id_procedimiento_administrativo"]);

            $archivoAvisoDiferendo = $params["archivo_fallo"];
            $url_fallo = $this::almacenarArchivo($archivoAvisoDiferendo);
            $dataProcedimiento->url_archivo_acta_fallo = $url_fallo;

            if (isset( $params['ganadores'] ) && !empty( $params['ganadores'] ) ) {

                foreach (  $params['ganadores'] as $id) {

                    $data = $this::find($id);
                    $data->fecha_fallo = Carbon::now();
                    $data->id_estatus_participacion=3;
                    $data->save();
                }

                $dataProcedimiento->id_estatus_procedimiento = 7;
            }else{
                $dataProcedimiento->id_estatus_procedimiento = 6;
            }

            $dataProcedimiento->save();
        }

        return new RespuestaModel(
            true,  $url_fallo
            ,Lang::get('messages.request_actualizar')
        );
    }

    public function obtenerArchivo($url, $encriptar)
    {

        $archHelp = new ArchivosHelper();
        $respServ = $archHelp->obtenerDocumento(
            $url,
            $encriptar
        );

        return $respServ->datos;

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

    public function enviarNotificacion($params)
    {
        foreach ($params as $participante) {
            if (isset($participante["correo"])) {
                if ($participante["razon_social"] !== null){
                    $destinatario = $participante["razon_social"];
                }else{
                    $destinatario = $participante["nombre_proveedor"]." ".$participante["primer_apellido_proveedor"]." ".$participante["segundo_apellido_proveedor"];
                }
                NotificacionesHelper::insertNotificacion($participante["usuario"],"Propuesta descargada","Su propuesta ha sido descargada de la licitacion ".$participante['procedimiento']);

                $helpCorreo = new CorreosHelper();
                $helpCorreo->correoDescargaPropuesta($participante["correo"], "Descarga de propuesta", $destinatario,$participante["procedimiento"]);
            }
        }
    }

    public static function obtenerParticipantesProcedimiento($param)
    {

        $query = DB::table('det_participantes_procedimientos as dpp')
            ->leftJoin('ms_proveedores as mp','mp.id_proveedor','=','dpp.id_proveedor')
            ->select('mp.*','dpp.id_estatus_participacion')
            ->where('dpp.id_procedimiento_administrativo','=',$param);

        return $query->get();
    }


}
