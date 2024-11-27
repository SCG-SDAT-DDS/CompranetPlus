<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Lang;

class DetReportesModel extends Model{

    protected $table = 'det_Reportes';
    protected $primaryKey = 'id_det_reportes';

    public $timestamps = false;

    public function getDetReportes($params = []){
        try{
            $queryList = $this->where('id_usuario',$params['id_usuario']);
            $queryList->where('activo',true);
            return $queryList->get();
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

    public function guardarReporte($params){
        if(isset($params['id_det_reportes']) && !is_null($params['id_det_reportes'])){
            return $this->actualizarReporte($params);
        }else{
            return $this->nuevoReporte($params);
        }
    }

    public function nuevoReporte($params){
        try{
            date_default_timezone_set('America/Mexico_City');
            DB::beginTransaction();
            $detReportes = new DetReportesModel();
            $detReportes->nombre_reporte = $params['nombre_reporte'];
            $detReportes->fecha = date('Y-m-d H:i:s');
            $detReportes->filtro = $params['filtro'];
            $detReportes->columnas = $params['columnas'];
            $detReportes->activo = true;
            $detReportes->id_usuario =$params['id_usuario'];
            $detReportes->save();
            DB::commit();
            return new RespuestaModel(true,$detReportes->id_det_reportes, Lang::get('messages.request_guardar'));
        }catch (\Exception $th) {
            Log::error('***** DetReportesModel->nuevoReporte');
            Log::error($th->getMessage());
            Log::error($th->getFile());
            Log::error($th->getLine());
            DB::rollback();
            return new RespuestaModel(false,  null, $th);
        }
    }

    public function actualizarReporte($params){
        try{
            date_default_timezone_set('America/Mexico_City');
            DB::beginTransaction();
            $detReportes = DetReportesModel::find($params['id_det_reportes']);
            isset($params['nombre_reporte']) ? $detReportes->nombre_reporte = $params['nombre_reporte'] : false;
            isset($params['filtro']) ? $detReportes->filtro = $params['filtro'] : false;
            isset($params['columnas']) ? $detReportes->columnas = $params['columnas'] : false;
            isset($params['activo']) ? $detReportes->activo = $params['activo'] : false;
            $detReportes->fecha = date('Y-m-d H:i:s');
            $detReportes->id_usuario =$params['id_usuario'];
            $detReportes->save();
            DB::commit();
            return new RespuestaModel(true,$detReportes->id_det_reportes, Lang::get('messages.request_guardar'));
        }catch (\Exception $th) {
            Log::error('***** DetReportesModel->actualizarReporte');
            Log::error($th->getMessage());
            Log::error($th->getFile());
            Log::error($th->getLine());
            //Log::error($th);
            DB::rollback();
            return new RespuestaModel(false,  null, $th);
        }
    }

}
