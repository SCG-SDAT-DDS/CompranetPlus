<?php

namespace App\Http\Controllers\Proveedores;

use App\Http\Controllers\Controller;
use App\Models\DetProveedoresSociosModel;
use App\Models\RespuestaServicio;
use Illuminate\Http\Request;

class SociosController extends Controller
{

    public function getSociosProveedor(Request $request)
    {
        $params = $request;
        $prov = new DetProveedoresSociosModel();
        $dataResp = $prov -> getSociosProveedor($params);

        $resp = new RespuestaServicio();
        return $resp -> setBusquedaExito($dataResp) -> getResponse();
    }
}
