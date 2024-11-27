<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Lang;

class MsReportesModel extends Model{

    protected $table = 'ms_reportes';

    public $timestamps = false;

    public function ultimoReporte(){
        $msReporteModel = MsReportesModel::orderBy('id_ms_reportes','desc');
        return $msReporteModel->first();
    }

}
