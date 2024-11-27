<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Lang;
use Illuminate\Support\Facades\Log;

class RolModel extends Model
{

    public $timestamps = false;
    protected $table = 'cat_roles';
    protected $primaryKey = 'id_rol';

    protected $fillable = [
        'nombre_rol',
        'activo',
        'fecha_ultima_mod',
        'usuario_ultima_mod'
    ];

    protected $casts = [
        'fecha_ultima_mod' => 'datetime',
    ];

    public function buscarRolesSistema($params)
    {
        $query = $this::select('*')
            ->distinct();

        if ($params["nombre"] != null) {
            $query->where(DB::raw("upper(nombre_rol)"), 'like', '%' . strtoupper($params["nombre"]). '%');
        }

        if ($params["omitir"] != null) {
 
            $query->where(DB::raw("upper(nombre_rol)"), '<>', strtoupper($params["omitir"]));

        }

        if ($params["estatus"] === false || $params["estatus"] === true) {
            $query->where('activo', '=', $params["estatus"]);
        }

        $data = $query->get();

        $resultado = Array();
        foreach ($data as $dat) {
            $temp = [
                "id" => $dat->id_rol,
                "nombre" => $dat->nombre_rol,
                "estatus" => $dat->activo == 1,
                "fechaModificacion" => $dat->fecha_ultima_mod,
            ];
            array_push($resultado, $temp);
        }

        return $resultado;
    }

    public function guardarRolSistema($parametros): RespuestaModel
    {
        $queryVal = $this::
            where(DB::raw("upper(nombre_rol)"), '=', strtoupper($parametros["nombre"]));

        if (isset($parametros["id"]) && $parametros["id"] != null) {
            $queryVal->where('id_rol', '<>', $parametros["id"]);
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
                $datoGuardar = new RolModel();
                $datoGuardar->activo = true;
            } else {
                if (isset($parametros["estatus"])) {
                    $datoGuardar->activo = $parametros["estatus"];
                }
            }

            if (isset($parametros["nombre"])) {
                $datoGuardar->nombre_rol = $parametros["nombre"];
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

    public function cambiarEstatusRolSistema($parametros): RespuestaModel
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
