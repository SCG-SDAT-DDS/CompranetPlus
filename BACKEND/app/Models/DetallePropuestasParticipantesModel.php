<?php

namespace App\Models;

use App\Enums\TipoArchivo;
use App\Helper\ArchivosHelper;
use App\Helper\CorreosHelper;
use App\Helper\NotificacionesHelper;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Lang;
use Illuminate\Support\Facades\Log;

class DetallePropuestasParticipantesModel extends Model
{
    public $timestamps = false;
    protected $table = 'det_propuestas_participantes';
    protected $primaryKey = 'id_propuesta_participante';

    protected $fillable = [
        'id_participante_procedimiento',
        'url_archivo_propuesta',
        'url_archivo_partida',
        'fecha_propuesta',
        'certificado_proveedor',
        'numero_certificado',
        'activo',
        'fecha_ultima_mod',
        'usuario_ultima_mod'
    ];

    protected $casts = [
        'fecha_ultima_mod' => 'datetime',
    ];


    public function guardarPropuestas($arrayPropuestas): RespuestaModel
    {
        DB::beginTransaction();

        try {
            foreach ($arrayPropuestas as $propuesta) {
                $datoGuardar = new DetallePropuestasParticipantesModel();

                if (isset($propuesta["id_propuesta_participante"])) {
                    $existingPropuesta = $this::find($propuesta["id_propuesta_participante"]);
                    $datoGuardar = $existingPropuesta ?? $datoGuardar;
                }

                // Ajusta la lógica para cada campo según tus necesidades
                $datoGuardar->activo = $propuesta["activo"] ?? true;
                $datoGuardar->id_participante_procedimiento = $propuesta["id_participante_procedimiento"] ?? null;

                if (isset($propuesta["url_archivo_propuesta"])) {
                    $archivoPropuesta = $propuesta["url_archivo_propuesta"];
                    $url_propuesta_rep = $this::almacenarArchivo($archivoPropuesta);
                    $datoGuardar->url_archivo_propuesta = $url_propuesta_rep;
                }

                if (!in_array($propuesta["id_tipo_procedimiento"], [5, 6])) {
                    $modelPartidas = new DetPartidasProcedimientosModel();
                    $urlProcedimientoProveedor = $modelPartidas->obtenerUrlPartidasProveedor(
                        $propuesta['id_procedimiento_administrativo'],
                        $propuesta['id_proveedor']
                    );
                    $datoGuardar->url_archivo_partida = $urlProcedimientoProveedor;
                }

                $datoGuardar->fecha_propuesta = Carbon::now();
                $datoGuardar->fecha_ultima_mod = Carbon::now();
                // $datoGuardar->usuario_ultima_mod = $propuesta["idUsuario"] ?? null;



                $datoGuardar->save();
            }

            DB::commit();
            return new RespuestaModel(true, $datoGuardar->id_propuesta_participante, Lang::get('messages.request_guardar'));
        } catch (\Exception $th) {
            Log::error($th);
            DB::rollback();
            return new RespuestaModel(false, null, $th->getMessage());
        }
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

    public function obtenerPropuestaParticipanteProcedimiento($idProcedimiento, $idProveedor)
    {
        $propuesta = DB::table('det_propuestas_participantes as propp')
            ->join('det_participantes_procedimientos as partp','partp.id_participante_procedimiento','propp.id_participante_procedimiento')
            ->where('partp.id_procedimiento_administrativo', $idProcedimiento)
            ->where('partp.id_proveedor', $idProveedor)
            ->where('partp.activo',true)
            ->where('propp.activo',true)
            ->select('propp.id_propuesta_participante')
            ->get();

        if ($propuesta != null && isset($propuesta[0])) {
            return $propuesta[0]->id_propuesta_participante;
        }

       return null;
    }

}
