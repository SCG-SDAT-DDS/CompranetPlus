<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Lang;
use Illuminate\Support\Facades\Log;

class FuncionSistemaModel extends Model
{

    public $timestamps = false;
    protected $table = 'cat_funcionalidades';
    protected $primaryKey = 'id_funcionalidad';

    protected $fillable = [
        'nombre_funcionalidad',
        'activo',
        'fecha_ultima_mod',
        'usuario_ultima_mod'
    ];

    protected $casts = [
        'fecha_ultima_mod' => 'datetime',
    ];

    public function buscarFuncionesSistema($params)
    {
        $query = DB::table('cat_funcionalidades as f')
            ->distinct()
            ->select('f.*');

        if ($params["nombre"] != null) {
            $query->where(DB::raw("upper(f.nombre_funcionalidad)"), 'like', '%' . strtoupper($params["nombre"]). '%');
        }

        if ($params["estatus"] === false || $params["estatus"] === true) {
            $query->where('f.activo', '=', $params["estatus"]);
        }

        $pageSize = 10;
        if (isset($params['pageSize']) && $params['pageSize'] != '') {
            $pageSize = $params["pageSize"];
        }
        $data = $query->paginate($pageSize);

        $resultado = [];
        foreach ($data as $dat) {
            $temp = [
                "id" => $dat->id_funcionalidad,
                "nombre" => $dat->nombre_funcionalidad,
                "estatus" => $dat->activo == 1,
                "id_padre" => $dat->id_funcionalidad_padre,
                "fechaModificacion" => $dat->fecha_ultima_mod,
            ];
            array_push($resultado, $temp);
        }

        return  [
            "total" => $data->total(),
            "datos" => $resultado,
            "per_page"=>$pageSize
        ];
    }

    public function guardarFuncionSistema($parametros): RespuestaModel
    {
        $queryVal = $this::
            where(DB::raw("upper(nombre_funcionalidad)"), '=', strtoupper($parametros["nombre"]));

        if (isset($parametros["id"]) && $parametros["id"] != null) {
            $queryVal->where('id_funcionalidad', '<>', $parametros["id"]);
        }

        $existeCoincidencia = $queryVal->first();

        if ($existeCoincidencia != null) {
            return new RespuestaModel(false, null, Lang::get('messages.request_reg_existe'));
        }


        DB::beginTransaction();
        try {
            if ($parametros["id"])
            $datoGuardar = $this::find($parametros["id"]);

            if (!isset($datoGuardar)) {
                $datoGuardar = new FuncionSistemaModel();
                $datoGuardar->activo = true;
            } else {
                if (isset($parametros["estatus"])) {
                    $datoGuardar->activo = $parametros["estatus"];
                }
            }

            if (isset($parametros["nombre"])) {
                $datoGuardar->nombre_funcionalidad = $parametros["nombre"];
            }

            $datoGuardar->fecha_ultima_mod = Carbon::now();
            $datoGuardar->usuario_ultima_mod = $parametros["idUsuario"];

            $datoGuardar->save();

            DB::commit();

            return new RespuestaModel(true,  $datoGuardar->id_funcionalidad, Lang::get('messages.request_guardar'));

        } catch (\Exception $th) {
            Log::error($th);
            DB::rollback();
            return new RespuestaModel(false,  null, $th);
        }

    }

    public function cambiarEstatusFuncionSistema($parametros)
    {
        DB::beginTransaction();
        try {
            $datoGuardar = $this::find($parametros["id"]);

            $datoGuardar->activo = $parametros["estatus"];
            $datoGuardar->fecha_ultima_mod = Carbon::now();
            $datoGuardar->usuario_ultima_mod = $parametros["idUsuario"];

            $datoGuardar->save();

            DB::commit();

            return new RespuestaModel(true,  $datoGuardar->id_funcionalidad, Lang::get('messages.request_actualizar'));

        } catch (\Exception $th) {
            Log::error($th);
            DB::rollback();
            return new RespuestaModel(false,  null, $th);
        }
    }

}
