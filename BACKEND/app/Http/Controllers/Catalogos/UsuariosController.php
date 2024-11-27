<?php

namespace App\Http\Controllers\Catalogos;

use App\Http\Controllers\Controller;
use App\Models\FuncionSistemaModel;
use App\Models\RespuestaServicio;
use App\Models\RolModel;
use App\Models\RolSistemaModel;
use App\Models\User;
use Illuminate\Http\Request;

class UsuariosController extends Controller
{
    public function buscarUsuarios(Request $request)
    {
        $request->validate([
            'nombre' => 'nullable|string',
            'aPaterno' => 'nullable|string',
            'aMaterno' => 'nullable|string',
            'rol' => 'nullable|numeric',
            'estatus' => 'nullable|boolean'
        ]);

        $params = $request->all();

        $model = new User();
        $dataResp = $model->buscarUsuarios($params);

        $resp = new RespuestaServicio();
        return $resp->setBusquedaExito($dataResp)->getResponse();
    }

    public function guardarUsuario(Request $request)
    {
        $request->validate([
            'id' =>  'nullable|numeric',
            'nombre' => 'required|string',
            'aPaterno' => 'required|string',
            'aMaterno' => 'required|string',
            'usuario' => 'required|string',
            'idRol' => 'required|numeric',
            'email' => 'required|string|email',
            'estatus' => 'nullable|boolean',
            'contrasena' => 'nullable|string',
        ]);

        $params = $request->all();
        $params["idUsuario"] = $request->user()->id_usuario;

        $model = new User();
        $respServ = $model->guardarUsuario($params);

        $resp = new RespuestaServicio();
        if ($respServ->exito) {
            return $resp->setExito($respServ->datos, $respServ->mensaje)->getResponse();
        } else {
            return $resp->setError(null, $respServ->mensaje)->getResponse();
        }
    }

    public function cambiarEstatusUsuario(Request $request)
    {
        $request->validate([
            'id' =>  'required|numeric',
            'estatus' =>  'required|boolean'
        ]);

        $params = $request->all();
        $params["idUsuario"] = $request->user()->id_usuario;

        $model = new User();
        $respServ = $model->cambiarEstatusUsuario($params);

        $resp = new RespuestaServicio();
        if ($respServ->exito) {
            return $resp->setExito($respServ->datos, $respServ->mensaje)->getResponse();
        } else {
            return $resp->setError(null, $respServ->mensaje)->getResponse();
        }
    }

    public function cambiarContrasena(Request $request)
    {
        $request->validate([
            'id' =>  'required|numeric',
            'contrasena' =>  'required|string'
        ]);

        $params = $request->all();
        $params["idUsuario"] = $request->user()->id_usuario;

        $model = new User();
        $respServ = $model->cambiarContrasena($params);

        $resp = new RespuestaServicio();
        if ($respServ->exito) {
            return $resp->setExito($respServ->datos, $respServ->mensaje)->getResponse();
        } else {
            return $resp->setError(null, $respServ->mensaje)->getResponse();
        }
    }
}
