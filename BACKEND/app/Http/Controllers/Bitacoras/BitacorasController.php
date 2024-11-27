<?php

namespace App\Http\Controllers\Bitacoras;

use App\Http\Controllers\Controller;
use App\Models\DetalleBitacoraModel;
use App\Models\RespuestaServicio;
use Illuminate\Http\Request;

class BitacorasController extends Controller
{



    public function buscarBitacoras(Request $request)
    {

        $params = $request;

        $bit = new DetalleBitacoraModel();
        $dataResp = $bit->buscarBitacoras($params);

        $resp = new RespuestaServicio();
        return $resp->setBusquedaExito($dataResp)->getResponse();
    }

}
