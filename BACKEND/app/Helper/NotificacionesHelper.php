<?php

namespace App\Helper;


use App\Models\MsNotificacionesUsuariosModel;

class NotificacionesHelper {

    public static function insertNotificacion( $id_usuario_recibe,$titulo_notificacion,$descripcion ) {

        $msNotificacionModel = new MsNotificacionesUsuariosModel();
        
        $msNotificacionModel->nuevaNotificacion(
                                                $id_usuario_recibe
                                                ,$titulo_notificacion
                                                ,$descripcion
                                                            
        );

    }

}

?>
