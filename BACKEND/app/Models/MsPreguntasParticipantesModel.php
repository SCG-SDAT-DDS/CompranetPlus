<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Lang;


class MsPreguntasParticipantesModel extends Model
{

    public $timestamps = false;
    protected $table = 'ms_preguntas_participantes';
    protected $primaryKey = 'id_pregunta_participante';

    protected $fillable = [
        'id_participante_procedimiento',
        'url_archivo_pregunta',
        'activo',
        'fecha_ultima_mod',
        'usuario_ultima_mod',
        'fecha_descarga_conv'
    ];

    protected $casts = [
        'fecha_ultima_mod' => 'datetime',
        'fecha_descarga_conv' => 'datetime',
    ];

    public function obtenerPreguntasJunta($idProcedimiento, $idProveedor, $id=null, $enviarNotificaciones = false)
    {
        $query = DB::table('ms_preguntas_participantes as pregp')
            ->join('det_participantes_procedimientos as detp', 'detp.id_participante_procedimiento', '=', 'pregp.id_participante_procedimiento')
            ->join('ms_proveedores as prov', 'prov.id_proveedor', '=', 'detp.id_proveedor')
            ->where("pregp.activo", true)
            ->where("detp.activo", true)
            ->where("detp.id_procedimiento_administrativo", $idProcedimiento)
            ->select("pregp.*", "prov.*" , "pregp.fecha_ultima_mod as fecha_ultima_mod");

        if (isset($idProveedor) && $idProveedor != null) {
            $query->where('detp.id_proveedor', $idProveedor);
        }

        if (isset($id) && $id != null) {
            $query->where('pregp.id_pregunta_participante', $id);
        }

        $datos = $query->get();
        $fechaDescargaActualizada = false;
        foreach ($datos as $item) {
            $item->url_archivo = $item->url_archivo_pregunta;

            $preguntaActualizar = $this->find($item->id_pregunta_participante);
            if ($enviarNotificaciones && $preguntaActualizar->fecha_descarga_conv == null) {
                $preguntaActualizar->fecha_descarga_conv = Carbon::now();
                $preguntaActualizar->save();
                $fechaDescargaActualizada = true;
            }
        }

        $resp = [
            "fechaDescargaActualizada" => $fechaDescargaActualizada,
            "datos" =>$datos
        ];

        return $resp;
    }

    public function guardarPreguntaJunta($parametros): RespuestaModel
    {
        $participanteProc = DB::table('det_participantes_procedimientos as detp')
            ->join('ms_proveedores as prov', 'prov.id_proveedor', '=', 'detp.id_proveedor')
            ->where("detp.activo", true)
            ->where("detp.id_procedimiento_administrativo", $parametros['idProcedimiento'])
            ->where('detp.id_proveedor', $parametros['idProveedor'])
            ->select("detp.id_participante_procedimiento")->first();

        $datoGuardar = new MsPreguntasParticipantesModel();
        $datoGuardar->id_participante_procedimiento = $participanteProc->id_participante_procedimiento;
        $datoGuardar->url_archivo_pregunta = $parametros['url'];
        $datoGuardar->activo = true;
        $datoGuardar->fecha_ultima_mod = Carbon::now();
        $datoGuardar->usuario_ultima_mod = $parametros["idUsuario"];

        $datoGuardar->save();

        return new RespuestaModel(true,  $datoGuardar->id_pregunta_participante, Lang::get('messages.request_guardar'));

    }

    public function eliminarPreguntaJunta($idsEliminar, $idUsuario)
    {
        if (isset($idsEliminar) && sizeof($idsEliminar) > 0) {

            $this->where('id_pregunta_participante', $idsEliminar)
                ->update([
                    'activo' => false,
                    'usuario_ultima_mod' => $idUsuario,
                    'fecha_ultima_mod' => Carbon::now()
                ]);
        }
    }

}
