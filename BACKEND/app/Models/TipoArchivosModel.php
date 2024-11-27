<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Lang;
use Illuminate\Support\Facades\Log;


class TipoArchivosModel extends Model
{

    public $timestamps = false;
    protected $table = 'cat_tipos_archivos';
    protected $primaryKey = 'id_tipo_archivo';

    protected $fillable = [
        'nombre_tipo_archivo',
        'caracter',
        'activo',
        'fecha_ultima_mod',
        'usuario_ultima_mod'
    ];

    protected $casts = [
        'fecha_ultima_mod' => 'datetime',
    ];

    public function obtenerTiposArchivos()
    {
        $query = DB::table('cat_tipos_archivos as ta')
            ->distinct()
            ->select('ta.*')
            ->where('ta.activo','=',1);


        $data = $query->get();

        return $data;
    }

    public function getTiposArchivos($params)
    {
        $query = DB::table('cat_tipos_archivos as ta')
            ->distinct()
            ->select('ta.*');

        if ($params["nombre_tipo_archivo"] !== null) {
            $query->where(DB::raw("upper(ta.nombre_tipo_archivo)"), 'like', '%' . strtoupper($params["nombre_tipo_archivo"]). '%');
        }

        if ($params["activo"] !== null) {
            $query->where('ta.activo', '=', $params["activo"]);
        }

        if ($params["caracter"] !== null) {
            $query->where('ta.caracter', '=', $params["caracter"]);
        }


        $data = $query->get();



        foreach ($data as $tipoArchivo){
            $parametro = $tipoArchivo->id_tipo_archivo;
            $existeCoincidencia = $this::findCoincidencia($parametro);
            $tipoArchivo->enUso = $existeCoincidencia;
        }
        return $data;
    }


    public function findCoincidencia($params)
    {
        $query = DB::table('cat_tipos_archivos as ta')
            ->leftJoin('det_anexos_procedimientos as dap','dap.id_tipo_archivo','=','ta.id_tipo_archivo')
            ->distinct()
            ->select('dap.*')
            ->where('dap.id_tipo_archivo','=',$params);

        $existeCoincidencia = $query->first();

        if ($existeCoincidencia != null) {
            return true;
        }

        return false;
    }

    public function existInProcedimiento($params)
    {
        $query = DB::table('cat_tipos_archivos as ta')
            ->leftJoin('det_anexos_procedimientos as dap','dap.id_tipo_archivo','=','ta.id_tipo_archivo')
            ->distinct()
            ->select('dap.*')
            ->where('dap.id_tipo_archivo','=',$params['id_tipo_archivo']);

        $existeCoincidencia = $query->first();

        $exist = false;

        if ($existeCoincidencia != null) {
            $exist = true;
            return [
                'mensaje' => 'Este tipo de archivo ya se encuentra en uso',
                'datos' => $exist
            ];
        }

        return [
            'mensaje' => 'Este tipo de archivo no se encuentra en uso',
            'datos' => $exist
        ];

    }

    public function eliminarTipoArchivo($parametros)
    {
        DB::beginTransaction();
        try {
            $datoGuardar = $this::find($parametros["id_tipo_archivo"]);

            $datoGuardar->activo = 0;
            $datoGuardar->fecha_ultima_mod = Carbon::now();
            $datoGuardar->usuario_ultima_mod = $parametros["idUsuario"];

            $datoGuardar->save();

            DB::commit();

            return new RespuestaModel(true,  $datoGuardar->id_tipo_archivo, Lang::get('messages.request_actualizar'));

        } catch (\Exception $th) {
            Log::error($th);
            DB::rollback();
            return new RespuestaModel(false,  null, $th);
        }
    }

    public function guardarTipoArchivo($parametros) : RespuestaModel{

        $queryVal = $this::
        where(DB::raw("upper(nombre_tipo_archivo)"), '=', strtoupper($parametros["nombre_tipo_archivo"]));
        if (isset($parametros["id_tipo_archivo"]) && $parametros["id_tipo_archivo"] != null) {
            $queryVal->where('id_tipo_archivo', '<>', $parametros["id_tipo_archivo"]);
        }

        $existeCoincidencia = $queryVal->first();

        if ($existeCoincidencia != null) {
            return new RespuestaModel(false, null, Lang::get('messages.request_reg_existe'));
        }

        DB::beginTransaction();
        try {

            if ($parametros["id_tipo_archivo"])
                $datoGuardar = $this::find($parametros["id_tipo_archivo"]);

            if (!isset($datoGuardar)) {
                $datoGuardar = new TipoArchivosModel();
                $datoGuardar->activo = true;
            }
            else {
                if (isset($parametros["activo"])) {
                    $datoGuardar->activo = $parametros["activo"];
                }
            }
            if (isset($parametros["nombre_tipo_archivo"])) {
                $datoGuardar->nombre_tipo_archivo = $parametros["nombre_tipo_archivo"];
            }

            if (isset($parametros["caracter"])) {
                $datoGuardar->caracter = $parametros["caracter"];
            }

            $datoGuardar->fecha_ultima_mod = Carbon::now();
            $datoGuardar->usuario_ultima_mod = $parametros["idUsuario"];
            $datoGuardar->save();

            DB::commit();

            return new RespuestaModel(true,  $datoGuardar->id_tipo_archivo , Lang::get('messages.request_guardar'));
        }catch (\Exception $th) {
            Log::error($th);
            DB::rollback();
            return new RespuestaModel(false,  null, $th);
        }
    }

    public function eliminarRegistro($params)
    {
        try{
            DB::beginTransaction();
            $catTipoArchivo=TipoArchivosModel::where('id_tipo_archivo',$params)->delete();
            DB::commit();
            return new RespuestaModel(true,$catTipoArchivo, Lang::get('messages.request_actualizar'));
        }catch (\Exception $th) {
            Log::error($th);
            DB::rollback();
            return new RespuestaModel(false,  null, $th);
        }
    }

}
