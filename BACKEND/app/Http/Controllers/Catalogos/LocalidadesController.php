<?php

namespace App\Http\Controllers\Catalogos;

use App\Http\Controllers\Controller;
use App\Models\LocalidadModel;
use App\Models\RespuestaServicio;
use Illuminate\Http\Request;

class LocalidadesController extends Controller
{
    public function buscarLocalidad(Request $request)
    {
        
        $params = $request->all();

        $funcionSis = new LocalidadModel();
        $dataResp = $funcionSis->getLoclidad($params);

        $resp = new RespuestaServicio();
        return $resp->setBusquedaExito($dataResp)->getResponse();
    }

    public function obtenerLocalidades(Request $request)
    {
        
        $params = $request -> all();

        $catLocalidades = new LocalidadModel();
        $dataResp = $catLocalidades -> getLocalidadesByMunicipio($params);

        $resp = new RespuestaServicio();
        return $resp -> setBusquedaExito($dataResp) -> getResponse();
    }

      
     
}
