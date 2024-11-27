<?php

namespace App\Http\Controllers\Convocantes;

use App\Enums\TipoArchivo;
use App\Helper\ArchivosHelper;
use App\Helper\CorreosHelper;
use App\Helper\NotificacionesHelper;
use App\Http\Controllers\Controller;
use App\Models\ArchivoModel;
use App\Models\DetalleAnexosProcedimientosModel;
use App\Models\MsJuntasAclaracionesModel;
use App\Models\MsPreguntasParticipantesModel;
use App\Models\MsRespuestasParticipantesModel;
use App\Models\ProcedimientoAdministrativoModel;
use App\Models\RespuestaModel;
use App\Models\RespuestaServicio;
use App\Models\TipoContrataciones;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Lang;
use Illuminate\Support\Facades\Log;

class JuntasProcedimientosController extends Controller
{

    public function obtenerPreguntasProcedimiento(Request $request)
    {

        $request->validate([
            'idProveedor' =>  'nullable|numeric',
            'idProcedimiento' =>  'required|numeric',
        ]);

        $params = $request->all();

        $model = new MsPreguntasParticipantesModel();
        $dataResp = $model->obtenerPreguntasJunta($params['idProcedimiento'], $params['idProveedor']);

        $resp = new RespuestaServicio();
        return $resp->setExito($dataResp["datos"])->getResponse();
    }

    public function obtenerArchivosPreguntasProcedimiento(Request $request)
    {

        $request->validate([
            'idProveedor' =>  'nullable|numeric',
            'idProcedimiento' =>  'required|numeric',
            'id' =>  'required|numeric',
            'enviarNotificaciones' => 'numeric',
        ]);

        $params = $request->all();

        try {
            $numeroProcedimiento = ProcedimientoAdministrativoModel::obtenerNumeroProcedimiento($params["idProcedimiento"]);

            $model = new MsPreguntasParticipantesModel();
            $data = $model->obtenerPreguntasJunta($params['idProcedimiento'], $params['idProveedor'], $params['id'],
                $params['enviarNotificaciones']);
            $dataResp = $data["datos"];


            $archHelp = new ArchivosHelper();
            $resp = new RespuestaServicio();
            if ($dataResp != null && sizeof($dataResp) == 1) {

                $path = parse_url($dataResp[0]->url_archivo_pregunta, PHP_URL_PATH);
                $nombreArchivo = basename($path);

                if (isset($params['enviarNotificaciones']) && $params['enviarNotificaciones']==1 && $data["fechaDescargaActualizada"]) {
                    $helpCorreo = new CorreosHelper();
                    $provedores = ProcedimientoAdministrativoModel::obtenerCorreosParticipantesProcedimiento(
                        $params['idProcedimiento'], $params['idProveedor']);

                    forEach($provedores as $prov) {
                        $helpCorreo->descargaAnexosProcedimientos(
                            $prov->correo_electronico,
                            "DESCARGA DE PREGUNTAS DEL PROCEDIMIENTO",
                            $prov->nombre_proveedor,
                            $numeroProcedimiento,
                            $nombreArchivo
                        );
                        NotificacionesHelper::insertNotificacion(
                            $prov->id_usuario,
                            "DESCARGA DE PREGUNTAS DEL PROCEDIMIENTO".$numeroProcedimiento,
                            "Se han descargado las preguntas del procedimiento ".$numeroProcedimiento);
                    }
                }

                return $resp->setExito([
                    'archivo' => $archHelp->obtenerDocumento($dataResp[0]->url_archivo_pregunta)->datos,
                    'nombreArchivo' => $nombreArchivo
                ])->getResponse();

            } else if ($dataResp != null && sizeof($dataResp) > 1) {

                $zip = new \ZipArchive();
                $date = Carbon::now();

                $finalNombreZip = 'preguntas_procedimiento_'.$numeroProcedimiento.'_'.$date->timestamp.'.zip';
                $finalURL = strtolower(env('FILE_STORAGE_SIGCE')).'/tmp/'.$finalNombreZip;
                $zipStatus = $zip->open($finalURL, ZipArchive::CREATE);

                if ($zipStatus !== true) {
                    return new RespuestaModel(false,  null, "Error al crear el zip");
                }

                foreach ($dataResp as $item) {
                    $path = parse_url($item->url_archivo_pregunta, PHP_URL_PATH);
                    $nombreArchivo = basename($path);
                    $base64 = $archHelp->obtenerDocumento($item->url_archivo_pregunta)->datos;

                    if (!$zip->addFromString($nombreArchivo, base64_decode($base64))) {
                        return new RespuestaModel(false,  null,
                            Lang::get('messages.storage.agregar_archivo_error'));
                    }
                }

                $zip->close();

                $archivoRespuestaZip = file_get_contents($finalURL);
                unlink($finalURL);

                if (isset($this->params['enviarNotificaciones']) && $this->params['enviarNotificaciones']==1) {
                    $helpCorreo = new CorreosHelper();
                    $provedores = ProcedimientoAdministrativoModel::obtenerCorreosParticipantesProcedimiento(
                        $params['idProcedimiento']);

                    forEach($provedores as $prov) {
                        $helpCorreo->descargaAnexosProcedimientos(
                            $prov->correo_electronico,
                            "DESCARGA DE PREGUNTAS DEL PROCEDIMIENTO",
                            $prov->nombre_proveedor,
                            $numeroProcedimiento,
                            $finalNombreZip
                        );
                        NotificacionesHelper::insertNotificacion(
                            $prov->id_usuario,
                            "DESCARGA DE PREGUNTAS DEL PROCEDIMIENTO".$numeroProcedimiento,
                            "Se han descargado las preguntas del procedimiento ".$numeroProcedimiento);
                    }
                }

                return $resp->setExito([
                    'archivo' => $archivoRespuestaZip,
                    'nombreArchivo' => $finalNombreZip
                ])->getResponse();
            }

        } catch (\Exception $th) {
            Log::error($th);
            if (str_contains(strtolower($th->getMessage()), 'smtp')) {
                return $resp->setExito(false, 'El servicio de Correos no está disponible por el momento')->getResponse();
            }
            return $resp->setError(false,  $th->getMessage());
        }

        return $resp->setError(null, "No existen archivos de preguntas");

    }

    public function guardarPreguntasProcedimiento(Request $request)
    {

        $request->validate([
            'idProveedor' =>  'numeric',
            'idProcedimiento' =>  'required|numeric',
            'anexosPreguntaAgregar' => 'nullable',
            'anexosPreguntaEliminar' => 'nullable',
        ]);

        $params = $request->all();
        $params["idUsuario"] = $request->user()->id_usuario;

        $resp = new RespuestaServicio();

        if ( ($params["anexosPreguntaAgregar"] == null || sizeof($params["anexosPreguntaAgregar"]) == 0 )
            && ($params["anexosPreguntaEliminar"] == null || sizeof($params["anexosPreguntaEliminar"]) == 0) ) {
            return $resp->setError(null,"Debes agregar o eliminar al menos una pregunta")->getResponse();
        }

        $model = new MsPreguntasParticipantesModel();

        try {
            DB::beginTransaction();
            foreach ($params['anexosPreguntaAgregar'] as $anexoPregunta) {
                $params["url"] = $this->almacenarArchivo($anexoPregunta, 15);
                $model->guardarPreguntaJunta($params);
            }

            $model->eliminarPreguntaJunta($params['anexosPreguntaEliminar'], $params["idUsuario"]);

            DB::commit();
            return $resp->setGuardarExito()->getResponse();
        } catch (\Exception $th) {
            Log::error($th);
            DB::rollback();
            return $resp->setError(null, $th->getMessage())->getResponse();
        }
    }

    public function guardarActaJunta(Request $request)
    {
        $request->validate([
            'idProcedimiento' =>  'required|numeric',
            'anexosActaJunta' => 'required',
        ]);

        $params = $request->all();
        $params["idUsuario"] = $request->user()->id_usuario;

        $resp = new RespuestaServicio();
        try {
            DB::beginTransaction();

            $numeroProcedimiento = ProcedimientoAdministrativoModel::obtenerNumeroProcedimiento($params["idProcedimiento"]);
            $anexos = new DetalleAnexosProcedimientosModel();

            $datosAlmacenar = [
                "id_tipo_archivo" => 2,
                "id_procedimiento_administrativo" =>  $params["idProcedimiento"],
                "comentarios" => "",
                "archivo_anexo" => [
                    'tipoArchivo' => 15,
                    'procedimiento' => $numeroProcedimiento,
                    'nombreArchivo' => $params['anexosActaJunta']['nombreArchivo'],
                    'base64' => $params['anexosActaJunta']['archivoBase64'],
                    'encriptar' => false,
                ],
                "idUsuario" => $params["idUsuario"]
            ];
            $dataResp = $anexos->guardarAnexosProcedimientosJuntaAclaraciones($datosAlmacenar);

            $modelJunta = new MsJuntasAclaracionesModel();
            $actaJunta = [
                "idProcedimiento" =>  $params["idProcedimiento"],
                "idUsuario" => $params["idUsuario"],
                "numeroProcedimiento" => $numeroProcedimiento
            ];
            $modelJunta->guardarActaJunta($actaJunta);

            DB::commit();
            return $resp->setExito($dataResp)->getResponse();
        } catch (\Exception $th) {
            Log::error($th);
            DB::rollback();
            return $resp->setError(null, $th->getMessage())->getResponse();
        }
    }

    private function almacenarArchivo($anexo, $idTipoArchivo)
    {
        $tipoArchivo  = TipoArchivo::obtenerTipoArchivo($idTipoArchivo);
        $archivo = new ArchivoModel(
            $anexo['nombreArchivo'],
            $anexo['archivoBase64'],
            $tipoArchivo);

        $archHelp = new ArchivosHelper();
        $respServ = $archHelp->guardarDocumento(
            $archivo,
            "",
            false
        );

        return $respServ->datos;
    }

    public function obtenerUltimaJunta(Request $request)
    {

        $request->validate([
            'idProcedimiento' =>  'required|numeric',
        ]);

        $params = $request->all();

        $model = new MsJuntasAclaracionesModel();
        $dataResp = $model->obtenerUltimaJunta($params['idProcedimiento']);

        $resp = new RespuestaServicio();
        return $resp->setExito($dataResp)->getResponse();
    }

    public function crearProrrogaJunta(Request $request)
    {

        $request->validate([
            'idProcedimiento' =>  'required|numeric',
            'anexosActaDiferimiento' => 'required',
        ]);

        $params = $request->all();
        $params["idUsuario"] = $request->user()->id_usuario;

        $numeroProcedimiento = ProcedimientoAdministrativoModel::obtenerNumeroProcedimiento($params["idProcedimiento"]);
        $anexos = new DetalleAnexosProcedimientosModel();

        $datosAlmacenar = [
            "id_tipo_archivo" => 20,
            "id_procedimiento_administrativo" =>  $params["idProcedimiento"],
            "comentarios" => "",
            "archivo_anexo" => [
                'tipoArchivo' => 16,
                'procedimiento' => $numeroProcedimiento,
                'nombreArchivo' => $params['anexosActaDiferimiento']['nombreArchivo'],
                'base64' => $params['anexosActaDiferimiento']['archivoBase64'],
                'encriptar' => false,
            ],
            "idUsuario" => $params["idUsuario"]
        ];
        $dataResp = $anexos->guardarAnexosProcedimientosJuntaAclaraciones($datosAlmacenar);
        $params["url"] = $dataResp->url_archivo_anexo;
        $params["numeroProcedimiento"] = $numeroProcedimiento;

        $model = new MsJuntasAclaracionesModel();
        $dataResp = $model->guardarProrrogaJunta($params);

        $resp = new RespuestaServicio();
        if ($dataResp->exito) {
            return $resp->setExito($dataResp)->getResponse();
        } else {
            return $resp->setError($dataResp->datos, $dataResp->mensaje)->getResponse();
        }
    }
}
