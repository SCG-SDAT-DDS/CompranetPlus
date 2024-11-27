<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Lang;
use Illuminate\Support\Facades\Log;


class MsJuntasAclaraciones extends Model
{

    public $timestamps = false;
    protected $table = 'ms_juntas_aclaraciones';
    protected $primaryKey = 'id_junta_aclaraciones';

    protected $fillable = [
        'id_procedimiento_administrativo',
        'fecha_junta_aclaraciones',
        'fecha_prorroga',
        'url_archivo',
        'activo',
        'fecha_ultima_mod',
        'usuario_ultima_mod'
    ];

    protected $casts = [
        'fecha_ultima_mod' => 'datetime',
    ];

    public function buscarJuntaAclaraciones($params)
    {
        $query = DB::table('ms_juntas_aclaraciones as ja')
            ->distinct()
            ->where('ja.id_procedimiento_administrativo','=',$params["id_procedimiento_administrativo"])
            ->select('ja.*');


        $data = $query->get();

        return $data;
    }


    public function guardarJuntaAclaraciones($parametros): RespuestaModel
    {

        DB::beginTransaction();
        try {
            if ($parametros["id_junta_aclaraciones"]){
                $datoGuardar = $this::find($parametros["id_junta_aclaraciones"]);
            }

            if (!isset($datoGuardar)) {
                $datoGuardar = new MsJuntasAclaraciones();
                $datoGuardar->activo = true;

            } else {
                if (isset($parametros["activo"])) {
                    $datoGuardar->activo = $parametros["activo"];
                }

            }

            if (isset($parametros["id_procedimiento_administrativo"])) {
                $datoGuardar->id_procedimiento_administrativo = $parametros["id_procedimiento_administrativo"];
            }

            if (isset($parametros["fecha_junta_aclaraciones"])) {
                $datoGuardar->fecha_junta_aclaraciones = $parametros["fecha_junta_aclaraciones"].' '.$parametros["hora_junta_aclaraciones"];;
            }
            if (isset($parametros["fecha_prorroga"])) {
                $datoGuardar->fecha_prorroga = $parametros["fecha_prorroga"];
            }
            if (isset($parametros["url_archivo"])) {
                $datoGuardar->url_archivo = $parametros["url_archivo"];
            }


            $datoGuardar->fecha_ultima_mod = Carbon::now();
            $datoGuardar->usuario_ultima_mod = $parametros["idUsuario"];

            $datoGuardar->save();

            DB::commit();

            return new RespuestaModel(true,  $datoGuardar->id_junta_aclaraciones, Lang::get('messages.request_guardar'));

        } catch (\Exception $th) {
            Log::error($th);
            DB::rollback();
            return new RespuestaModel(false,  null, $th->getMessage());
        }

    }



}
