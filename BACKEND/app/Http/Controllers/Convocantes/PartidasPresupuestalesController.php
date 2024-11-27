<?php

namespace App\Http\Controllers\Convocantes;

use App\Enums\TipoArchivo;
use App\Helper\ArchivosHelper;
use App\Http\Controllers\Controller;
use App\Models\ArchivoModel;
use App\Models\DetallePropuestasParticipantesModel;
use App\Models\DetPartidasProcedimientosModel;
use App\Models\ProcedimientoAdministrativoModel;
use App\Models\RespuestaServicio;
use App\Models\TipoContrataciones;
use Illuminate\Http\Request;

class PartidasPresupuestalesController extends Controller
{


    public function obtenerPartidasProcedimiento(Request $request)
    {

        $request->validate([
            'idProcedimiento' =>  'required|numeric'
        ]);

        $params = $request->all();

        $model = new DetPartidasProcedimientosModel();
        $dataResp = $model->obtenerPartidasProcedimiento($params['idProcedimiento']);

        $resp = new RespuestaServicio();
        return $resp->setExito($dataResp)->getResponse();
    }

    public function obtenerAnexoPartidasProcedimiento(Request $request)
    {

        $request->validate([
            'idProcedimiento' =>  'required|numeric'
        ]);

        $params = $request->all();

        $model = new ProcedimientoAdministrativoModel();
        $urlArchivo = $model->obtenerDocumentoPartidasProcedimiento($params['idProcedimiento']);

        $archHelp = new ArchivosHelper();
        $dataResp = $archHelp->obtenerDocumento($urlArchivo);

        $path = parse_url($urlArchivo, PHP_URL_PATH);
        $nombreArchivo = basename($path);

        $resp = new RespuestaServicio();
        return $resp->setExito([
           'archivo'=> $dataResp,
           'nombreArchivo'=>$nombreArchivo
        ])->getResponse();
    }

    public function obtenerPartidasProveedor(Request $request)
    {

        $request->validate([
            'idProveedor' =>  'required|numeric',
            'idProcedimiento' =>  'required|numeric',
        ]);

        $params = $request->all();

        $model = new DetPartidasProcedimientosModel();
        $dataResp = $model->obtenerPartidasProveedor($params['idProcedimiento'], $params['idProveedor']);

        $resp = new RespuestaServicio();
        return $resp->setExito($dataResp)->getResponse();
    }

    public function obtenerPropuestaParticipanteProcedimiento(Request $request)
    {

        $request->validate([
            'idProveedor' =>  'required|numeric',
            'idProcedimiento' =>  'required|numeric',
        ]);

        $params = $request->all();

        $modelPropPart = new DetallePropuestasParticipantesModel();
        $idParticipanteProcedimiento = $modelPropPart->obtenerPropuestaParticipanteProcedimiento(
            $params["idProcedimiento"], $params["idProveedor"]);

        $resp = new RespuestaServicio();
        if ($idParticipanteProcedimiento != null) {
            return $resp->setExito($idParticipanteProcedimiento)->getResponse();
        } else {
            return $resp->setError($idParticipanteProcedimiento, "El participante no cuenta con una propuesta")->getResponse();
        }
    }

    public function almacenarPartidasProveedor(Request $request)
    {

        $request->validate([
            'idProveedor' =>  'required|numeric',
            'idProcedimiento' =>  'required|numeric',
            'lstDatosPartidaPresupuestal' =>  'required',
            'anexo' =>  'required',
        ]);

        $params = $request->all();
        $params["idUsuario"] = $request->user()->id_usuario;
        $params["url"] = $this->almacenarArchivoPartidaProveedor($params['anexo']);

        $model = new DetPartidasProcedimientosModel();
        $dataResp = $model->guardarPartidasPresupuestales($params,false);

        $resp = new RespuestaServicio();
        if ($dataResp->exito) {
            return $resp->setExito($dataResp)->getResponse();
        } else {
            return $resp->setError($dataResp->datos, $dataResp->mensaje)->getResponse();
        }
    }

    private function almacenarArchivoPartidaProveedor($anexo)
    {
        $tipoArchivo  = TipoArchivo::obtenerTipoArchivo(12);
        $archivo = new ArchivoModel("Partidas_presupuesto_proveedor.xls",
            $anexo['base64'],
            $tipoArchivo);

        $archHelp = new ArchivosHelper();
        $respServ = $archHelp->guardarDocumento(
            $archivo,
            "",
            true
        );

        return $respServ->datos;
    }


}
