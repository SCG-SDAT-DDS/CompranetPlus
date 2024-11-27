<?php

namespace App\Helper;

use App\Models\ArchivoModel;
use App\Models\RespuestaModel;
use Carbon\Carbon;
use Faker\Core\File;
use Illuminate\Support\Facades\Lang;
use ZipArchive;
use Illuminate\Support\Facades\Log;

class ArchivosHelper {

    private function makeDirPath($path) {
        return file_exists($path) || mkdir($path, 0777, true);
    }

    private function generarPass($nombre) {
        $pass = env('APP_KEY'). $nombre;
        return $pass;
    }

    public function guardarDocumento(ArchivoModel $archivo,
                                     String $procedimiento = null,
                                     $encriptar=false) {

        $urlBase = strtolower(env('FILE_STORAGE_SIGCE'));

        $url = $urlBase;
        if ($procedimiento != null) {
            $url .= '/'.$procedimiento;
        }

        $url .= $archivo->getTipoArchivo()['subDir'];
        if ( !is_dir( $url ) ) {
            $this->makeDirPath( $url );
        }

        $filename_without_ext = preg_replace('/\\.[^.\\s]{3,4}$/', '', $archivo->getNombreArchivo());
        $date = Carbon::now();

        if (!$encriptar) {
            $finalURL = $url.$archivo->getNombreArchivo();

            if (file_exists($finalURL)) {
                $infoPath = pathinfo($archivo->getNombreArchivo());
                $finalURL = $url.$filename_without_ext.$date->timestamp.'.'.$infoPath['extension'];
            }

            file_put_contents($finalURL,base64_decode($archivo->getBase64()));
        } else {
            $zip = new ZipArchive();

            $finalURL = $url.$filename_without_ext.'.zip';

            if (file_exists($finalURL)) {
                $finalURL = $url.$filename_without_ext.$date->timestamp.'.zip';
            }

            $zipStatus = $zip->open($finalURL, ZipArchive::CREATE);
            if ($zipStatus !== true) {
                return new RespuestaModel(false,  null,
                    Lang::get('messages.storage.crear_zip_error'));
            }

            $password = $this->generarPass($filename_without_ext);
            if (!$zip->setPassword($password)) {
                return new RespuestaModel(false,  null,
                    Lang::get('messages.storage.agregar_pass_error'));
            }

            if (!$zip->addFromString($archivo->getNombreArchivo(), base64_decode($archivo->getBase64()))) {
                return new RespuestaModel(false,  null,
                    Lang::get('messages.storage.agregar_archivo_error'));
            }

            if (!$zip->setEncryptionName($archivo->getNombreArchivo(), ZipArchive::EM_AES_256)) {
                return new RespuestaModel(false,  null,
                    Lang::get('messages.storage.encriptacion_error'));
            }

            $zip->close();
        }

        return new RespuestaModel(true,  $finalURL,
            Lang::get('messages.storage.guardar_exito'));

    }

    public function obtenerDocumento(String $url, $encriptar=false) {

        $urlBase = strtolower(env('FILE_STORAGE_SIGCE').'/tmp');

        $fileName = basename($url);
        $filename_without_ext = preg_replace('/\\.[^.\\s]{3,4}$/', '', $fileName);

        $password = $this->generarPass($filename_without_ext);  


        if (file_exists($url)) {

            if ($encriptar) {
                $zip = new ZipArchive();
                if ($zip->open($url) === true) {

                    $zipTmpExtraccion = $urlBase.'/'.$filename_without_ext;

                    $zip->setPassword($password);
                    $zip->extractTo($zipTmpExtraccion);
                    $zip->close();

                    $archivosExtraidos = array_diff(scandir($zipTmpExtraccion), array('.', '..'));

                    if (sizeof($archivosExtraidos)>0) {
                        //$content = File::get($archivosExtraidos[0]); La comente porque me generaba un error
                        $primerArchivo = $zipTmpExtraccion . '/' . reset($archivosExtraidos);

                        $content = file_get_contents($primerArchivo);

                        return new RespuestaModel(true,  base64_encode($content),
                            Lang::get('messages.storage.exito_extraer_archivo'));
                    } else {


                        if (strlen($filename_without_ext) > 10) {
                             $nombreArchivoSimple = substr($filename_without_ext,0,strlen($filename_without_ext)-10);
                             $nombreArchivoTimestamp = substr($filename_without_ext,strlen($filename_without_ext)-10,strlen($filename_without_ext));
                             
                             log::info("------------------ARCHIVO");
                             log::info("full->".$filename_without_ext);
                             log::info("simple->".$nombreArchivoSimple);
                             log::info("time->".$nombreArchivoTimestamp);
                             $password = $this->generarPass($nombreArchivoSimple);  
                             
                             $zip = new ZipArchive();
                             if ($zip->open($url) === true) {

                                $zipTmpExtraccion = $urlBase.'/'.$filename_without_ext;

                                $zip->setPassword($password);
                                $zip->extractTo($zipTmpExtraccion);
                                $zip->close();

                                $archivosExtraidos = array_diff(scandir($zipTmpExtraccion), array('.', '..'));

                                if (sizeof($archivosExtraidos)>0) {
                                    //$content = File::get($archivosExtraidos[0]); La comente porque me generaba un error
                                    $primerArchivo = $zipTmpExtraccion . '/' . reset($archivosExtraidos);

                                    $content = file_get_contents($primerArchivo);

                                    return new RespuestaModel(true,  base64_encode($content),
                                        Lang::get('messages.storage.exito_extraer_archivo'));
                                } else {
                                    return new RespuestaModel(false,  null,
                                        Lang::get('messages.storage.extraccion_sin_datos'));
                                }
                            }

                        } else {
                            return new RespuestaModel(false,  null,
                                Lang::get('messages.storage.extraccion_sin_datos'));
                        }
                    }

                }
            } else {
                $content = file_get_contents($url);
                return new RespuestaModel(true,  base64_encode($content),
                        Lang::get('messages.storage.exito_extraer_archivo'));
            }

            return new RespuestaModel(false,  null,
                Lang::get('messages.storage.error_extraer_archivo'));
        }

        return new RespuestaModel(false,  null,
            Lang::get('messages.storage.archivo_no_existe'));

    }

}
?>
