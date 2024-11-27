<?php

namespace App\Models;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Lang;
use Illuminate\Support\Facades\Log;


class DetalleBitacoraModel extends Model
{
    public $timestamps = false;

    protected $table = 'det_bitacora';
    protected $primaryKey = 'id_bitacora';

    protected $fillable = [
        'id_rol',
        'id_usuario',
        'fecha_accion',
        'seccion_accion',
        'descripcion_accion',
        'valor_nuevo',
        'valor_anterior'
    ];



    public function buscarBitacoras($params)
    {
        $query = DB::table('det_bitacora as b')
            ->join('ms_usuarios as u','u.id_usuario','=','b.id_usuario')
            ->join('cat_roles as r','r.id_rol','=','b.id_rol')
            ->select('b.*','r.nombre_rol', 'u.nombre_usuario', 'u.primer_apellido_usuario', 'u.segundo_apellido_usuario')
            ->orderBy('b.id_bitacora','desc');


        if ($params["id_usuario"] != null) {
            $query->where('b.id_usuario', '=', $params["id_usuario"]);
        }


        if ($params["id_rol"] != null) {
            $query->where('b.id_rol', '=', $params["id_rol"]);
        }

        if ($params["fecha_accion_inicio"] != null) {
            $query->where(DB::raw('date(b.fecha_accion)'), '>=', $params["fecha_accion_inicio"]);

        }

        if ($params["fecha_accion_fin"] != null) {
            $query->where(DB::raw('date(b.fecha_accion)'), '<=', $params["fecha_accion_fin"]);

        }


        $data = $query->get();

        return $data;
    }


    public function guardarBitacora($parametros): RespuestaModel
    {
        //return new RespuestaModel(true,  1, Lang::get('messages.request_guardar'));

        DB::beginTransaction();
        try {


            $datoGuardar = new DetalleBitacoraModel();

            if (isset($parametros->id_usuario)) {
                $datoGuardar->id_usuario = $parametros->id_usuario;

                $queryRol = DB::table('ms_usuarios as u')
                    ->select('u.id_rol')
                    ->where('u.id_usuario','=',$datoGuardar->id_usuario);

                $rolGuardar = $queryRol->first();

                $datoGuardar->id_rol = $rolGuardar->id_rol;

            }
            if (isset($parametros->seccion_accion)) {
                $datoGuardar->seccion_accion = $parametros->seccion_accion;
            }
            if (isset($parametros->descripcion_accion)) {
                $datoGuardar->descripcion_accion = $parametros->descripcion_accion;
            }

            if (isset($parametros->valor_nuevo)) {
                $datoGuardar->valor_nuevo = $parametros->valor_nuevo;
            }
            if (isset($parametros->valor_anterior)) {
                $datoGuardar->valor_anterior = $parametros->valor_anterior;
            }
            $datoGuardar->fecha_accion = Carbon::now();

            $datoGuardar->save();

            DB::commit();


            return new RespuestaModel(true,  $datoGuardar->id_bitacora, Lang::get('messages.request_guardar'));

        } catch (\Exception $th) {
            Log::error($th);
            DB::rollback();
            return new RespuestaModel(false,  null, $th->getMessage());
        }

    }





}
