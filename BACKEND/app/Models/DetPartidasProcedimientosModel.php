<?php

namespace App\Models;

use App\Enums\TipoArchivo;
use App\Helper\ArchivosHelper;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Lang;
use Illuminate\Support\Facades\Log;

class DetPartidasProcedimientosModel extends Model
{
    public $timestamps = false;
    protected $table = 'det_partidas_procedimientos';
    protected $primaryKey = 'id_partida_procedimiento';

    protected $fillable = [
        'id_procedimiento_administrativo',
        'numero_partida',
        'descripcion_partida',
        'cantidad_partida',
        'codigo_partida',
        'nombre_partida',
        'partida_origen',
        'activo',
        'fecha_ultima_mod',
        'usuario_ultima_mod',
        'id_proveedor',
        'url'
    ];

    protected $casts = [
        'fecha_ultima_mod' => 'datetime',
    ];


    public function guardarPartidasPresupuestales($parametros, $partidaOrigen): RespuestaModel
    {
        DB::beginTransaction(); // Iniciar la transacción

        try {
            if ($partidaOrigen) {
                $this->where('id_procedimiento_administrativo', $parametros['idProcedimiento'])
                    ->where('partida_origen', $partidaOrigen)
                    ->update([
                        'activo' => false,
                        'usuario_ultima_mod' => $parametros["idUsuario"],
                        'fecha_ultima_mod' => Carbon::now()
                    ]);
            } else {
                $this->where('id_procedimiento_administrativo', $parametros['idProcedimiento'])
                    ->where('id_proveedor', $parametros["idProveedor"])
                    ->where('partida_origen', $partidaOrigen)
                    ->update([
                        'activo' => false,
                        'usuario_ultima_mod' => $parametros["idUsuario"],
                        'fecha_ultima_mod' => Carbon::now()
                    ]);
            }

            foreach($parametros["lstDatosPartidaPresupuestal"] as $partPres) {

                if (!isset($partPres['numero_partida']) && !isset($partPres['descripcion_partida']) && !isset($partPres['cantidad_partida'])
                    && !isset($partPres['nombre_partida']) && !isset($partPres['codigo_partida'])) {
                    continue;
                }

                $entidad = new DetPartidasProcedimientosModel();
                $entidad->id_procedimiento_administrativo = $parametros['idProcedimiento'];
                $entidad->numero_partida = $partPres['numero_partida'];
                $entidad->descripcion_partida = $partPres['descripcion_partida'];
                $entidad->cantidad_partida = $partPres['cantidad_partida'];
                $entidad->nombre_partida = $partPres['nombre_partida'];
                $entidad->codigo_partida = $partPres['codigo_partida'];
                $entidad->precio_unitario = isset($partPres['precio_unitario']) && $partPres['precio_unitario'] != null ? $partPres['precio_unitario'] : null;
                $entidad->importe = isset($partPres['importe']) && $partPres['importe'] != null ? $partPres['importe'] : null;
                $entidad->activo = true;
                $entidad->fecha_ultima_mod = Carbon::now();
                $entidad->usuario_ultima_mod = $parametros["idUsuario"];
                $entidad->partida_origen = $partidaOrigen;
                $entidad->url = $parametros['url'];
                $entidad->id_proveedor = $partPres["id_proveedor"] ?? null;

                $entidad->save();
            }

            DB::commit(); // Confirmar la transacción

            return new RespuestaModel(true, null, Lang::get('messages.request_guardar'));
        } catch (\Exception $th) {
            DB::rollBack(); // Revertir la transacción en caso de excepción
            Log::error($th);
            return new RespuestaModel(false, null, $th->getMessage());
        }
    }


    public function obtenerPartidasProcedimiento($idProcedimientoAdmin){

        $query = $this
            ->distinct()
            ->where('id_procedimiento_administrativo', $idProcedimientoAdmin)
            ->where('activo', true)
            ->where('partida_origen', true)
            ->orderBy('numero_partida');


        return $query->get()->toArray();
    }

    public function obtenerPartidasProveedor($idProcedimientoAdmin, $idProveedor)
    {

        $query = $this
            ->distinct()
            ->where('id_procedimiento_administrativo', $idProcedimientoAdmin)
            ->where('activo', true)
            ->where('partida_origen', false)
            ->where('id_proveedor', $idProveedor)
            ->orderBy('numero_partida');


        return $query->get()->toArray();
    }

    public function obtenerUrlPartidasProveedor($idProcedimientoAdmin, $idProveedor)
    {

        $query = $this
            ->where('id_procedimiento_administrativo', $idProcedimientoAdmin)
            ->where('activo', true)
            ->where('partida_origen', false)
            ->where('id_proveedor', $idProveedor)
            ->select('url')
            ->first();


        return $query->url;
    }

}
