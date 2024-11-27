<?php

namespace App\Http\Controllers\Catalogos;

use App\Http\Controllers\Controller;
use App\Models\EstadoModel;
use App\Models\RespuestaServicio;
use Illuminate\Http\Request;

class EstadosController extends Controller
{
    public function buscarEstado(Request $request)
    {
    
        $params = $request->all();

        $catEstadoModel = new EstadoModel();
        $dataResp = $catEstadoModel->getEstados($params);

        $resp = new RespuestaServicio();
        return $resp->setBusquedaExito($dataResp)->getResponse();

        
    }

    public function obtenerEstados()
    {
    
        $catEstadoModel = new EstadoModel();
        $dataResp = $catEstadoModel->getEstadosById();

        $resp = new RespuestaServicio();
        return $resp->setBusquedaExito($dataResp)->getResponse();
        
    }

}
