<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Lang;

class CatUnidadesCompradorasADExtemporaneoModel extends Model{

    public $timestamps = false;

    protected $table = 'cat_unidades_compradoras_ad_extemporanea';
    protected $primaryKey = 'id_cat_unidades_compradoras_ad_extemporanea';
    protected $fillable = [
        'fecha_otorgado',
        'fecha_inicio_periodo',
        'fecha_fin_periodo',
        'activo',
        'fecha_ultima_mod',
        'usuario_ultima_mod',
        'id_unidad_compradora',
        'estatus_periodo',
    ];
    protected $casts = [
        'fecha_otorgado' => 'datetime',
        'fecha_inicio_periodo' => 'date',
        'fecha_fin_periodo' => 'date',
        'fecha_ultima_mod' => 'datetime',
    ];

    public function getCatUnidadesCompradorasADExtemporanea($params = []){
        try{
            $queryList = $this->where('activo',true);
            $strSelectEstatus = "if(estatus_periodo is null, if(curdate() <= fecha_fin_periodo, true,false ), false ) as estatus_periodo";
            $queryList->selectRaw('cat_unidades_compradoras_ad_extemporanea.*, '.$strSelectEstatus);
            if(isset($params['id_unidad_compradora']) && $params['id_unidad_compradora'] != ''){
                $queryList->where('id_unidad_compradora',$params['id_unidad_compradora']);
            }
            return $queryList->get();
        }catch (\Exception $th) {
            //Log::error($th);
            Log::info('****** CatUnidadesCompradorasADExtemporaneoModel->getCatUnidadesCompradorasADExtemporanea');
            Log::error($th->getMessage());
            Log::error($th->getFile());
            Log::error($th->getLine());
            DB::rollback();
            return new RespuestaModel(false,  null, $th);
        }
    }

    public function guardarUnidadCompradoraADExtemporanea($params){
        $existeRegistro = $this::where('fecha_inicio_periodo',$params['fecha_inicio_periodo'])
            ->where('activo',true)
            ->where('id_unidad_compradora',$params['id_unidad_compradora']);
        if(isset($params['id_cat_unidades_compradoras_ad_extemporanea']) && !is_null($params['id_cat_unidades_compradoras_ad_extemporanea'])){
            $existeRegistro = $existeRegistro->where('id_cat_unidades_compradoras_ad_extemporanea','<>',$params['id_cat_unidades_compradoras_ad_extemporanea'])->first();
            if($existeRegistro != null){
                return new RespuestaModel(false, null, Lang::get('messages.request_reg_existe'));
            }
            return $this->actualizarUnidadCompradoraADExtemporanea($params);
        }else{
            $existeRegistro = $existeRegistro->first();
            if($existeRegistro != null){
                return new RespuestaModel(false, null, Lang::get('messages.request_reg_existe'));
            }
            return $this->nuevaUnidadCompradoraADExtemporanea($params);
        }
    }

    private function nuevaUnidadCompradoraADExtemporanea($params){
        try{
            DB::beginTransaction();
            $unidadCompradoraADExtemporanea = new CatUnidadesCompradorasADExtemporaneoModel();
            $unidadCompradoraADExtemporanea->fecha_otorgado = Carbon::now();;
            $unidadCompradoraADExtemporanea->fecha_inicio_periodo = $params['fecha_inicio_periodo'];
            $unidadCompradoraADExtemporanea->fecha_fin_periodo = $params['fecha_fin_periodo'];
            $unidadCompradoraADExtemporanea->activo = true;
            $unidadCompradoraADExtemporanea->fecha_ultima_mod = Carbon::now();
            $unidadCompradoraADExtemporanea->usuario_ultima_mod =$params['id_usuario'];
            $unidadCompradoraADExtemporanea->id_unidad_compradora =$params['id_unidad_compradora'];
            $unidadCompradoraADExtemporanea->save();
            DB::commit();
            return new RespuestaModel(true,$unidadCompradoraADExtemporanea->id_cat_unidades_compradoras_ad_extemporanea, Lang::get('messages.request_guardar'));
        }catch (\Exception $th) {
            Log::error('***** CatUnidadesCompradorasADExtemporaneaModel->nuevaUnidadCompradoraADExtemporanea');
            Log::error($th->getMessage());
            Log::error($th->getFile());
            Log::error($th->getLine());
            DB::rollback();
            return new RespuestaModel(false,  null, $th);
        }
    }

    public function actualizarUnidadCompradoraADExtemporanea($params){
        try{
            DB::beginTransaction();
            $unidadCompradoraADExtemporanea = CatUnidadesCompradorasADExtemporaneoModel::find($params['id_cat_unidades_compradoras_ad_extemporanea']);
            //este elemento se retira dado que la fecha de otorgamiento solo es en el insertar registro
            //isset($params['fecha_otorgado']) ? $unidadCompradoraADExtemporanea->fecha_otorgado = $params['fecha_otorgado'] : false;
            isset($params['fecha_inicio_periodo']) ? $unidadCompradoraADExtemporanea->fecha_inicio_periodo = $params['fecha_inicio_periodo'] : false;
            isset($params['fecha_fin_periodo']) ? $unidadCompradoraADExtemporanea->fecha_fin_periodo = $params['fecha_fin_periodo'] : false;
            isset($params['activo']) ? $unidadCompradoraADExtemporanea->activo = $params['activo'] : false;
            isset($params['estatus_periodo']) ? $unidadCompradoraADExtemporanea->estatus_periodo = $params['estatus_periodo'] : false;
            $unidadCompradoraADExtemporanea->fecha_ultima_mod = Carbon::now();
            $unidadCompradoraADExtemporanea->usuario_ultima_mod =$params['id_usuario'];
            $unidadCompradoraADExtemporanea->save();
            DB::commit();
            return new RespuestaModel(true,$unidadCompradoraADExtemporanea->id_cat_unidades_compradoras_ad_extemporanea, Lang::get('messages.request_guardar'));
        }catch (\Exception $th) {
            Log::error('***** CatUnidadesCompradorasModelADExtemporanea->actualizarUnidadCompradoraADExtemporanea');
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
