<?php

namespace App\Http\Controllers;

use App\Helper\Validations\ValidationFielHelper;
use App\Http\Controllers\Controller;
use App\Helper\FielHelper;
use App\Models\RespuestaServicio;
use Illuminate\Http\Request;
use Lang;
use Illuminate\Support\Facades\Log;


class FielController extends Controller
{
    private $fielHelper;
    private $env;

    function __construct(){
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

        //se cambian las validaciones conforme a estandar del proyecto
        $request->validate([
            'certificado_b64' => 'required|string',
        ]);

        $fielHelper = new FielHelper($request->get('certificado_b64'));
        $fielHelper->processDataCer(true);

        if($fielHelper->getEstatus()){
            return RespuestaServicio::setExito($fielHelper->getDatosCertificado(),Lang::get('messages.fiel.data_certificado_success'))->getResponse();
        }else{
            return RespuestaServicio::setError(null,Lang::get('messages.fiel.error.cer'))->getResponse();
        }
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
        //se cambian las validaciones conforme a estandar del proyecto
        $request->validate([
            'certificado_b64' => 'required',
            'key_b64' => 'required',
            'password' => 'required',
            'rfc_firmante' => 'required',
        ]);

        $fielHelper = new FielHelper($request->get('certificado_b64'),$request->get('key_b64'),$request->get('password'),$request->get('rfc_firmante'));
        //validamos la vigencia del certificado
        $fielHelper->validarVigenciaCertificado();
        $validacionFiel['vigencia'] = $fielHelper->getEstatus();
        //validamos la constraseña con el archivo key
        $fielHelper->validarPasswordKey();
        $validacionFiel['password'] = $fielHelper->getEstatus();
        //validamos la correspondencia del cer y la key - para poder hacer la correspondencia es necesario crear el pem del key con el password
        $fielHelper->validarCorrespondenciaCerKey();
        $validacionFiel['correspondencia_key_cer'] = $fielHelper->getEstatus();
        //validamos rfc firmante con el del certificado
        $fielHelper->validarRfcFirmante();
        $validacionFiel['rfc_firmante'] = $fielHelper->getEstatus();
        /**
         * validamos el certificado con lo de los servicios del SAT
         * De momento solamente esta en HC, hasta proxima liberación
         * y obtención de los servicios/permisos del SAT
         * De momento la función asignara un TRUE como valor de la validación
         */
        $fielHelper->validarCerWSSAT();
        $validacionFiel['servicio_SAT'] = $fielHelper->getEstatus();
        $validacionFiel['valida'] = true;
        if(!$validacionFiel['vigencia'] || !$validacionFiel['password']
            || !$validacionFiel['correspondencia_key_cer'] || !$validacionFiel['rfc_firmante']
            || !$validacionFiel['servicio_SAT']){
            $validacionFiel['valida'] = false;
            $validacionFiel['msg_failed'] = $fielHelper->getMsgFailed();
        }else{
            $validacionFiel['msg'] = $fielHelper->getMsg();
        }
        //dd($validacionFiel);
        $data['fiel'] = $validacionFiel;
        //if($fielHelper->getEstatus()){
            return RespuestaServicio::setExito($data,Lang::get('messages.fiel.data_certificado_success'))->getResponse();
        //}
        // else{
        //     return RespuestaServicio::setError(null,Lang::get('messages.fiel.error.cer'))->getResponse();
        // }
    }

    public function validarFirmaFielSAT(Request $request){
        try{
            echo 'Actualizando fiel...';
        }catch (\Exception $ex){

        }
    }

}
