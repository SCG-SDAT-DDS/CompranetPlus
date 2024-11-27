<?php

namespace App\Http\Controllers\Catalogos;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\TipoArchivosModel; // Asegúrate de importar el modelo Proveedor
use App\Models\RespuestaServicio;

class TipoArchivoController extends Controller
{
    public function buscarTipoArchivos(Request $request)
    {

        $params = $request;

        $proc = new TipoArchivosModel();
        $dataResp = $proc->getTiposArchivos($params);

        $resp = new RespuestaServicio();
        return $resp->setBusquedaExito($dataResp)->getResponse();
    }

    public function obtenerCoincidencia(Request $request)
    {

        $params = $request;

        $proc = new TipoArchivosModel();
        $dataResp = $proc->existInProcedimiento($params);

        $resp = new RespuestaServicio();
        return $resp->setBusquedaExito($dataResp)->getResponse();
    }

    public function guardarTipoArchivo(Request $request)
    {

        $params = $request;
        $params["idUsuario"] = $request->user()->id_usuario;

        $proc = new TipoArchivosModel();
        $respServ = $proc->guardarTipoArchivo($params);

        $resp = new RespuestaServicio();
        if ($respServ->exito) {
            return $resp->setExito($respServ->datos, $respServ->mensaje)->getResponse();
        } else {
            return $resp->setError(null, $respServ->mensaje)->getResponse();
        }
    }

    public function eliminarTipoArchivo(Request $request)
    {

        $params = $request;
        $params["idUsuario"] = $request->user()->id_usuario ?? null;

        $proc = new TipoArchivosModel();
        if ($params["enUso"] === false) {
            $respServ = $proc->eliminarRegistro($params["id_tipo_archivo"]);
        }else {
            $respServ = $proc->eliminarTipoArchivo($params);
        }

        $resp = new RespuestaServicio();
        if ($respServ->exito) {
            return $resp->setExito($respServ->datos, $respServ->mensaje)->getResponse();
        } else {
            return $resp->setError(null, $respServ->mensaje)->getResponse();
        }
    }
}
