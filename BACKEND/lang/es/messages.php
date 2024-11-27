<?php

//use Illuminate\Support\Facades\Lang;
//trans(Lang::get('messages.request_exito'), [ 'tipo' => 'Búsqueda']);

return [
    'system_error' => '¡Ocurrio un error en el sistema. Por favor contacta al administrador o intenta nuevamente!',
    'system_login_error' => '¡Datos incorrectos, verifica tu información e intenta nuevamente!',
    'system_login_exito' => '¡Bienvenido!',

    'request_exito' => '¡El servicio se ejecutó exitosamente !',
    'request_error' => '¡Ocurrio un error al ejecutar el servicio!',
    'request_busqueda' => "¡La información se registro correctamente!",
    'request_guardar' => "¡La información se registro correctamente!",
    'request_actualizar' => "¡La información se actualizó correctamente!",
    'request_reg_existe' => "¡La información ya se encuentra registrada, verifica tus datos!",

    'storage' => [
      'crear_zip_error' => 'No se pudo crear el archivo zip',
      'agregar_pass_error' => 'Error al agregar password al archivo zip',
      'agregar_archivo_error' => 'Error al agregar el archivo al zip',
      'encriptacion_error' => 'Ocurrio un error al encriptar el zip',
      'guardar_exito' => 'Se almaceno correctamente la información',

      'archivo_no_existe' => 'El archivo se obtuvo correctamente',
      'archivo_no_existe' => 'El archivo no existe en la ruta especificada',

      'error_extraer_archivo' => 'El archivo no se pudo extraer.',
      'exito_extraer_archivo' => 'El archivo se obtuvo exitosamente.',
      'extraccion_sin_datos' => 'El paquete no contiene información'
    ],

    'restablecer_pass' => [
        'usu_no_existe' => "¡El correo no coincide, verifica tu información!",
        'exito' => "Completa tu solicitud de restablecimiento de contraseña!",
        'exito_info' => "Se envió un correo con el código para continuar con el restablecimiento de contraseña!",
        'codigo_no_valido' => 'El código que ingresaste no es válido!',
        'exito_cambio' => "Tu contraseña ha sido modificada con éxito!",
    ],

    'success' => [
        'serviceSAT' => 'Se obtuvo el estatus del certificado a utilizar en el sistema',
        'serviceSATMsg' => 'El estatus que se obtuvo del certiciado es: ',
    ],
    'error' => [
        'exception' => 'Ocurrio un error en el sistema, favor de intentarlo nuevamente',
        'serviceSAT' => 'Ocurrio un error en las comunicaciones del servicio del SAT para validar al e-firma',
    ],

    'licitaciones' => [
        'dato_requerido' => 'El valor :attribute es requerido.',
        'dato_inexistente' => 'El valor :attribute no existe.',
        'tipo_licit_not_exits' => 'El tipo de licitación debe ser un tipo de licitación válido.',
        'tipo_normativa_not_exits' => 'El tipo de normativa debe ser un tipo de normativa válido.',
        'unidad_compradora_not_exits' => 'La unidad compradora debe ser una unidad compradora válida.',
        'unidad_compradora_length' => 'La clave de la unidad compradora es invalida. (Debe contener 9 dígitos)',
        'codigo_exito' => 'Código generado con éxito.',
    ],

    'fiel' => [
        'cer_not_exists' => 'El certificado de al Fiel no se cargo correctametne al sistema',
        'data_certificado_success' => 'Los datos del certificado se obtuvieron correctamente',
        'success' => [
            'cer' => 'Se obtuvieron los datos del certificado correctamente',
            'vig_cer' => 'El certificado se encuentra vigente',
            'rfc_firmante' => 'El RFC del firmante corresponde con el de la Firma Electrónica',
            'password' => 'La contraseña de la Firma Electrónica es correcta',
            'correspondencia_cer_key' => 'Existen correspondencia entre el .cer y .key de la Firma Electrónica',
            'validacion_fiel_SAT_HC' => 'Funcion HC que valida el .cer con el SAT; no disponible hasta su autorización de uso',
            'validacion_fiel_SAT' => 'El certificado es valido, fue emitido por el SAT y se encuentra vigente',
        ],
        'failed' => [
            'cer' => '',
            'vig_cer' => 'El certificado no se encuentra vigente',
            'rfc_firmante' => 'El RFC del firmante no corresponde con el del la Firma Electrónica',
            'password' => 'La contraseña de la Firma Electrónica es incorrecta',
            'correspondencia_cer_key' => 'No existe una correspondencia entre el .cer y .key de la Firma Electrónica o, la contraseña es incorrecta',
            'validacion_fiel_SAT' => 'El certificado no es válido, no fue emitido por el SAT o se encuentra revocado',
        ],
        'error' => [
            'cer' => 'Ocurrio un error al obtener los datos del certificado',
            'vig_cer' => 'Ocurrio un error al obtener la vigencia del certificado',
            'rfc_firmante' => 'Ocurrio un error al procesar el RFC del firmante',
            'password' => 'Ocurrio un error al procesar la contraseña con la Firma Electrónica',
            'correspondencia_cer_key' => 'Ocurrio un error al procesar la correspondencia entre el .cer y .key de la Firma Electrónica',
            'validacion_fiel_SAT' => 'Ocurrio un error al procesar el certificado de la Firma Electrónica con la entidad Certificadora del SAT',
        ]
    ],

    'proveedores' => [
        'registro_success' => 'Los datos se han guardado con exito',
        'inscripcion_exist' => 'Ya se encuentra registrado en esta licitacion.',
        'inscripcion_success' => 'El registro de su inscripción se ha realizado exitosamente',
        'registro_complete' => 'Ha concluido su registro exitosamente'
    ],

    'apertura' => [
        'autorizacion_success' => 'El acto de recepción y apertura ha sido autorizado exitosamente'
    ],

    'reportes' => [
        'error' => [
            'existe_hoy' => 'El reporte con fecha de hoy ya ha sido generado, solo se permite por este medio una actualización al día'
        ]
    ]
];
