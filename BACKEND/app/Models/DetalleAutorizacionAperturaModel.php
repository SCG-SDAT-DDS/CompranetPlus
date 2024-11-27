<?php

namespace App\Models;

use App\Helper\CorreosHelper;
use App\Helper\NotificacionesHelper;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Lang;
use Illuminate\Support\Facades\Log;

class DetalleAutorizacionAperturaModel extends Model
{
    public $timestamps = false;
    protected $table = 'det_autorizacion_apertura';
    protected $primaryKey = 'id_autorizacion_apertura';

    protected $fillable = [
        'id_procedimiento_administrativo',
        'id_usuario_convocante',
        'id_usuario_supervisor',
        'id_usuario_admin',
        'activo',
        'fecha_ultima_mod',
        'usuario_ultima_mod'
    ];

    protected $casts = [
        'fecha_ultima_mod' => 'datetime',
    ];

    public function guardarAutorizacionApertura($parametros): RespuestaModel
    {
        DB::beginTransaction();
        try {
            if (isset($parametros["id_autorizacion_apertura"])) {
                $datoGuardar = $this::find($parametros["id_autorizacion_apertura"]);
            }

            if (!isset($datoGuardar)) {
                $datoGuardar = new DetalleAutorizacionAperturaModel();
                $datoGuardar->activo = true;
            }

            if (isset($parametros["id_procedimiento_administrativo"])) {
                $datoGuardar->id_procedimiento_administrativo = $parametros["id_procedimiento_administrativo"];
            }

            if (isset($parametros["id_usuario_convocante"])) {
                $datoGuardar->id_usuario_convocante = $parametros["id_usuario_convocante"];
            }

            if (isset($parametros["id_usuario_supervisor"])) {
                $datoGuardar->id_usuario_supervisor = $parametros["id_usuario_supervisor"];
            }

            if (isset($parametros["id_usuario_admin"])) {
                $datoGuardar->id_usuario_admin = $parametros["id_usuario_admin"];
            }

            $datoGuardar->fecha_ultima_mod = Carbon::now();
            $datoGuardar->usuario_ultima_mod = $parametros["idUsuario"] ?? null;

            $id_autorizacion_apertura = $parametros['id_autorizacion_apertura'];

            // Verificar si ambos id_autorizacion_apertura e id_usuario_convocante ya existen en el mismo registro
            $existeAutorizacionConvocante = DetalleAutorizacionAperturaModel::where('id_autorizacion_apertura', $id_autorizacion_apertura)
                ->whereNotNull('id_usuario_convocante')
                ->exists();

            // Verificar si ambos id_autorizacion_apertura e id_usuario_supervisor ya existen en el mismo registro
            $existeAutorizacionSupervisor = DetalleAutorizacionAperturaModel::where('id_autorizacion_apertura', $id_autorizacion_apertura)
                ->whereNotNull('id_usuario_supervisor')
                ->exists();



            $datoGuardar->save();

            DB::commit();


            if ($datoGuardar->id_usuario_convocante === null && $datoGuardar->id_usuario_admin === null) {
                $mensaje = "El usuario convocante falta por validar";
            }
            if ($datoGuardar->id_usuario_supervisor === null && $datoGuardar->id_usuario_admin === null) {
                $mensaje = "El usuario supervisor falta por validar";
            }
            if ($datoGuardar->id_usuario_convocante === null && $datoGuardar->id_usuario_supervisor === null && $datoGuardar->id_usuario_admin !== null) {
                $mensaje = "El usuario convocante y/o usuario supervisor faltan por autorizar";
            }

            if($datoGuardar->id_usuario_convocante && !$existeAutorizacionConvocante)
            {
                $idUsuarioConvocante = $datoGuardar->id_usuario_convocante;
                $usuarioConvocante = User::obtenerCorreoUsuario($idUsuarioConvocante);
                NotificacionesHelper::insertNotificacion($idUsuarioConvocante,
                    'Autorización de Acto de Apertura del procedimiento '.$parametros["procedimiento"],
                    'Ha autorizado el Acto de Apertura para descargar las propuestas de los Proveedores inscritos en el procedimiento: '.$parametros["procedimiento"]);
                $helpCorreo = new CorreosHelper();
                $helpCorreo->correoAutorizacionApertura($usuarioConvocante->correo, "Autorizacion de Acto de Recepción y Apertura",$parametros["procedimiento"]);
            }

            if($datoGuardar->id_usuario_supervisor && !$existeAutorizacionSupervisor)
            {
                $idUsuarioSupervisor = $datoGuardar->id_usuario_supervisor;
                $usuarioSupervisor = User::obtenerCorreoUsuario($idUsuarioSupervisor);
                NotificacionesHelper::insertNotificacion($idUsuarioSupervisor,
                    'Autorización de Acto de Apertura del procedimiento '.$parametros["procedimiento"],
                    'Ha autorizado el Acto de Apertura para descargar las propuestas de los Proveedores inscritos en el procedimiento: '.$parametros["procedimiento"]);
                $helpCorreo = new CorreosHelper();
                $helpCorreo->correoAutorizacionApertura($usuarioSupervisor->correo, "Autorizacion de Acto de Apertura", $parametros["procedimiento"]);
            }


            if (!empty($mensaje)) {
                return new RespuestaModel(true, false, $mensaje);
            }

            return new RespuestaModel(true,  true, Lang::get('messages.apertura.autorizacion_success'));

        } catch (\Exception $th) {
            Log::error($th);
            DB::rollback();
            if (str_contains(strtolower($th->getMessage()), 'smtp') && empty($mensaje)) {
                return new RespuestaModel(true, true, 'El servicio de Correos no está disponible por el momento');
            }

            if (str_contains(strtolower($th->getMessage()), 'smtp') && !empty($mensaje)) {
                return new RespuestaModel(true, false, $mensaje);
            }
            return new RespuestaModel(false,  null, $th->getMessage());
        }

    }
}
