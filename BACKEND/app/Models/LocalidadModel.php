<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class LocalidadModel extends Model
{
    public $timestamps = false;
    protected $table = 'cat_localidades';
    protected $primaryKey = 'id_localidad';

    protected $fillable = [
        'clave_loclidad',
        'nombre_localidad',
        'latitud',
        'longitud',
        'altitud',
        'activo',
        'id_estado',
        'id_municipio',
        'fecha_ultima_mod',
        'usuario_ultima_mod'
    ];
    protected $casts = [
        'fecha_ultima_mod' => 'datetime',
    ];

    public function getLoclidad($params){
        

        $query = DB::table('cat_localidades as loc')
        ->distinct()
        ->leftJoin('cat_municipios as mcpio', 'loc.id_municipio', '=', 'mcpio.id_municipio')
        ->leftJoin('cat_estados as estado', 'mcpio.id_estado', '=', 'estado.id_estado')
        ->select(
            'loc.*',
            'estado.nombre_estado as nombre_estado',
            'mcpio.nombre_municipio as nombre_municipio'
        )
        ->orderBy('loc.id_localidad');

        if ($params["nombreLocalidad"] != null) {
            $query->where(DB::raw("upper(loc.nombre_localidad)")
                        , 'like', '%' . strtoupper($params["nombreLocalidad"]). '%');
        }
        
        if ($params["idEstado"] != null) {
            $query->where(DB::raw("estado.id_estado"), '=', $params["idEstado"]);
        }

        if ($params["idMunicipio"] != null) {
            $query->where(DB::raw("mcpio.id_municipio"), '=', $params["idMunicipio"]);
        }

        $pageSize = 10;

        if (isset($params['pageSize']) && $params['pageSize'] != '') {
            $pageSize = $params["pageSize"];
        }

        $data = $query->paginate($pageSize);

        $result = [];
        foreach ($data as $dat) {
            $temp = [
                "id" => $dat->id_localidad,
                "estado" => $dat->nombre_estado,
                "municipio" => $dat->nombre_municipio,
                "nombre" => $dat->nombre_localidad,
                "fechaModificacion" => $dat->fecha_ultima_mod,
            ];
            array_push($result, $temp);
        }

        return  [
            "total" => $data->total(),
            "datos" => $result,
            "per_page"=>$pageSize
        ];
    }
    
    public function getLocalidadesByMunicipio($params){
        $query = DB::table('cat_localidades as loc')
        ->distinct()
        ->select('loc.*');

        if ($params["id"] != null) {
            $query->where('loc.id_municipio',$params["id"]);
        }

        $data = $query->orderBy('loc.id_localidad')->get();

        $resultado = Array();
        
        foreach ($data as $dat) {
            $temp = [
                "id" => $dat->id_localidad,
                "localidad" => $dat->nombre_localidad,
            ];
            array_push($resultado, $temp);
        }

        return $resultado;
    }
}
