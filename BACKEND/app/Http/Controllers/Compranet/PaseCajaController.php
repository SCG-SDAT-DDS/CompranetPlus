<?php

namespace App\Http\Controllers\Compranet;

use App\Helper\PaseCajaHelper;
use App\Http\Controllers\Controller;
use App\Models\DetalleParticipantesProcedimientosModel;
use App\Models\RespuestaServicio;
use DOMException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Lang;


class PaseCajaController extends Controller
{
    public function obtenerConceptosCobro()
    {
        $PaseCajaHelper = new PaseCajaHelper();
        $resp = new RespuestaServicio();
        return $resp->setBusquedaExito($PaseCajaHelper->conceptoCobroService())->getResponse();

    }

    public function obtenerB64PaseCaja(Request $request)
    {
        $request->validate([
            'idPaseCaja' =>  ['required', 'numeric'],
        ]);

        $params = $request->all();

        $PaseCajaResp = new PaseCajaHelper();
        $resp = new RespuestaServicio();
        return $resp->setBusquedaExito($PaseCajaResp->obtenerB64PaseCaja($params))->getResponse();
    }


    public function consultaRecibo(Request $request)
    {
        $request->validate([
            'idPaseCaja' =>  ['required', 'numeric'],
            'id_participante_procedimiento' => ['required']
        ]);

        $params = $request->all();
        $params["idUsuario"] = $request->user()->id_usuario;

        $PaseCajaHelper = new PaseCajaHelper();
        $paseResp = $PaseCajaHelper->obtenerRecibo($params);
        if (isset($paseResp['status_recibo']) && $paseResp['status_recibo'] !== '1' || $paseResp['error'] == true){
            $funcionPar = new DetalleParticipantesProcedimientosModel();
            $funcionPar->generoRecibo($params);
        }

        $resp = new RespuestaServicio();
        return $resp->setBusquedaExito($paseResp)->getResponse();
    }

    /**
     * @throws DOMException
     */
    public function generarPaseCaja(Request $request)
    {
        $params = $request->json()->all();
        $params["idUsuario"] = $request->user()->id_usuario;

        $PaseCajaHelper = new PaseCajaHelper();

        $conceptos = $PaseCajaHelper->conceptoCobroService();
        $params["COD_BP"] = $conceptos["COD_BP"];
        $params["COD_CTA_CONTRATO"] = $conceptos["COD_CTA_CONTRATO"];
        $params["COD_OBJ_CONTRATO"] = $conceptos["COD_OBJ_CONTRATO"];

        $folio = $PaseCajaHelper->generarPaseCaja($params);

        $resp = new RespuestaServicio();

        if ($folio !== null && $folio !== '') {
            $funcionPar = new DetalleParticipantesProcedimientosModel();
            $funcionPar->generoPaseCaja($params, $folio);
            $parametro = [
                'idPaseCaja' =>$folio
            ];
            $recibo = $PaseCajaHelper->obtenerB64PaseCaja($parametro);
            $datos = [
                'base64' => $recibo,
                'folio' => $folio
            ];
            return $resp->setExito($datos, Lang::get('messages.request_guardar'))->getResponse();
        } else {
            return $resp->setError(null,'Hubo un error al generar el pase a caja')->getResponse();
        }
    }
}
