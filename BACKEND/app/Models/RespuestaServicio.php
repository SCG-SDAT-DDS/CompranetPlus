<?php

namespace App\Models;

use Illuminate\Support\Facades\Lang;

class RespuestaServicio {
    public static $codigos = [
        "EXITO"=>200,
        "ERROR"=>500
    ];

    private $codigo;
    private $mensaje;
    private $datos;

    public static function setCustom($datos, $mensaje, $codigo) {
        $instance = new self();
        $instance->datos = $datos;
        $instance->mensaje = $mensaje;
        $instance->codigo = self::$codigos[$codigo];
    }

    public static function setExito($datos = null, $mensaje = null ) {
        $instance = new self();
        $instance->datos = $datos;
        $instance->codigo = self::$codigos["EXITO"];

        if ($mensaje != null) {
            $instance->mensaje = $mensaje;
        } else {
            $instance->mensaje = Lang::get('messages.request_exito');
        }

        return $instance;
    }

    public static function setBusquedaExito($datos = null, $mensaje = null ) {
        $instance = new self();
        $instance->datos = $datos;
        $instance->codigo = self::$codigos["EXITO"];

        if ($mensaje != null) {
            $instance->mensaje = $mensaje;
        } else {
            $instance->mensaje = Lang::get('messages.request_busqueda');
        }

        return $instance;
    }

    public static function setGuardarExito($datos = null, $mensaje = null ) {
        $instance = new self();
        $instance->datos = $datos;
        $instance->codigo = self::$codigos["EXITO"];

        if ($mensaje != null) {
            $instance->mensaje = $mensaje;
        } else {
            $instance->mensaje = Lang::get('messages.request_guardar');
        }

        return $instance;
    }

    public static function setError($datos = null, $mensaje = null, $codigo = null ) {
        $instance = new self();
        $instance->datos = $datos;

        if ($codigo != null) {
            $instance->codigo = $codigo;
        } else {
            $instance->codigo = self::$codigos["ERROR"];
        }

        if ($mensaje != null) {
            $instance->mensaje = $mensaje;
        } else {
            $instance->mensaje = Lang::get('messages.request_error');
        }

        return $instance;
    }

    public function getResponse() {
        return response()->json([
            'mensaje' => $this->mensaje,
            'datos' => $this->datos
        ], $this->codigo);
    }
}
