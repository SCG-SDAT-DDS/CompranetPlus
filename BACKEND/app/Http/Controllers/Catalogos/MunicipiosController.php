<?php

namespace App\Http\Controllers\Catalogos;

use App\Http\Controllers\Controller;
use App\Models\MunicipioModel;
use App\Models\RespuestaServicio;
use Illuminate\Http\Request;

class MunicipiosController extends Controller
{
    public function buscarMunicipio(Request $request)
    {
        
        $params = $request->all();

        $catMunicipioModel = new MunicipioModel();
        $dataResp = $catMunicipioModel->getMunicipio($params);

        $resp = new RespuestaServicio();
        return $resp->setBusquedaExito($dataResp)->getResponse();
    }

    public function obtenerMunicipios(Request $request)
    {
        $params = $request->all();
        
        $catMunicipioModel = new MunicipioModel();
        $dataResp = $catMunicipioModel->getMunicipiosByEstado($params);

        $resp = new RespuestaServicio();
        return $resp->setBusquedaExito($dataResp)->getResponse();
        
    }
}
