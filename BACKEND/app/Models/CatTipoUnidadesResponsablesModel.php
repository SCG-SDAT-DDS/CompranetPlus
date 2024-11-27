<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CatTipoUnidadesResponsablesModel extends Model{

    public $timestamps = false;

    protected $table = 'cat_tipos_unidades_responsables';
    protected $primaryKey = 'id_tipo_unidad_responsable';
    protected $fillable = [
        'tipo_unidad_responsable',
        // 'activo',
        // 'fecha_ultima_mod',
        // 'usuario_ultima_mod'
    ];
    protected $casts = [
        'fecha_ultima_mod' => 'datetime',
    ];

}

?>
