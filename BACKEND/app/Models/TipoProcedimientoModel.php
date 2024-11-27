<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Lang;
use Illuminate\Support\Facades\Log;

class TipoProcedimientoModel extends Model
{

    public $timestamps = false;
    protected $table = 'cat_tipos_procedimientos';
    protected $primaryKey = 'id_tipo_procedimiento';

    protected $fillable = [
        'nombre_procedimiento',
        'activo',
        'fecha_ultima_mod',
        'usuario_ultima_mod'
    ];

    protected $casts = [
        'fecha_ultima_mod' => 'datetime',
    ];

    public function obtenerTiposProcedimientos($params)
    {
        $query = DB::table('cat_tipos_procedimientos as tp')
            ->distinct()
            ->select('tp.*');

        if ($params['tipo'] == 1 || $params['tipo'] == 2) {
            $query->where('tp.id_tipo_procedimiento','<=',6);
        }

        $data = $query->get();

        return $data;
    }


}
