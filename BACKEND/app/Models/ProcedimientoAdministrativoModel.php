<?php

namespace App\Models;

use App\Helper\ArchivosHelper;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Lang;
use Illuminate\Support\Facades\Log;
use App\Enums\TipoArchivo;


class ProcedimientoAdministrativoModel extends Model
{

    public $timestamps = false;
    protected $table = 'ms_procedimientos_administrativos';
    protected $primaryKey = 'id_procedimiento_administrativo';

    protected $fillable = [
        'id_tipo_contratacion',
        'id_unidad_compradora',
        'id_tipo_procedimiento',
        'id_tipo_caracter_licitacion',
        'id_tipo_modalidad',
        'licitacion_recortada',
        'licitacion_tecnologia',
        'descripcion_concepto_contratacion',
        'numero_oficio_autorizacion',
        'importe_autorizado',
        'capitulo',
        'proyecto',
        'partida',
        'id_estatus_procedimiento',
        'numero_procedimiento',
        'numero_licitanet',
        'descripcion_normatividad',
        'numero_cotizaciones',
        'url_archivo_convocatoria',
        'url_archivo_bases',
        'url_archivo_oficio_autorizacion',
        'url_archivo_partidas',
        'url_archivo_acta_fallo',
        'activo',
        'fecha_ultima_mod',
        'usuario_ultima_mod'
    ];

    protected $casts = [
        'fecha_ultima_mod' => 'datetime',
    ];

    public function buscarProcedimientosAdministrativos($params)
    {
        $anioActual = date("Y");

        $query = DB::table('ms_procedimientos_administrativos as pa')
            ->join('cat_tipos_procedimientos as tp','pa.id_tipo_procedimiento','=','tp.id_tipo_procedimiento')
            ->join('cat_estatus_procedimientos as ep','ep.id_estatus_procedimiento','=','pa.id_estatus_procedimiento')
            ->leftJoin('cat_tipos_modalidades as ctm','ctm.id_tipo_modalidad','=','pa.id_tipo_modalidad')
            ->leftJoin('det_detalles_convocatorias as dc','dc.id_procedimiento_administrativo','=','pa.id_procedimiento_administrativo')
            ->leftJoin('cat_unidades_compradoras as uc', 'uc.id_unidad_compradora', '=', 'pa.id_unidad_compradora')
            ->leftJoin('cat_unidades_responsables as ur', 'ur.id_unidad_responsable', '=', 'uc.id_unidad_responsable')
            ->distinct()
            ->where('pa.id_tipo_contratacion','=',$params["id_tipo_contratacion"])
            ->where('pa.id_unidad_compradora','=',$params["id_unidad_compradora"])
            ->where('pa.anio','=',$anioActual)
            ->select('pa.*','tp.nombre_procedimiento','ctm.nombre_modalidad', 'ep.nombre_estatus_procedimiento', 'ep.estilo', 'dc.fecha_junta_aclaraciones',
                'dc.fecha_junta_aclaraciones_nueva','dc.fecha_limite_inscripcion','dc.fecha_limite_inscripcion_nueva',
                'dc.fecha_apertura','dc.fecha_apertura_nueva','dc.diferendo_acto_apertura','dc.fecha_fallo', 'dc.url_archivo_acto_recepcion',
                'uc.nombre_unidad_compradora','ur.nombre_unidad_responsable', 'ur.id_unidad_responsable',
                DB::raw("(select count(*) from det_participantes_procedimientos pp where pp.id_procedimiento_administrativo = pa.id_procedimiento_administrativo and pp.activo = 1) as numero_participantes"),
                DB::raw("'" . Carbon::now()->format('Y-m-d H:i:s') . "' as horaServidor")
            )
            ->orderBy('pa.id_procedimiento_administrativo','desc');



        if ($params["numero_procedimiento"] != null) {
            $query->where('pa.numero_procedimiento', '=', $params["numero_procedimiento"]);
        }

        if ($params["id_tipo_procedimiento"] != null) {
            $query->where('pa.id_tipo_procedimiento', '=', $params["id_tipo_procedimiento"]);
        }

        if ($params["concepto_contratacion"] != null) {
            $query->where(DB::raw("upper(pa.descripcion_concepto_contratacion)"), 'like', '%' . strtoupper($params["concepto_contratacion"]). '%');
        }


        $pageSize = 10;
        if (isset($params['pageSize']) && $params['pageSize'] != '') {
            $pageSize = $params["pageSize"];
        }

        $data = $query->paginate($pageSize);

        //$data = $query->get();

        return $data;







    }


    public function guardarProcedimientoAdministrativo($parametros): RespuestaModel
    {

        $nuevo = true;
        DB::beginTransaction();
        try {
            if ($parametros["id_procedimiento_administrativo"]) {
                $datoGuardar = $this::find($parametros["id_procedimiento_administrativo"]);
                $valorAnterior = clone $datoGuardar;
                $nuevo = false;
            }

            if (!isset($datoGuardar)) {
                $datoGuardar = new ProcedimientoAdministrativoModel();
                $valorAnterior = clone $datoGuardar;

                $datoGuardar->activo = true;

                if (isset($parametros["anio"])) {
                    $datoGuardar->anio = $parametros["anio"];
                }else{
                    $anioActual = date("Y");
                    $datoGuardar->anio = $anioActual;
                }


                if($parametros["id_tipo_contratacion"] == 1 || $parametros["id_tipo_contratacion"] == 2) {
                    $datoGuardar->id_estatus_procedimiento = 1;
                }
                if($parametros["id_tipo_contratacion"] == 3) {
                    $datoGuardar->id_estatus_procedimiento = 7;
                }
                $datoGuardar->id_tipo_contratacion = $parametros["id_tipo_contratacion"];
            } else {
                if (isset($parametros["activo"])) {
                    $datoGuardar->activo = $parametros["activo"];
                }
                if (isset($parametros["numero_procedimiento"])) {
                    $datoGuardar->numero_procedimiento = $parametros["numero_procedimiento"];
                }
                if (isset($parametros["id_estatus_procedimiento"])) {
                    $datoGuardar->id_estatus_procedimiento = $parametros["id_estatus_procedimiento"];
                }
            }

            if (isset($parametros["id_unidad_compradora"])) {
                $datoGuardar->id_unidad_compradora = $parametros["id_unidad_compradora"];
            }
            if (isset($parametros["id_tipo_procedimiento"])) {
                $datoGuardar->id_tipo_procedimiento = $parametros["id_tipo_procedimiento"];
            }
            if (isset($parametros["id_tipo_caracter_licitacion"])) {
                $datoGuardar->id_tipo_caracter_licitacion = $parametros["id_tipo_caracter_licitacion"];
            }
            if (isset($parametros["id_tipo_modalidad"])) {
                $datoGuardar->id_tipo_modalidad = $parametros["id_tipo_modalidad"];
            }
            if (isset($parametros["licitacion_recortada"])) {
                $datoGuardar->licitacion_recortada = $parametros["licitacion_recortada"];
            }
            if (isset($parametros["licitacion_tecnologia"])) {
                $datoGuardar->licitacion_tecnologia = $parametros["licitacion_tecnologia"];
            }
            if (isset($parametros["descripcion_concepto_contratacion"])) {
                $datoGuardar->descripcion_concepto_contratacion = $parametros["descripcion_concepto_contratacion"];
            }
            if (isset($parametros["numero_oficio_autorizacion"])) {
                $datoGuardar->numero_oficio_autorizacion = $parametros["numero_oficio_autorizacion"];
            }
            if (isset($parametros["importe_autorizado"])) {
                $datoGuardar->importe_autorizado = $parametros["importe_autorizado"];
            }
            if (isset($parametros["capitulo"])) {
                $datoGuardar->capitulo = $parametros["capitulo"];
            }
            if (isset($parametros["proyecto"])) {
                $datoGuardar->proyecto = $parametros["proyecto"];
            }
            if (isset($parametros["partida"])) {
                $datoGuardar->partida = $parametros["partida"];
            }
            if (isset($parametros["descripcion_normatividad"])) {
                $datoGuardar->descripcion_normatividad = $parametros["descripcion_normatividad"];
            }
            if (isset($parametros["numero_cotizaciones"])) {
                $datoGuardar->numero_cotizaciones = $parametros["numero_cotizaciones"];
            }
            if (isset($parametros["numero_licitanet"])) {
                $datoGuardar->numero_licitanet = $parametros["numero_licitanet"];
            }


            if (isset($parametros["archivo_convocatoria"])) {
                $archivoConvocatoria = $parametros["archivo_convocatoria"];

                $url_convocatoria = $this::almacenarArchivo($archivoConvocatoria);
                $datoGuardar->url_archivo_convocatoria = $url_convocatoria;
            }else{
                if (isset($parametros["url_archivo_convocatoria"])) {
                    $datoGuardar->url_archivo_convocatoria = $parametros["url_archivo_convocatoria"];
                }
            }


            if (isset($parametros["archivo_bases"])) {
                $archivoBases = $parametros["archivo_bases"];

                $url_bases = $this::almacenarArchivo($archivoBases);
                $datoGuardar->url_archivo_bases = $url_bases;
            }else{
                if (isset($parametros["url_archivo_bases"])) {
                    $datoGuardar->url_archivo_bases = $parametros["url_archivo_bases"];
                }
            }


            if (isset($parametros["archivo_oficio_autorizacion"])) {
                $archivoOficioAutorizacion = $parametros["archivo_oficio_autorizacion"];

                $url_autorizacion = $this::almacenarArchivo($archivoOficioAutorizacion);
                $datoGuardar->url_archivo_oficio_autorizacion = $url_autorizacion;
            }else{
                if (isset($parametros["url_archivo_oficio_autorizacion"])) {
                    $datoGuardar->url_archivo_oficio_autorizacion = $parametros["url_archivo_oficio_autorizacion"];
                }
            }

            if (isset($parametros["archivo_partidas"])) {
                $archivoPartidas = $parametros["archivo_partidas"];

                $url_partidas = $this::almacenarArchivo($archivoPartidas);
                $datoGuardar->url_archivo_partidas= $url_partidas;
            }else{
                if (isset($parametros["url_archivo_partidas"])) {
                    $datoGuardar->url_archivo_partidas = $parametros["url_archivo_partidas"];
                }
            }


            $datoGuardar->fecha_ultima_mod = Carbon::now();
            $datoGuardar->usuario_ultima_mod = $parametros["idUsuario"];




            if($nuevo && $parametros["id_tipo_contratacion"] == 3){

                $parametros['idTipoLicitacion'] = 3;
                $parametros['idTipoProcedimiento'] = $parametros['id_tipo_procedimiento'];
                $parametros['idUnidadCompradora'] = $parametros['id_unidad_compradora'];

                $helpNumProd = new NumeroProcedimientoModel();
                $respServ =  $helpNumProd->generarNumeroProd($parametros, true);
                $datoGuardar->numero_procedimiento = $respServ->datos;

            }


            $datoGuardar->save();

            DB::commit();


            if($parametros["id_tipo_contratacion"] == 1 || $parametros["id_tipo_contratacion"] == 2){


                $detalle = new DetalleConvocatoriaModel();

                $parametros["id_procedimiento_administrativo"] = $datoGuardar->id_procedimiento_administrativo;
                $respDetalleServicio = $detalle->guardarDetalleConvocatoria($parametros);
                Log::info('Guardado del detalle de la convocatoria'.' '.$respDetalleServicio->exito.' '.$respDetalleServicio->mensaje);

                $junta = new MsJuntasAclaraciones();
                $parametros["id_procedimiento_administrativo"] = $datoGuardar->id_procedimiento_administrativo;
                $respJuntaServicio = $junta->guardarJuntaAclaraciones($parametros);
                Log::info('Guardado de la junta de aclaraciones'.' '.$respJuntaServicio->exito.' '.$respJuntaServicio->mensaje);


            }

            if($parametros["id_tipo_contratacion"] == 3){

                $parametros["id_procedimiento_administrativo"] = $datoGuardar->id_procedimiento_administrativo;


                $participante = new DetalleParticipantesProcedimientosModel();
                $parametros["id_tipo_participacion"] = 2;
                $parametros["id_estatus_participacion"] = 3;
                $parametros["fecha_inscripcion"] = new Carbon();
                $respParticipanteServicio = $participante->guardarDetalleParticipantesProcedimientos($parametros);
                Log::info('Guardado del detalle de participantes en el procedimiento'.' '.$respParticipanteServicio->exito.' '.$respParticipanteServicio->mensaje);

                $contrato = new ContratoModel();


                $parametros["id_participante_procedimiento"] = $respParticipanteServicio->datos;
                $respContratoServicio = $contrato->guardarContrato($parametros);
                Log::info('Guardado del contrato'.' '.$respContratoServicio->exito.' '.$respContratoServicio->mensaje);



            }


            $anexos = new DetalleAnexosProcedimientosModel();

            $parametros["id_procedimiento_administrativo"] = $datoGuardar->id_procedimiento_administrativo;
            $respAnexosServicio = $anexos->guardarAnexosProcedimientos($parametros);
            Log::info('Guardado de los anexos servicio'.' '.$respAnexosServicio->exito.' '.$respAnexosServicio->mensaje);


            //VARIABLES PARA BITACORA
            if($parametros["id_tipo_contratacion"] == 1){
                $seccion = "Licitaciones Públicas";
            }else if($parametros["id_tipo_contratacion"] == 2){
                $seccion = "Licitaciones Simplificadas";
            }
            else if($parametros["id_tipo_contratacion"] == 3){
                $seccion = "Adjudicaciones Directas";
            }

            if ($parametros["id_procedimiento_administrativo"]){
                $descripcionAccion = "Actualizar procedimiento con id: ".$datoGuardar->id_procedimiento_administrativo." y el concepto: ".$datoGuardar->descripcion_concepto_contratacion;
            }else{
                $descripcionAccion = "Crear procedimiento con id: ".$datoGuardar->id_procedimiento_administrativo." y el concepto: ".$datoGuardar->descripcion_concepto_contratacion;
            }

            $valorNuevo = $datoGuardar;


            $diferenciaNuevo = $valorNuevo->compareTo($valorAnterior);
            $diferenciaAnterior = $valorAnterior->compareTo($valorNuevo);


            //BITACORA



            $bitacoraModel = new BitacoraModel($parametros["idUsuario"],
                $seccion,
                $descripcionAccion);

            $bitacoraModel->valor_nuevo = $diferenciaNuevo;
            $bitacoraModel->valor_anterior = $diferenciaAnterior;



            $bit = new DetalleBitacoraModel();
            $respBit = $bit->guardarBitacora($bitacoraModel);
            Log::info('Guardado de la bitacora'.' '.$respBit->exito.' '.$respBit->mensaje);

            //BITACORA

            return new RespuestaModel(true,  $datoGuardar->id_procedimiento_administrativo, Lang::get('messages.request_guardar'));

        } catch (\Exception $th) {
            Log::error($th);
            DB::rollback();
            return new RespuestaModel(false,  null, $th->getMessage());
        }

    }



    public function obtenerProcedimientoAdministrativo($params)
    {
        $queryJuntaAclaraciones = DB::table('ms_juntas_aclaraciones as ja')
            ->where('ja.id_procedimiento_administrativo','=',$params["id_procedimiento_administrativo"])
            ->max('ja.id_junta_aclaraciones');


        $query = DB::table('ms_procedimientos_administrativos as pa')
            ->leftJoin('det_detalles_convocatorias as dp','dp.id_procedimiento_administrativo','=','pa.id_procedimiento_administrativo')
            ->leftJoin('ms_juntas_aclaraciones as ja','ja.id_procedimiento_administrativo','=','pa.id_procedimiento_administrativo')
            ->join('cat_tipos_procedimientos as tp','pa.id_tipo_procedimiento','=','tp.id_tipo_procedimiento')
            ->leftJoin('cat_tipos_caracteres_licitaciones as tcl','tcl.id_tipo_caracter_licitacion','=','pa.id_tipo_caracter_licitacion')
            ->leftJoin('cat_tipos_modalidades as tm','tm.id_tipo_modalidad','=','pa.id_tipo_modalidad')
            ->leftJoin('ms_costos_inscripciones as ci','ci.id_costo_inscripcion','=','dp.costo_bases')
            ->leftJoin('cat_unidades_compradoras as cuc','cuc.id_unidad_compradora','=','pa.id_unidad_compradora')
            ->leftJoin('cat_unidades_responsables as cur','cur.id_unidad_responsable','=','cuc.id_unidad_responsable')
            ->leftJoin('cat_tipos_unidades_responsables as ctur','ctur.id_tipo_unidad_responsable','=','cur.id_tipo_unidad_responsable')
            ->join('cat_estatus_procedimientos as ep','ep.id_estatus_procedimiento','=','pa.id_estatus_procedimiento')
            ->distinct()
            ->where('pa.id_procedimiento_administrativo','=',$params["id_procedimiento_administrativo"])
            ->where('ja.id_junta_aclaraciones','=',$queryJuntaAclaraciones)
            ->select('pa.*', 'tp.nombre_procedimiento', 'ep.nombre_estatus_procedimiento', 'ep.estilo',
                'dp.id_detalle_convocatoria','dp.fecha_publicacion','dp.fecha_limite_inscripcion','dp.fecha_visita_lugar','dp.existen_visitas_adicionales','dp.descripcion_lugar','dp.fecha_junta_aclaraciones','dp.existen_juntas_adicionales',
                'dp.fecha_apertura','dp.fecha_fallo','dp.costo_bases','dp.diferendo_acto_apertura','dp.fecha_junta_aclaraciones_nueva','dp.fecha_limite_inscripcion_nueva','dp.fecha_apertura_nueva','dp.fecha_inicio_obra_nueva','dp.url_archivo_aviso_diferendo','dp.url_archivo_acto_recepcion','dp.costo_inscripcion_aut',
                'tcl.nombre_caracter_licitacion','tm.nombre_modalidad', 'ci.costo_inscripcion', 'ja.id_junta_aclaraciones', 'ja.fecha_carga_acta','ja.url_archivo','ctur.id_tipo_unidad_responsable','ctur.tipo_unidad_responsable');


        $data['procedimiento'] = $query->get()->first();

        $contratos = new ContratoModel();
        $dataContratos = $contratos->buscarContrato($params);
        $data['contratos'] = $dataContratos;

        $anexos = new DetalleAnexosProcedimientosModel();
        $dataAnexos = $anexos->buscarDetalleAnexosProcedimientos($params);
        $data['anexos'] = $dataAnexos;


        $participantes = new DetalleParticipantesProcedimientosModel();
        $dataParticipantes = $participantes->buscarDetalleParticipantesProcedimientos($params);
        $data['participantes'] = $dataParticipantes;


        if(isset($data['procedimiento']->url_archivo_convocatoria)){
            $archivo_convocatoria = $this::obtenerArchivo(
                $data['procedimiento']->url_archivo_convocatoria, false
            );
            $data['procedimiento']->archivo_convocatoria = $archivo_convocatoria;
        }

        if(isset($data['procedimiento']->url_archivo_bases)){
            $archivo_bases= $this::obtenerArchivo(
                $data['procedimiento']->url_archivo_bases, false
            );
            $data['procedimiento']->archivo_bases = $archivo_bases;
        }

        if(isset($data['procedimiento']->url_archivo_oficio_autorizacion)){
            $archivo_oficio_autorizacion = $this::obtenerArchivo(
                $data['procedimiento']->url_archivo_oficio_autorizacion, false
            );
            $data['procedimiento']->archivo_oficio_autorizacion = $archivo_oficio_autorizacion;
        }

        if(isset($data['procedimiento']->url_archivo_partidas)){
            $archivo_partidas = $this::obtenerArchivo(
                $data['procedimiento']->url_archivo_partidas, false
            );
            $data['procedimiento']->archivo_partidas = $archivo_partidas;
        }



        return $data;
    }


    public function obtenerAnexosProcedimientoAdministrativo($params)
    {

        $anexos = new DetalleAnexosProcedimientosModel();
        $dataAnexos = $anexos->buscarDetalleAnexosProcedimientos($params);
        $data['anexos'] = $dataAnexos;


        return $data;
    }


    public function obtenerContratosProcedimientoAdministrativo($params)
    {

        $contratos = new ContratoModel();
        $dataContratos = $contratos->buscarContrato($params);
        $data['contratos'] = $dataContratos;


        return $data;
    }



    public function guardarAnexosProcedimientoAdministrativo($parametros): RespuestaModel
    {


        try {


            $anexos = new DetalleAnexosProcedimientosModel();
            $respAnexosServicio = $anexos->guardarAnexosProcedimientos($parametros);


            return new RespuestaModel(true,  $parametros, Lang::get('messages.request_guardar'));

        } catch (\Exception $th) {
            Log::error($th);
            DB::rollback();
            return new RespuestaModel(false,  null, $th);
        }

    }





    public function obtenerProcedimientosVistaPublica($params){
        $query = DB::table('ms_procedimientos_administrativos as pa')
            ->leftJoin('cat_estatus_procedimientos as ep', 'ep.id_estatus_procedimiento', '=', 'pa.id_estatus_procedimiento')
            ->leftJoin('cat_tipos_caracteres_licitaciones as cl', 'cl.id_tipo_caracter_licitacion', '=', 'pa.id_tipo_caracter_licitacion')
            ->leftJoin('cat_tipos_modalidades as tm', 'tm.id_tipo_modalidad', '=', 'pa.id_tipo_modalidad')
            ->leftJoin('cat_tipos_procedimientos as tp', 'tp.id_tipo_procedimiento', '=', 'pa.id_tipo_procedimiento')
            ->leftJoin('cat_unidades_compradoras as uc', 'uc.id_unidad_compradora', '=', 'pa.id_unidad_compradora')
            ->leftJoin('cat_unidades_responsables as ur', 'ur.id_unidad_responsable', '=', 'uc.id_unidad_responsable')
            ->leftJoin('det_detalles_convocatorias as dc','dc.id_procedimiento_administrativo','=','pa.id_procedimiento_administrativo')
            ->distinct()
            ->select('pa.id_procedimiento_administrativo','pa.id_tipo_contratacion','pa.id_unidad_compradora','pa.id_tipo_procedimiento','pa.id_tipo_caracter_licitacion','pa.id_tipo_modalidad','pa.licitacion_recortada','pa.licitacion_tecnologia','pa.descripcion_concepto_contratacion','pa.id_estatus_procedimiento','pa.numero_procedimiento',
                'cl.id_tipo_caracter_licitacion', 'cl.nombre_caracter_licitacion',
                'tm.id_tipo_modalidad', 'tm.nombre_modalidad',
                'tp.nombre_procedimiento',
                'uc.nombre_unidad_compradora',
                'ur.nombre_unidad_responsable', 'ur.id_unidad_responsable',
                'ep.nombre_estatus_procedimiento', 'ep.estilo',
                'dc.fecha_publicacion'
            );

            if ($params['unidad_responsable'] !== null) {
                $query->where('ur.id_unidad_responsable','=',$params['unidad_responsable']);
            }

            if ($params['concepto_contratacion'] !== null){
                $query->where(DB::raw("upper(pa.descripcion_concepto_contratacion)"), 'like', '%' . strtoupper($params["concepto_contratacion"]). '%');
            }

            if ($params['no_licitacion'] !== null){
                $query->where(DB::raw("upper(pa.numero_procedimiento)"),'like','%' . strtoupper($params['no_licitacion']) . '%');
            }

            if ($params['tipo_licitacion'] !== null){
                $query->where('pa.id_tipo_contratacion' , '=' , $params['tipo_licitacion']);
            }

            if ($params['tipo_procedimiento'] !== null){
                $query->where('pa.id_tipo_procedimiento', '=' , $params['tipo_procedimiento']);
            }

            if ($params['estatus_procedimiento'] !== null){
                $query->where('pa.id_estatus_procedimiento','=', $params['estatus_procedimiento']);
            }

            if ($params['fecha_inicial'] !== null && $params['fecha_final'] !== null) {
                $query->whereBetween('pa.fecha_ultima_mod', [$params['fecha_inicial']. ' 00:00:00', $params['fecha_final']. ' 23:59:59']);
            }

            $query->whereNotIn('pa.id_estatus_procedimiento', [1, 4]);

            $pageSize = 10;

            if (isset($params['pageSize']) && $params['pageSize'] != '') {
                $pageSize = $params["pageSize"];
            }

            $data = $query->orderByDesc('dc.fecha_publicacion')->paginate($pageSize);

        return $data;
    }

    public function obtenerDetalleProcedimiento($params)
    {
        $query = DB::table('ms_procedimientos_administrativos as pa')
            ->leftJoin('det_detalles_convocatorias as dp','dp.id_procedimiento_administrativo','=','pa.id_procedimiento_administrativo')
            ->join('cat_tipos_procedimientos as tp','pa.id_tipo_procedimiento','=','tp.id_tipo_procedimiento')
            ->leftJoin('cat_tipos_caracteres_licitaciones as tcl','tcl.id_tipo_caracter_licitacion','=','pa.id_tipo_caracter_licitacion')
            ->leftJoin('cat_tipos_modalidades as tm','tm.id_tipo_modalidad','=','pa.id_tipo_modalidad')
            ->leftJoin('ms_costos_inscripciones as ci','ci.id_costo_inscripcion','=','dp.costo_bases')
            ->join('cat_estatus_procedimientos as ep','ep.id_estatus_procedimiento','=','pa.id_estatus_procedimiento')
            ->join('cat_tipos_contrataciones as tc','tc.id_tipo_contratacion','=','pa.id_tipo_contratacion')
            ->leftJoin('cat_unidades_compradoras as uc','uc.id_unidad_compradora','=','pa.id_unidad_compradora')
            ->leftJoin('cat_unidades_responsables as ur','ur.id_unidad_responsable','=','uc.id_unidad_responsable')
            ->leftJoin('cat_tipos_unidades_responsables as ctur','ctur.id_tipo_unidad_responsable','=','ur.id_tipo_unidad_responsable')
            ->distinct()
            ->where('pa.id_procedimiento_administrativo','=',$params["id_procedimiento_administrativo"])
            ->select('pa.*', 'tp.nombre_procedimiento', 'ep.nombre_estatus_procedimiento', 'ep.estilo', 'dp.*', 'tcl.nombre_caracter_licitacion','tm.nombre_modalidad', 'ci.costo_inscripcion','ur.nombre_unidad_responsable','tc.nombre_contratacion','ctur.id_tipo_unidad_responsable','ctur.tipo_unidad_responsable');


        $data['procedimiento'] = $query->get()->first();

        $anexos = new DetalleAnexosProcedimientosModel();
        $dataAnexos = $anexos->buscarDetalleAnexosProcedimientos($params);
        $data['anexos'] = $dataAnexos;


        if(isset($data['procedimiento']->url_archivo_convocatoria)){
            $archivo_convocatoria = $this::obtenerArchivo(
                $data['procedimiento']->url_archivo_convocatoria, false
            );
            $data['procedimiento']->archivo_convocatoria = $archivo_convocatoria;
        }

        if(isset($data['procedimiento']->url_archivo_bases)){
            $archivo_bases= $this::obtenerArchivo(
                $data['procedimiento']->url_archivo_bases, false
            );
            $data['procedimiento']->archivo_bases = $archivo_bases;
        }

        if(isset($data['procedimiento']->url_archivo_oficio_autorizacion)){
            $archivo_oficio_autorizacion = $this::obtenerArchivo(
                $data['procedimiento']->url_archivo_oficio_autorizacion, false
            );
            $data['procedimiento']->archivo_oficio_autorizacion = $archivo_oficio_autorizacion;
        }


        return $data;
    }


    public function cambiarEstatusProcedimiento($parametros)
    {
        DB::beginTransaction();
        try {
            $datoGuardar = $this::find($parametros["id_procedimiento_administrativo"]);

            $modelEstatusAnterior = EstatusProcedimientoModel::find($datoGuardar->id_estatus_procedimiento);
            $estatusAnterior = $modelEstatusAnterior->nombre_estatus_procedimiento;
            $modelEstatusNuevo = EstatusProcedimientoModel::find($parametros["id_estatus_procedimiento"]);
            $estatusNuevo = $modelEstatusNuevo->nombre_estatus_procedimiento;


            $datoGuardar->id_estatus_procedimiento = $parametros["id_estatus_procedimiento"];
            $datoGuardar->fecha_ultima_mod = Carbon::now();
            $datoGuardar->usuario_ultima_mod = $parametros["idUsuario"];

            $datoGuardar->save();

            DB::commit();

            //VARIABLES PARA BITACORA

            if($datoGuardar->id_tipo_contratacion == 1){
                $seccion = "Licitaciones Públicas";
            }else if($datoGuardar->id_tipo_contratacion == 2){
                $seccion = "Licitaciones Simplificadas";
            }
            else if($datoGuardar->id_tipo_contratacion == 3){
                $seccion = "Adjudicaciones Directas";
            }

            $descripcionAccion = "Cambio de estatus del procedimiento con id: ".$datoGuardar->id_procedimiento_administrativo." y concepto: ".$datoGuardar->descripcion_concepto_contratacion." del estatus: ".$estatusAnterior.", al estatus: ".$estatusNuevo;


            //BITACORA

            $bitacoraModel = new BitacoraModel($datoGuardar->usuario_ultima_mod,
                $seccion,
                $descripcionAccion);

            $bit = new DetalleBitacoraModel();
            $respBit = $bit->guardarBitacora($bitacoraModel);

            //BITACORA

            return new RespuestaModel(true,  $datoGuardar->id_rol, Lang::get('messages.request_actualizar'));

        } catch (\Exception $th) {
            Log::error($th);
            DB::rollback();
            return new RespuestaModel(false,  null, $th);
        }
    }



    public function almacenarArchivo($request)
    {
        $tipoArchivo  = TipoArchivo::obtenerTipoArchivo($request['tipoArchivo']);
        $archivo = new ArchivoModel($request['nombreArchivo'],
            $request['base64'],
            $tipoArchivo);

        $archHelp = new ArchivosHelper();
        $respServ = $archHelp->guardarDocumento(
            $archivo,
            $request['procedimiento'],
            $request['encriptar']
        );


        return $respServ->datos;
    }


    public function obtenerArchivo($url, $encriptar)
    {

        $archHelp = new ArchivosHelper();
        $respServ = $archHelp->obtenerDocumento(
            $url,
            $encriptar
        );

        return $respServ->datos;

    }


    public function buscarUnidadesCompradorasUsuario($id_usuario)
    {

        if(User::usuarioTieneRol($id_usuario, 1)){


            $query = DB::table('cat_unidades_compradoras as uc')
                ->leftJoin('cat_unidades_responsables as ur','ur.id_unidad_responsable','=','uc.id_unidad_responsable')
                ->leftJoin('cat_tipos_unidades_responsables as ctur','ctur.id_tipo_unidad_responsable','=','ur.id_tipo_unidad_responsable')
                ->distinct()
                ->where('uc.activo','=',1)
                ->select('uc.*','ctur.id_tipo_unidad_responsable','ctur.tipo_unidad_responsable');

            $unidadesCompradoras = $query->get();


        }else{
            $unidadesCompradoras = CatUnidadesCompradorasModel::findByIdUsuario($id_usuario);
        }

        return $unidadesCompradoras;
    }

    public function actualizarNumProcedimientoAdministrativo($idProcedimientoAdmin, $numeroProc): RespuestaModel
    {
        try {
            $datoGuardar = $this::find($idProcedimientoAdmin);
            $datoGuardar->numero_procedimiento = $numeroProc;
            $datoGuardar->save();


            //VARIABLES PARA BITACORA
            if($datoGuardar->id_tipo_contratacion == 1){
                $seccion = "Licitaciones Públicas";
            }else if($datoGuardar->id_tipo_contratacion == 2){
                $seccion = "Licitaciones Simplificadas";
            }
            else if($datoGuardar->id_tipo_contratacion == 3){
                $seccion = "Adjudicaciones Directas";
            }


            $descripcionAccion = "Fijar numero de procedimiento, al procedimiento con id: ".$datoGuardar->id_procedimiento_administrativo." el numero fijado es: ".$datoGuardar->numero_procedimiento;

            //BITACORA



            $bitacoraModel = new BitacoraModel($datoGuardar->usuario_ultima_mod,
                $seccion,
                $descripcionAccion);

            $bit = new DetalleBitacoraModel();
            $respBit = $bit->guardarBitacora($bitacoraModel);

            //BITACORA

            return new RespuestaModel(true,  $numeroProc, Lang::get('messages.request_guardar'));
        } catch (\Exception $th) {
            return new RespuestaModel(false,  null, $th);
        }
    }


    public function compareTo(ProcedimientoAdministrativoModel $other)
    {
        $attributes = collect($this->getAttributes())
            ->map(function ($attribute, $key) use ($other) {
                if ($attribute != $other->$key) {
                    return $key = $attribute;
                }
            })->reject(function ($attribute, $key) {
                return !$attribute || in_array($key, ['id', 'created_at', 'updated_at']);
            });

        return $attributes;
    }

    public function buscarAutorizacionApertura($params)
    {
        $query = DB::table('ms_procedimientos_administrativos as pa')
            ->leftJoin('det_autorizacion_apertura as da','da.id_procedimiento_administrativo','=','pa.id_procedimiento_administrativo')
            ->distinct()
            ->where('pa.id_procedimiento_administrativo','=',$params["id_procedimiento_administrativo"])
            ->select('da.*');

        return $query->get()->first();
    }

    public function actualizarProcedimientosCapturadosToVigentes()
    {
        $query = DB::table('ms_procedimientos_administrativos as p')
            ->join('det_detalles_convocatorias as d','d.id_procedimiento_administrativo','=','p.id_procedimiento_administrativo')
            ->where('p.id_estatus_procedimiento', '=', 1)
            ->whereNotNull('p.numero_procedimiento')
            ->where('d.fecha_publicacion','<=', Carbon::now());

        $query->update(['p.id_estatus_procedimiento' => 2]);

        $query2 = DB::table('ms_procedimientos_administrativos as p')
            ->join('det_detalles_convocatorias as d','d.id_procedimiento_administrativo','=','p.id_procedimiento_administrativo')
            ->where('p.id_estatus_procedimiento', '=', 2)
            ->whereNotNull('p.numero_procedimiento')
            ->where(function ($query) {
                $query->where(function ($query) {
                    $query->whereNotNull('d.fecha_limite_inscripcion')
                        ->where(DB::raw('DATE(d.fecha_limite_inscripcion)'), '<', Carbon::today());
                })
                    ->orWhere(function ($query) {
                        $query->whereNotNull('d.fecha_limite_inscripcion_nueva')
                            ->where(DB::raw('DATE(d.fecha_limite_inscripcion_nueva)'), '<', Carbon::today());
                    });
            });

        $query2->update(['p.id_estatus_procedimiento' => 3]);

        $query3 = DB::table('ms_procedimientos_administrativos as p')
            ->join('det_detalles_convocatorias as d','d.id_procedimiento_administrativo','=','p.id_procedimiento_administrativo')
            ->where('p.id_estatus_procedimiento', '=', 3)
            ->whereNotNull('p.numero_procedimiento')
            ->where(function ($query) {
                $query->where(function ($query) {
                    $query->whereNotNull('d.fecha_limite_inscripcion')
                        ->where(DB::raw('DATE(d.fecha_limite_inscripcion)'), '>=', Carbon::today());
                })
                    ->orWhere(function ($query) {
                        $query->whereNotNull('d.fecha_limite_inscripcion_nueva')
                            ->where(DB::raw('DATE(d.fecha_limite_inscripcion_nueva)'), '>=', Carbon::today());
                    });
            });

        $query3->update(['p.id_estatus_procedimiento' => 2]);

        return true;
    }


    public function getADExtemporaneaUsuario($id_usuario){

        if(User::usuarioTieneRol($id_usuario, 1)){


            $queryUC = DB::table('cat_unidades_compradoras as uc')
                ->distinct()
                ->where('uc.activo','=',1)
                ->select('uc.*');

            $unidadesCompradoras = $queryUC->pluck('uc.id_unidad_compradora', 'uc.id_unidad_compradora')
                ->all();


        }else{


            $queryUC = DB::table('cat_unidad_compradora_ms_usuario as uni_usu')
                ->join('cat_unidades_compradoras as uni','uni.id_unidad_compradora','uni_usu.id_unidad_compradora')
                ->join('ms_usuarios as usu','usu.id_usuario','uni_usu.id_usuario')
                ->where('uni_usu.id_usuario', $id_usuario)
                ->where('uni.activo', true)
                ->where('usu.activo', true)
                ->where('uni_usu.activo', true);

            $unidadesCompradoras = $queryUC->pluck('uni_usu.id_unidad_compradora', 'uni_usu.id_unidad_compradora')
                ->all();
        }


        $query = DB::table('cat_unidades_compradoras_ad_extemporanea as ae')
            ->whereRaw('"'.Carbon::now().'" between ae.fecha_inicio_periodo and ae.fecha_fin_periodo')
            ->pluck('ae.id_unidad_compradora', 'ae.id_unidad_compradora')
            ->all();


        $queryUnidades = DB::table('cat_unidades_compradoras as uc')
            ->distinct()
            ->select('uc.*')
            ->whereIn('uc.id_unidad_compradora',$query)
            ->whereIn('uc.id_unidad_compradora', $unidadesCompradoras);

        $dataUnidades = $queryUnidades->get();

        return $dataUnidades;

    }


    public function getAniosPrevios(){

        $aniosArreglo = array();
        $anioActual = date("Y");

        foreach (range($anioActual-1,$anioActual-20) as $item) {
            \array_push($aniosArreglo, $item);
        }
        return $aniosArreglo;

    }

    public function obtenerDocumentoPartidasProcedimiento($idProcedimiento)
    {
            $procedimiento = $this::find($idProcedimiento);
            return $procedimiento->url_archivo_partidas;
    }

    public static function obtenerCorreosParticipantesProcedimiento($idProcedimiento, $idProveedor = null)
    {
        $query = DB::Table('det_participantes_procedimientos as depp')
            ->join('ms_proveedores as prov', 'prov.id_proveedor', '=', 'depp.id_proveedor')
            ->where('depp.id_procedimiento_administrativo', $idProcedimiento)
            ->where('depp.activo', true)
            ->where('prov.activo', true)
            ->select("prov.correo_electronico", "prov.id_usuario")
            ->selectRaw("concat(prov.nombre_proveedor,' ',prov.primer_apellido_proveedor,' ',prov.segundo_apellido_proveedor) nombre_proveedor")
            ->distinct();

        if ($idProveedor != null) {
            $query->where('depp.id_proveedor', $idProveedor);
        }

        return $query->get();
    }

    public static function obtenerNumeroProcedimiento($id) {
        $model = new ProcedimientoAdministrativoModel();
        $proc = $model::find($id);
        return $proc->numero_procedimiento;
    }

}
