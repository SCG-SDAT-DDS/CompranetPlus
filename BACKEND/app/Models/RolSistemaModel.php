<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Lang;
use Illuminate\Support\Facades\Log;

class RolSistemaModel extends Model
{

    public $timestamps = false;
    protected $table = 'det_roles_funcionalidades';
    protected $primaryKey = 'id_rol_funcionalidad';

    protected $fillable = [
        'id_rol',
        'id_funcionalidad',
        'activo',
        'fecha_ultima_mod',
        'usuario_ultima_mod'
    ];

    protected $casts = [
        'fecha_ultima_mod' => 'datetime',
    ];

    public function obtenerFuncionesRolesSistema($params)
    {
        $query = DB::table('cat_funcionalidades as f')
            ->leftJoin('det_roles_funcionalidades as fr', function($join)  use ($params) {
                $join->on('fr.id_funcionalidad', '=', 'f.id_funcionalidad')
                    ->where('fr.activo', true)
                    ->where('fr.id_rol', $params['idRol']);
            })
            ->distinct()
            ->orderBy('f.nombre_funcionalidad', 'desc')
            ->select('f.id_funcionalidad', 'f.nombre_funcionalidad', 'fr.activo');

        $data = $query->get();

        $resultado = Array();
        foreach ($data as $dat) {
            $temp = [
                "id" => $dat->id_funcionalidad,
                "nombre" => $dat->nombre_funcionalidad,
                "estatus" => $dat->activo,
                "loading" => false
            ];
            array_push($resultado, $temp);
        }

        return $resultado;
    }

    public function activarRolSistema($parametros): RespuestaModel
    {
       DB::beginTransaction();
        try {

            $queryVal = DB::table('det_roles_funcionalidades as rf')
                ->where("rf.id_rol", $parametros["idRol"])
                ->where("rf.id_funcionalidad", $parametros["idFuncion"])
                ->where("rf.activo", true);

            $existeCoincidencia = $queryVal->first();

            if ($existeCoincidencia != null) {
                $existeCoincidencia = $this->find($existeCoincidencia->id_rol_funcionalidad);
                $existeCoincidencia->activo = $parametros["estatus"];
                $existeCoincidencia->save();

                DB::commit();
                return new RespuestaModel(true, $existeCoincidencia->id_rol_funcionalidad, Lang::get('messages.request_actualizar'));
            } else {
                $datoGuardar = new RolSistemaModel();
                $datoGuardar->id_funcionalidad = $parametros["idFuncion"];
                $datoGuardar->id_rol = $parametros["idRol"];
                $datoGuardar->fecha_ultima_mod = Carbon::now();
                $datoGuardar->usuario_ultima_mod = $parametros["idUsuario"];
                $datoGuardar->activo = true;
                $datoGuardar->save();

                DB::commit();
                return new RespuestaModel(true,  $datoGuardar->id_rol, Lang::get('messages.request_guardar'));
            }

        } catch (\Exception $th) {
            Log::error($th);
            DB::rollback();
            return new RespuestaModel(false,  null, $th);
        }

    }
}
