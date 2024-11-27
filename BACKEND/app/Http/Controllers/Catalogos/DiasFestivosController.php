<?php

namespace App\Http\Controllers\Catalogos;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\CatDiasFestivosModel;
use App\Models\RespuestaServicio;


class DiasFestivosController extends Controller
{

    public function getDiasFestivos(Request $request)
    {
        $params = $request;
        $dias = new CatDiasFestivosModel();
        $dataResp = $dias -> getDiasFestivos($params);

        $resp = new RespuestaServicio();
        return $resp -> setBusquedaExito($dataResp) -> getResponse();
    }

    public function guardarDiaFestivo(Request $request)
    {
        $request->validate([
            'id_dia_festivo' =>  'nullable|numeric',
            'nombre_dia_festivo' => 'required|string',
            'fecha_dia_festivo' => 'required|string',
        ]);

        $params = $request->all();
        $params["idUsuario"] = $request->user()->id_usuario;

        $diaModel = new CatDiasFestivosModel();
        $respServ = $diaModel->guardarDiaFestivo($params);

        $resp = new RespuestaServicio();
        if ($respServ->exito) {
            return $resp->setExito($respServ->datos, $respServ->mensaje)->getResponse();
        } else {
            return $resp->setError(null, $respServ->mensaje)->getResponse();
        }
    }

    public function cambiarEstatusDiaFestivo(Request $request)
    {
        $request->validate([
            'id_dia_festivo' => 'required|numeric',
            'activo' => 'required|boolean'
        ]);

        $params = $request->all();
        $params["idUsuario"] = $request->user()->id_usuario;

        $diaModel = new CatDiasFestivosModel();
        $respServ = $diaModel->cambiarEstatusDiaFestivo($params);

        $resp = new RespuestaServicio();
        if ($respServ->exito) {
            return $resp->setExito($respServ->datos, $respServ->mensaje)->getResponse();
        } else {
            return $resp->setError(null, $respServ->mensaje)->getResponse();
        }
    }

    public function obtenerDiasFestivos()
    {
        $dias = new CatDiasFestivosModel();
        $dataResp = $dias -> obtenerDiasFestivos();

        $resp = new RespuestaServicio();
        return $resp -> setBusquedaExito($dataResp) -> getResponse();
    }
}
