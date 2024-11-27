<?php

namespace App\Http\Controllers\Proveedores;

use App\Helper\CorreosHelper;
use App\Helper\NotificacionesHelper;
use App\Http\Controllers\Controller;
use App\Models\BitacoraModel;
use App\Models\DetalleBitacoraModel;
use App\Models\DetalleParticipantesProcedimientosModel;
use App\Models\DetallePropuestasParticipantesModel;
use App\Models\DetParticipantesProcedimientosModel;
use App\Models\MsNotificacionesUsuariosModel;
use App\Models\ProveedorModel;
use App\Models\RespuestaServicio;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Mockery\Exception;

class TableroProveedoresController extends Controller
{


    public function obtenerProcedimientosProveedor(Request $request){

        $params = $request->all();

        $detProveedor = new DetParticipantesProcedimientosModel();
        $dataResp = $detProveedor->obtenerProcedimientosProveedor($params);

        $resp = new RespuestaServicio();
        return $resp->setBusquedaExito($dataResp)->getResponse();

    }

    public function obtenerNotificacionesProveedor(Request $request){

        $request->validate([
            'id_usuario' => 'nullable|numeric',
        ]);

        $params = $request->all();

        $resp = new RespuestaServicio();

        if($params["id_usuario"] != null) {
            $msNotificacionesUsuario = new MsNotificacionesUsuariosModel();
            $dataResp = $msNotificacionesUsuario->getMsNotificacionesUsuario($params);
            return $resp->setBusquedaExito($dataResp)->getResponse();
        }

        return $resp->setError(null, 'id_usuario es requerido!')->getResponse();

    }

    public function notificacionLeida(Request $request){

        $request->validate([
            'id_notificacion' => 'nullable|numeric',
        ]);

        $params = $request->all();
        $resp = new RespuestaServicio();

        if($params["id_notificacion"] != null) {
            $msNotificacionesUsuario = new MsNotificacionesUsuariosModel();
            $dataResp = $msNotificacionesUsuario->notificacionLeida($params);
            return $resp->setBusquedaExito($dataResp)->getResponse();
        }

        return $resp->setError(null, 'id_usuario es requerido!')->getResponse();

    }

    public function inscripcionProcedimiento(Request $request){
        $params = $request->all();

        $detProveedor = new DetParticipantesProcedimientosModel();
        $dataResp = $detProveedor->guardarInscripcionProveedor($params);

        $resp = new RespuestaServicio();
        return $resp->setBusquedaExito($dataResp)->getResponse();
    }

    public function obtenerDetalleParticipante(Request $request)
    {
        $params = $request->all();
        $detProveedor = new DetalleParticipantesProcedimientosModel();
        $dataResp = $detProveedor->obtenerDetalleParticipante($params);

        $resp = new RespuestaServicio();
        return $resp->setBusquedaExito($dataResp)->getResponse();
    }

    public function obtenerDetalleParticipantePaseCaja(Request $request)
    {
        $params = $request->all();
        $detProveedor = new DetalleParticipantesProcedimientosModel();
        $dataResp = $detProveedor->obtenerDetalleParticipantePaseCaja($params);

        $resp = new RespuestaServicio();
        return $resp->setBusquedaExito($dataResp)->getResponse();
    }

    public function guardarPropuestaProveedor(Request $request){
        $params = $request->all();

        $detProveedor = new DetallePropuestasParticipantesModel();
        $dataResp = $detProveedor->guardarPropuesta($params);

        $resp = new RespuestaServicio();
        if ($dataResp->exito) {
            return $resp->setExito($dataResp->datos, $dataResp->mensaje)->getResponse();
        } else {
            return $resp->setError(null, $dataResp->mensaje)->getResponse();
        }

    }

    public function guardarPropuestasProveedor(Request $request)
    {
        $params = $request->all();

        $detProveedor = new DetallePropuestasParticipantesModel();
        $dataResp = $detProveedor->guardarPropuestas($params['propuestas'] ?? []);

        $resp = new RespuestaServicio();
        if ($dataResp->exito) {
            return $resp->setExito($dataResp->datos, $dataResp->mensaje)->getResponse();
        } else {
            return $resp->setError(null, $dataResp->mensaje)->getResponse();
        }
    }

    public function generarPaseCaja(Request $request)
    {
        $request->validate([
            'id_participante_procedimiento' =>  'required|numeric',
            'pase_caja' =>  'required|boolean'
        ]);

        $params = $request->all();
        $params["idUsuario"] = $request->user()->id_usuario;

        $funcionPar = new DetalleParticipantesProcedimientosModel();
        $respServ = $funcionPar->generoPaseCaja($params);

        $resp = new RespuestaServicio();
        if ($respServ->exito) {
            return $resp->setExito($respServ->datos, $respServ->mensaje)->getResponse();
        } else {
            return $resp->setError(null, $respServ->mensaje)->getResponse();
        }
    }

    public function notificarAcusePropuesta(Request $request)
    {
        $resp = new RespuestaServicio();
        try {
            // Validar la entrada
            $validated = $request->validate([
                'procedimiento' => 'required|string',
                'id_proveedor' => 'required'
            ]);

            $params = $validated; // Usar los datos validados

            // Obtener el proveedor
            $proveedor = ProveedorModel::obtenerCorreoProveedor($params["id_proveedor"]);

            $destinatario = $proveedor->razon_social !== null
                ? $proveedor->razon_social
                : $proveedor->nombre_proveedor . " " . $proveedor->primer_apellido_proveedor . " " . $proveedor->segundo_apellido_proveedor;

            // Variables para bitácora
            $seccion = "Recepcion de Propuesta";
            $descripcionAccion = "Recepcion de Propuestas del Proveedor: " . $proveedor->rfc_proveedor . " en la Licitación: " . $params["procedimiento"];

            // Bitácora
            $bitacoraModel = new BitacoraModel($proveedor->id_usuario, $seccion, $descripcionAccion);
            $bit = new DetalleBitacoraModel();
            $respBit = $bit->guardarBitacora($bitacoraModel);

            // Notificación
            NotificacionesHelper::insertNotificacion(
                $proveedor->id_usuario,
                "Acuse de Recepción de Proposiciones " . $params["procedimiento"],
                "Le notificamos que han sido recibidas sus propuestas:" . $params["procedimiento"]
            );


            try {
                $helpCorreo = new CorreosHelper();
                $helpCorreo->correoAcusePropuestas(
                    $proveedor->correo_electronico,
                    "Acuse de Recepción de Proposiciones " . $params["procedimiento"],
                    $destinatario,
                    $params["procedimiento"]
                );

                return $resp->setExito(1, 'Se le ha enviando una notificación a su correo')->getResponse();

            } catch (\Exception $th) {
                Log::error("Error al enviar el correo al proveedor: " . $th->getMessage(), ['exception' => $th]);
                return $resp->setExito(0, 'El servicio de correos no está disponible por el momento')->getResponse();
            }

        } catch (\Exception $th) {
            return $resp->setError(null, $th->getMessage())->getResponse();
        }
    }
}
