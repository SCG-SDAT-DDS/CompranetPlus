<?php

namespace App\Http\Controllers\Convocantes;

use App\Http\Controllers\Controller;
use App\Models\DetalleConvocatoriaModel;
use App\Models\RespuestaServicio;
use Illuminate\Http\Request;

class DetalleConvocatoriaController extends Controller
{
    public function obtenerDetalleFechas(Request $request)
    {

        $params = $request->all();

        $detalleFechas = new DetalleConvocatoriaModel();
        $dataResp = $detalleFechas->obtenerFechasProcedimiento($params);

        $resp = new RespuestaServicio();
        return $resp->setExito($dataResp)->getResponse();
    }

    public function diferendoActoApertura(Request $request)
    {
        $params = $request->all();
        $params["idUsuario"] = $request->user()->id_usuario ?? null;

        $proc = new DetalleConvocatoriaModel();
        $respServ = $proc->guardarDiferendo($params);


        $resp = new RespuestaServicio();
        if ($respServ->exito) {
            return $resp->setExito($respServ->datos, $respServ->mensaje)->getResponse();
        } else {
            return $resp->setError(null, $respServ->mensaje)->getResponse();
        }

    }

    public function recepcionApertura(Request $request)
    {
        $params = $request->all();
        $params["idUsuario"] = $request->user()->id_usuario ?? null;

        $proc = new DetalleConvocatoriaModel();
        $respServ = $proc->guardarActaRecepcionApertura($params);


        $resp = new RespuestaServicio();
        if ($respServ->exito) {
            return $resp->setExito($respServ->datos, $respServ->mensaje)->getResponse();
        } else {
            return $resp->setError(null, $respServ->mensaje)->getResponse();
        }

    }
}
