<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class EstatusProveedorModel extends Model
{
    public $timestamps = false;
    protected $table = 'cat_estatus_proveedores';
    protected $primaryKey = 'id_estatus_proveedor';

    protected $fillable = [
        'nombre_estatus_proveedor',
        'estilo',
        'activo',
        'fecha_ultima_mod',
        'usuario_ultima_mod'
    ];

    protected $casts = [
        'fecha_ultima_mod' => 'datetime',
    ];
}
