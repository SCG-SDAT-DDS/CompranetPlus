<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Lang;

class NumeroProcedimientoModel extends Model
{

    public $timestamps = false;
    protected $table = 'det_seq_numero_procedimiento';
    protected $primaryKey = 'id_seq_numero_procedimiento';

    protected $fillable = [
        'id_tipo_seq',
        'id_unidad_compradora',
        'anio',
        'codigo'
    ];


    public function generarNumeroProd($params, $persistir = false) {
        try {
            $respVals = $this->validarDatosParaCodigo($params);
            if (!$respVals->exito) {
                return $respVals;
            }

            $tipoLicitacion = DB::table('cat_tipos_contrataciones')
                ->where('id_tipo_contratacion', $params['idTipoLicitacion'])
                ->first();
            $tipoProcedimiento = DB::table('cat_tipos_procedimientos')
                ->where('id_tipo_procedimiento', $params['idTipoProcedimiento'])
                ->first();
            $unidadCompradora = DB::table('cat_unidades_compradoras')
                ->where('id_unidad_compradora', $params['idUnidadCompradora'])
                ->first();

            $respVals = $this->validarDatosParaCodigo2($params, $tipoLicitacion, $tipoProcedimiento, $unidadCompradora);
            if (!$respVals->exito) {
                return $respVals;
            }

            $date = new Carbon();
            $anio = $date->year;

            $respVals = $this->obtenerConsecutivo($tipoLicitacion,$params['idUnidadCompradora'], $anio, $persistir);
            if (!$respVals->exito) {
                return $respVals;
            }

            $codigoFinal = $tipoLicitacion->acronimo . $tipoProcedimiento->acronimo . '-' .
                $unidadCompradora->clave_unidad_compradora . '-' .
                $respVals->datos . '-' .
                $anio;

            return new RespuestaModel(true, $codigoFinal,
                Lang::get('messages.licitaciones.codigo_exito'));
        } catch (\Exception $th) {
            return new RespuestaModel(false,  null, $th);
        }
    }

    function validarDatosParaCodigo($params) {
        if ($params['idTipoLicitacion'] == null) {
            return new RespuestaModel(false,  $params['idTipoLicitacion'],
                Lang::get('messages.licitaciones.dato_requerido', ['attribute'=>'idTipoLicitacion']));
        }

        if ($params['idTipoProcedimiento'] == null) {
            return new RespuestaModel(false,  $params['idTipoProcedimiento'],
                Lang::get('messages.licitaciones.dato_requerido', ['attribute'=>'idTipoProcedimiento']));
        }

        if ($params['idUnidadCompradora'] == null) {
            return new RespuestaModel(false,  $params['idUnidadCompradora'],
                Lang::get('messages.licitaciones.dato_requerido', ['attribute'=>'idUnidadCompradora']));
        }

        return new RespuestaModel(true);
    }

    function validarDatosParaCodigo2($params, $tipoLicitacion, $tipoProcedimiento, $unidadCompradora) {

        if ($tipoLicitacion == null || $tipoLicitacion->acronimo == null || trim($tipoLicitacion->acronimo) == '') {
            return new RespuestaModel(false,  $params['idTipoProcedimiento'],
                Lang::get('messages.licitaciones.dato_inexistente', ['attribute'=>'acrónimo del tipo de licitación']));
        }

        if ($tipoProcedimiento == null || $tipoProcedimiento->acronimo == null || trim($tipoProcedimiento->acronimo) == '') {
            return new RespuestaModel(false,  $params['idTipoProcedimiento'],
                Lang::get('messages.licitaciones.dato_inexistente', ['attribute'=>'acrónimo del tipo de procedimiento']));
        }

        if ($unidadCompradora == null || $unidadCompradora->clave_unidad_compradora == null || trim($unidadCompradora->clave_unidad_compradora) == '') {
            return new RespuestaModel(false,  $params['idUnidadCompradora'],
                Lang::get('messages.licitaciones.dato_inexistente', ['attribute'=>'clave de la unidad compradora']));
        }

        if (strlen($unidadCompradora->clave_unidad_compradora) != 9) {
            return new RespuestaModel(false,  $unidadCompradora->clave_unidad_compradora,
                Lang::get('messages.licitaciones.unidad_compradora_length'));
        }

        return new RespuestaModel(true);
    }

    function obtenerConsecutivo($tipoLicitacion,$unidadCompradora ,$anio, $persistir = false) {

        $idTipoContratacion = $tipoLicitacion->id_tipo_contratacion;
        $idTipoSecuencia = 1;

        if ($idTipoContratacion >= 3) {
            $idTipoSecuencia = 2;
        }

        $seqCodigo = $this
            ->where('id_tipo_seq', $idTipoSecuencia)
            ->where('id_unidad_compradora', $unidadCompradora)
            ->where('anio', $anio)
            ->orderByDesc('id_seq_numero_procedimiento')
            ->first();

        if ($seqCodigo == null) {
            $codigo = 1;

            if ($persistir) {
                DB::table('det_seq_numero_procedimiento')->insert([
                    'id_tipo_seq' => $idTipoSecuencia,
                    'id_unidad_compradora' => $unidadCompradora,
                    'anio' => $anio,
                    'codigo' => $codigo
                ]);
            }

            return new RespuestaModel(true, $this->formatearCodigo($codigo));
        }

        $seqCodigo->codigo = $seqCodigo->codigo + 1;

        if ($persistir) {
            $seqCodigo->save();
        }

        return new RespuestaModel(true, $this->formatearCodigo($seqCodigo->codigo));

    }

    function formatearCodigo($numero) {
        return str_pad($numero, 3, "0", STR_PAD_LEFT);
    }


}
