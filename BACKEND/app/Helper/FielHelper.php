<?php

namespace App\Helper;

use Illuminate\Support\Facades\Log;
class FielHelper {

    private $urlValidacion;
    private $env;
    private $estatus;
    private $msg;
    private $msgFailed;
    private $dataCertificado;
    private $resultWSFielGobCol;
    private $certificadoB64;
    private $keyB64;
    private $password;
    private $rfcFirmante;
    private $cerToPem;
    private $nameFirmaTemp;
    private $pathDirectorySSL;
    private $pathOpenSSL;
    private $pathTempFilesTemp;
    private $pathFilesFielCrt;

    /**
     * el constructor de la fiel del helper solo recibe como paremetro el string b64 del cer
     * es unicamente para poder construir el objeto de la fiel helper
     * servira para poder obtener los datos del certificado
     * las demas funciones de validacion se deberan setear las variables el constructor sobrecargado
     * 1. la key formato string en base64
     * 2. el password
     * 3. el rfc del firmante
     */
    function __construct($certificadoB64, $keyB64 = null, $password = null, $rfcFirmante = null){
        $this->urlValidacion = 'https://apisnet.col.gob.mx/wsSignGob/apiV1/Valida/Certificado';
        $this->env = strtolower(env('APP_ENV'));
        $this->estatus = true;
        $this->msg = [];
        $this->msgFailed = [];
        $this->certificadoB64 = $certificadoB64;
        $this->keyB64 = $keyB64;
        $this->password = $password;
        $this->rfcFirmante = $rfcFirmante;
        $this->dataCertificado = null;
        $this->resultWSFielGobCol = null;
        $this->cerToPem = null;
        //        $this->nameFirmaTemp = date('YmdHis');
        $this->nameFirmaTemp = date('YmdHis').'_'.uniqid('', true);
        if(strtolower($this->env) == 'local' ){
            $this->pathDirectorySSL = 'C:/OpenSSL/bin/';
            $this->pathOpenSSL = 'C:\OpenSSL\bin\openssl';
            $this->pathTempFilesTemp = 'C:/tempfiel/';
            $this->pathFilesFielCrt = 'C:/fielcrt/';
        }else{
            $this->pathDirectorySSL = '/usr/bin/';
            $this->pathOpenSSL = '/usr/bin/openssl';
            $this->pathTempFilesTemp = '/tempfiel/';
            $this->pathFilesFielCrt = '/fielcrt/';
        }
        if(!file_exists($this->pathTempFilesTemp)){
            //mkdir($this->pathTempFilesTemp,0777,true);
            //chmod($this->pathTempFilesTemp,0777);
        }
    }

    function  __destruct(){
        $this->destroyFilesValidacionFIEL();
        $this->urlValidacion = null;
        $this->env = null;
        $this->estatus = null;
        $this->msg = null;
        $this->msgFailed = null;
        $this->certificadoB64 = null;
        $this->keyB64 = null;
        $this->password = null;
        $this->rfcFirmante = null;
        $this->dataCertificado = null;
        $this->resultWSFielGobCol = null;
        $this->cerToPem = null;
        $this->nameFirmaTemp = null;
        $this->pathDirectorySSL = null;
        $this->pathOpenSSL = null;
        $this->pathTempFilesTemp = null;
    }

    // ** END GETTERS/SETTERS ** //
    /*  */
    public function getEstatus(){
        return $this->estatus;
    }

    public function getMsg(){
        return $this->msg;
    }

    public function getMsgFailed(){
        return $this->msgFailed;
    }

    public function getDatosCertificado(){
        return $this->dataCertificado;
    }

    public function getResultWSFielGobCol(){
        return $this->resultWSFielGobCol;
    }

    public function setRfcFirmante($rfcFirmante){
        $this->rfcFirmante = $rfcFirmante;
    }

    public function getCerToPem(){
        return $this->cerToPem;
    }

    // ** END GETTERS/SETTERS ** //

    /**
     * Funcion para obtener los datos contenidos en el certificado
     * se realiza con el openssl y el algoritmo criptografico pkcs8
     * @author Enrique Corona
     * @date ago/2023
     */
    public function processDataCer($fromController = false){
        try{
            $this->codifyCerToPEM();
            $cerParse = openssl_x509_parse($this->cerToPem);
            $this->dataCertificado['name'] = $cerParse['subject']['name'];
            $this->dataCertificado['rfc'] = $cerParse['subject']['x500UniqueIdentifier'];
            $this->dataCertificado['email'] = $cerParse['subject']['emailAddress'];
            $this->dataCertificado['curp'] = $cerParse['subject']['serialNumber'];
            //$this->dataCertificado['hash'] = $cerParse['hash'];
            $this->dataCertificado['validFrom'] = date('YmdHis',$cerParse['validFrom_time_t']);
            $this->dataCertificado['validTo'] = date('YmdHis',$cerParse['validTo_time_t']);
            $this->dataCertificado['validFromFormat'] = date('Y-m-d H:i:s',$cerParse['validFrom_time_t']);
            $this->dataCertificado['validToFormat'] = date('Y-m-d H:i:s',$cerParse['validTo_time_t']);
            $this->estatus = true;
            $fromController ? $this->msg[] = \Lang::get('messages.fiel.success.cer') : false;
        }catch (\Exception $ex){
            $this->estatus = false;
            Log::info('***** FielHelper->processDataCer: '.$ex->getMessage(). ' file: '.$ex->getFile(). ' line: '.$ex->getLine());
            $this->msg[] = \Lang::get('messages.fiel.error.cer');
        }
    }

    /**
     * Funcion para validar la vigencia del certificado
     * se realiza con el openssl y el algoritmo criptografico pkcs8
     * @author Enrique Corona
     * @date ago/2023
     */
    public function validarVigenciaCertificado(){
        try{
            /**
             * se va validando la vigencia del certificado conforme a los datos que contiene
             * en caso de que no se haya procesado el dataCertificado lo mandamos a procesar
             */
            is_null($this->dataCertificado) ? $this->processDataCer() : false;
            $today = date('YmdHis');
            if($today >= $this->dataCertificado['validFrom'] && $today <= $this->dataCertificado['validTo']){
                $this->estatus = true;
                $this->msg[] = \Lang::get('messages.fiel.success.vig_cer');
            }else{
                $this->estatus = false;
                $this->msgFailed[] = \Lang::get('messages.fiel.failed.vig_cer');
            }
        }catch (\Exception $ex){
            $this->estatus = false;
            Log::info('***** FielHelper->validarVigenciaCertificado: '.$ex->getMessage(). ' file: '.$ex->getFile(). ' line: '.$ex->getLine());
            $this->msg[] = \Lang::get('messages.fiel.error.vig_cer');
        }
    }

    /**
     * Funcion para validar el RFC de la persona que deberia de firmar el proceso
     * contra la persona que esta firmando (la que carga al sistema la firma electrónica)
     * se realiza con el openssl y el algoritmo criptografico pkcs8
     * @author Enrique Corona
     * @date ago/2023
     */
    public function validarRfcFirmante(){
        try{
            /**
             * se va validando el rfc del que deberia firmar con el del certificado que se esta recibiendo
             * en caso de que no se haya procesado el dataCertificado lo mandamos a procesar
             */
            is_null($this->dataCertificado) ? $this->processDataCer() : false;
            if(strpos(strtolower($this->dataCertificado['rfc']) , strtolower($this->rfcFirmante)) !== false){
                $this->estatus = true;
                $this->msg[] = \Lang::get('messages.fiel.success.rfc_firmante');
            }else{
                $this->estatus = false;
                $this->msgFailed[] = \Lang::get('messages.fiel.failed.rfc_firmante');
            }
        }catch (\Exception $ex){
            $this->estatus = false;
            Log::info('***** FielHelper->validarRfcFirmante: '.$ex->getMessage(). ' file: '.$ex->getFile(). ' line: '.$ex->getLine());
            $this->msg[] = \Lang::get('messages.fiel.error.rfc_firmante');
        }
    }

    /**
     * Funcion para validar la contraseña y llave privada .key
     * se realiza con el openssl y el algoritmo criptografico pkcs8
     * @author Enrique Corona
     * @date ago/2023
     */
    public function validarPasswordKey(){
        try{
            //para procesar la constraseña generamos temporalmente la key que se recibio como archivo
            file_put_contents($this->pathTempFilesTemp.$this->nameFirmaTemp.'.key',base64_decode($this->keyB64));
            $shell = 'openssl pkcs8 -inform DER -in '.$this->pathTempFilesTemp.$this->nameFirmaTemp.'.key' ;
            $shell .= ' -passin pass:'.$this->password;
            $shell .= ' -out '.$this->pathTempFilesTemp.$this->nameFirmaTemp.'.key.pem';
            shell_exec($shell);
            if(filesize($this->pathTempFilesTemp.$this->nameFirmaTemp.'.key.pem') > 0){
                $this->estatus = true;
                $this->msg[] = \Lang::get('messages.fiel.success.password');
            }else{
                $this->estatus = false;
                $this->msgFailed[] = \Lang::get('messages.fiel.failed.password');
            }
        }catch (\Exception $ex){
            $this->estatus = false;
            Log::info('***** FielHelper->validarPasswordKey: '.$ex->getMessage(). ' file: '.$ex->getFile(). ' line: '.$ex->getLine());
            $this->msg[] = \Lang::get('messages.fiel.error.password');
        }
    }

    /**
     * Funcion para validar la correspondiencia entre el certificado y la llave privada
     * para poder realizar la operación es necesario:
     * 1. Que se cree el archivo pem de la llave privada
     * 2. El archivo pem se generá con la contraseaña de la llave
     * 3. los pasos 1 y 2 se logran con la fucion de $this->validarPasswordKey()
     * @author Enrique Corona
     * @date ago/2023
     */
    public function validarCorrespondenciaCerKey(){
        try{
            $errorstrKey="";$errorstrCer="";
            $resultKey="";$resultCer="";
            // ***** CERTIFICADO START ***** //
            $tempFileCerPEM = $this->pathTempFilesTemp.$this->nameFirmaTemp.'.cer.pem';
            //procesamos el pem del certificado para procesarlo con el md5
            file_put_contents($tempFileCerPEM,$this->cerToPem);
            $shell = "openssl x509 -noout -modulus -in ".$tempFileCerPEM." | openssl md5";
            $descriptorspec = array(
                0 => array("pipe", "r"),  // stdin is a pipe that the child will read from
                1 => array("pipe", "w"),  // stdout is a pipe that the child will write to
                2 => array("pipe", "w") // stderr is a pipe that the child will write to
            );
            $processCer = proc_open($shell, $descriptorspec, $pipes, $this->pathDirectorySSL);
            $pc = proc_get_status($processCer);
            if (is_resource($processCer)) {
                fclose($pipes[0]);
                // Getting errors from stderr
                while ($line = fgets($pipes[2])) {
                    $errorstrCer.=$line;
                }
                while ($line = fgets($pipes[1])) {
                    $resultCer .=$line;
                }
                proc_close($processCer);
            }
            // ***** CERTIFICADO END ***** //

            // ***** KEY START ***** //
            $shell = 'openssl rsa -noout -modulus -in '.$this->pathTempFilesTemp.$this->nameFirmaTemp.'.key.pem | openssl md5';
            $processKey = proc_open($shell, $descriptorspec, $pipes, $this->pathDirectorySSL);
            $pk = proc_get_status($processKey);
            if (is_resource($processKey)) {
                fclose($pipes[0]);
                // Getting errors from stderr
                while ($line = fgets($pipes[2])) {
                    $errorstrKey.=$line;
                }
                while ($line = fgets($pipes[1])) {
                    $resultKey .=$line;
                }
                proc_close($processKey);
            }
            // ***** KEY END ***** //

            if($errorstrKey !== '' || $errorstrCer !== ''){
                $this->estatus = false;
                Log::info('***** FielHelper->validarCorrespondenciaCerKey - '.$errorstrCer.' - '.$errorstrKey);
                $this->msgFailed[] = \Lang::get('messages.fiel.failed.correspondencia_cer_key');
            }
            if($resultCer === $resultKey) {
                $this->estatus = true;
                $this->msg[] = \Lang::get('messages.fiel.success.correspondencia_cer_key');
            }
        }catch (\Exception $ex){
            $this->estatus = false;
            Log::info('***** FielHelper->validarCorrespondenciaCerKey: '.$ex->getMessage(). ' file: '.$ex->getFile(). ' line: '.$ex->getLine());
            $this->msg[] = \Lang::get('messages.fiel.error.correspondencia_cer_key');
        }
    }

    /**
     * funcion especializada para validar el certificado de la firma
     * para validar que sea emitido por la Entidad Certificadora del SAT
     * deberia devolver el estatus posibles de: ACEPTADO, REVOCADO, UNKNOWN
     * @author Enrique Corona
     * @date ago/2023
     * @update 26/oct/2023-02/nov/2023
     */
    public function validarCerWSSAT(){
        if (!env('ACTIVAR_VALIDACION_SAT', false)) {
            $this->estatus = true;
            $this->msg[] = \Lang::get('messages.fiel.success.validacion_fiel_SAT');
            return;
        }

        try{
            //$this->estatus = true;
            //omitimos el mensaje de la validacion del .cer con el servicio del SAT en HC
            //se implementa lo de la validacion del certificado conforme a la documentacion del SAT
            //shell ejemplo documentacion
            //ocsp -issuer c:/Test/ac2_4096.crt -cert c:/Test/gava730717ae1.pem -text
            //-url https://cfdit.sat.gob.mx/edofiel -VAfile c:/Test/OCSP_AC_4096_SHA256.crt
            //-header host cfdit.sat.gob.mx
            $cmd  = 'openssl ocsp -issuer '.$this->pathFilesFielCrt.'AC_UAT_2022.crt';   //indicacion del crt del SAT
            $cmd .= ' -cert '.$this->pathTempFilesTemp.''.$this->nameFirmaTemp.'.cer.pem -text';                 //indicacion para el pem a validar
            $cmd .= ' -url https://cfdit.sat.gob.mx/edofiel';           //indicacion del URL para el validado del archivo PEM
            $cmd .= ' -VAfile '.$this->pathFilesFielCrt.'OCSP_UAT_2022.crt';                  //indicacion del certificado proporcionado por el SAT para uso del OCSP
            $cmd .= ' -header host cfdit.sat.gob.mx';                   //indicamos la cabecera para que el servicio no marque error 403 forbiden y nos de permiso de uso del servicio

            $outputCmd = shell_exec($cmd);
            //dd($this->pathFilesFielCrt,$cmd,$outputCmd);
            Log::info('***** FielHelper->validarCerWSSAT');
            Log::info($cmd);
            Log::info($outputCmd);
            $outputArray = preg_split('/[\r\n]/', $outputCmd);
            if(isset($outputArray[23])){
                $validate = preg_split('/: /', $outputArray[23]);
                //$this->typeValidateSAT = $validate[1];
                if($validate[1] === 'good' ){
                    $this->estatus = true;
                    $this->msg[] = \Lang::get('messages.fiel.success.validacion_fiel_SAT');
                }else{
                    $this->estatus = false;
                    $this->msgFailed[] = \Lang::get('messages.fiel.failed.validacion_fiel_SAT');
                }
            }else{
                $this->estatus = false;
                $this->msgFailed[] = \Lang::get('messages.fiel.error.validacion_fiel_SAT');
            }

            //$this->msg[] = \Lang::get('messages.fiel.success.validacion_fiel_SAT_HC');
        }catch (\Exception $ex){
            $this->estatus = false;
            Log::info('***** FielHelper->validarCerWSSAT: '.$ex->getMessage(). ' file: '.$ex->getFile(). ' line: '.$ex->getLine());
            $this->msg[] = \Lang::get('messages.fiel.error.validacion_fiel_SAT');
        }
    }

    /**
     * funcion que valida el certificado con los servicios de sonora
     * no se recomienda ya que es uno que no se tiene control y la disponibilidad del mismo
     * @author Enrique Corona
     * @date ago/2023
     */
    public function validarCerWSSingGobCol(){
        try{
            $tempFileCerPEM = $this->pathTempFilesTemp.$this->nameFirmaTemp.'.cer';
            //procesamos el pem del certificado para procesarlo con el md5
            file_put_contents($tempFileCerPEM,base64_decode($this->certificadoB64));
            if(function_exists('curl_file_create')){
                $certificado = curl_file_create($tempFileCerPEM);
            }else{
                $certificado = '@'.realpath($tempFileCerPEM);
            }
            $post = array('certificado' => $certificado);
            $options = array(
                CURLOPT_POST => true,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POSTFIELDS => $post,
            );
            if($this->env == 'local'){
                $options[CURLOPT_SSL_VERIFYPEER] = false;
            }
            $curlopt = CommomHelper::curlopt($this->urlValidacion,$options);
            $this->estatus = true;
            $this->resultWSFielGobCol = json_decode($curlopt,true);
        }catch (\Exception $ex){
            $this->estatus = false;
            Log::info('***** FielHelper->validarCerWSSingGobCol: '.$ex->getMessage(). ' file: '.$ex->getFile(). ' line: '.$ex->getLine());
            $this->msg[] = \Lang::get('messages.fiel.error.validacion_fiel_SAT');
        }
    }

    /**
     * funcion privada que convierte el contenido del certificado en formato
     * @author Enrique Corona
     * @date ago/2023
     */
    private function codifyCerToPEM(){
        try{
            $cerContent = base64_decode($this->certificadoB64);
            $this->cerToPem = '-----BEGIN CERTIFICATE-----'.PHP_EOL
                .chunk_split(base64_encode($cerContent),64,PHP_EOL)
                .'-----END CERTIFICATE-----'.PHP_EOL;
            $this->estatus = true;
        }catch (\Exception $ex){
            $this->estatus = false;
            Log::info('***** FielHelper->codifyCerToPEM: '.$ex->getMessage(). ' file: '.$ex->getFile(). ' line: '.$ex->getLine());
            $this->msg[] = \Lang::get('messages.fiel.cer_not_exists');
        }
    }

    private function destroyFilesValidacionFIEL(){
        try{
            Log::info('***** FielHelper->destroyFilesValidacionFIEL - '.$this->nameFirmaTemp);
            file_exists($this->pathTempFilesTemp.$this->nameFirmaTemp.'.cer') ? unlink($this->pathTempFilesTemp.$this->nameFirmaTemp.'.cer') : false;
            file_exists($this->pathTempFilesTemp.$this->nameFirmaTemp.'.cer.pem') ? unlink($this->pathTempFilesTemp.$this->nameFirmaTemp.'.cer.pem') : false;
            file_exists($this->pathTempFilesTemp.$this->nameFirmaTemp.'.key') ? unlink($this->pathTempFilesTemp.$this->nameFirmaTemp.'.key') : false;
            file_exists($this->pathTempFilesTemp.$this->nameFirmaTemp.'.key.pem') ? unlink($this->pathTempFilesTemp.$this->nameFirmaTemp.'.key.pem') : false;
        }catch (\Exception $ex){
            $this->estatus = false;
            Log::info('***** FielHelper->destroyFilesValidacionFIEL: '.$ex->getMessage(). ' file: '.$ex->getFile(). ' line: '.$ex->getLine());
            $this->msg[] = $ex->getMessage();
        }
    }
}

?>
