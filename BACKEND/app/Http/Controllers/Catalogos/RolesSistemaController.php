<?php

namespace App\Http\Controllers\Catalogos;

use App\Http\Controllers\Controller;
use App\Models\RespuestaServicio;
use App\Models\RolModel;
use App\Models\RolSistemaModel;
use Illuminate\Http\Request;

class RolesSistemaController extends Controller
{
    public function buscarRolesSistema(Request $request)
    {
        $request->validate([
            'nombre' => 'nullable|string',
            'estatus' => 'nullable|boolean'
        ]);

        $params = $request->all();

        $rolSis = new RolModel();
        $dataResp = $rolSis->buscarRolesSistema($params);

        $resp = new RespuestaServicio();
        return $resp->setBusquedaExito($dataResp)->getResponse();
    }

    public function guardarRolesSistema(Request $request)
    {
        $request->validate([
            'id' =>  'nullable|numeric',
            'nombre' => 'required|string',
            'estatus' => 'nullable|boolean'
        ]);

        $params = $request->all();
        $params["idUsuario"] = $request->user()->id_usuario;

        $funcionSis = new RolModel();
        $respServ = $funcionSis->guardarRolSistema($params);

        $resp = new RespuestaServicio();
        if ($respServ->exito) {
            return $resp->setExito($respServ->datos, $respServ->mensaje)->getResponse();
        } else {
            return $resp->setError(null, $respServ->mensaje)->getResponse();
        }
    }

    public function cambiarEstatusRolesSistema(Request $request)
    {
        $request->validate([
            'id' =>  'required|numeric',
            'estatus' =>  'required|boolean'
        ]);

        $params = $request->all();
        $params["idUsuario"] = $request->user()->id_usuario;

        $funcionRol = new RolModel();
        $respServ = $funcionRol->cambiarEstatusRolSistema($params);

        $resp = new RespuestaServicio();
        if ($respServ->exito) {
            return $resp->setExito($respServ->datos, $respServ->mensaje)->getResponse();
        } else {
            return $resp->setError(null, $respServ->mensaje)->getResponse();
        }
    }

    public function obtenerFuncionesRolesSistema(Request $request)
    {
        $request->validate([
            'idRol' => 'nullable|numeric'
        ]);

        $params = $request->all();

        $funSis = new RolSistemaModel();
        $dataResp = $funSis->obtenerFuncionesRolesSistema($params);

        $resp = new RespuestaServicio();
        return $resp->setBusquedaExito($dataResp)->getResponse();
    }

    public function activarRolSistema(Request $request)
    {
        $request->validate([
            'idRol' =>  'required|numeric',
            'idFuncion' =>  'required|numeric',
            'estatus' =>  'required|boolean'
        ]);

        $params = $request->all();
        $params["idUsuario"] = $request->user()->id_usuario;

        $funcionSis = new RolSistemaModel();
        $respServ = $funcionSis->activarRolSistema($params);

        $resp = new RespuestaServicio();
        if ($respServ->exito) {
            return $resp->setExito($respServ->datos, $respServ->mensaje)->getResponse();
        } else {
            return $resp->setError(null, $respServ->mensaje)->getResponse();
        }
    }
}
