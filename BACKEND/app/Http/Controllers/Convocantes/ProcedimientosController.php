<?php

namespace App\Http\Controllers\Convocantes;

use App\Helper\ArchivosHelper;
use App\Http\Controllers\Controller;
use App\Models\ContratoModel;
use App\Models\DetalleAutorizacionAperturaModel;
use App\Models\DetPartidasProcedimientosModel;
use App\Models\EstatusProcedimientoModel;
use App\Models\ProcedimientoAdministrativoModel;
use App\Models\RespuestaServicio;
use App\Models\TipoArchivosModel;
use App\Models\TipoCaracterModel;
use App\Models\TipoContrataciones;
use App\Models\TipoModalidadModel;
use App\Models\TipoProcedimientoModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ProcedimientosController extends Controller
{


    public function obtenerTiposProcedimientos(Request $request)
    {

        $params = $request['params'];

        $tipoProc = new TipoProcedimientoModel();
        $dataResp = $tipoProc->obtenerTiposProcedimientos($params);

        $resp = new RespuestaServicio();
        return $resp->setExito($dataResp)->getResponse();
    }


    public function obtenerTiposCaracteresLicitaciones(Request $request)
    {

        $params = $request['params'];

        $tipoCaracter = new TipoCaracterModel();
        $dataResp = $tipoCaracter->obtenerTiposCaracteresLicitaciones();

        $resp = new RespuestaServicio();
        return $resp->setExito($dataResp)->getResponse();
    }


    public function obtenerTiposModalidadesLicitaciones(Request $request)
    {

        $params = $request['params'];

        $tipoModalidad = new TipoModalidadModel();
        $dataResp = $tipoModalidad->obtenerTiposModalidadesLicitaciones();

        $resp = new RespuestaServicio();
        return $resp->setExito($dataResp)->getResponse();
    }

    public function obtenerTiposArchivos(Request $request)
    {

        $params = $request['params'];

        $tipoArchivos = new TipoArchivosModel();
        $dataResp = $tipoArchivos->obtenerTiposArchivos();

        $resp = new RespuestaServicio();
        return $resp->setExito($dataResp)->getResponse();
    }


    public function buscarProcedimientosAdministrativos(Request $request)
    {

        $params = $request;

        $proc = new ProcedimientoAdministrativoModel();
        $dataResp = $proc->buscarProcedimientosAdministrativos($params);

        $resp = new RespuestaServicio();
        return $resp->setBusquedaExito($dataResp)->getResponse();
    }


    public function guardarProcedimientoAdministrativo(Request $request)
    {
        $resp = new RespuestaServicio();

        $params = $request->all();
        $params["idUsuario"] = $request->user()->id_usuario;

            //VALIDAR SI ES DE TECNOLOGIA SUS ANEXOS

        $tiene_documento_licitacion = true;
        if (isset($params["licitacion_tecnologia"])) {
            if($params["licitacion_tecnologia"] == 1){
                $tiene_documento_licitacion = false;

                foreach ($params["anexos_procedimiento"] as $anexo) {
                    if ($anexo["id_tipo_archivo"] == 6) {
                        $tiene_documento_licitacion = true;
                        break;
                    }
                }

            }
        }

        if(!$tiene_documento_licitacion){
            return $resp->setError(null, 'El Dictamen Técnico de Tecnología es obligatorio')->getResponse();
        }

        if( !in_array($params["id_tipo_procedimiento"], [5, 6]) &&
            ($params["lstDatosPartidaPresupuestal"] == null || sizeof($params["lstDatosPartidaPresupuestal"]) == 0)){
            return $resp->setError(null, '!El anexo con partidas presupuestales debe de tener al menos una partida presupuestal!')->getResponse();
        }


        //VALIDAR SI ES DE OBRA SUS ANEXOS

        $tiene_anexo_tecnico_obra = true;
        $tiene_catalogo_conceptos = true;
        if (isset($params["id_tipo_procedimiento"])) {
            if($params["id_tipo_procedimiento"] == 5){
                $tiene_anexo_tecnico_obra = false;
                $tiene_catalogo_conceptos = false;

                foreach ($params["anexos_procedimiento"] as $anexo) {
                    if ($anexo["id_tipo_archivo"] == 7) {
                        $tiene_anexo_tecnico_obra = true;
                    }
                    if ($anexo["id_tipo_archivo"] == 8) {
                        $tiene_catalogo_conceptos = true;
                    }
                }

            }
        }

        if(!$tiene_anexo_tecnico_obra || !$tiene_catalogo_conceptos){
            return $resp->setError(null, 'El Anexo Técnico de Obra y el Catálogo de Conceptos son obligatorios')->getResponse();
        }


        //VALIDAR SI ES DE SERVICIOS RELACIONADOS CON OBRA SUS ANEXOS

        $tiene_anexo_tecnico_obra = true;
        $tiene_terminos_referencia = true;
        if (isset($params["id_tipo_procedimiento"])) {
            if($params["id_tipo_procedimiento"] == 6){
                $tiene_anexo_tecnico_obra = false;
                $tiene_terminos_referencia = false;

                foreach ($params["anexos_procedimiento"] as $anexo) {
                    if ($anexo["id_tipo_archivo"] == 7) {
                        $tiene_anexo_tecnico_obra = true;
                    }
                    if ($anexo["id_tipo_archivo"] == 10) {
                        $tiene_terminos_referencia = true;
                    }
                }

            }
        }

        if(!$tiene_anexo_tecnico_obra || !$tiene_terminos_referencia){
            return $resp->setError(null, 'El Anexo Técnico de Obra y los Términos de Referencia son obligatorios')->getResponse();
        }

        //

        $proc = new ProcedimientoAdministrativoModel();
        $respServ = $proc->guardarProcedimientoAdministrativo($params);
        $params["idProcedimiento"] = $respServ->datos;
        $params["url"] = "";

        if (!in_array($params["id_tipo_procedimiento"], [5, 6])) {
            $partPres = new DetPartidasProcedimientosModel();
            $respServPartPres = $partPres->guardarPartidasPresupuestales($params, true);

            if (!$respServPartPres->exito) {
                Log::info('Error en el guardado de las partidas'.' '.$respServPartPres->exito.' '.$respServPartPres->mensaje);
                return $resp->setError(null, $respServPartPres->mensaje.' '.'Hubo un error al guardar los datos de las partidas')->getResponse();
            }
        }

        if (!$respServ->exito) {
            Log::info('Error en el guardado de toda la informacion de la licitacion'.' '.$respServ->exito.' '.$respServ->mensaje);
            return $resp->setError(null, $respServ->mensaje.' '.'Hubo un error al guardar los datos de la licitacion')->getResponse();
        }


        return $resp->setExito($respServ->datos, $respServ->mensaje)->getResponse();

    }

    public function guardarAnexosProcedimientoAdministrativo(Request $request)
    {


        $params = $request->all();
        $params["idUsuario"] = $request->user()->id_usuario;

        $resp = new RespuestaServicio();


        $tiene_documento_licitacion = true;
        if (isset($params["licitacion_tecnologia"])) {
            if($params["licitacion_tecnologia"] == 1){
                $tiene_documento_licitacion = false;

                foreach ($params["anexos_procedimiento"] as $anexo) {
                    if ($anexo["id_tipo_archivo"] == 6) {
                        $tiene_documento_licitacion = true;
                        break;
                    }
                }

            }
        }

        if(!$tiene_documento_licitacion){
            return $resp->setError(null, 'El Dictamen Técnico de Tecnología es obligatorio')->getResponse();
        }




        //VALIDAR SI ES DE OBRA SUS ANEXOS

        $tiene_anexo_tecnico_obra = true;
        $tiene_catalogo_conceptos = true;
        if (isset($params["id_tipo_procedimiento"])) {
            if($params["id_tipo_procedimiento"] == 5){
                $tiene_anexo_tecnico_obra = false;
                $tiene_catalogo_conceptos = false;

                foreach ($params["anexos_procedimiento"] as $anexo) {
                    if ($anexo["id_tipo_archivo"] == 7) {
                        $tiene_anexo_tecnico_obra = true;
                    }
                    if ($anexo["id_tipo_archivo"] == 8) {
                        $tiene_catalogo_conceptos = true;
                    }
                }

            }
        }

        if(!$tiene_anexo_tecnico_obra || !$tiene_catalogo_conceptos){
            return $resp->setError(null, 'El Anexo Técnico de Obra y el Catálogo de Conceptos son obligatorios')->getResponse();
        }


        //VALIDAR SI ES DE SERVICIOS RELACIONADOS CON OBRA SUS ANEXOS

        $tiene_anexo_tecnico_obra = true;
        $tiene_terminos_referencia = true;
        if (isset($params["id_tipo_procedimiento"])) {
            if($params["id_tipo_procedimiento"] == 6){
                $tiene_anexo_tecnico_obra = false;
                $tiene_terminos_referencia = false;

                foreach ($params["anexos_procedimiento"] as $anexo) {
                    if ($anexo["id_tipo_archivo"] == 7) {
                        $tiene_anexo_tecnico_obra = true;
                    }
                    if ($anexo["id_tipo_archivo"] == 10) {
                        $tiene_terminos_referencia = true;
                    }
                }

            }
        }

        if(!$tiene_anexo_tecnico_obra || !$tiene_terminos_referencia){
            return $resp->setError(null, 'El Anexo Técnico de Obra y los Términos de Referencia son obligatorios')->getResponse();
        }

        //

        $proc = new ProcedimientoAdministrativoModel();
        $respServ = $proc->guardarAnexosProcedimientoAdministrativo($params);



        if ($respServ->exito) {
            return $resp->setExito($respServ->datos, $respServ->mensaje)->getResponse();
        } else {
            return $resp->setError(null, $respServ->mensaje)->getResponse();
        }
    }


    public function obtenerProcedimientoAdministrativo(Request $request)
    {

        $params = $request['params'];

        $proc = new ProcedimientoAdministrativoModel();
        $dataResp = $proc->obtenerProcedimientoAdministrativo($params);

        $model = new DetPartidasProcedimientosModel();
        $partidas = $model->obtenerPartidasProcedimiento($params["id_procedimiento_administrativo"]);
        $dataResp['procedimiento']->lstDatosPartidaPresupuestal = $partidas;

        $resp = new RespuestaServicio();
        return $resp->setBusquedaExito($dataResp)->getResponse();
    }


    public function obtenerEstatusProcedimiento(Request $request)
    {

        $params = $request['params'];

        $estatus = new EstatusProcedimientoModel();
        $dataResp = $estatus->obtenerEstatusProcedimiento($params);

        $resp = new RespuestaServicio();
        return $resp->setExito($dataResp)->getResponse();
    }

    public function cambiarEstatusProcedimiento(Request $request)
    {
        $request->validate([
            'id_procedimiento_administrativo' =>  'required|numeric',
            'id_estatus_procedimiento' =>  'required|numeric'
        ]);

        $params = $request->all();
        $params["idUsuario"] = $request->user()->id_usuario;

        $proc = new ProcedimientoAdministrativoModel();
        $respServ = $proc->cambiarEstatusProcedimiento($params);

        $resp = new RespuestaServicio();
        if ($respServ->exito) {
            return $resp->setExito($respServ->datos, $respServ->mensaje)->getResponse();
        } else {
            return $resp->setError(null, $respServ->mensaje)->getResponse();
        }
    }


    public function obtenerProcedimientosVistaPublica(Request $request)
    {
        $params = $request;
        $proc = new ProcedimientoAdministrativoModel();
        $dataResp = $proc -> obtenerProcedimientosVistaPublica($params);

        $resp = new RespuestaServicio();
        return $resp -> setBusquedaExito($dataResp) -> getResponse();
    }

    public function obtenerDetalleProcedimientoAdministrativo(Request $request)
    {

        $params = $request-> all();
        $proc = new ProcedimientoAdministrativoModel();
        $dataResp = $proc->obtenerDetalleProcedimiento($params);

        $resp = new RespuestaServicio();
        return $resp->setBusquedaExito($dataResp)->getResponse();
    }

    public function obtenerAnexosProcedimientoAdministrativo(Request $request)
    {

        $params = $request['params'];

        $proc = new ProcedimientoAdministrativoModel();
        $dataResp = $proc->obtenerAnexosProcedimientoAdministrativo($params);

        $resp = new RespuestaServicio();
        return $resp->setBusquedaExito($dataResp)->getResponse();
    }

    public function obtenerMsCostosInscripcionActuales(Request $request)
    {
        $params = $request['params'];

        $msCostosInscripcionModel = new MsCostosIncripcionesModel();
        $datosCostosInscripcion = $msCostosInscripcionModel->getMsCostosInscripcionesActuales($params);

        return RespuestaServicio::setBusquedaExito($datosCostosInscripcion)->getResponse();
    }

    public function obtenerArchivoBase64(Request $request)
    {
        $params = $request['params'];

        $archHelp = new ArchivosHelper();
        $respServ = $archHelp->obtenerDocumento(
            $params['url'],
            $params['encriptar']
        );

        $resp = new RespuestaServicio();
        if ($respServ->exito) {
            return $resp->setExito($respServ->datos, $respServ->mensaje)->getResponse();
        } else {
            return $resp->setError(null, $respServ->mensaje)->getResponse();
        }
    }


    public function obtenerContratosProcedimientoAdministrativo(Request $request)
    {

        $params = $request['params'];

        $proc = new ProcedimientoAdministrativoModel();
        $dataResp = $proc->obtenerContratosProcedimientoAdministrativo($params);

        $resp = new RespuestaServicio();
        return $resp->setBusquedaExito($dataResp)->getResponse();
    }


    public function guardarContratoProcedimientoAdministrativo(Request $request)
    {


        $params = $request->all();
        $params["idUsuario"] = $request->user()->id_usuario;

        $contrato = new ContratoModel();

        $respContratoServicio = $contrato->guardarContrato($params);


        $resp = new RespuestaServicio();
        if ($respContratoServicio->exito) {
            return $resp->setExito($respContratoServicio->datos, $respContratoServicio->mensaje)->getResponse();
        } else {
            return $resp->setError(null, $respContratoServicio->mensaje)->getResponse();
        }
    }


    public function obtenerUnidadesCompradorasUsuario(Request $request){

        $params = $request->all();

        $proc = new ProcedimientoAdministrativoModel();
        $datosUsuario = $proc->buscarUnidadesCompradorasUsuario($request->user()->id_usuario);

        return RespuestaServicio::setBusquedaExito($datosUsuario)->getResponse();
    }

    public function obtenerAutorizacionApertura(Request $request)
    {
        $params = $request->all();

        $proc = new ProcedimientoAdministrativoModel();
        $datosAutorizacion = $proc->buscarAutorizacionApertura($params);

        $resp = new RespuestaServicio();
        return $resp->setBusquedaExito($datosAutorizacion)->getResponse();

    }

    public function generarAutorizacionApertura(Request $request)
    {
        $data = $request->all();
        $parametros = $data['params'];

        $proc = new DetalleAutorizacionAperturaModel();
        $datosAutorizacion = $proc->guardarAutorizacionApertura($parametros);

        $resp = new RespuestaServicio();
        if ($datosAutorizacion->exito) {
            return $resp->setExito($datosAutorizacion->datos, $datosAutorizacion->mensaje)->getResponse();
        } else {
            return $resp->setError(null, $datosAutorizacion->mensaje)->getResponse();
        }

    }

    public function obtenerADExtemporaneasUsuario(Request $request)
    {

        $proc = new ProcedimientoAdministrativoModel();
        $datosADExtemporanea = $proc->getADExtemporaneaUsuario($request->user()->id_usuario);

        $resp = new RespuestaServicio();
        return $resp->setBusquedaExito($datosADExtemporanea)->getResponse();

    }

    public function obtenerAniosPrevios()
    {

        $proc = new ProcedimientoAdministrativoModel();
        $aniosPrevios = $proc->getAniosPrevios();

        $resp = new RespuestaServicio();
        return $resp->setBusquedaExito($aniosPrevios)->getResponse();

    }


    public function actualizarEstatusCron()
    {

        $model = new ProcedimientoAdministrativoModel();
        $regreso = $model->actualizarProcedimientosCapturadosToVigentes();

        $resp = new RespuestaServicio();
        return $resp->setExito($regreso)->getResponse();

    }

}
