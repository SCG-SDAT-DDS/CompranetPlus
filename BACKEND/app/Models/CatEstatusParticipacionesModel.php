<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Lang;

class CatEstatusParticipacionesModel extends Model{

    public $timestamps = false;

    protected $table = 'cat_estatus_participaciones';
    protected $primaryKey = 'id_estatus_participacion';
    protected $fillable = [
        'nombre_estatus_participacion',
        'activo',
    ];


    public function listado(){
        return CatTiposPersoneriasJuridicasModel::where('activo',true)->get();
    }
}

?>
