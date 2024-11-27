<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Lang;
use Illuminate\Support\Facades\Log;

class CatDiasFestivosModel extends Model
{
    public $timestamps = false;
    protected $table = 'cat_dias_festivos';
    protected $primaryKey = 'id_dia_festivo';

    protected $fillable = [
        'nombre_dia_festivo',
        'fecha_dia_festivo',
        'numero_dias',
        'activo',
        'fecha_ultima_mod',
        'usuario_ultima_mod'
    ];

    protected $casts = [
        'fecha_dia_festivo' => 'date',
        'fecha_ultima_mod' => 'datetime',
    ];


    public function guardarDiaFestivo($parametros): RespuestaModel
    {
        $queryVal = $this::
            where(DB::raw("upper(nombre_dia_festivo)"), '=', strtoupper($parametros["nombre_dia_festivo"]))
            ->whereDate("fecha_dia_festivo", $parametros["fecha_dia_festivo"]);

        if (isset($parametros["id_dia_festivo"]) && $parametros["id_dia_festivo"] != null) {
            $queryVal->where('id_dia_festivo', '<>', $parametros["id_dia_festivo"]);
        }

        $existeCoincidencia = $queryVal->first();

        if ($existeCoincidencia != null) {
            return new RespuestaModel(false, null, Lang::get('messages.request_reg_existe'));
        }


        DB::beginTransaction();
        try {
            if ($parametros["id_dia_festivo"])
            $datoGuardar = $this::find($parametros["id_dia_festivo"]);

            if (!isset($datoGuardar)) {
                $datoGuardar = new CatDiasFestivosModel();
                $datoGuardar->activo = true;
            } else {
                if (isset($parametros["activo"])) {
                    $datoGuardar->activo = $parametros["activo"];
                }
            }

            if (isset($parametros["nombre_dia_festivo"])) {
                $datoGuardar->nombre_dia_festivo = $parametros["nombre_dia_festivo"];
            }

            if (isset($parametros["fecha_dia_festivo"])) {
                $datoGuardar->fecha_dia_festivo = $parametros["fecha_dia_festivo"];
            }

            $datoGuardar->fecha_ultima_mod = Carbon::now();
            $datoGuardar->usuario_ultima_mod = $parametros["idUsuario"];

            $datoGuardar->save();

            DB::commit();

            return new RespuestaModel(true,  $datoGuardar->id_rol, Lang::get('messages.request_guardar'));

        } catch (\Exception $th) {
            Log::error($th);
            DB::rollback();
            return new RespuestaModel(false,  null, $th);
        }
    }

    public function getDiasFestivos($params)
    {

       $queryList = DB::table('cat_dias_festivos as df')
           ->distinct()
           ->select('df.*');

        if (isset($params['nombre_dia_festivo']) && $params['nombre_dia_festivo'] != '') {
            $queryList->where(DB::raw("upper(df.nombre_dia_festivo)"), 'like', '%' . strtoupper($params["nombre_dia_festivo"]). '%');
        }

        if (isset($params['fecha_dia_festivo']) && $params['fecha_dia_festivo'] != '') {
            $queryList->whereDate('df.fecha_dia_festivo',$params['fecha_dia_festivo']);
        }

        if (isset($params['activo']) && $params['activo'] != '') {
            $queryList->where('df.activo',$params['activo']);
        }

        $pageSize = 10;

        if (isset($params['pageSize']) && $params['pageSize'] != '') {
           $pageSize = $params["pageSize"];
        }

        $data = $queryList->orderBy('df.id_dia_festivo')->paginate($pageSize);

        return $data;
    }

    public function cambiarEstatusDiaFestivo($parametros)
    {
        DB::beginTransaction();
        try {
            $datoGuardar = $this::find($parametros["id_dia_festivo"]);

            $datoGuardar->activo = $parametros["activo"];
            $datoGuardar->fecha_ultima_mod = Carbon::now();
            $datoGuardar->usuario_ultima_mod = $parametros["idUsuario"];

            $datoGuardar->save();

            DB::commit();

            return new RespuestaModel(true,  $datoGuardar->id_dia_festivo, Lang::get('messages.request_actualizar'));

        } catch (\Exception $th) {
            Log::error($th);
            DB::rollback();
            return new RespuestaModel(false,  null, $th);
        }
    }

    public function obtenerDiasFestivos()
    {
        $queryList = DB::table('cat_dias_festivos as df')
            ->distinct()
            ->select('df.fecha_dia_festivo','df.nombre_dia_festivo')
            ->where('df.activo','=',1);

        return $queryList->get();
    }

}
