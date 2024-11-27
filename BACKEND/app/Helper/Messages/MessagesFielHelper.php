<?php

namespace App\Helper\Messages;

class MessagesFielHelper{

    public static function formValidateCerData(){
        return [
            //'path_certificado' => 'required',
            'certificado_b64.required' => 'El certificado es un campo obligatorio',
        ];
    }

    public static function formValidacionFirma(){
        return [
            'certificado_b64.required' => 'El certificado es un campo obligatorio',
            'key_b64.required' => 'El .key es un campo obligatorio',
            'password.required' => 'La contraseña de la fiel es requerida',
            'rfc_firmante.required' => 'El RFC quien deberia firmar es obligatorio',
        ];
    }

}