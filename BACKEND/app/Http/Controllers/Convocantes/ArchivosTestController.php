<?php

namespace App\Http\Controllers\Convocantes;

use App\Enums\TipoArchivo;
use App\Helper\ArchivosHelper;
use App\Http\Controllers\Controller;
use App\Models\ArchivoModel;
use App\Models\RespuestaServicio;
use Illuminate\Http\Request;

class ArchivosTestController extends Controller
{


    public function almacenarArchivoTest(Request $request)
    {
        $request->validate([
            'nombreArchivo' =>  'required|string',
            'base64' =>  'required|string',
            'tipoArchivo' =>  'required|numeric',
            'procedimiento' =>  'required|numeric',
            'encriptar' =>  'required|boolean',
        ]);

        $tipoArchivo  = TipoArchivo::obtenerTipoArchivo($request->tipoArchivo);
        $archivo = new ArchivoModel($request->nombreArchivo,
            $request->base64,
            $tipoArchivo);

        $archHelp = new ArchivosHelper();
        $respServ = $archHelp->guardarDocumento(
            $archivo,
            $request->procedimiento,
            $request->encriptar
        );

        $resp = new RespuestaServicio();
        if ($respServ->exito) {
            return $resp->setExito($respServ->datos, $respServ->mensaje)->getResponse();
        } else {
            return $resp->setError(null, $respServ->mensaje)->getResponse();
        }
    }

    public function obtenerArchivoTest(Request $request)
    {
        $request->validate([
            'url' =>  'required|string',
            'encriptar' =>  'required|boolean',
        ]);

        $archHelp = new ArchivosHelper();
        $respServ = $archHelp->obtenerDocumento(
            $request->url,
            $request->encriptar
        );

        $resp = new RespuestaServicio();
        if ($respServ->exito) {
            return $resp->setExito($respServ->datos, $respServ->mensaje)->getResponse();
        } else {
            return $resp->setError(null, $respServ->mensaje)->getResponse();
        }
    }

}
