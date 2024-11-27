<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Lang;
use Illuminate\Support\Facades\Log;

class MsNotificacionesUsuariosModel extends Model
{
    public $timestamps = false;

    protected $table = 'ms_notificaciones_usuarios';
    protected $primaryKey = 'id_notificacion_usuario';

    protected $fillable = [
        'id_usuario_recibe',
        'titulo_notificacion',
        'descripcion_notificacion',
        'fecha_notificacion',
        'estatus_leido',
        'fecha_leido',
        'activo',
        'fecha_ultima_mod',
        'usuario_ultima_mod'
    ];
    protected $casts = [
        'fecha_ultima_mod' => 'datetime',
    ];

    
    public function getMsNotificacionesUsuario($params){
       
        $notificaciones = DB::table('ms_notificaciones_usuarios as noti')
        ->select('noti.*')
        ->where('id_usuario_recibe', $params["id_usuario"])
        ->where(function ($query) {
            $query->where('fecha_notificacion', '>=', now()->subDays(30))
            ->orWhere(function ($query){
                $query->where('fecha_notificacion', '<', now()->subDays(30))
                ->where(function ($query) {
                    $query->where('estatus_leido', 0)
                          ->orWhereNull('estatus_leido');
                });
            });
        })
        ->orderBy('fecha_notificacion', 'desc')
        ->get();


        $totalNoLeidas = DB::table('ms_notificaciones_usuarios as noti')
        ->where('id_usuario_recibe', $params["id_usuario"])
        ->where('estatus_leido', false)
        ->distinct()
        ->select('noti.*')
        ->count();

        return [
            'notificaciones' => $notificaciones,
            'totalNoLeidas' => $totalNoLeidas,
        ];
    }

    public function nuevaNotificacion($id_usuario_recibe,$titulo_notificacion,$descripcion){
        DB::beginTransaction();
        try {
                $notificacion = new MsNotificacionesUsuariosModel();
                $notificacion->id_usuario_recibe = $id_usuario_recibe;
                $notificacion->titulo_notificacion = $titulo_notificacion;
                $notificacion->descripcion_notificacion = $descripcion;
                $notificacion->fecha_notificacion = Carbon::now();
                $notificacion->fecha_ultima_mod = Carbon::now();
                $notificacion->usuario_ultima_mod =null;
                $notificacion->save();
                DB::commit();
                return new RespuestaModel(  true
                                            ,$notificacion->id_notificacion_usuario
                                            ,Lang::get('messages.request_guardar')
                                        );
            } catch (\Exception $th) {
                Log::error($th);
                DB::rollback();
                return new RespuestaModel(false,  null, $th);
            }
    }


    public function notificacionLeida($parametros){
        try{
            DB::beginTransaction();
            $notificacion = MsNotificacionesUsuariosModel::find($parametros['id_notificacion']);

            if ($notificacion && !$notificacion->estatus_leido) {
                
                $notificacion->estatus_leido = 1;
                $notificacion->fecha_leido = Carbon::now();

                $notificacion->fecha_ultima_mod = Carbon::now();
                $notificacion->save();
                DB::commit();
                return new RespuestaModel(  true
                ,$notificacion->id_notificacion_usuario
                ,Lang::get('messages.request_guardar')
                );
                
            }

        }catch (\Exception $th) {
            Log::error($th);
            DB::rollback();
            return new RespuestaModel(false,  null, $th);
        }

    }
    
}
