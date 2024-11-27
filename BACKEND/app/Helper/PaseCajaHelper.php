<?php

namespace App\Helper;

use App\Models\RespuestaModel;
use Carbon\Carbon;
use DOMException;
use Illuminate\Support\Facades\Lang;
use Illuminate\Support\Facades\Log;

class PaseCajaHelper
{
    /**
     * @throws DOMException
     */
    public function conceptoCobroService()
    {
        $url = env('URL_PASE_CAJA_CONCEPTO_COBRO');
        // Construir el XML de la solicitud SOAP
        $dom = new \DOMDocument('1.0', 'utf-8');

        // Crear elementos
        $envelope = $dom->createElementNS('http://schemas.xmlsoap.org/soap/envelope/', 'soapenv:Envelope');
        $envelope->setAttribute('xmlns:con', 'http://geson.gob.mx/TRM/PORTAL/ContraloriaCompraNet');

        $header = $dom->createElement('soapenv:Header');
        $body = $dom->createElement('soapenv:Body');

        $mtContraloriaCompraNetReq = $dom->createElement('con:MT_ContraloriaCompraNet_req');
        $tpCtaContrato = $dom->createElement('TP_CTA_CONTRATO', '33');
        $cobro = $dom->createElement('COBRO', 'CO');

        // Construir la estructura del XML
        $envelope->appendChild($header);
        $envelope->appendChild($body);
        $body->appendChild($mtContraloriaCompraNetReq);
        $mtContraloriaCompraNetReq->appendChild($tpCtaContrato);
        $mtContraloriaCompraNetReq->appendChild($cobro);

        $dom->appendChild($envelope);

        // Obtener el XML como string
        $xmlRequest = $dom->saveXML();

        $headers = [
            'Method: POST',
            'Connection: Keep-Alive',
            'User-Agent: PHP-SOAP-CURL',
            'Content-Type: text/xml; charset=utf-8',
            'SOAPAction: "SI_ContraloriaCompraNet_out"'
        ];

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER,$headers);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $xmlRequest);
        curl_setopt($ch, CURLOPT_HTTP_VERSION, CURL_HTTP_VERSION_1_1);

        $username = env('SOAP_USERNAME');
        $password = env('SOAP_PASSWORD');
        curl_setopt($ch, CURLOPT_USERPWD, "$username:$password");

        $response = curl_exec($ch);

        curl_close($ch);

        if ($response === false) {
            die('Error cURL: ' . curl_error($ch));
        }

        $dom->loadXML($response);

        $codBP = $dom->getElementsByTagName('COD_BP')->item(0)->nodeValue;
        $codCtaContrato = $dom->getElementsByTagName('COD_CTA_CONTRATO')->item(0)->nodeValue;
        $codObjContrato = $dom->getElementsByTagName('COD_OBJ_CONTRATO')->item(0)->nodeValue;

        $conceptos = [];
        $conceptosNodes = $dom->getElementsByTagName('CONCEPTOS');
        foreach ($conceptosNodes as $conceptoNode) {
            $codConcept = $conceptoNode->getElementsByTagName('COD_CONCEPT')->item(0)->nodeValue;
            $codOpPrinc = $conceptoNode->getElementsByTagName('COD_OP_PRINC')->item(0)->nodeValue;
            $codOpParci = $conceptoNode->getElementsByTagName('COD_OP_PARCI')->item(0)->nodeValue;
            $descripcion = $conceptoNode->getElementsByTagName('DESCRIPCION')->item(0)->nodeValue;
            $importe = $conceptoNode->getElementsByTagName('IMPORTE')->item(0)->nodeValue;
            $cantidad = $conceptoNode->getElementsByTagName('CANTIDAD')->item(0)->nodeValue;

            $conceptoData = [
                'COD_CONCEPT' => $codConcept,
                'COD_OP_PRINC' => $codOpPrinc,
                'COD_OP_PARCI' => $codOpParci,
                'DESCRIPCION' => $descripcion,
                'IMPORTE' => floatval($importe), // Convertir a float si es necesario
                'CANTIDAD' => intval($cantidad), // Convertir a entero si es necesario
            ];

            $conceptos[] = $conceptoData;
        }

        $mensaje = [
            'TP_MENS' => $dom->getElementsByTagName('TP_MENS')->item(0)->nodeValue,
            'ID_MENS' => $dom->getElementsByTagName('ID_MENS')->item(0)->nodeValue,
            'V1_MENS' => $dom->getElementsByTagName('V1_MENS')->item(0)->nodeValue,
            'V2_MENS' => $dom->getElementsByTagName('V2_MENS')->item(0)->nodeValue,
        ];

        $responseArray = [
            'COD_BP' => $codBP,
            'COD_CTA_CONTRATO' => $codCtaContrato,
            'COD_OBJ_CONTRATO' => $codObjContrato,
            'CONCEPTOS' => $conceptos,
            'MENSAJES' => $mensaje,
        ];

        return $responseArray;
    }

    /**
     * @throws DOMException
     */
    public function generarPaseCaja($params)
    {
        $url = env('URL_PASE_CAJA_CREAR_PASE');

        // Crear un nuevo documento DOM
        $dom = new \DOMDocument('1.0', 'UTF-8');

        $envelope = $dom->createElementNS('http://schemas.xmlsoap.org/soap/envelope/', 'soapenv:Envelope');
        $envelope->setAttribute('xmlns:pas', 'http://geson.gob.mx/TRM/PORTAL/PaseAcaja');

        $header = $dom->createElement('soapenv:Header');
        $body = $dom->createElement('soapenv:Body');
        // Crear el elemento raíz <ns0:MT_PaseCaja_req> con su espacio de nombres
        $envelope->appendChild($header);
        $envelope->appendChild($body);

        $mtPaseCajaReq = $dom->createElementNS('http://geson.gob.mx/TRM/PORTAL/PaseAcaja', 'ns0:MT_PaseCaja_req');
        $body->appendChild($mtPaseCajaReq);
        $dom->appendChild($envelope);

        // Crear los elementos y sus hijos
        $cabecera = $dom->createElement('Cabecera');
        $mtPaseCajaReq->appendChild($cabecera);

        // Añadir elementos a Cabecera
        $elements = array(
            'COD_BP' => $params['COD_BP'],
            'RFC' => $params['rfc_proveedor'],
            'TP_CTA_CONTRATO' => '33',
            'COD_CTA_CONTRADO' =>  $params['COD_CTA_CONTRATO'],
            'CLASE_OBJETO' => 'CO',
            'COD_OBJ_CONTRATO' => $params['COD_OBJ_CONTRATO'],
            'CLAVE_PERIODO' => '',
            'FECHA_VENCIMIENTO' => $params['fecha_vencimiento'],
            'NOMBRE_OPCIONAL_PC' => htmlspecialchars($params['nombre'], ENT_XML1, 'UTF-8'),
            'DIRECCION_OPCIONAL_PC' => htmlspecialchars($params['direccion'], ENT_XML1, 'UTF-8'),
            'CORREO_ELECTRONICO' => htmlspecialchars($params['correo_electronico'], ENT_XML1, 'UTF-8') ,
            'OBSERVACIONES' => $params['numero_procedimiento']
        );

        foreach ($elements as $tag => $value) {
            $element = $dom->createElement($tag, $value);
            $cabecera->appendChild($element);
        }

        $generales = $dom->createElement('Generales');
        $mtPaseCajaReq->appendChild($generales);

        // Añadir elementos a Generales
        $domicilio = $dom->createElement('Domicilio');
        $generales->appendChild($domicilio);

        $elements = array(
            'CALLE', 'ENTRE_CALLES', 'NRO_EXT', 'NRO_INT', 'MUNICIPIO', 'LOCALIDAD',
            'COLONIA', 'COD_POSTAL', 'ZONA', 'ESTADO'
        );

        foreach ($elements as $tag) {
            $element = $dom->createElement($tag, '');
            $domicilio->appendChild($element);
        }

        $conceptos = $dom->createElement('Conceptos');
        $generales->appendChild($conceptos);

        $elements = array(
            'COD_CONCEPTP' => '61090100100',
            'COD_OP_PRINC' => '6148',
            'COD_OP_PARCI' => '1100',
            'IMPORTE' => $params['costo_inscripcion'],
            'CANTIDAD' => '1'
        );

        foreach ($elements as $tag => $value) {
            $element = $dom->createElement($tag, $value);
            $conceptos->appendChild($element);
        }

        // Añadir elementos a ISRTP
        $isrtp = $dom->createElement('ISRTP');
        $mtPaseCajaReq->appendChild($isrtp);

        $referenciasISRTP = $dom->createElement('ReferenciasISRTP');
        $isrtp->appendChild($referenciasISRTP);

        $elements = array(
            'COD_CTA_CONTRATO' => '',
            'NOM_ORGANIZACION' => '',
            'NRO_MES' => '0',
            'NRO_EMPLEADOS' => '0',
            'BAS_GRAVABLE' => '0'
        );

        foreach ($elements as $tag => $value) {
            $element = $dom->createElement($tag, $value);
            $referenciasISRTP->appendChild($element);
        }

        // Añadir elementos a Declaracion
        $declaracion = $dom->createElement('Declaracion');
        $mtPaseCajaReq->appendChild($declaracion);

        $datosDeclaracion = $dom->createElement('DatosDeclaracion');
        $declaracion->appendChild($datosDeclaracion);

        $elements = array(
            'NOM_CAMPO' => '',
            'DES_CAMPO' => '',
            'VAL_CAMPO' => '',
            'IND_APLIC' => ''
        );

        foreach ($elements as $tag => $value) {
            $element = $dom->createElement($tag, $value);
            $datosDeclaracion->appendChild($element);
        }

        // Añadir elementos a Vehicular
        $vehicular = $dom->createElement('Vehicular');
        $mtPaseCajaReq->appendChild($vehicular);

        $partidasAbiertas = $dom->createElement('PartidasAbiertas');
        $vehicular->appendChild($partidasAbiertas);

        $elements = array(
            'COD_CONCEPTP' => '',
            'COD_OP_PRINC' => '',
            'COD_OP_PARCI' => '',
            'DENOMINACION' => '',
            'PERIODO' => '',
            'IMPORTE' => '0',
            'IND_BORRADO' => '',
            'DOC_CONTABLE' => '',
            'DOC_POS_1' => '',
            'DOC_POS_2' => ''
        );

        foreach ($elements as $tag => $value) {
            $element = $dom->createElement($tag, $value);
            $partidasAbiertas->appendChild($element);
        }

        // Añadir elementos a ISAN
        $isan = $dom->createElement('ISAN');
        $mtPaseCajaReq->appendChild($isan);

        $tablaVehiculosISAN = $dom->createElement('TablaVehiculosISAN');
        $isan->appendChild($tablaVehiculosISAN);

        $elements = array(
            'TIPO' => '',
            'MODELO' => '',
            'UNIDADES' => '0',
            'VALOR_ENAJENACION' => '0'
        );

        foreach ($elements as $tag => $value) {
            $element = $dom->createElement($tag, $value);
            $tablaVehiculosISAN->appendChild($element);
        }

        // Añadir elementos a VIgenciaLicencia
        $vigenciaLicencia = $dom->createElement('VIgenciaLicencia');
        $mtPaseCajaReq->appendChild($vigenciaLicencia);

        $vigLicen = $dom->createElement('VIG_LICEN', '');
        $vigenciaLicencia->appendChild($vigLicen);

        // Guardar el documento XML en una cadena
        $xmlRequest = $dom->saveXML();
        Log::info( '-------------------- XML GENERADO ---------------------------------------');
        Log::info($xmlRequest);

        $headers = [
            'Method: POST',
            'Connection: Keep-Alive',
            'User-Agent: PHP-SOAP-CURL',
            'Content-Type: text/xml; charset=utf-8',
            'SOAPAction: "SI_PaseCaja_B64_out"'
        ];

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER,$headers);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $xmlRequest);
        curl_setopt($ch, CURLOPT_HTTP_VERSION, CURL_HTTP_VERSION_1_1);

        $username = env('SOAP_USERNAME');
        $password = env('SOAP_PASSWORD');
        curl_setopt($ch, CURLOPT_USERPWD, "$username:$password");

        $response = curl_exec($ch);
        curl_close($ch);

        if ($response === false) {
            die('Error cURL: ' . curl_error($ch));
        }

        $dom->loadXML($response);

        $folio = $dom->getElementsByTagName('FOLIO')->item(0)->nodeValue;

        return $folio;

    }

    /**
     * @throws DOMException
     */
    public function obtenerB64PaseCaja($params)
    {
        $url = env('URL_PASE_CAJA_GET_PASE');
        // Construir el XML de la solicitud SOAP
        $dom = new \DOMDocument('1.0', 'utf-8');

        // Crear elementos
        $envelope = $dom->createElementNS('http://schemas.xmlsoap.org/soap/envelope/', 'soapenv:Envelope');
        $envelope->setAttribute('xmlns:pas', 'http://geson.gob.mx/PORTAL/WS/PaseCaja_B64');

        $header = $dom->createElement('soapenv:Header');
        $body = $dom->createElement('soapenv:Body');

        $mtPaseCajaReq = $dom->createElement('pas:MT_Pase_Caja_Rqst');
        $idPaseCaja = $dom->createElement('Id_Pase_Caja', $params['idPaseCaja']);

        // Construir la estructura del XML
        $envelope->appendChild($header);
        $envelope->appendChild($body);
        $body->appendChild($mtPaseCajaReq);
        $mtPaseCajaReq->appendChild($idPaseCaja);

        $dom->appendChild($envelope);

        $xmlRequest = $dom->saveXML();

        $headers = [
            'Method: POST',
            'Connection: Keep-Alive',
            'User-Agent: PHP-SOAP-CURL',
            'Content-Type: text/xml; charset=utf-8',
            'SOAPAction: "SI_PaseCaja_B64_out"'
        ];

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER,$headers);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $xmlRequest);
        curl_setopt($ch, CURLOPT_HTTP_VERSION, CURL_HTTP_VERSION_1_1);

        $username = env('SOAP_USERNAME');
        $password = env('SOAP_PASSWORD');
        curl_setopt($ch, CURLOPT_USERPWD, "$username:$password");

        $response = curl_exec($ch);
        curl_close($ch);

        if ($response === false) {
            die('Error cURL: ' . curl_error($ch));
        }

        $dom->loadXML($response);

        $id_mensaje = $dom->getElementsByTagName('Id')->item(0)->nodeValue;
        $descripcion = $dom->getElementsByTagName('Descripcion')->item(0)->nodeValue;
        $stringB64 = $dom->getElementsByTagName('Str_Base_64')->item(0)->nodeValue;

        $responseArray = [
            'ID_MENSAJE' => $id_mensaje,
            'descripcion' => $descripcion,
            'base64' => $stringB64,
        ];


        return $responseArray;
    }

    /**
     * @throws DOMException
     */
    public function obtenerRecibo($params)
    {
        $url = env('URL_PASE_CAJA_GET_RECIBO');

        $dom = new \DOMDocument('1.0', 'utf-8');

        // Crear elementos
        $envelope = $dom->createElementNS('http://schemas.xmlsoap.org/soap/envelope/', 'soapenv:Envelope');
        $envelope->setAttribute('xmlns:pag', 'http://geson.gob.mx/TRM/PORTAL/PagoEnLinea');

        $header = $dom->createElement('soapenv:Header');
        $body = $dom->createElement('soapenv:Body');

        $mtConsultaReq = $dom->createElement('pag:MT_Consulta_req');
        $idPaseCaja = $dom->createElement('PASEC', $params['idPaseCaja']);
        $recibo = $dom->createElement('RECIBO','?');

        // Construir la estructura del XML
        $envelope->appendChild($header);
        $envelope->appendChild($body);
        $body->appendChild($mtConsultaReq);
        $mtConsultaReq->appendChild($idPaseCaja);
        $mtConsultaReq->appendChild($recibo);

        $dom->appendChild($envelope);

        // Obtener el XML como string
        $xmlRequest = $dom->saveXML();

        $headers = [
            'Method: POST',
            'Connection: Keep-Alive',
            'User-Agent: PHP-SOAP-CURL',
            'Content-Type: text/xml; charset=utf-8',
            'SOAPAction: "SI_ConsultaRo_out"'
        ];

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER,$headers);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $xmlRequest);
        curl_setopt($ch, CURLOPT_HTTP_VERSION, CURL_HTTP_VERSION_1_1);

        $username = env('SOAP_USERNAME');
        $password = env('SOAP_PASSWORD');
        curl_setopt($ch, CURLOPT_USERPWD, "$username:$password");

        $response = curl_exec($ch);
        curl_close($ch);
        if ($response === false) {
            die('Error cURL: ' . curl_error($ch));
        }

        $dom->loadXML($response);
        // Obtener detalles del error SOAP si existe
        $faultCode = $dom->getElementsByTagName('faultcode')->item(0);
        $faultString = $dom->getElementsByTagName('faultstring')->item(0);

        if ($faultCode !== null && $faultString !== null) {
            // Retornar bandera de error con detalles específicos
            return ['error' => true, 'message' => "Error SOAP: {$faultCode->nodeValue} - {$faultString->nodeValue}"];
        }
        $status = $dom->getElementsByTagName('STATUS')->item(0)->nodeValue;
        $datos = [];
        $datosNodes = $dom->getElementsByTagName('DATOS');
        foreach ($datosNodes as $datoNode) {
            $recibo = $datoNode->getElementsByTagName('RECIBO')->item(0)->nodeValue;
            $pase_caja = $datoNode->getElementsByTagName('PASE_CAJA')->item(0)->nodeValue;
            $tipo = $datoNode->getElementsByTagName('TIPO')->item(0)->nodeValue;
            $importe = $datoNode->getElementsByTagName('IMPORTE')->item(0)->nodeValue;
            $partner = $datoNode->getElementsByTagName('PARTNER')->item(0)->nodeValue;
            $f_creacion = $datoNode->getElementsByTagName('F_CREACION')->item(0)->nodeValue;
            $nombre = $datoNode->getElementsByTagName('NOMBRE')->item(0)->nodeValue;

            $dataDatos = [
                'recibo' => $recibo,
                'pase_caja' => $pase_caja,
                'tipo' => $tipo,
                'importe' => floatval($importe),
                'partner' => $partner,
                'fecha_creacion' => $f_creacion,
                'nombre' => $nombre
            ];

            $datos[] = $dataDatos;
        }
        //$datos = $dom->getElementsByTagName('DATOS')->item(0)->nodeValue;
        $stringB64 = $dom->getElementsByTagName('STR_B64')->item(0)->nodeValue;


        $responseArray = [
            'status_recibo' => $status,
            'datos' => $datos,
            'base64' => $stringB64,
        ];

        return $responseArray;

    }



}
