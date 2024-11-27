<?php

namespace App\Models;

class BitacoraModel {
    public $id_usuario;
    public $seccion_accion;
    public $descripcion_accion;
    public $valor_nuevo;
    public $valor_anterior;

    function  __construct($id_usuario=null, $seccion_accion=null, $descripcion_accion=null) {
        $this->id_usuario = $id_usuario;
        $this->seccion_accion = $seccion_accion;
        $this->descripcion_accion = $descripcion_accion;
    }
}
