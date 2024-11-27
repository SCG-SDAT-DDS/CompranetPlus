<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UnidadResponsableModel extends Model
{

    public function obtenerTipoUnidadResponsable()
    {
        return [
            ['id' => 1, 'tipo_unidad_responsable' => 'Estatal'],
            ['id' => 2, 'tipo_unidad_responsable' => 'Municipal'],
            ['id' => 3, 'tipo_unidad_responsable' => 'Autónomo'],
            ['id' => 4, 'tipo_unidad_responsable' => 'Organismo Descentralizado'],
            ['id' => 5, 'tipo_unidad_responsable' => 'Empresa de Participación Estatal'],
            ['id' => 6, 'tipo_unidad_responsable' => 'Fideicomiso Público'],
            ['id' => 7, 'tipo_unidad_responsable' => 'Órgano Público'],
        ];
    }

    public function obtenerUnidadesResponsables()
    {
        return [
            ['id' => 1, 'unidad_responsable' => 'Administración Portuaria Integral del Sonora S.A de C.V', 'siglas' => 'APIS', 'estatus' => true, 'id_tipo_unidad_responsable' => 4, 'catalogo_tipo_unidad_responsable' => ['id' => 4, 'tipo_unidad_responsable' => 'Organismo Descentralizado']],
            ['id' => 2, 'unidad_responsable' => 'Biblioteca Pública Jesús Corral Ruiz', 'siglas' => 'BPJCR', 'estatus' => true, 'id_tipo_unidad_responsable' => 1, 'catalogo_tipo_unidad_responsable' => ['id' => 1, 'tipo_unidad_responsable' => 'Estatal']],
        ];
    }

}

?>
