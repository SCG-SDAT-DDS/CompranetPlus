<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;


class MunicipioModel extends Model
{
    public $timestamps = false;
    protected $table = 'cat_municipios';
    protected $primaryKey = 'id_municipio';

    protected $fillable = [
        'clave_municipio',
        'nombre_municipio',
        'id_estado',
        'activo',
        'fecha_ultima_mod',
        'usuario_ultima_mod'
    ];
    protected $casts = [
        'fecha_ultima_mod' => 'datetime',
    ];


    public function getMunicipio($params){
        
        $query = DB::table('cat_municipios as mcpio')
            ->distinct()
            ->leftJoin('cat_estados as estado', 'mcpio.id_estado', '=', 'estado.id_estado')
            ->select('mcpio.*', 'estado.nombre_estado as nombre_estado');

        if ($params["nombreMunicipio"] != null) {
            $query->where(DB::raw("upper(mcpio.nombre_municipio)")
            , 'like', '%' . strtoupper($params["nombreMunicipio"]) . '%');
        }

        if ($params["idEstado"] != null) {
            $query->where(DB::raw("mcpio.id_estado"), '=', $params["idEstado"]);
        }

        $pageSize = 10;
        if (isset($params['pageSize']) && $params['pageSize'] != '') {
            $pageSize = $params["pageSize"];
        }
        $data = $query->paginate($pageSize);

        $result = [];
        foreach ($data as $dat) {
            $temp = [
                "id" => $dat->id_municipio,
                "estado" => $dat->nombre_estado,
                "nombre" => $dat->nombre_municipio,
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


    public function getMunicipiosByEstado($params){
        
        $query = DB::table('cat_municipios as mcpio')
        ->distinct()
        ->select('mcpio.*');

        if ($params["id"] != null) {
            $query->where('mcpio.id_estado',$params["id"]);
        }

        $data = $query->orderBy('mcpio.nombre_municipio')->get();

        $resultado = [];
        
        foreach ($data as $dat) {
            $temp = [
                "id" => $dat->id_municipio,
                "municipio" => $dat->nombre_municipio,
            ];
            array_push($resultado, $temp);
        }

        return $resultado;
    }
}
