<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Lang;

class MsCostosIncripcionesModel extends Model{

    public $timestamps = false;

    protected $table = 'ms_costos_inscripciones';
    protected $primaryKey = 'id_costo_inscripcion';
    protected $fillable = [
        'anio',
        'costo_inscripcion',
        'activo',
        'id_tipo_procedimiento',
        'fecha_ultima_mod',
        'usuario_ultima_mod'
    ];
    protected $casts = [
        'fecha_ultima_mod' => 'datetime',
    ];

    public function getMsCostosInscripciones($params = []){
        try{
            $queryList = $this->where('activo',true);
            if(isset($params['descripcion']) && $params['descripcion'] != ''){
                $queryList->where(function($query) use($params){
                    $query->orWhere('anio','like','%'.$params['descripcion'].'%');
                    $query->orWhere('costo_inscripcion','like','%'.$params['descripcion'].'%');
                });
            }if($params['id_tipo_procedimiento']){
                $queryList->where('id_tipo_procedimiento',$params['id_tipo_procedimiento']);
            }
            return $queryList->with('catTiposProcedimientos')->get();
        }catch (\Exception $th) {
            //Log::error($th);
            Log::info('****** MsCostosInscripcionesModel->getCatUnidadesCompradoras');
            Log::error($th->getMessage());
            Log::error($th->getFile());
            Log::error($th->getLine());
            DB::rollback();
            return new RespuestaModel(false,  null, $th);
        }
    }

    public function getMsCostosInscripcionesActuales($params = []){
        try{
            $anioActual = date("Y");
            $queryList = $this->where('activo',true);
            $queryList->where('anio','=',$anioActual);
            if($params['id_tipo_procedimiento']){
                $queryList->where('id_tipo_procedimiento',$params['id_tipo_procedimiento']);
            }
            return $queryList->with('catTiposProcedimientos')->get();
        }catch (\Exception $th) {
            //Log::error($th);
            Log::info('****** MsCostosInscripcionesModel->getCatUnidadesCompradoras');
            Log::error($th->getMessage());
            Log::error($th->getFile());
            Log::error($th->getLine());
            DB::rollback();
            return new RespuestaModel(false,  null, $th);
        }
    }


    public function catTiposProcedimientos(){
        return $this->hasOne('App\Models\CatTiposProcedimientosModel','id_tipo_procedimiento','id_tipo_procedimiento');
    }

    public function guardarCostoInscripcion($params){
        //validar con usuario lo del costo de participación para este caso
        if(isset($params['id_costo_inscripcion']) && !is_null($params['id_costo_inscripcion'])){
            return $this->actualizarCostoInscripcion($params);
        }else{
            return $this->nuevoCostoInscripcion($params);
        }
    }

    private function nuevoCostoInscripcion($params){
        try{
            DB::beginTransaction();
            $costoInscripcion = new MsCostosIncripcionesModel();
            $costoInscripcion->id_tipo_procedimiento = $params['id_tipo_procedimiento'];
            $costoInscripcion->anio = $params['anio'];
            $costoInscripcion->presupuesto_autorizado = $params['presupuesto_autorizado'];
            $costoInscripcion->costo_inscripcion = $params['costo_inscripcion'];
            $costoInscripcion->activo = true;
            $costoInscripcion->fecha_ultima_mod = Carbon::now();
            $costoInscripcion->usuario_ultima_mod =$params['id_usuario'];
            $costoInscripcion->save();
            DB::commit();
            return new RespuestaModel(true,$costoInscripcion->id_unidad_compradora, Lang::get('messages.request_guardar'));
        }catch (\Exception $th) {
            Log::error('***** MsCostosInscripcionesModel->nuevaUnidadCompradora');
            Log::error($th->getMessage());
            Log::error($th->getFile());
            Log::error($th->getLine());
            DB::rollback();
            return new RespuestaModel(false,  null, $th);
        }
    }

    public function actualizarCostoInscripcion($params){
        try{
            DB::beginTransaction();
            $costoInscripcion = MsCostosIncripcionesModel::find($params['id_costo_inscripcion']);
            isset($params['id_tipo_procedimiento']) ? $costoInscripcion->id_tipo_procedimiento = $params['id_tipo_procedimiento'] : false;
            isset($params['anio']) ? $costoInscripcion->anio = $params['anio'] : false;
            isset($params['presupuesto_autorizado']) ? $costoInscripcion->presupuesto_autorizado = $params['presupuesto_autorizado'] : false;
            isset($params['costo_inscripcion']) ? $costoInscripcion->costo_inscripcion = $params['costo_inscripcion'] : false;
            isset($params['activo']) ? $costoInscripcion->activo = $params['activo'] : false;
            $costoInscripcion->fecha_ultima_mod = Carbon::now();
            $costoInscripcion->usuario_ultima_mod =$params['id_usuario'];
            $costoInscripcion->save();
            DB::commit();
            return new RespuestaModel(true,$costoInscripcion->id_unidad_compradora, Lang::get('messages.request_guardar'));
        }catch (\Exception $th) {
            Log::error('***** MsCostosInscripcionesModel->actualizarcostoInscripcion');
            Log::error($th->getMessage());
            Log::error($th->getFile());
            Log::error($th->getLine());
            //Log::error($th);
            DB::rollback();
            return new RespuestaModel(false,  null, $th);
        }
    }

}

?>
