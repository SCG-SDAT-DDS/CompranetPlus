<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\DetReportesModel;
use App\Models\DetReportesPublicoModel;
use App\Models\MsReportesModel;
use App\Models\ReportesModel;
use App\Models\RespuestaServicio;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Crypt;
use App\Helper\CorreosHelper;
use Illuminate\Contracts\Encryption\DecryptException;
use SimpleXMLElement;


class ReportesController extends Controller
{
    private $env;

    function __construct(){
        $this->env = strtolower(env('APP_ENV'));
    }

    public function listadoColumnasDisponibles(){
        Log::info('***** ReportesController->listadoColumnasDisponibles');

        $reportesModel = new ReportesModel();
        $datos = $reportesModel->columnasReporteDisponibles();

        return RespuestaServicio::setBusquedaExito($datos)->getResponse();
    }

    public function actualizar(Request $request){
        $request->validate([
            'origen' => 'required|string'
        ]);
        $params = $request->all();
        $reporteModel = new ReportesModel();
        $actualizarReporte = $reporteModel->actualizarReporte($params);
        //dd($actualizarReporte);
        if($actualizarReporte){
            return RespuestaServicio::setExito(null,$reporteModel->getMsg())->getResponse();
        }
        return RespuestaServicio::setError(null,$reporteModel->getMsg(),500)->getResponse();
    }

    public function ultimoReporte(){
        $msReportesModel = new MsReportesModel();

        $datos = $msReportesModel->ultimoReporte();

        return RespuestaServicio::setBusquedaExito($datos)->getResponse();
    }

    /**
     * apartado de funcinoes para el guardado de reportes
     * tanto para el guardar como para el eliminar y el listado
     */
    public function listadoMisReportes(Request $request){
        $params["id_usuario"] = $request->user()->id_usuario;
        $detReportesModel = new DetReportesModel();
        $datos = $detReportesModel->getDetReportes($params);
        return RespuestaServicio::setBusquedaExito($datos)->getResponse();
    }

    public function guardarMiReporte(Request $request){
        $request->validate([
            'nombre_reporte' => 'required|string',
            'filtro' => 'required|string',
            'columnas' => 'required|string',
        ]);

        $params = $request->all();
        $params["id_usuario"] = $request->user()->id_usuario;
        $deReportesModel = new DetReportesModel();
        $respServ = $deReportesModel->guardarReporte($params);
        $resp = new RespuestaServicio();
        if ($respServ->exito) {
            return $resp->setExito($respServ->datos, $respServ->mensaje)->getResponse();
        } else {
            return $resp->setError(null, $respServ->mensaje)->getResponse();
        }
    }

    public function cambiarEstatusDR(Request $request){
        $request->validate([
            'id_det_reportes' => 'required|numeric',
            'activo' => 'required|boolean'
        ]);
        $params = $request->all();
        $params["id_usuario"] = $request->user()->id_usuario;
        $deReportesModel = new DetReportesModel();
        $respServ = $deReportesModel->actualizarReporte($params);
        $resp = new RespuestaServicio();
        if ($respServ->exito) {
            return $resp->setExito($respServ->datos, $respServ->mensaje)->getResponse();
        } else {
            return $resp->setError(null, $respServ->mensaje)->getResponse();
        }
    }

    /**
     * Funcion especialista para obtener los datos del certificado con el que se esta intendo firmar
     * @author: ECR
     * @date: ago/2023
     * @param Request con el input de path_certificado
     * @response objeto JSON a partir del array[status:boolean,msg:array,data:[[]]]
     */
    public function generar(Request $request){
        $request->validate([
            //'filtro' => 'string',
            //'datos' => 'string',
            'formato' => 'required|string',
        ]);
        $params = $request->all();
        $downloadReport = isset($params['formato']) ? $params['formato'] : 'tablero';
        //se recivio en base 64 los parametros
        if($downloadReport != 'tablero'){
            $params['filtro'] = json_decode(base64_decode($params['filtro']));
            $params['columnas'] = json_decode(base64_decode($params['columnas']));
        }
        $filtro = isset($params['filtro']) ? $params['filtro'] : [];
        $columns = isset($params['columnas']) ? $params['columnas'] : [];
        $reporteModel = new ReportesModel($filtro,$columns);
        $datosReporte = $reporteModel->obtenerReporte();
        Log::info($datosReporte);

        switch($downloadReport){
            case 'json':case 'JSON':
                $this->downloadJSON($datosReporte);
                break;
            case 'xml': case 'XML':
                $this->downloadXML($datosReporte);
                break;
            case 'excel': case 'EXCEL': case 'xls': case 'XLS':
                $this->downloadExcel($datosReporte);
                break;
            default:
                return RespuestaServicio::setBusquedaExito($datosReporte)->getResponse();
                //$this->downloadJSON($datosReporte);
                break;
        }
    }

    public function rpListado(Request $request){
        $request->validate([
            'id_det_reportes' => 'required|numeric',
        ]);
        $params = $request->all();
        //$params["id_usuario"] = $request->user()->id_usuario;
        $detReportesPublicoModel = new DetReportesPublicoModel();
        $datos = $detReportesPublicoModel->listado($params);
        return RespuestaServicio::setBusquedaExito($datos)->getResponse();
    }

    public function rpAgregar(Request $request){
        $request->validate([
            'id_det_reportes' => 'required|numeric',
            'nombre_cliente' => 'required|string',
            'correo' => 'required|email',
        ]);
        $params = $request->all();
        $params["id_usuario"] = $request->user()->id_usuario;
        $params["pin_descarga"] = sprintf("%06d", mt_rand(1, 999999));
        $deReportesModel = new DetReportesPublicoModel();
        $respServ = $deReportesModel->nuevoReporte($params);
        $resp = new RespuestaServicio();
        if ($respServ->exito) {
            return $resp->setExito($respServ->datos, $respServ->mensaje)->getResponse();
        } else {
            return $resp->setError(null, $respServ->mensaje)->getResponse();
        }
    }

    public function rpEliminar(Request $request){
        $request->validate([
            'id_det_reportes_publico' => 'required|numeric',
            'activo' => 'required|boolean'
        ]);
        $params = $request->all();
        //$params["id_usuario"] = $request->user()->id_usuario;
        $deReportesModel = new DetReportesPublicoModel();
        $respServ = $deReportesModel->actualizarReporte($params);
        $resp = new RespuestaServicio();
        if ($respServ->exito) {
            return $resp->setExito($respServ->datos, $respServ->mensaje)->getResponse();
        } else {
            return $resp->setError(null, $respServ->mensaje)->getResponse();
        }
    }

    public function rpEnviarCorreo(Request $request){
        try{
            $request->validate([
                'id_det_reportes_publico' => 'required|numeric',
            ]);
            $params = $request->all();
            Log::info('**** params: ');
            Log::info(json_encode($params));
            //echo json_encode($params);exit;
            $detReportesPublicoModel = new DetReportesPublicoModel();
            $registro = $detReportesPublicoModel->reportebyId($params['id_det_reportes_publico']);
            $arrayCifrar = [
                'id_det_reportes_publico' => $registro->id_det_reportes_publico,
                'nombre_cliente' => $registro->nombre_cliente,
                'correo' => $registro->correo,
                'fecha' => $registro->fecha,
            ];
            $encryptJson = Crypt::encryptString(json_encode($arrayCifrar));
            $urlDescargaReporte = url('api/reportes/publico/descarga?tkath='.$encryptJson.'&pin='.base64_encode($registro->pin_descarga));
            //$link = '<a href="'.$urlDescargaReporte.'" class="btn btn-sm btn-info">Descargar</a>';
            //Log::info($encriptJson);
            Log::info('***** ReportesController->rpEnviarCorreo');
            Log::info('Url de descarga: '.$urlDescargaReporte);
            //aqui va funcinoalidad para lo del envio del correo
            $helpCorreo = new CorreosHelper();
            $helpCorreo->correoDescargaReporte(
                $registro->correo,
                "Descarga de reporte COMPRANET",
                $registro->nombre_cliente,
                $urlDescargaReporte
            );
            return RespuestaServicio::setExito(null,'Se envió con éxito el correo para descarga del reporte al destinatario registrado')->getResponse();
        }catch(\Exception $ex){
            Log::info('***** error reportes controller');
            Log::info($ex->getMessage().'-'.$ex->getLine().'-'.$ex->getFile());
            return RespuestaServicio::setError(null,'Ocurrio un problema con el envio del correo para el reporte')->getResponse();
        }
    }

    public function rpDescarga(Request $request){
        try{
            $params = $request->all();
            $decryptedJson = Crypt::decryptString($params['tkath']);
            $data = json_decode($decryptedJson,true);
            if(is_array($data) && isset($data['id_det_reportes_publico']) && is_numeric($data['id_det_reportes_publico'])){
                $detReportesPublicoModel = new DetReportesPublicoModel();
                //dd($data,base64_decode($params['pin']));
                $registro = $detReportesPublicoModel->reportebyId($data['id_det_reportes_publico']);
                if(isset($params['pin']) && $params['pin'] != ''){
                    if(base64_decode($params['pin']) == $registro->pin_descarga){
                        //validamos que este registro no este eliminado
                        if(isset($registro->activo) && $registro->activo){
                            //obtenemos el reporte con el que se genero esta publicacion
                            $detReportesModel = DetReportesModel::find($registro->id_det_reportes);
                            $filtro = json_decode($detReportesModel->filtro);
                            $columns = json_decode($detReportesModel->columnas);
                            $reporteModel = new ReportesModel($filtro,$columns);
                            $datosReporte = $reporteModel->obtenerReporte();
                            Log::info($datosReporte);
                            //se procede a la descarga del archivo en formato json
                            $this->downloadJSON($datosReporte);
                        }else{
                            echo '<h5>La url a la que intenta ingresar ya no se encuentra vigente, solicite un nuevo reporte con el área correspondiente</h5>';exit;
                        }
                    }else{
                        echo '<h5>La url a la que intenta ingresar no es correcta, valide la URL y vuelva a intentarlo</h5>';exit;
                    }
                }else{
                    echo '<h5>Ocurrio un problema al intentar descifrar el pin de acceso para su reporte, valide la URL y vuelva a intentarlo</h5>';exit;
                }
            }else{
                echo '<h5>Ocurrio un problema al intentar descifrar la llave para su reporte, valide la URL y vuelva a intentarlo</h5>';exit;
            }
        }catch (DecryptException $e) {
            echo '<h5>Ocurrio un problema al tratar de generar su reporte, valide la URL y vuelva a intentarlo</h5>';exit;
        }
    }

    private function downloadJSON($reporte){
        $jsonDownload = json_encode($reporte);
        header('Content-disposition: attachment; filename='.date('Ymd').'reporteCOMPRANET.json');
        header('Content-type: application/json; charset=utf-8');
        echo ($jsonDownload);exit;
    }

    private function downloadXML($reporte){
        $reporte = json_decode(json_encode($reporte),true);
        //dd($reporte);
        $xml = new SimpleXMLElement('<?xml version="1.0"?><COMPRANET></COMPRANET>');
        $this->arrayToXML($reporte,$xml);
        header('Content-disposition: attachment; filename='.date('Ymd').'reporteCOMPRANET.xml');
        header('Content-type: application/xml');
        print $xml->asXML();exit;
    }

    private function downloadExcel($reporte){
        try{
            header("content-type:application/csv;charset=UTF-8");
            header("Content-Disposition: attachment; filename=".date('Ymd')."reporteCOMPRANET.csv");
            echo "\xEF\xBB\xBF";
            $reporte = json_decode(json_encode($reporte),true);
            //$fileCsv = fopen(public_path().'/'.date('Ymd').'reporteSIGCE.csv','w'); //para una ruta fisica del servidor
            $fileCsv = fopen("php://output","wb"); //para una ruta interna en php
            //Log::info('***** filecsv = '.public_path().'/'.date('Ymd').'reporteSIGCE.csv');
            foreach($reporte as $index => $registro){
                //primer elemento obtenemos los encabezados de los datos
                if($index == 0){
                    $encabezados = $this->encabezadosExcel($registro);
                    fputcsv($fileCsv,$encabezados);
                }
                fputcsv($fileCsv,$registro);
            }
            fclose($fileCsv);
        }catch (\Exception $th) {
            //Log::error($th);
            Log::info('****** ReportesController->downloadExcel');
            Log::error($th->getMessage());
            Log::error($th->getFile());
            Log::error($th->getLine());
            return RespuestaServicio::setError()->getResponse();
        }
    }

    private function arrayToXML($datos,&$xmlDatos){
        foreach($datos as $clave => $valor){
            //seria el contenedor de todo un registro
            if(is_array($valor)){
                $registro = $xmlDatos->addChild('Registro_'.$clave+1);
                $this->arrayToXML($valor,$registro);
            }else{
                $xmlDatos->addChild("$clave",htmlspecialchars("$valor"));
            }
        }
    }

    private function encabezadosExcel($registro){
        $encabezados = [];
        foreach($registro as $columna => $valor){
            $encabezados[] = $columna;
        }
        return $encabezados;
    }

}
