<?php

namespace App\Http\Controllers\Proveedores;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ProveedorModel; // Asegúrate de importar el modelo Proveedor
use App\Models\RespuestaServicio;
use Illuminate\Support\Facades\Log;


class ProveedorController extends Controller
{
    public function guardarProveedor(Request $request)
    {

        $data = $request->all();
        $parametros = $data['proveedor'];
        $arraySocios = $data['socios'] ?? [];
        $arrayDocumentos = $data['documentos'] ?? [];
        $parametros["idUsuario"] = $request->user()->id_usuario ?? null;

        $proveedorModel = new ProveedorModel();
        $respServ = $proveedorModel->guardarProveedor($parametros , $arraySocios, $arrayDocumentos); // Llama a tu función de guardado

        $resp = new RespuestaServicio();
        if ($respServ->exito) {
            return $resp->setExito($respServ->datos, $respServ->mensaje)->getResponse();
        } else {
            return $resp->setError(null, $respServ->mensaje)->getResponse();
        }
    }


    public function buscarProovedores(Request $request)
    {

        $params = $request;

        $proc = new ProveedorModel();
        $dataResp = $proc->buscarProveedores($params);

        $resp = new RespuestaServicio();
        return $resp->setBusquedaExito($dataResp)->getResponse();
    }

    public function getProveedores(Request $request)
    {
        $params = $request;
        $prov = new ProveedorModel();
        $dataResp = $prov -> getProveedores($params);

        $resp = new RespuestaServicio();
        return $resp -> setBusquedaExito($dataResp) -> getResponse();
    }

    public function cambiarEstatusProveedor(Request $request)
    {
        $request->validate([
            'id_proveedor' =>  'required|numeric',
            'id_estatus_proveedor' =>  'required|numeric'
        ]);

        $params = $request->all();
        $params["idUsuario"] = $request->user()->id_usuario;

        $proc = new ProveedorModel();
        $respServ = $proc->cambiarEstatusProveedor($params);

        $resp = new RespuestaServicio();
        if ($respServ->exito) {
            return $resp->setExito($respServ->datos, $respServ->mensaje)->getResponse();
        } else {
            return $resp->setError(null, $respServ->mensaje)->getResponse();
        }
    }

    public function finalizarRegistroProveedor(Request $request)
    {
        $request->validate([
            'id_proveedor' =>  'required|numeric',
        ]);

        $params = $request->all();

        $proc = new ProveedorModel();
        $respServ = $proc->finalizarRegistroProveedor($params);

        $resp = new RespuestaServicio();
        if ($respServ->exito) {
            return $resp->setExito($respServ->datos, $respServ->mensaje)->getResponse();
        } else {
            return $resp->setError(null, $respServ->mensaje)->getResponse();
        }
    }

    public function eliminarProveedor(Request $request)
    {
        $request->validate([
            'id_proveedor' => 'required|numeric',
            'activo' => 'required|boolean'
        ]);

        $params = $request->all();
        $params["idUsuario"] = $request->user()->id_usuario;

        $diaModel = new ProveedorModel();
        $respServ = $diaModel->eliminarProveedor($params);

        $resp = new RespuestaServicio();
        if ($respServ->exito) {
            return $resp->setExito($respServ->datos, $respServ->mensaje)->getResponse();
        } else {
            return $resp->setError(null, $respServ->mensaje)->getResponse();
        }
    }

    public function obtenerEstatusProveedor(Request $request)
    {
        $request->validate([
            'id_proveedor' =>  'required|numeric',
        ]);

        $params = $request->all();

        $prov = new ProveedorModel();
        $dataResp = $prov -> getStatusProveedor($params);

        $resp = new RespuestaServicio();
        return $resp -> setBusquedaExito($dataResp) -> getResponse();

    }
}
