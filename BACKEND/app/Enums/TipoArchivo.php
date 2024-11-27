<?php

namespace App\Enums;
class TipoArchivo extends \Illuminate\Validation\Rules\Enum {
    private const CONTRATO = [
        'subDir' => '/contrato/',
        'tipo' => 'pdf'
    ];

    private const BASE = [
        'subDir' => '/base/',
        'tipo' => 'pdf'
    ];

    private const CONVOCATORIA = [
        'subDir' => '/convocatoria/',
        'tipo' => 'pdf'
    ];

    private const OFICIO_AUTORIZACION = [
        'subDir' => '/oficio_autorizacion/',
        'tipo' => 'pdf'
    ];

    private const ANEXOS = [
        'subDir' => '/anexos/',
        'tipo' => '*'
    ];

    private const INE = [
        'subDir' => '/INE/',
        'tipo' => 'JPG'
    ];

    private const SITUACION_FISCAL = [
        'subDir' => '/CONSTANCIA_SITUACION_FISCAL/',
        'tipo' => 'pdf'
    ];

    private const CEDULA_PROFESIONAL = [
        'subDir' => '/CEDULA_PROFESIONAL/',
        'tipo' => 'pdf'
    ];

    private const ACTAS_CONSTITUTIVAS = [
        'subDir' => '/ACTAS_CONSTITUTIVAS/',
        'tipo' => 'pdf'
    ];

    private const AVISO_DIFERENDO = [
        'subDir' => '/AVISO_DIFERENDO/',
        'tipo' => 'pdf'
    ];

    private const ACTA_RECEPCION_APERTURA = [
        'subDir' => '/ACTA_RECEPCION_APERTURA/',
        'tipo' => 'pdf'
    ];

    private const PROPUESTA_PROVEEDOR = [
        'subDir' => '/PROPUESTA_PROVEEDOR/',
        'tipo' => '*'
    ];

    private const ACTA_FALLO = [
        'subDir' => '/ACTA_FALLO/',
        'tipo' => 'pdf'
    ];

    private const PREGUNTA = [
        'subDir' => '/PREGUNTA/',
        'tipo' => 'pdf'
    ];

    private const RESPUESTA = [
        'subDir' => '/RESPUESTA/',
        'tipo' => 'pdf'
    ];

    private const ACTA_PRORROGA = [
        'subDir' => '/PRORROGA/',
        'tipo' => 'pdf'
    ];

    private const PARTIDAS = [
        'subDir' => '/PARTIDAS/',
        'tipo' => 'xlsx'
    ];

    public static function obtenerTipoArchivo($tipo) {
        if ($tipo == 1) {
            return TipoArchivo::CONTRATO;
        }

        if ($tipo == 2) {
            return TipoArchivo::BASE;
        }

        if ($tipo == 3) {
            return TipoArchivo::CONVOCATORIA;
        }

        if ($tipo == 4) {
            return TipoArchivo::OFICIO_AUTORIZACION;
        }

        if ($tipo == 5) {
            return TipoArchivo::ANEXOS;
        }

        if ($tipo == 6) {
            return TipoArchivo::INE;
        }

        if ($tipo == 7) {
            return TipoArchivo::SITUACION_FISCAL;
        }

        if ($tipo == 8) {
            return TipoArchivo::CEDULA_PROFESIONAL;
        }

        if ($tipo == 9) {
            return TipoArchivo::ACTAS_CONSTITUTIVAS;
        }

        if ($tipo == 10) {
            return TipoArchivo::AVISO_DIFERENDO;
        }

        if ($tipo == 11) {
            return TipoArchivo::ACTA_RECEPCION_APERTURA;
        }

        if ($tipo == 12) {
            return TipoArchivo::PROPUESTA_PROVEEDOR;
        }

        if ($tipo == 13) {
            return TipoArchivo::ACTA_FALLO;
        }

        if ($tipo == 14) {
            return TipoArchivo::PREGUNTA;
        }

        if ($tipo == 15) {
            return TipoArchivo::RESPUESTA;
        }

        if ($tipo == 16) {
            return TipoArchivo::ACTA_PRORROGA;
        }

        if ($tipo == 18) {
            return TipoArchivo::PARTIDAS;
        }
    }
}
