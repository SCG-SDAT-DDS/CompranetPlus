<?php

namespace App\Helper\Validations;
class ValidationFielHelper {

    public static function formValidateCerData(){
        return [
            //'path_certificado' => 'required',
            'certificado_b64' => 'required',
        ];
    }

    public static function formValidacionFirma(){
        return [
            'certificado_b64' => 'required',
            'key_b64' => 'required',
            'password' => 'required',
            'rfc_firmante' => 'required',
        ];
    }

}
