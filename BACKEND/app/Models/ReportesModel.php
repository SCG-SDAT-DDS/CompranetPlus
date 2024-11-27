<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Lang;

class ReportesModel extends Model{

    private $paramsFiltro;
    private $paramsColumns;

    private $msg;

    function __construct($filtro = [],$columns = []){
        $this->paramsFiltro = $filtro;
        $this->paramsColumns = empty($columns) ? $this->columnsAllBase() : $columns;
        $this->msg = '';
    }

    public function obtenerReporte(){
        try{
            $reporte = ReporteViewModel::select($this->paramsColumns);
            if(!empty($this->paramsFiltro)){
                $filtro = $this->paramsFiltro;
                $reporte->where(function($query) use ($filtro){
                    foreach($filtro as $columna => $valor){
                        Log::info('***** valor: '.$valor . ' - Columna: '.$columna);
                        if(!is_null($valor) && $valor != ''){
                            if(is_numeric($valor)){
                                $query->orWhere($columna,$valor);
                            }else{
                                $query->orWhere($columna,'like','%'.$valor.'%');
                            }
                        }
                    }
                });
            }

            return $reporte->get();
        }catch (\Exception $th) {
            //Log::error($th);
            Log::info('****** ReportesModel->obtenerReporte');
            Log::error($th->getMessage());
            Log::error($th->getFile());
            Log::error($th->getLine());
            DB::rollback();
            return new RespuestaModel(false,  null, $th->getMessage());
        }
    }

    public function obtenerReporteOLD(){

        return DB::table('ms_procedimientos_administrativos as mpa')
            ->join('det_participantes_procedimientos as dpp','dpp.id_procedimiento_administrativo','mpa.id_procedimiento_administrativo')
            ->join('cat_unidades_compradoras as cuc','cuc.id_unidad_compradora','mpa.id_unidad_compradora')
            ->join('cat_unidades_responsables as cur','cur.id_unidad_responsable','cuc.id_unidad_responsable')
            ->join('cat_tipos_contrataciones as ctc','ctc.id_tipo_contratacion','mpa.id_tipo_contratacion')
            ->join('cat_tipos_procedimientos as ctp','ctp.id_tipo_procedimiento','mpa.id_tipo_procedimiento')
            ->join('ms_proveedores as mp','mp.id_proveedor','dpp.id_proveedor')
            ->join('cat_estados as ce','ce.id_estado','mp.id_estado')
            ->join('cat_municipios as cm','cm.id_municipio','mp.id_municipio')
            ->join('cat_localidades as cl','cl.id_localidad','mp.id_localidad')
            ->join('cat_tipos_personerias_juridicas as ctpj','ctpj.id_tipo_personeria_juridica','mp.id_tipo_personeria_juridica')
            ->select('mpa.*','dpp.*','mp.*','mpa.numero_procedimiento',
                'mpa.descripcion_concepto_contratacion','cur.siglas','cur.nombre_unidad_responsable','ctc.nombre_contratacion',
                'ctp.nombre_procedimiento','ctpj.nombre_personeria_juridica','mp.rfc_proveedor','mp.nombre_proveedor','mp.primer_apellido_proveedor',
                'mp.segundo_apellido_proveedor','mp.razon_social','mp.numero_cedula_profesional','mp.numero_registro_imss','mp.descripcion_giro_empresa',
                'mp.nombre_vialidad','mp.numero_exterior','mp.numero_interior','mp.nombre_colonia','cl.nombre_localidad','cm.nombre_municipio','ce.nombre_estado','mp.codigo_postal')
            ->get();

    }

    public function actualizarReporte($params){
        try{
            date_default_timezone_set('America/Hermosillo');
            $actualizarReporte = true;
            if(isset($params['origen']) && $params['origen'] !== 'cron'){
                $msReporteModel = MsReportesModel::where('origen', $params['origen'])
                    ->whereDate('fecha_actualizacion', date('Y-m-d'))
                    ->first();
                $actualizarReporte = !is_object($msReporteModel);
            }
            if($actualizarReporte){
                $vistaCreadaActualizada = $this->createUpdateViewReporte();
                if($vistaCreadaActualizada){
                    //insertamos el registro de cuando esta actualizado el reporte
                    $msReporteModel = new MsReportesModel();
                    $msReporteModel->fecha_actualizacion = date('Y-m-d H:i:s');
                    $msReporteModel->origen = $params['origen'];
                    $msReporteModel->save();
                }
                return true;
            }else{
                $this->msg = Lang::get('messages.reportes.error.existe_hoy');
                return false;
            }
        }catch (\Exception $th) {
            //Log::error($th);
            Log::info('****** ReportesModel->actualizarReporte');
            Log::error($th->getMessage());
            Log::error($th->getFile());
            Log::error($th->getLine());
            $this->msg = Lang::get('messages.error.exception');
            return false;
        }

    }

    public function columnasReporteDisponibles(){
        try{
            return DB::select("show columns from reporte_vista where Field not LIKE 'id_%';");
        }catch (\Exception $th) {
            //Log::error($th);
            Log::info('****** ReportesModel->columnasReporteDisponibles');
            Log::error($th->getMessage());
            Log::error($th->getFile());
            Log::error($th->getLine());
            DB::rollback();
            return [];
        }
    }

    public function getMsg(){
        return $this->msg;
    }

    private function createUpdateViewReporte(){
        try{
            $queryCreateView = "create or replace view
                reporte_vista as ".$this->queryColumnsViews();
            DB::statement($queryCreateView);
            return true;
        }catch (\Exception $th) {
            //Log::error($th);
            Log::info('****** ReportesModel->createViewReporte');
            Log::error($th->getMessage());
            Log::error($th->getFile());
            Log::error($th->getLine());
            DB::rollback();
            return false;
        }
    }

    private function queryColumnsViews(){
        return "
            select
                if(mpa.numero_procedimiento is null,'Sin dato', mpa.numero_procedimiento) as numero_licitacion,
                cuc.id_unidad_responsable,
                cur.nombre_unidad_responsable as unidad_responsable,
                mpa.id_unidad_compradora,
                cuc.nombre_unidad_compradora as unidad_compradora,
                mpa.id_tipo_procedimiento,
                ctp.nombre_procedimiento as tipo_procedimiento,
                dpp.id_estatus_participacion as id_estatus_participacion,
                cepa.nombre_estatus_participacion as estatus_participacion,
                mpa.id_tipo_caracter_licitacion,
                if(mpa.id_tipo_caracter_licitacion is null,'Sin dato',ctcl.nombre_caracter_licitacion) as caracter,
                mpa.id_tipo_modalidad,
                if(mpa.id_tipo_modalidad is null, 'Sin dato',ctm.nombre_modalidad) as modalidad,
                mpa.id_estatus_procedimiento,
                cep.nombre_estatus_procedimiento as estatus_de_procedimiento,
                mpa.importe_autorizado as importe,
                if(mpa.capitulo is null, 'Sin dato',mpa.capitulo) as capitulo,
                if(mpa.proyecto is null, 'Sin dato',mpa.proyecto) as proyecto,
                if(mpa.partida is null, 'Sin dato',mpa.partida) as partida,
                mpa.numero_oficio_autorizacion as numero_oficio,
                if(ddc.fecha_publicacion is null, 'Sin dato',date_format(ddc.fecha_publicacion,'%d/%m/%Y')) as fecha_publicacion,
                if(ddc.fecha_limite_inscripcion is null, 'Sin dato',date_format(ddc.fecha_limite_inscripcion,'%d/%m/%Y')) as fecha_limite_inscripcion,
                if(ddc.fecha_visita_lugar is null, 'Sin dato',date_format(ddc.fecha_visita_lugar,'%d/%m/%Y')) as fecha_visita_lugar,
                if(ddc.descripcion_lugar is null, 'Sin dato',ddc.descripcion_lugar) as descripcion_lugar,
                if(ddc.fecha_junta_aclaraciones is null, 'Sin dato',date_format(ddc.fecha_junta_aclaraciones,'%d/%m/%Y')) as fecha_junta_aclaraciones,
                if(ddc.fecha_apertura is null, 'Sin dato',date_format(ddc.fecha_apertura,'%d/%m/%Y')) as fecha_apertura,
                if(ddc.fecha_fallo is null,'Sin dato',date_format(ddc.fecha_fallo,'%d/%m/%Y')) as fecha_fallo,
                if(ddc.diferendo_acto_apertura is null, false,true) as diferendo_acto_apertura,
                if(ddc.diferendo_acto_apertura is not null and ddc.diferendo_acto_apertura is true,'Si','No') as tiene_diferido_apertura,
                if(ddc.fecha_junta_aclaraciones_nueva is null, 'Sin dato',date_format(ddc.fecha_junta_aclaraciones_nueva,'%d/%m/%Y')) as fecha_junta_aclaraciones_nueva,
                if(ddc.fecha_limite_inscripcion_nueva is null, 'Sin dato',date_format(ddc.fecha_limite_inscripcion_nueva,'%d/%m/%Y')) as fecha_limite_inscripcion_nueva,
                if(ddc.fecha_apertura_nueva is null,'Sin dato',date_format(ddc.fecha_apertura_nueva,'%d/%m/%Y')) as fecha_apertura_nueva,
                if(ddc.fecha_inicio_obra_nueva is null,'Sin dato',date_format(ddc.fecha_inicio_obra_nueva,'%d/%m/%Y')) as fecha_inicio_obra_nueva,
                mp.id_estado,
                ce.nombre_estado as estado,
                mp.id_municipio,
                cm.nombre_municipio as municipio,
                mp.id_localidad,
                cl.nombre_localidad as localidad,
                mp.id_tipo_personeria_juridica,
                ctpj.nombre_personeria_juridica as personalidad_juridica,
                mpa.licitacion_recortada,
                if(mpa.licitacion_recortada is true,'Si','No') as tiene_licitacion_recortada,
                mpa.licitacion_tecnologia,
                if(mpa.licitacion_tecnologia is true,'Si','No') as tiene_licitacion_tecnologia,
                mpa.descripcion_concepto_contratacion as concepto,
                mp.rfc_proveedor as rfc,
                mp.razon_social as razon_social,
                mp.descripcion_giro_empresa as giro,
                mp.codigo_postal as codigo_postal
            from ms_procedimientos_administrativos mpa
                left join det_detalles_convocatorias ddc on ddc.id_procedimiento_administrativo = mpa.id_procedimiento_administrativo
                inner join det_participantes_procedimientos dpp on dpp.id_procedimiento_administrativo = mpa.id_procedimiento_administrativo
                inner join cat_unidades_compradoras cuc on cuc.id_unidad_compradora = mpa.id_unidad_compradora
                inner join cat_unidades_responsables cur on cur.id_unidad_responsable = cuc.id_unidad_responsable
                inner join cat_tipos_contrataciones ctc on ctc.id_tipo_contratacion = mpa.id_tipo_contratacion
                inner join cat_tipos_procedimientos ctp on ctp.id_tipo_procedimiento = mpa.id_tipo_procedimiento
                inner join cat_estatus_participaciones cepa on cepa.id_estatus_participacion = dpp.id_estatus_participacion
                left join cat_tipos_caracteres_licitaciones ctcl on ctcl.id_tipo_caracter_licitacion = mpa.id_tipo_caracter_licitacion
                left join cat_tipos_modalidades ctm on ctm.id_tipo_modalidad = mpa.id_tipo_modalidad
                inner join cat_estatus_procedimientos cep on cep.id_estatus_procedimiento = mpa.id_estatus_procedimiento
                inner join ms_proveedores mp on mp.id_proveedor = dpp.id_proveedor
                inner join cat_estados ce on ce.id_estado = mp.id_estado
                inner join cat_municipios cm on cm.id_municipio = mp.id_municipio
                inner join cat_localidades cl on cl.id_localidad = mp.id_localidad
                inner join cat_tipos_personerias_juridicas ctpj on ctpj.id_tipo_personeria_juridica = mp.id_tipo_personeria_juridica;";
    }

    private function columnsAllBase(){
        try{
            $columnsView = $this->columnasReporteDisponibles();
            $columns = [];
            foreach($columnsView as $column){
                $columns[] = $column->Field;
            }
            return $columns;
        }catch (\Exception $th) {
            //Log::error($th);
            Log::info('****** ReportesModel->createViewReporte');
            Log::error($th->getMessage());
            Log::error($th->getFile());
            Log::error($th->getLine());
            DB::rollback();
            return new RespuestaModel(false,  null, $th->getMessage());
        }
    }

}
