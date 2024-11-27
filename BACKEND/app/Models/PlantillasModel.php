<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Lang;
use Illuminate\Support\Facades\Log;

class PlantillasModel extends Model
{

    public $plantillasEnum = [
        'RECUPERAR_PASS' => 1,
        'REGISTRO_PROVEEDOR' => 2,
        'VALIDACION_PROVEEDOR' => 3,
        'MOD_PROVEEDOR' => 4,
        'INSCRIPCION_PROVEEDOR' => 5,
        'ACUSE_PREGUNTAS' => 6,
        'ACUSE_PROPUESTA' => 7,
        'DESCARGA_PREGUNTAS' => 8,
        'DIFERIMIENTO_PARTICIPANTE' => 9,
        'DIFERIMIENTO_INVITADO' => 10,
        'AUTORIZACION_APERTURA' => 11,
        'DESCARGA_PROPUESTA' =>12,
        'PRORROGA_JUNTA'=>13,
        'RESUPESTA_JUNTA'=>14,
        'DESCARGA_PREGUNTAS'=>15,
        'DESCARGA_REPORTES'=>16,
    ];

    public $timestamps = false;
    protected $table = 'cat_plantillas';
    protected $primaryKey = 'id_plantilla';

    protected $fillable = [
        'nombre',
        'texto_plantilla',
        'activo',
        'fecha_ultima_mod',
        'usuario_ultima_mod'
    ];

    protected $casts = [
        'fecha_ultima_mod' => 'datetime',
    ];

}
