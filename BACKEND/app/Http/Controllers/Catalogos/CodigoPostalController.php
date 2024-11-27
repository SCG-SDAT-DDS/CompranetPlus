<?php

namespace App\Http\Controllers\Catalogos;

use App\Http\Controllers\Controller;
use App\Models\CatAsentamientosModel;
use App\Models\RespuestaServicio;
use Illuminate\Http\Request;

class CodigoPostalController extends Controller
{
    public function buscarCodigoPostal(Request $request)
    {

        $params = $request->all();

        $catEstadoModel = new CatAsentamientosModel();
        $dataResp = $catEstadoModel->getAsentamientos($params);

        $resp = new RespuestaServicio();
        return $resp->setBusquedaExito($dataResp)->getResponse();


    }

    public function guardarAsentamiento(Request $request)
    {
        $request->validate([
            'id_asentamiento' =>  'nullable|numeric',
            'codigo_postal' =>  'required|numeric',
            'nombre_asentamiento' =>  'required|string',
            'tipo_asentamiento' => 'required|string',
            'id_estado' => 'required|numeric',
            'id_municipio' => 'nullable|numeric',
        ]);

        $params = $request->all();
        $params["idUsuario"] = $request->user()->id_usuario;

        $asentamiento = new CatAsentamientosModel();
        $respServ = $asentamiento->guardarAsentamiento($params);

        $resp = new RespuestaServicio();
        if ($respServ->exito) {
            return $resp->setExito($respServ->datos, $respServ->mensaje)->getResponse();
        } else {
            return $resp->setError(null, $respServ->mensaje)->getResponse();
        }
    }

    public function cambiarEstatusAsentamiento(Request $request)
    {
        $request->validate([
            'id_asentamiento' =>  'required|numeric',
            'activo' =>  'required|boolean'
        ]);

        $params = $request->all();
        $params["idUsuario"] = $request->user()->id_usuario;

        $funcionSis = new CatAsentamientosModel();
        $respServ = $funcionSis->cambiarEstatusAsentamiento($params);

        $resp = new RespuestaServicio();
        if ($respServ->exito) {
            return $resp->setExito($respServ->datos, $respServ->mensaje)->getResponse();
        } else {
            return $resp->setError(null, $respServ->mensaje)->getResponse();
        }
    }

    public function obtenerAsentamientoByCP(Request $request)
    {
        $request->validate([
            'codigo_postal' => 'required|numeric'
        ]);

        $params = $request->all();

        $codPost = new CatAsentamientosModel();
        $dataResp = $codPost->obtenerAsentamientoByCP($params);

        $respServ = new RespuestaServicio();
        return $respServ->setBusquedaExito($dataResp)->getResponse();

    }
}
