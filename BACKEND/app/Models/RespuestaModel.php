<?php

namespace App\Models;

class RespuestaModel {
    public $exito;
    public $mensaje;
    public $datos;

    function  __construct($exito=null, $datos=null, $mensaje=null) {
        $this->exito = $exito;
        $this->mensaje = $mensaje;
        $this->datos = $datos;
    }
}
