<?php

namespace App\Models;

use App\Enums\TipoArchivo;
use App\Helper\ArchivosHelper;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Lang;
use Illuminate\Support\Facades\Log;


class DetalleAnexosProcedimientosModel extends Model
{

    public $timestamps = false;
    protected $table = 'det_anexos_procedimientos';
    protected $primaryKey = 'id_anexo_procedimiento';

    protected $fillable = [
        'id_procedimiento_administrativo',
        'id_tipo_archivo',
        'url_archivo_anexo',
        'comentarios',
        'activo',
        'fecha_ultima_mod',
        'usuario_ultima_mod'
    ];

    protected $casts = [
        'fecha_ultima_mod' => 'datetime',
    ];

    public function buscarDetalleAnexosProcedimientos($params)
    {
        $query = DB::table('det_anexos_procedimientos as dap')
            ->join('cat_tipos_archivos as ta','ta.id_tipo_archivo','=','dap.id_tipo_archivo')
            ->distinct()
            ->where('dap.id_procedimiento_administrativo','=',$params["id_procedimiento_administrativo"])
            ->where('dap.activo','=',1)
            ->select('dap.*','ta.nombre_tipo_archivo','ta.caracter');


        $data = $query->get();

        return $data;
    }


    public function guardarDetalleAnexosProcedimientos($parametros): RespuestaModel
    {

        DB::beginTransaction();
        try {
            if ($parametros["id_anexo_procedimiento"])
                $datoGuardar = $this::find($parametros["id_anexo_procedimiento"]);

            if (!isset($datoGuardar)) {
                $datoGuardar = new DetalleAnexosProcedimientosModel();
                $datoGuardar->activo = true;

            } else {
                if (isset($parametros["activo"])) {
                    $datoGuardar->activo = $parametros["activo"];
                }

            }

            if (isset($parametros["id_tipo_archivo"])) {
                $datoGuardar->id_tipo_archivo = $parametros["id_tipo_archivo"];
            }

            if (isset($parametros["id_procedimiento_administrativo"])) {
                $datoGuardar->id_procedimiento_administrativo = $parametros["id_procedimiento_administrativo"];
            }

            if (isset($parametros["url_archivo_anexo"])) {
                $datoGuardar->url_archivo_anexo = $parametros["url_archivo_anexo"];
            }
            if (isset($parametros["comentarios"])) {
                $datoGuardar->comentarios = $parametros["comentarios"];
            }


            $datoGuardar->fecha_ultima_mod = Carbon::now();
            $datoGuardar->usuario_ultima_mod = $parametros["idUsuario"];

            $datoGuardar->save();

            DB::commit();

            return new RespuestaModel(true,  $datoGuardar->id_anexo_procedimiento, Lang::get('messages.request_guardar'));

        } catch (\Exception $th) {
            Log::error($th);
            DB::rollback();
            return new RespuestaModel(false,  null, $th);
        }

    }


    public function guardarAnexosProcedimientos($parametros): RespuestaModel
    {
        DB::beginTransaction();
        try {
            foreach ($parametros["anexos_procedimiento"] as $anexo) {

                $datoGuardar = new DetalleAnexosProcedimientosModel();

                if ($anexo["id_anexo_procedimiento"])
                    $datoGuardar = $this::find($anexo["id_anexo_procedimiento"]);

                if (!isset($datoGuardar)) {

                    $datoGuardar->activo = true;

                } else {
                    if (isset($anexo["activo"])) {
                        $datoGuardar->activo = $anexo["activo"];
                    }

                }

                if (isset($anexo["id_tipo_archivo"])) {
                    $datoGuardar->id_tipo_archivo = $anexo["id_tipo_archivo"];
                }

                if (isset($parametros["id_procedimiento_administrativo"])) {
                    $datoGuardar->id_procedimiento_administrativo = $parametros["id_procedimiento_administrativo"];
                }


                if (isset($anexo["comentarios"])) {
                    $datoGuardar->comentarios = $anexo["comentarios"];
                }



                if (isset($anexo["archivo_anexo"])) {
                    $archivoAnexo = $anexo["archivo_anexo"];

                    $url_anexo = $this::almacenarArchivo($archivoAnexo);
                    $datoGuardar->url_archivo_anexo = $url_anexo;
                }else{
                    if (isset($anexo["url_archivo_anexo"])) {
                        $datoGuardar->url_archivo_anexo = $anexo["url_archivo_anexo"];
                    }
                }

                $datoGuardar->fecha_ultima_mod = Carbon::now();
                $datoGuardar->usuario_ultima_mod = $parametros["idUsuario"];

                $datoGuardar->save();



            }


            // Eliminar anexos

            foreach ($parametros["anexos_procedimiento_eliminar"] as $anexo) {

                $datoEliminar = new DetalleAnexosProcedimientosModel();

                if ($anexo["id_anexo_procedimiento"]){
                    $datoEliminar = $this::find($anexo["id_anexo_procedimiento"]);
                    $datoEliminar->activo = false;
                    $datoEliminar->fecha_ultima_mod = Carbon::now();
                    $datoEliminar->usuario_ultima_mod = $parametros["idUsuario"];

                    $datoEliminar->save();

                }



            }



            DB::commit();

            if(isset($datoGuardar->id_anexo_procedimiento)){
                $regreso = $datoGuardar->id_anexo_procedimiento;
            }else{
                $regreso = 0;
            }


            return new RespuestaModel(true,  $regreso, Lang::get('messages.request_guardar'));
        } catch (\Exception $th) {
            Log::error($th);
            DB::rollback();
            return new RespuestaModel(false,  null, $th->getMessage());
        }
    }

    public function guardarAnexosProcedimientosJuntaAclaraciones($anexo)
    {

        $datoGuardar = new DetalleAnexosProcedimientosModel();
        $datoGuardar->activo = true;
        $datoGuardar->id_tipo_archivo = $anexo["id_tipo_archivo"];
        $datoGuardar->id_procedimiento_administrativo = $anexo["id_procedimiento_administrativo"];
        $datoGuardar->comentarios = $anexo["comentarios"];
        $archivoAnexo = $anexo["archivo_anexo"];

        $url_anexo = $this::almacenarArchivo($archivoAnexo);
        $datoGuardar->url_archivo_anexo = $url_anexo;

        $datoGuardar->fecha_ultima_mod = Carbon::now();
        $datoGuardar->usuario_ultima_mod = $anexo["idUsuario"];

        $datoGuardar->save();

        return $datoGuardar;
}



    public function almacenarArchivo($request)
    {
        $tipoArchivo  = TipoArchivo::obtenerTipoArchivo($request['tipoArchivo']);
        $archivo = new ArchivoModel($request['nombreArchivo'],
            $request['base64'],
            $tipoArchivo);

        $archHelp = new ArchivosHelper();
        $respServ = $archHelp->guardarDocumento(
            $archivo,
            $request['procedimiento'],
            $request['encriptar']
        );


        return $respServ->datos;
    }


}
