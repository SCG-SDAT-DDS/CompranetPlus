<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Lang;

class DetReportesPublicoModel extends Model{

    protected $table = 'det_reportes_publico';

    protected $primaryKey = 'id_det_reportes_publico';

    public $timestamps = false;

    public function listado($params){
        try{
            $queryList = $this->where('id_det_reportes',$params['id_det_reportes']);
            $queryList->where('activo',true);
            return $queryList->get();
        }catch (\Exception $th) {
            Log::error('***** DetReportesPublicModel->listado');
            Log::error($th->getMessage());
            Log::error($th->getFile());
            Log::error($th->getLine());
            DB::rollback();
            return new RespuestaModel(false,  null, $th);
        }
    }

    public function reportebyId($idDetReportePublico){
        try{
            return $this->find($idDetReportePublico);
        }catch (\Exception $th) {
            Log::error('***** DetReportesPublicModel->reportebyId');
            Log::error($th->getMessage());
            Log::error($th->getFile());
            Log::error($th->getLine());
            DB::rollback();
            return new RespuestaModel(false,  null, $th);
        }
    }

    public function nuevoReporte($params){
        try{
            date_default_timezone_set('America/Hermosillo');
            DB::beginTransaction();
            $drp = new DetReportesPublicoModel();
            $drp->nombre_cliente = $params['nombre_cliente'];
            $drp->correo = $params['correo'];
            $drp->pin_descarga = $params['pin_descarga'];
            $drp->id_det_reportes = $params['id_det_reportes'];
            $drp->fecha = date('Y-m-d H:i:s');
            $drp->activo = true;
            $drp->save();
            DB::commit();
            return new RespuestaModel(true,$drp->id_det_reportes_publico, Lang::get('messages.request_guardar'));
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
            date_default_timezone_set('America/Hermosillo');
            DB::beginTransaction();
            $detReportes = DetReportesPublicoModel::find($params['id_det_reportes_publico']);
            isset($params['nombre_cliente']) ? $detReportes->nombre_cliente = $params['nombre_cliente'] : false;
            isset($params['correo']) ? $detReportes->correo = $params['correo'] : false;
            isset($params['pin_descarga']) ? $detReportes->pin_descarga = $params['pin_descarga'] : false;
            isset($params['id_det_reportes']) ? $detReportes->id_det_reportes = $params['id_det_reportes'] : false;
            isset($params['activo']) ? $detReportes->activo = $params['activo'] : false;
            $detReportes->fecha = date('Y-m-d H:i:s');
            $detReportes->save();
            DB::commit();
            return new RespuestaModel(true,$detReportes->id_det_reportes_publico, Lang::get('messages.request_guardar'));
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
