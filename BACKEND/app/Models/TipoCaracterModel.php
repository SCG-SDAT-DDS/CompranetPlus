<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Lang;
use Illuminate\Support\Facades\Log;

class TipoCaracterModel extends Model
{

    public $timestamps = false;
    protected $table = 'cat_tipos_caracteres_licitaciones';
    protected $primaryKey = 'id_tipo_caracter_licitacion';

    protected $fillable = [
        'nombre_caracter_licitacion',
        'activo',
        'fecha_ultima_mod',
        'usuario_ultima_mod'
    ];

    protected $casts = [
        'fecha_ultima_mod' => 'datetime',
    ];

    public function obtenerTiposCaracteresLicitaciones()
    {
        $query = DB::table('cat_tipos_caracteres_licitaciones as tcl')
            ->distinct()
            ->select('tcl.*');


        $data = $query->get();

        return $data;
    }


}
