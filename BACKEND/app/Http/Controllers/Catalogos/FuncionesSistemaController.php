<?php

namespace App\Http\Controllers\Catalogos;

use App\Http\Controllers\Controller;
use App\Models\FuncionSistemaModel;
use App\Models\RespuestaServicio;
use Illuminate\Http\Request;

class FuncionesSistemaController extends Controller
{
    public function buscarFuncionSistema(Request $request)
    {
        $request->validate([
            'nombre' => 'nullable|string',
            'estatus' => 'nullable|boolean'
        ]);

        $params = $request->all();

        $funcionSis = new FuncionSistemaModel();
        $dataResp = $funcionSis->buscarFuncionesSistema($params);

        $resp = new RespuestaServicio();
        return $resp->setBusquedaExito($dataResp)->getResponse();
    }

    public function guardarFuncionSistema(Request $request)
    {
        $request->validate([
            'id' =>  'nullable|numeric',
            'nombre' => 'required|string',
            'estatus' => 'nullable|boolean'
        ]);

        $params = $request->all();
        $params["idUsuario"] = $request->user()->id_usuario;

        $funcionSis = new FuncionSistemaModel();
        $respServ = $funcionSis->guardarFuncionSistema($params);

        $resp = new RespuestaServicio();
        if ($respServ->exito) {
            return $resp->setExito($respServ->datos, $respServ->mensaje)->getResponse();
        } else {
            return $resp->setError(null, $respServ->mensaje)->getResponse();
        }
    }

    public function cambiarEstatusFuncionSistema(Request $request)
    {
        $request->validate([
            'id' =>  'required|numeric',
            'estatus' =>  'required|boolean'
        ]);

        $params = $request->all();
        $params["idUsuario"] = $request->user()->id_usuario;

        $funcionSis = new FuncionSistemaModel();
        $respServ = $funcionSis->cambiarEstatusFuncionSistema($params);

        $resp = new RespuestaServicio();
        if ($respServ->exito) {
            return $resp->setExito($respServ->datos, $respServ->mensaje)->getResponse();
        } else {
            return $resp->setError(null, $respServ->mensaje)->getResponse();
        }
    }
}
