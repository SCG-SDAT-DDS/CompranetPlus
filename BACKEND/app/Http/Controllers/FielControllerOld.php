<?php

namespace App\Http\Controllers;

use App\Helper\CommomHelper;
use App\Helper\FielHelper;
use App\Helper\Messages\MessagesFielHelper;
use App\Helper\Validations\ValidationFielHelper;
use Config;
use Illuminate\Http\Request;
use Lang;


class FielControllerOld extends Controller
{
    //
    private $codeResponse;
    private $response;
    private $fielHelper;
    private $env;

    function __construct(){
        $this->codeResponse = 200;
        $this->response = array();
        $this->env = strtolower(env('APP_ENV'));
    }

    /**
     * Funcion especialista para obtener los datos del certificado con el que se esta intendo firmar
     * @author: ECR
     * @date: ago/2023
     * @param Request con el input de path_certificado
     * @response objeto JSON a partir del array[status:boolean,msg:array,data:[[]]]
     */
    public function obtenerDatosCertificado(Request $request){
        try{
            $this->codeResponse = 200;
            $this->response = CommomHelper::getResultControllerDefault();
            $validacion = $this->validarFormDataForm($request);
            if($validacion['status']){
                $fielHelper = new FielHelper($request->get('certificado_b64'));
                $fielHelper->processDataCer(true);
                if($fielHelper->getEstatus()){
                    $this->codeResponse = 200;
                    $this->response['status'] = true;
                    $this->response['msg'][] = Lang::get('messages.fiel.data_certificado_success');
                    $this->response['data']['certificado'] = $fielHelper->getDatosCertificado();
                }else{
                    $this->codeResponse = 400;
                    $this->response['status'] = false;
                    $this->response['msg'] = $fielHelper->getMsg();
                }
            }else{
                $this->codeResponse = 400;
                $this->response = [
                    'status' => false,
                    'msg' => $validacion['msg'],
                ];
            }
        }catch (\Exception $ex){
            $this->codeResponse = 500;
            $this->response = [
                'status' => false,
                'msg' => [
                    Lang::get('messages.error.exception'),
                    $ex->getMessage(),
                    $ex->getFile(),
                    $ex->getLine()
                ]
            ];
        }
        CommomHelper::responseController($this->codeResponse,$this->response);
    }

    /**
     * Funcion especialista para validar la firma electronica
     * se validará:
     * 1. la vigencia del certificado,
     * 2. la correspondencia del certificado con la llave privada
     * 3. la constraseña con la llave privada
     * 4. la correspondencia del RFC firmante con la firma electronica cargada al sistema
     * @author: ECR
     * @date: ago/2023
     * @param Request con el input:
     * 1. archivo .cer codificado en base64
     * 2. archivo .key codificado en base64
     * 3. password
     * 4. RFC firmante
     * @response objeto JSON a partir del array[status:boolean,msg:array,data:[[]]]
     */
    public function validarFirmaElectronica(Request $request){
        try{
            $this->codeResponse = 200;
            $this->response = CommomHelper::getResultControllerDefault();
            $validacion = $this->validarFormFirmaElectronica($request);
            if($validacion['status']){
                $fielHelper = new FielHelper($request->get('certificado_b64'),$request->get('key_b64'),$request->get('password'),$request->get('rfc_firmante'));
                //validamos la vigencia del certificado
                $fielHelper->validarVigenciaCertificado();
                $validacionFiel['vigencia'] = $fielHelper->getEstatus();
                //validamos la constraseña con el archivo key
                //$fielHelper->setPathKey('D:\OneDrive\Documentos\SAT\FIEL_CORE9004062J1\FIEL_CORE9004062J1_20170317141920\Claveprivada_FIEL_CORE9004062J1_20170317_141920.key');
                $fielHelper->validarPasswordKey();
                $validacionFiel['password'] = $fielHelper->getEstatus();
                //validamos la correspondencia del cer y la key - para poder hacer la correspondencia es necesario crear el pem del key con el password
                $fielHelper->validarCorrespondenciaCerKey();
                $validacionFiel['correspondencia_key_cer'] = $fielHelper->getEstatus();
                //validamos rfc firmante con el del certificado
                $fielHelper->validarRfcFirmante();
                $validacionFiel['rfc_firmante'] = $fielHelper->getEstatus();
                $validacionFiel['valida'] = true;
                /**
                 * validamos el certificado con lo de los servicios del SAT
                 * De momento solamente esta en HC, hasta proxima liberación
                 * y obtención de los servicios/permisos del SAT
                 * De momento la función asignara un TRUE como valor de la validación
                 */
                $fielHelper->validarCerWSSAT();
                $validacionFiel['servicio_SAT'] = $fielHelper->getEstatus();

                $validacionFiel['msg'] = $fielHelper->getMsg();
                $validacionFiel['msg_failed'] = $fielHelper->getMsg();
                if(!$validacionFiel['vigencia'] || !$validacionFiel['password']
                    || !$validacionFiel['correspondencia_key_cer'] || !$validacionFiel['rfc_firmante']
                    || !$validacionFiel['servicio_SAT']){
                    $validacionFiel['valida'] = false;
                    $validacionFiel['msg_failed'] = $fielHelper->getMsgFailed();
                }
                $this->codeResponse = 200;
                $this->response['data']['fiel'] = $validacionFiel;
            }else{
                $this->codeResponse = 400;
                $this->response = [
                    'status' => false,
                    'msg' => $validacion['msg'],
                ];
            }
        }catch (\Exception $ex){
            $this->codeResponse = 500;
            $this->response = [
                'status' => false,
                'msg' => [
                    Lang::get('messages.error.exception'),
                    $ex->getMessage(),
                    $ex->getFile(),
                    $ex->getLine()
                ]
            ];
        }
        CommomHelper::responseController($this->codeResponse,$this->response);
    }

    public function validarFirmaFielSAT(Request $request){
        try{
            $this->codeResponse = 200;
            $this->response = CommomHelper::getResultControllerDefault();
            $validacion = $this->validarFormValidacionFiel($request);
            if($validacion['status']){
                $fielHelper = new FielHelper($request->get('path_certificado'));
                $fielHelper->validarCerWSSingGobCol(); //ejecutamos el proceso
                if($fielHelper->getEstatus()){
                    $resultValidacionFiel = $fielHelper->getResultWSFielGobCol();
                    $this->env == 'local' ? $this->response['data']['responseWsGobCol'] = $fielHelper->getResultWSFielGobCol() : false;
                    if(isset($resultValidacionFiel['RESTService']['StatusResponse'])
                        && $resultValidacionFiel['RESTService']['StatusResponse'] == 'EXITO'){
                        //validamos el estatus del certificado
                        $this->response['msg'][] = Lang::get('messages.success.serviceSAT');
                        if(isset($resultValidacionFiel['Response']['OCSPStatus']) && $resultValidacionFiel['Response']['OCSPStatus'] == 'Aceptado'){
                            $this->codeResponse = 200;
                            $this->response['status'] = true;
                        }else{
                            $this->response['status'] = false;
                        }
                        $this->response['msg'][] = $resultValidacionFiel['RESTService']['Message'];
                        $this->response['msg'][] = Lang::get('messages.success.serviceSATMsg').' '.$resultValidacionFiel['Response']['OCSPStatus'];
                    }else{
                        $this->codeResponse = 409; //peticion en conflicto
                        $this->response['status'] = false;
                        $this->response['msg'][] = Config::get('messages.error.serviceSAT');
                    }
                }else{
                    $this->codeResponse = 400;
                    $this->response['status'] = false;
                    $this->response['msg'] = $fielHelper->getMsg();
                }

            }else{
                $this->codeResponse = $validacion['code'];
                $this->response = [
                    'status' => false,
                    'msg' => $validacion['msg'],
                ];
            }
        }catch (\Exception $ex){
            $this->codeResponse = 500;
            $this->response = [
                'status' => false,
                'msg' => [
                    Lang::get('messages.error.exception'),
                    $ex->getMessage(),
                    $ex->getFile(),
                    $ex->getLine()
                ]
            ];
        }
        CommomHelper::responseController($this->codeResponse,$this->response);
    }

    private function validarFormDataForm($paramsForm){
        $result = CommomHelper::getResultControllerDefault();
        $rules = ValidationFielHelper::formValidateCerData();
        $messages = MessagesFielHelper::formValidateCerData();
        $v = \Validator::make($paramsForm->all(), $rules,$messages);
        if($v->fails()){
            $result['status'] = false;
            $result['msg'] = $v->errors()->all();
        }
        return $result;
    }

    private function validarFormFirmaElectronica($paramsForm){
        $result = CommomHelper::getResultControllerDefault();
        $rules = ValidationFielHelper::formValidacionFirma();
        $messages = MessagesFielHelper::formValidacionFirma();
        $v = \Validator::make($paramsForm->all(), $rules,$messages);
        if($v->fails()){
            $result['status'] = false;
            $result['msg'] = $v->errors()->all();
        }
        return $result;
    }

}
