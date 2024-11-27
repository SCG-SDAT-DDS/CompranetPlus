<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Lang;

class CatUnidadesCompradorasModel extends Model{

    public $timestamps = false;

    protected $table = 'cat_unidades_compradoras';
    protected $primaryKey = 'id_unidad_compradora';
    protected $fillable = [
        'nombre_unidad_compradora',
        'clave_unidad_compradora',
        'pagina_web',
        'nombre_vialidad',
        'id_estado',
        'id_municipio',
        'codigo_postal',
        'nombre_responsable',
        'puesto',
        'telefono',
        'correo',
        'activo',
        'fecha_ultima_mod',
        'usuario_ultima_mod'
    ];
    protected $casts = [
        'fecha_ultima_mod' => 'datetime',
    ];

    public function getCatUnidadesCompradoras($params = []){
        try{
            $queryList = $this->where('activo',true);
            if(isset($params['descripcion_cuc']) && $params['descripcion_cuc'] != ''){
                $queryList->where(function($query) use($params){
                    $query->orWhere('nombre_unidad_compradora','like','%'.$params['descripcion_cuc'].'%');
                    $query->orWhere('clave_unidad_compradora','like','%'.$params['descripcion_cuc'].'%');
                });
            }if(isset($params['id_unidad_responsable']) && $params['id_unidad_responsable'] != ''){
                $queryList->where('id_unidad_responsable',$params['id_unidad_responsable']);
            }
            return $queryList->with('catUnidadesResponsables')->get();
        }catch (\Exception $th) {
            //Log::error($th);
            Log::info('****** CatUnidadesCompradorasModel->getCatUnidadesCompradoras');
            Log::error($th->getMessage());
            Log::error($th->getFile());
            Log::error($th->getLine());
            DB::rollback();
            return new RespuestaModel(false,  null, $th);
        }
    }

    public function catUnidadesResponsables(){
        return $this->hasOne('App\Models\CatUnidadesResponsablesModel','id_unidad_responsable','id_unidad_responsable');
    }

    public function guardarUnidadCompradora($params){
        $existeRegistro = $this::where(DB::raw("upper(clave_unidad_compradora)"), '=', strtoupper($params['clave_unidad_compradora']))
            ->where('activo',true);
        if(isset($params['id_unidad_compradora']) && !is_null($params['id_unidad_compradora'])){
            $existeRegistro = $existeRegistro->where('id_unidad_compradora','<>',$params['id_unidad_compradora'])->first();
            if($existeRegistro != null){
                return new RespuestaModel(false, null, Lang::get('messages.request_reg_existe'));
            }
            return $this->actualizarUnidadCompradora($params);
        }else{
            $existeRegistro = $existeRegistro->first();
            if($existeRegistro != null){
                return new RespuestaModel(false, null, Lang::get('messages.request_reg_existe'));
            }
            return $this->nuevaUnidadCompradora($params);
        }
    }

    private function nuevaUnidadCompradora($params){
        try{
            DB::beginTransaction();
            $unidadCompradora = new CatUnidadesCompradorasModel();
            $unidadCompradora->clave_unidad_compradora = $params['clave_unidad_compradora'];
            $unidadCompradora->nombre_unidad_compradora = $params['nombre_unidad_compradora'];
            $unidadCompradora->id_unidad_responsable = $params['id_unidad_responsable'];
            $unidadCompradora->pagina_web = $params['pagina_web'];
            $unidadCompradora->nombre_vialidad = $params['nombre_vialidad'];
            $unidadCompradora->id_estado = $params['id_estado'];
            $unidadCompradora->id_municipio = $params['id_municipio'];
            $unidadCompradora->codigo_postal = $params['codigo_postal'];
            $unidadCompradora->nombre_responsable = $params['responsable'];
            $unidadCompradora->puesto = $params['puesto'];
            $unidadCompradora->correo = $params['correo'];
            $unidadCompradora->telefono = $params['telefono'];
            $unidadCompradora->activo = true;
            $unidadCompradora->fecha_ultima_mod = Carbon::now();
            $unidadCompradora->usuario_ultima_mod =$params['id_usuario'];
            $unidadCompradora->save();
            DB::commit();
            return new RespuestaModel(true,$unidadCompradora->id_unidad_compradora, Lang::get('messages.request_guardar'));
        }catch (\Exception $th) {
            Log::error('***** CatUnidadesCompradorasModel->nuevaUnidadCompradora');
            Log::error($th->getMessage());
            Log::error($th->getFile());
            Log::error($th->getLine());
            DB::rollback();
            return new RespuestaModel(false,  null, $th);
        }
    }

    public function actualizarUnidadCompradora($params){
        try{
            DB::beginTransaction();
            $unidadCompradora = CatUnidadesCompradorasModel::find($params['id_unidad_compradora']);
            isset($params['clave_unidad_compradora']) ? $unidadCompradora->clave_unidad_compradora = $params['clave_unidad_compradora'] : false;
            isset($params['nombre_unidad_compradora']) ? $unidadCompradora->nombre_unidad_compradora = $params['nombre_unidad_compradora'] : false;
            isset($params['id_unidad_responsable']) ? $unidadCompradora->id_unidad_responsable = $params['id_unidad_responsable'] : false;
            isset($params['pagina_web']) ? $unidadCompradora->pagina_web = $params['pagina_web'] : false;
            isset($params['nombre_vialidad']) ? $unidadCompradora->nombre_vialidad = $params['nombre_vialidad'] : false;
            isset($params['id_estado']) ? $unidadCompradora->id_estado = $params['id_estado'] : false;
            isset($params['id_municipio']) ? $unidadCompradora->id_municipio = $params['id_municipio'] : false;
            isset($params['codigo_postal']) ? $unidadCompradora->codigo_postal = $params['codigo_postal'] : false;
            isset($params['responsable']) ? $unidadCompradora->nombre_responsable = $params['responsable'] : false;
            isset($params['puesto']) ? $unidadCompradora->puesto = $params['puesto'] : false;
            isset($params['correo']) ? $unidadCompradora->correo = $params['correo'] : false;
            isset($params['telefono']) ? $unidadCompradora->telefono = $params['telefono'] : false;
            isset($params['activo']) ? $unidadCompradora->activo = $params['activo'] : false;
            $unidadCompradora->fecha_ultima_mod = Carbon::now();
            $unidadCompradora->usuario_ultima_mod =$params['id_usuario'];
            $unidadCompradora->save();
            DB::commit();
            return new RespuestaModel(true,$unidadCompradora->id_unidad_compradora, Lang::get('messages.request_guardar'));
        }catch (\Exception $th) {
            Log::error('***** CatUnidadesCompradorasModel->actualizarUnidadCompradora');
            Log::error($th->getMessage());
            Log::error($th->getFile());
            Log::error($th->getLine());
            //Log::error($th);
            DB::rollback();
            return new RespuestaModel(false,  null, $th);
        }
    }

    public function obtenerUnidadCompradora($params)
    {
        $query = DB::table('cat_unidades_compradora as cuc')
            ->join('cat_unidades_responsables as cur','cur.id_unidad_responsable','=','cuc.id_unidad_responsable')
            ->distinct()
            ->where('cuc.id_unidad_compradora','=',$params["id_unidad_compradora"])
            ->select('cuc.*');


        $data = $query->get();

        return $data;
    }

    public static function findByIdUsuario($idUsuario)
    {
        return DB::table('cat_unidad_compradora_ms_usuario as uni_usu')
            ->join('cat_unidades_compradoras as uni','uni.id_unidad_compradora','uni_usu.id_unidad_compradora')
            ->leftJoin('cat_unidades_responsables as ur','ur.id_unidad_responsable','=','uni.id_unidad_responsable')
            ->leftJoin('cat_tipos_unidades_responsables as ctur','ctur.id_tipo_unidad_responsable','=','ur.id_tipo_unidad_responsable')
            ->join('ms_usuarios as usu','usu.id_usuario','uni_usu.id_usuario')
            ->where('uni_usu.id_usuario', $idUsuario)
            ->where('uni.activo', true)
            ->where('usu.activo', true)
            ->where('uni_usu.activo', true)
            ->select('uni.*','ctur.id_tipo_unidad_responsable','ctur.tipo_unidad_responsable')->distinct()->get();
    }

    public static function obtenerUCompradoras($idUR)
    {
        return DB::table('cat_unidades_compradoras as uni')
            ->where('uni.activo', '=',true)
            ->where('uni.id_unidad_responsable', '=',$idUR)
            ->select('uni.*')->distinct()->get();
    }

    public function obtenerRelacionInteresParticipacion($idUnidadCompradora){

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
            ->where('mpa.id_unidad_compradora',$idUnidadCompradora)
            ->select('mpa.id_procedimiento_administrativo','dpp.id_participante_procedimiento','mp.id_proveedor','mpa.numero_procedimiento',
                'mpa.descripcion_concepto_contratacion','cur.siglas','cur.nombre_unidad_responsable','ctc.nombre_contratacion',
                'ctp.nombre_procedimiento','ctpj.nombre_personeria_juridica','mp.rfc_proveedor','mp.nombre_proveedor','mp.primer_apellido_proveedor',
                'mp.segundo_apellido_proveedor','mp.razon_social','mp.numero_cedula_profesional','mp.numero_registro_imss','mp.descripcion_giro_empresa',
                'mp.nombre_vialidad','mp.numero_exterior','mp.numero_interior','mp.nombre_colonia','cl.nombre_localidad','cm.nombre_municipio','ce.nombre_estado','mp.codigo_postal')
            ->get();

    }

}

?>
