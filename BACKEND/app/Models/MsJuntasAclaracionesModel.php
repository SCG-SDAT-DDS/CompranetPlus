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


class MsJuntasAclaracionesModel extends Model
{

    public $timestamps = false;
    protected $table = 'ms_juntas_aclaraciones';
    protected $primaryKey = 'id_junta_aclaraciones';

    protected $fillable = [
        'id_procedimiento_administrativo',
        'fecha_junta_aclaraciones',
        'fecha_carga_acta',
        'url_archivo',
        'activo',
        'fecha_ultima_mod',
        'usuario_ultima_mod'
    ];

    protected $casts = [
        //'fecha_junta_aclaraciones' => 'datetime',
        //'fecha_carga_acta' => 'datetime',
        'fecha_ultima_mod' => 'datetime',
    ];

    public function obtenerUltimaJunta($idProcedimiento)
    {
        $maxValue = $this::where('id_procedimiento_administrativo', $idProcedimiento)
            ->where('activo', true)
            ->max('id_junta_aclaraciones');


        $ultimaJunta = $this->find($maxValue);

        $ultimaJunta->horaServidor = Carbon::now()->format('Y-m-d H:i:s');


        return $ultimaJunta;
    }

    public function guardarActaJunta($parametros): RespuestaModel
    {
        DB::beginTransaction();
        try {
            $fechaActual = Carbon::now();

            $datoGuardar = $this->obtenerUltimaJunta($parametros['idProcedimiento']);
            unset($datoGuardar['horaServidor']);
            $datoGuardar->fecha_carga_acta = $fechaActual;
            $datoGuardar->fecha_ultima_mod = $fechaActual;
            $datoGuardar->usuario_ultima_mod = $parametros["idUsuario"];

            $datoGuardar->save();

            $detalleConvocatoria = new DetalleConvocatoriaModel();
            $detalleConvocatoria->guardarFechaJuntaAclaraciones($parametros["idProcedimiento"],$datoGuardar->fecha_carga_acta);
            DB::commit();

            $helpCorreo = new CorreosHelper();
            $proveedores = ProcedimientoAdministrativoModel::obtenerCorreosParticipantesProcedimiento($parametros['idProcedimiento']);

                // Inserción de notificaciones
                foreach ($proveedores as $prov) {
                    NotificacionesHelper::insertNotificacion(
                        $prov->id_usuario,
                        "RESPUESTA DE JUNTA DE ACLARACIONES " . $parametros["numeroProcedimiento"],
                        "Se ha registrado la respuesta a las preguntas del procedimiento " . $parametros["numeroProcedimiento"]
                    );
                }

                // Envío de correos electrónicos
                foreach ($proveedores as $prov) {
                    $helpCorreo->respuestaJuntaAclaraciones(
                        $prov->correo_electronico,
                        "RESPUESTA DE JUNTA DE ACLARACIONES",
                        $prov->nombre_proveedor,
                        $parametros["numeroProcedimiento"]
                    );
                }

            return new RespuestaModel(true,  $datoGuardar->id_junta_aclaraciones, Lang::get('messages.request_guardar'));

        } catch (\Exception $th) {
            Log::error($th);
            DB::rollback();
            if (str_contains(strtolower($th->getMessage()), 'smtp')) {
                return new RespuestaModel(true, null, 'El servicio de Correos no está disponible por el momento');
            }
            return new RespuestaModel(false,  null, $th);
        }

    }

    public function guardarProrrogaJunta($parametros): RespuestaModel
    {
        DB::beginTransaction();
        try {
            $fechaActual = Carbon::now();

            $ultimaJunta = $this->obtenerUltimaJunta($parametros['idProcedimiento']);
            unset($ultimaJunta['horaServidor']);
            $ultimaJunta->activo = false;
            $ultimaJunta->fecha_ultima_mod = $fechaActual;
            $ultimaJunta->usuario_ultima_mod = $parametros["idUsuario"];
            $ultimaJunta->save();

            $datoGuardar = new MsJuntasAclaracionesModel();
            $datoGuardar->id_procedimiento_administrativo = $parametros['idProcedimiento'];
            $datoGuardar->fecha_junta_aclaraciones = $parametros['fechaJuntaAlaraciones'];
            $datoGuardar->url_archivo = $parametros['url'];
            $datoGuardar->activo = true;
            $datoGuardar->fecha_ultima_mod = $fechaActual;
            $datoGuardar->usuario_ultima_mod = $parametros["idUsuario"];

            $datoGuardar->save();

            $helpCorreo = new CorreosHelper();

            $procModl = new DetalleConvocatoriaModel();
            $procModl->guardarFechaJuntaAclaraciones($parametros['idProcedimiento'], $parametros['fechaJuntaAlaraciones']);

            DB::commit();

            $provedores = ProcedimientoAdministrativoModel::obtenerCorreosParticipantesProcedimiento($parametros['idProcedimiento']);
            forEach($provedores as $prov) {
                NotificacionesHelper::insertNotificacion(
                    $prov->id_usuario,
                    "PRORROGA DE JUNTA DE ACLARACIONES ".$parametros["numeroProcedimiento"],
                    "Se ha realizado una prorroga para realizar la junta de aclaraciones para el día ".$datoGuardar->fecha_junta_aclaraciones);
            }

            forEach($provedores as $prov) {
                $helpCorreo->prorrogaJuntaAclaraciones(
                    $prov->correo_electronico,
                    "PRORROGA DE JUNTA DE ACLARACIONES",
                    $prov->nombre_proveedor,
                    $parametros["numeroProcedimiento"],
                    $datoGuardar->fecha_junta_aclaraciones
                );
            }


            return new RespuestaModel(true,  $datoGuardar->id_junta_aclaraciones, Lang::get('messages.request_guardar'));

        } catch (\Exception $th) {
            Log::error($th);
            DB::rollback();
            if (str_contains(strtolower($th->getMessage()), 'smtp')) {
                return new RespuestaModel(true, null, 'El servicio de Correos no está disponible por el momento');
            }
            return new RespuestaModel(false,  null, $th);
        }

    }

}
