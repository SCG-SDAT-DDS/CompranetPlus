<?php

namespace App\Http\Controllers\Convocantes;

use Carbon\Carbon;
use App\Http\Controllers\Controller;
use App\Models\DetalleParticipantesProcedimientosModel;
use App\Models\RespuestaServicio;
use App\Models\TipoContrataciones;
use Illuminate\Http\Request;

class ParticipantesController extends Controller
{

    public function obtenerParticipantesGanadoresProcedimiento(Request $request)
    {

        $params = $request;

        $participantes = new DetalleParticipantesProcedimientosModel();
        $dataResp = $participantes->buscarGanadoresProcedimientos($params);

        $resp = new RespuestaServicio();
        return $resp->setBusquedaExito($dataResp)->getResponse();
    }


    public function obtenerParticipanteInvitado(Request $request){
        $request->validate([
            'id_procedimiento_administrativo' => 'required|numeric',
        ]);
        $params = $request->all();

        $participantes = new DetalleParticipantesProcedimientosModel();
        $data = $participantes->buscarDetalleParticipantesProcedimientos($params);
        $resp = new RespuestaServicio();
        return $resp->setBusquedaExito($data)->getResponse();

    }

    public function obtenerParticipanteInvitadoFallo(Request $request){
        $request->validate([
            'id_procedimiento_administrativo' => 'required|numeric',
        ]);
        $params = $request->all();

        $participantes = new DetalleParticipantesProcedimientosModel();
        $data = $participantes->buscarParticipantesFalloProcedimientos($params);
        $resp = new RespuestaServicio();
        return $resp->setBusquedaExito($data)->getResponse();

    }

    public function cambiarEstatusParticipante(Request $request)
    {
        $request->validate([
            'id_participante_procedimiento' =>  'required|numeric',
            'activo' =>  'required|boolean'
        ]);

        $params = $request->all();
        $params["idUsuario"] = $request->user()->id_usuario;

        $funcionPar = new DetalleParticipantesProcedimientosModel();
        $respServ = $funcionPar->cambiarEstusParticipanteProcedimiento($params);

        $resp = new RespuestaServicio();
        if ($respServ->exito) {
            return $resp->setExito($respServ->datos, $respServ->mensaje)->getResponse();
        } else {
            return $resp->setError(null, $respServ->mensaje)->getResponse();
        }
    }

    public function guardarParticipanteInvitado(Request $request){
        $request->validate([
            'id_participante_procedimiento ' =>  'nullable|numeric',
            'id_procedimiento_administrativo' =>  'required|numeric',
            'id_proveedor' =>  'required|numeric'
        ]);

        $params = $request->all();
        $params["idUsuario"] = $request->user()->id_usuario;
        $params["id_estatus_participacion"] = 1;
        $params["fecha_inscripcion"] = Carbon::now();
        $funcionPar = new DetalleParticipantesProcedimientosModel();
        $respServ = $funcionPar->guardarDetalleParticipantesProcedimientos($params);

        $resp = new RespuestaServicio();
        if ($respServ->exito) {
            $funcionPar->notificarParticipanteProveedor($params);
            return $resp->setExito($respServ->datos, $respServ->mensaje)->getResponse();
        } else {
            return $resp->setError(null, $respServ->mensaje)->getResponse();
        }

    }

    public function obtenerProposiciones(Request $request)
    {
        $params = $request-> all();

        $participantes = new DetalleParticipantesProcedimientosModel();
        $data = $participantes->obtenerProposicionesConvocatoria($params);
        $resp = new RespuestaServicio();
        return $resp->setBusquedaExito($data)->getResponse();
    }

    public function guardarParticipantesGanadores(Request $request){
        $request->validate([
            'archivo_fallo' => 'required',
        ]);

        $params = $request->all();

        $params["idUsuario"] = $request->user()->id_usuario;

        $funcionPar = new DetalleParticipantesProcedimientosModel();
        $respServ = $funcionPar->participantesGanadoresProcedimiento($params);

        $resp = new RespuestaServicio();
        if ($respServ->exito) {
            $funcionPar->notificarPropuestaFallo($params);
            
            return $resp->setExito($respServ->datos, $respServ->mensaje)->getResponse();
        } else {
            return $resp->setError(null, $respServ->mensaje)->getResponse();
        }

    }

    public function notificarDescargaPropuesta(Request $request)
    {
        $data = $request->all();
        $params = $data['params'];

        $resp = new RespuestaServicio();

        try {
            $funcionPar = new DetalleParticipantesProcedimientosModel();
            $funcionPar->enviarNotificacion($params);

            return $resp->setExito(true, 'Notificación enviada con éxito')->getResponse();

        } catch (\Exception $e) {
            if (str_contains(strtolower($e->getMessage()), 'smtp')) {
                return $resp->setExito(true, 'El servicio de Correos no está disponible por el momento')->getResponse();
            }
            // Manejar cualquier otro tipo de error
            return $resp->setError(null, 'Error al enviar la notificación: ' . $e->getMessage())->getResponse();
        }
    }



}
