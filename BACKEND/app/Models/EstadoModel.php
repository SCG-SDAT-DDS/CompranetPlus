<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;


class EstadoModel extends Model
{
    public $timestamps = false;

    protected $table = 'cat_estados';
    protected $primaryKey = 'id_estado';

    protected $fillable = [
        'clave estado',
        'abr_estado',
        'nombre_estado',
        'activo',
        'fecha_ultima_mod',
        'usuario_ultima_mod'
    ];
    protected $casts = [
        'fecha_ultima_mod' => 'datetime',
    ];

    public function getEstados($params){
        
        $query = DB::table('cat_estados as estado')
            ->distinct()
            ->select('estado.*');

        if ($params["nombreEstado"] != null) {
            $query->where(DB::raw("upper(estado.nombre_estado)")
                        , 'like', '%' . strtoupper($params["nombreEstado"]). '%');
        }
        if ($params["abrEstado"] != null) {
            $query->where(DB::raw("upper(estado.abr_estado)")
                        , 'like', '%' . strtoupper($params["abrEstado"]). '%');
        }

        $data = $query->get();

        $resultado = [];
        
        foreach ($data as $dat) {
            $temp = [
                "id" => $dat->id_estado,
                "abrEstado" => $dat->abr_estado,
                "nombre" => $dat->nombre_estado,
                "fechaModificacion" => $dat->fecha_ultima_mod,
            ];
            array_push($resultado, $temp);
        }

        return $resultado;
    }

    public function getEstadosById(){
        
        $query = DB::table('cat_estados as estado')
        ->distinct()
        ->select('estado.*')
        ->orderBy('estado.id_estado');


        $data = $query->get();

        $resultado = array();
        
        foreach ($data as $dat) {
            $temp = [
                "id" => $dat->id_estado,
                "estado" => $dat->nombre_estado,
            ];
            array_push($resultado, $temp);
        }

        return $resultado;
    }
}
