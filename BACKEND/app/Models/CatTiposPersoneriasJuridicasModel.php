<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Lang;

class CatTiposPersoneriasJuridicasModel extends Model{

    public $timestamps = false;

    protected $table = 'cat_tipos_personerias_juridicas';
    protected $primaryKey = 'id_tipo_personeria_juridica';
    protected $fillable = [
        'nombre_personeria_juridica',
        'activo',
    ];


    public function listado(){
        return CatTiposPersoneriasJuridicasModel::where('activo',true)->get();
    }
}

?>
