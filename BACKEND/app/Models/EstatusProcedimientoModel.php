<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;


class EstatusProcedimientoModel extends Model
{

    public $timestamps = false;
    protected $table = 'cat_estatus_procedimientos';
    protected $primaryKey = 'id_estatus_procedimiento';

    protected $fillable = [
        'nombre_estatus_procedimiento',
        'estilo',
        'activo',
        'fecha_ultima_mod',
        'usuario_ultima_mod'
    ];

    protected $casts = [
        'fecha_ultima_mod' => 'datetime',
    ];

    public function obtenerEstatusProcedimiento($params)
    {

        $idsEstatus = [];

        if($params["id_estatus_procedimiento"] == 1){
            array_push($idsEstatus, 4);
        }
        if($params["id_estatus_procedimiento"] == 2){
            array_push($idsEstatus, 5);
        }
        if($params["id_estatus_procedimiento"] == 3){
            array_push($idsEstatus, 5);
            array_push($idsEstatus, 6);
        }
        if($params["id_estatus_procedimiento"] == 6){
            array_push($idsEstatus, 3);
        }


        $query = DB::table('cat_estatus_procedimientos as ta')
            ->distinct()
            ->whereIn('ta.id_estatus_procedimiento', $idsEstatus)
            ->select('ta.*');


        $data = $query->get();

        return $data;
    }

    public function listado(){
        return EstatusProcedimientoModel::where('activo',true)->get();
    }
}
