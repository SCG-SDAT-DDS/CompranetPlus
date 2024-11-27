<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Lang;

class CatUnidadesResponsablesModel extends Model{

    public $timestamps = false;

    protected $table = 'cat_unidades_responsables';
    protected $primaryKey = 'id_unidad_responsable';
    protected $fillable = [
        'nombre_unidad_responsable',
        'id_tipo_unidad_responsable',
        'activo',
        'fecha_ultima_mod',
        'usuario_ultima_mod'
    ];
    protected $casts = [
        'fecha_ultima_mod' => 'datetime',
    ];

    public function getCatUnidadesResponsables($params = []){
        try{
            $queryList = $this->where('activo',true);
            if(isset($params['descripcion_cur']) && $params['descripcion_cur'] != '' ){
                $queryList->where(function($query) use($params){
                    $query->orWhere('nombre_unidad_responsable','like','%'.$params['descripcion_cur'].'%');
                    $query->orWhere('siglas','like','%'.$params['descripcion_cur'].'%');
                    $query->orWhere('id_tipo_unidad_responsable',$params['descripcion_cur']);
                });
            }if(isset($params['id_tipo_unidad_responsable']) && $params['id_tipo_unidad_responsable'] != '' ){
                $queryList->where('id_tipo_unidad_responsable',$params['id_tipo_unidad_responsable']);
            }
            return $queryList->with('catTipoUnidadesResponsables')->get();
        }catch (\Exception $th) {
            //Log::error($th);
            Log::info('****** CatUnidadesResponsablesModel->getCatUnidadesResponsables');
            Log::error($th->getMessage());
            Log::error($th->getFile());
            Log::error($th->getLine());
            DB::rollback();
            return new RespuestaModel(false,  null, $th);
        }
    }

    public function catTipoUnidadesResponsables(){
        return $this->hasOne('App\Models\CatTipoUnidadesResponsablesModel','id_tipo_unidad_responsable','id_tipo_unidad_responsable');
    }

    public function guardarUnidadResponsable($params){
        $existeRegistro = $this::where(DB::raw("upper(siglas)"), '=', strtoupper($params['siglas']))
            ->where('activo',true);
        if(isset($params['id_unidad_responsable']) && !is_null($params['id_unidad_responsable'])){
            $existeRegistro = $existeRegistro->where('id_unidad_responsable','<>',$params['id_unidad_responsable'])->first();
            if($existeRegistro != null){
                return new RespuestaModel(false, null, Lang::get('messages.request_reg_existe'));
            }
            return $this->actualizarUnidadResponsable($params);
        }else{
            $existeRegistro = $existeRegistro->first();
            if($existeRegistro != null){
                return new RespuestaModel(false, null, Lang::get('messages.request_reg_existe'));
            }
            return $this->nuevaUnidadResponsable($params);
        }
    }

    private function nuevaUnidadResponsable($params){
        try{
            DB::beginTransaction();
            $unidadResponsable = new CatUnidadesResponsablesModel();
            $unidadResponsable->nombre_unidad_responsable = $params['nombre_unidad_responsable'];
            $unidadResponsable->siglas = $params['siglas'];
            $unidadResponsable->id_tipo_unidad_responsable = $params['id_tipo_unidad_responsable'];
            $unidadResponsable->activo = true;
            $unidadResponsable->fecha_ultima_mod = Carbon::now();
            $unidadResponsable->usuario_ultima_mod =$params['id_usuario'];
            $unidadResponsable->save();
            DB::commit();
            return new RespuestaModel(true,$unidadResponsable->id_unidad_responsable, Lang::get('messages.request_guardar'));
        }catch (\Exception $th) {
            Log::error($th);
            DB::rollback();
            return new RespuestaModel(false,  null, $th);
        }
    }

    public function actualizarUnidadResponsable($params){
        try{
            DB::beginTransaction();
            $unidadResponsable = CatUnidadesResponsablesModel::find($params['id_unidad_responsable']);
            isset($params['nombre_unidad_responsable']) ? $unidadResponsable->nombre_unidad_responsable = $params['nombre_unidad_responsable'] : false;
            isset($params['siglas']) ? $unidadResponsable->siglas = $params['siglas'] : false;
            isset($params['id_tipo_unidad_responsable']) ? $unidadResponsable->id_tipo_unidad_responsable = $params['id_tipo_unidad_responsable'] : false;
            isset($params['activo']) ? $unidadResponsable->activo = $params['activo'] : false;
            $unidadResponsable->fecha_ultima_mod = Carbon::now();
            $unidadResponsable->usuario_ultima_mod =$params['id_usuario'];
            $unidadResponsable->save();
            DB::commit();
            return new RespuestaModel(true,$unidadResponsable->id_unidad_responsable, Lang::get('messages.request_guardar'));
        }catch (\Exception $th) {
            Log::error('***** CatUnidadesResponsablesModel->actualizarUnidadResponsable');
            Log::error($th->getMessage());
            Log::error($th->getFile());
            Log::error($th->getLine());
            //Log::error($th);
            DB::rollback();
            return new RespuestaModel(false,  null, $th);
        }
    }

    public static function findByIdUsuario($idUsuario)
    {
        return DB::table('cat_unidad_responsable_ms_usuario as uni_usu')
            ->join('cat_unidades_responsables as uni','uni.id_unidad_responsable','uni_usu.id_unidad_responsable')
            ->join('ms_usuarios as usu','usu.id_usuario','uni_usu.id_usuario')
            ->where('uni_usu.id_usuario', $idUsuario)
            ->where('uni.activo', true)
            ->where('usu.activo', true)
            ->where('uni_usu.activo', true)
            ->select('uni.*')->distinct()->get();
    }

}

?>
