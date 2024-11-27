<?php

namespace App\Models;
use App\Helper\CorreosHelper;
use App\Helper\NotificacionesHelper;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Lang;
use Illuminate\Support\Facades\Log;


class DetParticipantesProcedimientosModel extends Model
{
    public $timestamps = false;

    protected $table = 'det_participantes_procedimientos';
    protected $primaryKey = 'id_participante_procedimiento';

    protected $fillable = [
        'id_procedimiento_administrativo',
        'id_proveedor',
        'id_tipo_participacion',
        'id_estatus_participacion',
        'fecha_inscripcion',
        'certificado_proveedor',
        'numero_certificado',
        'fecha_fallo',
        'url_archivo_acto_fallo',
        'activo',
        'fecha_ultima_mod',
        'usuario_ultima_mod'
    ];
    protected $casts = [
        'fecha_ultima_mod' => 'datetime',
    ];


    public function obtenerProcedimientosProveedor($params){

        if($params["usuarioId"] != null) {
            $query = DB::table('ms_proveedores as pro')
            ->where('pro.id_usuario', $params["usuarioId"])
            ->whereNotIn('pd.id_estatus_procedimiento', [1, 4])
            ->where('dpp.activo', 1)
            ->join('det_participantes_procedimientos as dpp', 'dpp.id_proveedor', '=', 'pro.id_proveedor')
            ->join('ms_procedimientos_administrativos as pd', 'pd.id_procedimiento_administrativo', '=', 'dpp.id_procedimiento_administrativo')
            ->leftJoin  ('cat_estatus_procedimientos as cp','pd.id_estatus_procedimiento','=', 'cp.id_estatus_procedimiento')
            ->leftJoin  ('cat_tipos_procedimientos as ct','pd.id_tipo_procedimiento','=', 'ct.id_tipo_procedimiento')
            ->leftJoin('det_detalles_convocatorias as dp','dp.id_procedimiento_administrativo','=','pd.id_procedimiento_administrativo')
            ->leftJoin('ms_costos_inscripciones as mc','mc.id_costo_inscripcion','=','dp.costo_bases')
            ->leftJoin('cat_unidades_compradoras as cuc','cuc.id_unidad_compradora','=','pd.id_unidad_compradora')
            ->leftJoin('cat_unidades_responsables as cur','cur.id_unidad_responsable','=','cuc.id_unidad_responsable')
            ->leftJoin('cat_tipos_unidades_responsables as ctur','ctur.id_tipo_unidad_responsable','=','cur.id_tipo_unidad_responsable')
            ->orderBy('dpp.id_participante_procedimiento','desc');

            $query->leftJoin('det_autorizacion_apertura as daa', function ($join) {
                $join->on('pd.id_procedimiento_administrativo', '=', 'daa.id_procedimiento_administrativo')
                     ->where('pd.id_estatus_procedimiento', '=', 3);
            })
            ->leftJoin('ms_preguntas_participantes as mp', function ($join) {
                $join->on('dpp.id_participante_procedimiento', '=', 'mp.id_participante_procedimiento')
                     ->where('pd.id_estatus_procedimiento', '=', 2);
            })

            ->leftJoin('cat_flujos_procedimientos as cf', function ($join) {
                $join->on('cf.id_flujo', '=', DB::raw('
                                                        CASE
                                                            WHEN pd.id_estatus_procedimiento = 7 THEN 6
                                                            WHEN pd.id_estatus_procedimiento = 5 THEN 0
                                                            WHEN pd.id_estatus_procedimiento =3 AND daa.id_autorizacion_apertura IS NULL THEN 4
                                                            WHEN pd.id_estatus_procedimiento =3 AND daa.id_autorizacion_apertura IS NOT NULL THEN 5
                                                            WHEN pd.id_estatus_procedimiento =2 AND dpp.pase_caja=1 AND pd.id_tipo_contratacion=1 THEN 3
                                                            WHEN pd.id_estatus_procedimiento =2 AND pd.id_tipo_contratacion=2 THEN 3
                                                            WHEN pd.id_estatus_procedimiento =2 AND mp.id_pregunta_participante IS NULL THEN 1
                                                            WHEN pd.id_estatus_procedimiento =2 AND mp.id_pregunta_participante IS NOT NULL AND pd.id_tipo_contratacion=1 THEN 2
                                                            ELSE 0
                                                        END
                                                    '));
            });
            $query->select(
                'pro.id_usuario',
            'pd.id_procedimiento_administrativo',
            'cp.nombre_estatus_procedimiento',
            'cp.estilo',
            'ct.nombre_procedimiento','ct.id_tipo_procedimiento as tipo_procedimiento',
            'pd.*',
            'cf.nombre_flujo_procedimiento as nombre_flujo_procedimiento',
            'dp.*',
            'dpp.id_participante_procedimiento',
            'dpp.pase_caja',
            'dp.fecha_junta_aclaraciones',
            'mc.*','ctur.id_tipo_unidad_responsable','ctur.tipo_unidad_responsable',
                DB::raw("'" . Carbon::now()->format('Y-m-d H:i:s') . "' as horaServidor")
            )->distinct(['dpp.id_participante_procedimiento']);

            if ($params["noProcedimiento"] != null) {
                $query->where(DB::raw("upper(pd.numero_procedimiento)"), 'like', '%' . strtoupper($params["noProcedimiento"]). '%');
            }

            if ($params["tipoProcedimientoId"] != null) {
                $query->where(DB::raw("pd.id_tipo_procedimiento"), '=', $params["tipoProcedimientoId"]);
            }

            if ($params["tipoEstatusId"] != null) {
                $query->where(DB::raw("pd.id_estatus_procedimiento"), '=', $params["tipoEstatusId"]);
            }

            $pageSize = 10;

            if (isset($params['pageSize']) && $params['pageSize'] != '') {
                $pageSize = $params["pageSize"];
            }

            return  $query->paginate($pageSize);

        }

        return "proveedorId es requerido!";

    }


    public function guardarInscripcionProveedor($parametros): RespuestaModel
    {
        if (isset($parametros["id_proveedor"])) {
            $id_proveedor = $parametros["id_proveedor"];
            $id_procedimiento_administrativo = $parametros["id_procedimiento_administrativo"];
            $queryVal = $this::where('id_proveedor', '=', $id_proveedor)
            ->where('id_procedimiento_administrativo', '=', $id_procedimiento_administrativo);
            $existeCoincidencia = $queryVal->exists(); // Verifica si existe una coincidencia
        }

        if ($existeCoincidencia) {
            return new RespuestaModel(false, null, Lang::get('messages.proveedores.inscripcion_exist'));
        }
        DB::beginTransaction();
        try {
            if ($parametros["id_participante_procedimiento"])
                $datoGuardar = $this::find($parametros["id_participante_procedimiento"]);

            if (!isset($datoGuardar)) {
                $datoGuardar = new DetParticipantesProcedimientosModel();
                $datoGuardar->activo = true;
                $datoGuardar->id_estatus_participacion = 1;
            } else {
                if (isset($parametros["activo"])) {
                    $datoGuardar->activo = $parametros["activo"];
                }
                if (isset($parametros["id_estatus_participacion"])) {
                    $datoGuardar->id_estatus_participacion = $parametros["id_estatus_participacion"];
                }
            }

            if (isset($parametros["id_procedimiento_administrativo"])) {
                $datoGuardar->id_procedimiento_administrativo = $parametros["id_procedimiento_administrativo"];
            }

            if (isset($parametros["id_proveedor"])) {
                $datoGuardar->id_proveedor = $parametros["id_proveedor"];

            }

            if (isset($parametros["id_tipo_participacion"])) {
                $datoGuardar->id_tipo_participacion = $parametros["id_tipo_participacion"];
            }
            if (isset($parametros["fecha_inscripcion"])) {
                $datoGuardar->fecha_inscripcion = $parametros["fecha_inscripcion"];
            }
            if (isset($parametros["certificado_proveedor"])) {
                $datoGuardar->certificado_proveedor = $parametros["certificado_proveedor"];
            }
            if (isset($parametros["numero_certificado"])) {
                $datoGuardar->numero_certificado = $parametros["numero_certificado"];
            }
            if (isset($parametros["fecha_fallo"])) {
                $datoGuardar->fecha_fallo = $parametros["fecha_fallo"];
            }
            if (isset($parametros["url_archivo_acto_fallo"])) {
                $datoGuardar->url_archivo_acto_fallo = $parametros["url_archivo_acto_fallo"];
            }

            $datoGuardar->fecha_ultima_mod = Carbon::now();
            //$datoGuardar->usuario_ultima_mod = $parametros["idUsuario"] ??  null;

            $datoGuardar->save();

            $proveedor = ProveedorModel::obtenerCorreoProveedor($datoGuardar->id_proveedor);
            NotificacionesHelper::insertNotificacion($proveedor->id_usuario,"Inscripcion a licitación ".$parametros["procedimiento"],"Ha sido inscrito como participante en la licitacion:".$parametros["procedimiento"]);

            DB::commit();

            $helpCorreo = new CorreosHelper();
            $helpCorreo->inscripcionProveedor($proveedor->correo_electronico, "INSCRIPCION A LICITACION",$proveedor->nombre_proveedor,$parametros["procedimiento"],0);


            return new RespuestaModel(true,  $datoGuardar->id_participante_procedimiento, Lang::get('messages.proveedores.inscripcion_success'));
        } catch (\Exception $th) {
            Log::error($th);
            DB::rollback();
            if (str_contains(strtolower($th->getMessage()), 'smtp')) {
                return new RespuestaModel(true, null, 'El servicio de Correos no está disponible por el momento');
            }
            return new RespuestaModel(false,  null,$th->getMessage());
        }
    }



}
