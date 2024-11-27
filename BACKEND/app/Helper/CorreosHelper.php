<?php

namespace App\Helper;
use App\Models\PlantillasModel;
use Illuminate\Support\Facades\Mail;

class CorreosHelper {

    public function enviarCorreoRecuperarPass($direccion, $asunto, $datos) {

        $plantillas = new PlantillasModel();
        $plantillaEnviar = $plantillas->find($plantillas->plantillasEnum['RECUPERAR_PASS']);
        if ($plantillaEnviar != null) {
            $texto = $plantillaEnviar->texto_plantilla;

            foreach ($datos as $d) {
                $texto = str_replace($d['CAD'],$d['VAL'], $texto);
            }

            Mail::send([], [], function ($message) use ($texto, $direccion, $asunto) {
                $message
                    ->to($direccion)
                    ->subject($asunto)
                    ->html($texto);
            });

        }
    }

    public function correoProveedorRegistrado($direccion, $asunto, $nombreDestinatario) {

        $plantillas = new PlantillasModel();
        $plantillaEnviar = $plantillas->find($plantillas->plantillasEnum['REGISTRO_PROVEEDOR']);
        if ($plantillaEnviar != null) {
            $texto = $plantillaEnviar->texto_plantilla;
            $texto = str_replace('{{NOMBRE}}', $nombreDestinatario, $texto);
            Mail::send([], [], function ($message) use ($texto, $direccion, $asunto) {
                $message
                    ->to($direccion)
                    ->subject($asunto)
                    ->html($texto);
            });

        }
    }

    public function correoProveedorValidado($direccion, $asunto, $nombreDestinatario) {

        $plantillas = new PlantillasModel();
        $plantillaEnviar = $plantillas->find($plantillas->plantillasEnum['VALIDACION_PROVEEDOR']);
        if ($plantillaEnviar != null) {
            $texto = $plantillaEnviar->texto_plantilla;
            $texto = str_replace('{{NOMBRE}}', $nombreDestinatario, $texto);
            Mail::send([], [], function ($message) use ($texto, $direccion, $asunto) {
                $message
                    ->to($direccion)
                    ->subject($asunto)
                    ->html($texto);
            });

        }
    }

    public function correoProveedorModificado($direccion, $asunto, $nombreDestinatario, $rfc_proveedor) {

        $plantillas = new PlantillasModel();
        $plantillaEnviar = $plantillas->find($plantillas->plantillasEnum['MOD_PROVEEDOR']);
        if ($plantillaEnviar != null) {
            $texto = $plantillaEnviar->texto_plantilla;
            $texto = str_replace('{{NOMBRE}}', $nombreDestinatario, $texto);
            $texto = str_replace('{{NOMBRE}}', $nombreDestinatario, $texto);
            $texto = str_replace('{{RFC}}', $rfc_proveedor, $texto);
            Mail::send([], [], function ($message) use ($texto, $direccion, $asunto) {
                $message
                    ->to($direccion)
                    ->subject($asunto)
                    ->html($texto);
            });
        }
    }

    public function inscripcionProveedor($direccion, $asunto, $nombreDestinatario, $procedimiento , $tipoInscripcion) {

        $plantillas = new PlantillasModel();
        $plantillaEnviar = $plantillas->find($plantillas->plantillasEnum['INSCRIPCION_PROVEEDOR']);
        if ($plantillaEnviar != null) {
            $texto = $plantillaEnviar->texto_plantilla;
            if ($tipoInscripcion == 0){
                $texto = str_replace('{{PARTICIPACION}}', 'participante', $texto);
            }

            if ($tipoInscripcion == 1){
                $texto = str_replace('{{PARTICIPACION}}', 'invitado', $texto);
            }
            $texto = str_replace('{{NOMBRE}}', $nombreDestinatario, $texto);
            $texto = str_replace('{{PROCEDIMIENTO}}', $procedimiento, $texto);
            Mail::send([], [], function ($message) use ($texto, $direccion, $asunto) {
                $message
                    ->to($direccion)
                    ->subject($asunto)
                    ->html($texto);
            });

        }
    }

    public function correoAcusePreguntas($direccion, $asunto, $nombreDestinatario, $procedimiento) {

        $plantillas = new PlantillasModel();
        $plantillaEnviar = $plantillas->find($plantillas->plantillasEnum['ACUSE_PREGUNTAS']);
        if ($plantillaEnviar != null) {
            $texto = $plantillaEnviar->texto_plantilla;
            $texto = str_replace('{{NOMBRE}}', $nombreDestinatario, $texto);
            $texto = str_replace('{{PROCEDIMIENTO}}', $procedimiento, $texto);
            Mail::send([], [], function ($message) use ($texto, $direccion, $asunto) {
                $message
                    ->to($direccion)
                    ->subject($asunto)
                    ->html($texto);
            });

        }
    }

    public function correoAcusePropuestas($direccion, $asunto, $nombreDestinatario, $procedimiento) {

        $plantillas = new PlantillasModel();
        $plantillaEnviar = $plantillas->find($plantillas->plantillasEnum['ACUSE_PROPUESTA']);
        if ($plantillaEnviar != null) {
            $texto = $plantillaEnviar->texto_plantilla;
            $texto = str_replace('{{NOMBRE}}', $nombreDestinatario, $texto);
            $texto = str_replace('{{PROCEDIMIENTO}}', $procedimiento, $texto);
            Mail::send([], [], function ($message) use ($texto, $direccion, $asunto) {
                $message
                    ->to($direccion)
                    ->subject($asunto)
                    ->html($texto);
            });

        }
    }

    public function correoDiferimientoAperturaParticipante($direccion, $asunto, $nombreDestinatario, $procedimiento, $fechaDiferimiento, $horaDiferimiento) {

        $plantillas = new PlantillasModel();
        $plantillaEnviar = $plantillas->find($plantillas->plantillasEnum['DIFERIMIENTO_PARTICIPANTE']);
        if ($plantillaEnviar != null) {
            $texto = $plantillaEnviar->texto_plantilla;
            $texto = str_replace('{{NOMBRE}}', $nombreDestinatario, $texto);
            $texto = str_replace('{{PROCEDIMIENTO}}', $procedimiento, $texto);
            $texto = str_replace('{{FECHA_DIFERIMIENTO}}', date('d/m/y', strtotime($fechaDiferimiento)), $texto);
            $texto = str_replace('{{HORA_DIFERIMIENTO}}', date('h:i A', strtotime($horaDiferimiento)), $texto);
            Mail::send([], [], function ($message) use ($texto, $direccion, $asunto) {
                $message
                    ->to($direccion)
                    ->subject($asunto)
                    ->html($texto);
            });

        }
    }

    public function correoDiferimientoAperturaInvitado($direccion, $asunto, $nombreDestinatario, $procedimiento, $fechaDiferimiento, $horaDiferimiento) {

        $plantillas = new PlantillasModel();
        $plantillaEnviar = $plantillas->find($plantillas->plantillasEnum['DIFERIMIENTO_INVITADO']);
        if ($plantillaEnviar != null) {
            // Obtener la fecha y hora actual en los formatos deseados
            $texto = $plantillaEnviar->texto_plantilla;
            $texto = str_replace('{{NOMBRE}}', $nombreDestinatario, $texto);
            $texto = str_replace('{{PROCEDIMIENTO}}', $procedimiento, $texto);
            $texto = str_replace('{{FECHA_DIFERIMIENTO}}', date('d/m/y', strtotime($fechaDiferimiento)), $texto);
            $texto = str_replace('{{HORA_DIFERIMIENTO}}', date('h:i A', strtotime($horaDiferimiento)), $texto);
            Mail::send([], [], function ($message) use ($texto, $direccion, $asunto) {
                $message
                    ->to($direccion)
                    ->subject($asunto)
                    ->html($texto);
            });

        }
    }

    public function correoAutorizacionApertura($direccion, $asunto , $procedimiento) {

        $plantillas = new PlantillasModel();
        $plantillaEnviar = $plantillas->find($plantillas->plantillasEnum['AUTORIZACION_APERTURA']);
        if ($plantillaEnviar != null) {
            $texto = $plantillaEnviar->texto_plantilla;
            $texto = str_replace('{{PROCEDIMIENTO}}', $procedimiento, $texto);
            Mail::send([], [], function ($message) use ($texto, $direccion, $asunto) {
                $message
                    ->to($direccion)
                    ->subject($asunto)
                    ->html($texto);
            });

        }
    }

    public function correoDescargaPropuesta($direccion, $asunto, $nombreDestinatario, $procedimiento,) {
        $plantillas = new PlantillasModel();
        $plantillaEnviar = $plantillas->find($plantillas->plantillasEnum['DESCARGA_PROPUESTA']);
        if ($plantillaEnviar != null) {
            // Obtener la fecha y hora actual en los formatos deseados
            $fechaActual = date('d/m/Y');
            $horaActualServidor = date('h:i A'); // Hora del servidor
            $horaActual = date('h:i A', strtotime($horaActualServidor) - 7 * 3600); // Restar 7 horas

            $texto = $plantillaEnviar->texto_plantilla;
            $texto = str_replace('{{NOMBRE}}', $nombreDestinatario, $texto);
            $texto = str_replace('{{PROCEDIMIENTO}}', $procedimiento, $texto);
            $texto = str_replace('{{FECHA}}', $fechaActual, $texto);
            $texto = str_replace('{{HORA}}', $horaActual, $texto);
            Mail::send([], [], function ($message) use ($texto, $direccion, $asunto) {
                $message
                    ->to($direccion)
                    ->subject($asunto)
                    ->html($texto);
            });

        }
    }

    public function prorrogaJuntaAclaraciones($direccion, $asunto, $nombreDestinatario, $procedimiento, $fechaProrroga) {

        $plantillas = new PlantillasModel();
        $plantillaEnviar = $plantillas->find($plantillas->plantillasEnum['PRORROGA_JUNTA']);
        if ($plantillaEnviar != null) {
            $texto = $plantillaEnviar->texto_plantilla;

            $texto = str_replace('{{NOMBRE_DESTINATARIO}}', $nombreDestinatario, $texto);
            $texto = str_replace('{{PROCEDIMIENTO}}', $procedimiento, $texto);
            $texto = str_replace('{{FECHA}}', $fechaProrroga, $texto);
            Mail::send([], [], function ($message) use ($texto, $direccion, $asunto) {
                $message
                    ->to($direccion)
                    ->subject($asunto)
                    ->html($texto);
            });

        }
    }

    public function respuestaJuntaAclaraciones($direccion, $asunto, $nombreDestinatario, $procedimiento) {

        $plantillas = new PlantillasModel();
        $plantillaEnviar = $plantillas->find($plantillas->plantillasEnum['RESUPESTA_JUNTA']);
        if ($plantillaEnviar != null) {
            $texto = $plantillaEnviar->texto_plantilla;

            $texto = str_replace('{{NOMBRE_DESTINATARIO}}', $nombreDestinatario, $texto);
            $texto = str_replace('{{PROCEDIMIENTO}}', $procedimiento, $texto);
            Mail::send([], [], function ($message) use ($texto, $direccion, $asunto) {
                $message
                    ->to($direccion)
                    ->subject($asunto)
                    ->html($texto);
            });

        }
    }

    public function descargaAnexosProcedimientos($direccion, $asunto, $nombreDestinatario, $procedimiento, $nombreArchivoPreguntas) {

        $plantillas = new PlantillasModel();
        $plantillaEnviar = $plantillas->find($plantillas->plantillasEnum['DESCARGA_PREGUNTAS']);
        if ($plantillaEnviar != null) {
            $texto = $plantillaEnviar->texto_plantilla;

            $texto = str_replace('{{NOMBRE_DESTINATARIO}}', $nombreDestinatario, $texto);
            $texto = str_replace('{{PROCEDIMIENTO}}', $procedimiento, $texto);
            $texto = str_replace('{{PREGUNTAS}}', $nombreArchivoPreguntas, $texto);
            Mail::send([], [], function ($message) use ($texto, $direccion, $asunto) {
                $message
                    ->to($direccion)
                    ->subject($asunto)
                    ->html($texto);
            });

        }
    }

    public function correoDescargaReporte($direccion, $asunto, $nombreDestinatario, $link) {

        $plantillas = new PlantillasModel();
        $plantillaEnviar = $plantillas->find($plantillas->plantillasEnum['DESCARGA_REPORTES']);
        if ($plantillaEnviar != null) {
            $texto = $plantillaEnviar->texto_plantilla;

            $texto = str_replace('{{USUARIO}}', $nombreDestinatario, $texto);
            $texto = str_replace('{{LINK}}', $link, $texto);
            Mail::send([], [], function ($message) use ($texto, $direccion, $asunto) {
                $message
                    ->to($direccion)
                    ->subject($asunto)
                    ->html($texto);
            });

        }
    }

}

?>
