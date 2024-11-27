<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Lang;
use Illuminate\Support\Facades\Log;

class CatAsentamientosModel extends Model
{
    public $timestamps = false;

    protected $table = 'cat_asentamientos';
    protected $primaryKey = 'id_asentamiento';

    protected $fillable = [
        'codigo_postal',
        'nombre_asentamiento',
        'tipo_asentamiento',
        'id_estado',
        'id_municipio',
        'activo',
        'fecha_ultima_mod',
        'usuario_ultima_mod'
    ];
    protected $casts = [
        'fecha_ultima_mod' => 'datetime',
    ];

    public function getAsentamientos($params){

        $pageSize = 10;

        $query = DB::table('cat_asentamientos as cp')

        ->leftJoin('cat_municipios as mcpio', 'cp.id_municipio', '=', 'mcpio.id_municipio')
        ->leftJoin('cat_estados as estado', 'cp.id_estado', '=', 'estado.id_estado')
        ->distinct()
        ->select('cp.*','estado.nombre_estado as estado','mcpio.nombre_municipio as municipio');



        if ($params["activo"] !== null) {
            $query->where(DB::raw("cp.activo"), '=', $params["activo"]);
        }
        if ($params["idEstado"] != null) {
            $query->where(DB::raw("cp.id_estado"), '=', $params["idEstado"]);
        }

        if ($params["idMunicipio"] != null) {
            $query->where(DB::raw("cp.id_municipio"), '=', $params["idMunicipio"]);
        }
        if ($params["cp"] != null) {
            $query->where(DB::raw("cp.codigo_postal"),'like', $params["cp"]. '%');
        }

        if (isset($params['pageSize']) && $params['pageSize'] != '') {
            $pageSize = $params["pageSize"];
        }

        return $query->paginate($pageSize);


    }

    public function guardarAsentamiento($parametros) : RespuestaModel{

        $queryVal = $this::
            where(DB::raw("codigo_postal"), '=', $parametros["codigo_postal"])
            ->where('nombre_asentamiento', '=',  $parametros["nombre_asentamiento"]);

        if (isset($parametros["id_asentamiento"]) && $parametros["id_asentamiento"] != null) {
            $queryVal->where('id_asentamiento', '<>', $parametros["id_asentamiento"]);
        }

        $existeCoincidencia = $queryVal->first();

        if ($existeCoincidencia != null) {
            return new RespuestaModel(false, null, Lang::get('messages.request_reg_existe'));
        }

        DB::beginTransaction();
        try {

            if ($parametros["id_asentamiento"])
            $datoGuardar = $this::find($parametros["id_asentamiento"]);

            if (!isset($datoGuardar)) {
                $datoGuardar = new CatAsentamientosModel();
                $datoGuardar->activo = true;
            }
            else {
                if (isset($parametros["activo"])) {
                    $datoGuardar->activo = $parametros["activo"];
                }
            }
            if (isset($parametros["codigo_postal"])) {
                $datoGuardar->codigo_postal = $parametros["codigo_postal"];
            }
            if (isset($parametros["nombre_asentamiento"])) {
                $datoGuardar->nombre_asentamiento = $parametros["nombre_asentamiento"];
            }
            if (isset($parametros["tipo_asentamiento"])) {
                $datoGuardar->tipo_asentamiento = $parametros["tipo_asentamiento"];
            }
            if (isset($parametros["id_estado"])) {
                $datoGuardar->id_estado = $parametros["id_estado"];
            }
            if (isset($parametros["id_municipio"])) {
                $datoGuardar->id_municipio = $parametros["id_municipio"];
            }

            $datoGuardar->fecha_ultima_mod = Carbon::now();
            $datoGuardar->usuario_ultima_mod = $parametros["idUsuario"];
            $datoGuardar->save();

            DB::commit();

            return new RespuestaModel(true,  $datoGuardar->id_asentamiento , Lang::get('messages.request_guardar'));
        }catch (\Exception $th) {
            Log::error($th);
            DB::rollback();
            return new RespuestaModel(false,  null, $th);
        }
    }

    public function cambiarEstatusAsentamiento($parametros)
    {
        DB::beginTransaction();
        try {
            $datoGuardar = $this::find($parametros["id_asentamiento"]);

            $datoGuardar->activo = $parametros["activo"];
            $datoGuardar->fecha_ultima_mod = Carbon::now();
            $datoGuardar->usuario_ultima_mod = $parametros["idUsuario"];

            $datoGuardar->save();

            DB::commit();

            return new RespuestaModel(true,  $datoGuardar->id_asentamiento, Lang::get('messages.request_actualizar'));

        } catch (\Exception $th) {
            Log::error($th);
            DB::rollback();
            return new RespuestaModel(false,  null, $th);
        }
    }

    public function obtenerAsentamientoByCP($params)
    {
        $query = DB::table('cat_asentamientos as ca')
            ->join('cat_municipios as cm', 'cm.id_municipio', '=', 'ca.id_municipio')
            ->join('cat_estados as ce', 'ce.id_estado','=','ca.id_estado')
            ->select('ca.id_asentamiento','ca.nombre_asentamiento','ca.codigo_postal','cm.id_municipio','cm.nombre_municipio','ce.id_estado','ce.nombre_estado')
            ->where('ca.codigo_postal','=',$params['codigo_postal'])
            ->orderBy('ca.nombre_asentamiento')
            ->distinct();

        $data = $query -> get();

        if (count($data) > 0) {
            // Obtener datos de localidades
            $localidadesQuery = DB::table('cat_localidades as cl')
                ->select('cl.id_localidad', 'cl.nombre_localidad', 'cl.id_municipio')
                ->where('cl.id_municipio', '=', $data[0]->id_municipio)
                ->orderBy('cl.nombre_localidad')
                ->get();

            $uniqueLocalidades = $localidadesQuery->unique('nombre_localidad');
            $localidades = [];

            foreach ($uniqueLocalidades as $localidad) {
                $localidades[] = [
                    'id' => $localidad->id_localidad,
                    'localidad' => $localidad->nombre_localidad,
                ];
            }

            $result = [
                'id_estado' => $data[0]->id_estado ?? null,
                'nombre_estado' => $data[0]->nombre_estado ?? null,
                'id_municipio' => $data[0]->id_municipio ?? null,
                'nombre_municipio' => $data[0]->nombre_municipio ?? null,
                'asentamientos' => [],
                'localidades' => $localidades
            ];

            foreach ($data as $row) {
                $result['asentamientos'][] = [
                    'id_asentamiento' => $row->id_asentamiento,
                    'nombre_asentamiento' => $row->nombre_asentamiento,
                    'codigo_postal' => $row->codigo_postal
                ];
            }

            return $result;
        }else{
            return ['mensaje' => 'No se encontraron datos para el código postal proporcionado'];
        }
    }
}
