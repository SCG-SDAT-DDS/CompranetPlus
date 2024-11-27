<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;


class TipoModalidadModel extends Model
{

    public $timestamps = false;
    protected $table = 'cat_tipos_modalidades';
    protected $primaryKey = 'id_tipo_modalidad';

    protected $fillable = [
        'nombre_modalidad',
        'activo',
        'fecha_ultima_mod',
        'usuario_ultima_mod'
    ];

    protected $casts = [
        'fecha_ultima_mod' => 'datetime',
    ];

    public function obtenerTiposModalidadesLicitaciones()
    {
        $query = DB::table('cat_tipos_modalidades as tm')
            ->distinct()
            ->select('tm.*');


        $data = $query->get();

        return $data;
    }


}
