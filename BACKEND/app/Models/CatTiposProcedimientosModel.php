<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Lang;

class CatTiposProcedimientosModel extends Model{

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

    public function getCatTiposProcedimientos(){
        try{
            return $this->where('activo',true)->get();
        }catch (\Exception $th) {
            //Log::error($th);
            Log::info('****** CatTiposProcedimientosModel->getCatTiposProcedimientos');
            Log::error($th->getMessage());
            Log::error($th->getFile());
            Log::error($th->getLine());
            DB::rollback();
            return new RespuestaModel(false,  null, $th);
        }
    }
}

?>
